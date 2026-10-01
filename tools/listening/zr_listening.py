#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11,<3.15"
# dependencies = ["audible>=0.10,<0.13"]
# ///
"""zr-listening: puts Zamilur's Audible listening on zamilur.com, from his own Mac.

It reads his Audible library and listening stats on this Mac, writes a small
file (site/listening.js) and commits it to the website's GitHub repo, which
Netlify publishes. The Audible sign-in never leaves this Mac: it's kept in
~/.zr-listening, encrypted with a key held in the macOS Keychain, next to the
GitHub token.

Commands (run them with ~/.zr-listening/zr-listening <command>):
  setup      sign in to Audible in your browser, save a GitHub token, publish
             once and schedule a weekly run (Monday 08:00)
  update     read Audible and publish (what the weekly run does)
  preview    show what would be published, without publishing
             (add --debug to save Audible's raw replies in ~/.zr-listening)
  status     show the schedule, the last run and the stored sign-ins
  uninstall  stop the weekly run, remove this Mac from your Audible devices
             and delete the stored sign-ins
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import getpass
import json
import os
import plistlib
import re
import secrets
import shutil
import subprocess
import sys
import webbrowser
from pathlib import Path
from typing import Any

REPO = "zamilurpersonal-source/personal_website"
BRANCH = "main"
TARGET = "site/listening.js"
SITE = "https://zamilur.com"

HOME = Path.home()
DIR = HOME / ".zr-listening"
AUTH_FILE = DIR / "audible-auth.json"
CONFIG_FILE = DIR / "config.json"
LOG_FILE = DIR / "last-run.log"
LABEL = "com.zamilur.listening"
PLIST = HOME / "Library" / "LaunchAgents" / f"{LABEL}.plist"

KEY_GITHUB = "zr-listening GitHub token"
KEY_AUDIBLE = "zr-listening Audible file key"

DEFAULT_CONFIG = {
    "country": "us",     # Audible store: us, uk, ca, au, de, fr, it, es, in, jp
    "show_current": 1,   # books shown under "Now listening"
    "show_finished": 6,  # books shown under "Recently finished"
    "hide": [],          # ASINs or words in a title to keep off the site
}

PODCAST_TYPES = {"PodcastParent", "PodcastEpisode", "PodcastSeason", "Periodical", "Newspaper", "Magazine"}


# ---------- small helpers ----------

def say(text: str = "") -> None:
    print(text, flush=True)


def ask_yes(question: str, default: bool = True) -> bool:
    hint = "[Y/n]" if default else "[y/N]"
    answer = input(f"{question} {hint} ").strip().lower()
    return default if not answer else answer.startswith("y")


def notify(message: str) -> None:
    """A macOS notification, so a failed weekly run doesn't go unnoticed."""
    try:
        subprocess.run(["osascript", "-e", f'display notification {json.dumps(message)} with title "zr-listening"'],
                       check=False, capture_output=True, timeout=10)
    except Exception:
        pass


def log(line: str) -> None:
    DIR.mkdir(mode=0o700, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    with LOG_FILE.open("a") as f:
        f.write(f"{stamp}  {line}\n")


def load_config() -> dict[str, Any]:
    config = dict(DEFAULT_CONFIG)
    if CONFIG_FILE.exists():
        try:
            config.update(json.loads(CONFIG_FILE.read_text()))
        except ValueError:
            say(f"Couldn't read {CONFIG_FILE}; using the defaults.")
    return config


def save_config(config: dict[str, Any]) -> None:
    DIR.mkdir(mode=0o700, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(config, indent=2) + "\n")


# ---------- macOS Keychain (through /usr/bin/security, so background runs never prompt) ----------

def security(*args: str) -> subprocess.CompletedProcess | None:
    try:
        return subprocess.run(["security", *args], capture_output=True, text=True)
    except FileNotFoundError:  # not a Mac
        return None


def keychain_get(service: str) -> str | None:
    r = security("find-generic-password", "-a", getpass.getuser(), "-s", service, "-w")
    return r.stdout.strip() if r and r.returncode == 0 and r.stdout.strip() else None


def keychain_set(service: str, value: str) -> None:
    r = security("add-generic-password", "-U", "-a", getpass.getuser(), "-s", service, "-w", value)
    if not r or r.returncode != 0:
        raise SystemExit(f"Couldn't save to the Keychain: {r.stderr.strip() if r else 'no Keychain on this system'}")


def keychain_delete(service: str) -> None:
    security("delete-generic-password", "-a", getpass.getuser(), "-s", service)


# ---------- Audible ----------

def browser_login(url: str) -> str:
    try:
        import readline  # noqa: F401  (lets macOS Terminal take the long pasted address)
    except ImportError:
        pass
    say()
    say("Your browser will open Amazon's Audible sign-in page.")
    say("  1. Sign in with your Amazon account (you may be asked twice, and for a code or a puzzle).")
    say("  2. After signing in you'll land on a 'Page not found' page. That's expected.")
    say("  3. Copy the whole address from the browser's address bar and paste it here.")
    say()
    say("If the browser doesn't open, copy this address into it:")
    say(url)
    say()
    webbrowser.open(url)
    return input("Paste the address here, then press Return: ").strip()


def audible_login(country: str):
    import audible

    auth = audible.Authenticator.from_login_external(locale=country, login_url_callback=browser_login)
    save_auth(auth)
    return auth


def save_auth(auth) -> None:
    DIR.mkdir(mode=0o700, exist_ok=True)
    key = keychain_get(KEY_AUDIBLE)
    if not key:
        key = secrets.token_urlsafe(32)
        keychain_set(KEY_AUDIBLE, key)
    auth.to_file(AUTH_FILE, password=key, encryption="json", set_default=False)
    os.chmod(AUTH_FILE, 0o600)


def load_auth():
    import audible

    key = keychain_get(KEY_AUDIBLE)
    if not AUTH_FILE.exists() or not key:
        raise SystemExit("There's no Audible sign-in on this Mac yet. Run: ~/.zr-listening/zr-listening setup")
    return audible.Authenticator.from_file(AUTH_FILE, password=key)


def walk(node: Any):
    """Every dict inside a reply, however deeply nested."""
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from walk(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk(value)


def first_time(d: dict[str, Any]) -> str | None:
    for key, value in d.items():
        if isinstance(value, str) and ("timestamp" in key or "date" in key or key.endswith("_updated") or key == "last_updated"):
            if re.match(r"\d{4}-\d{2}-\d{2}", value):
                return value
    return None


def fetch_library(client, debug: dict[str, Any] | None) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    page = 1
    while page <= 20:
        reply = client.get(
            "1.0/library",
            num_results=1000,
            page=page,
            response_groups="contributors,media,product_attrs,product_desc,is_finished,percent_complete,listening_status",
            image_sizes="500",
            sort_by="-PurchaseDate",
        )
        if debug is not None:
            debug[f"library-page-{page}"] = reply
        batch = reply.get("items", []) if isinstance(reply, dict) else []
        items.extend(batch)
        if len(batch) < 1000:
            break
        page += 1
    return items


def fetch_finish_dates(client, debug: dict[str, Any] | None) -> dict[str, str]:
    """ASIN -> when it was marked finished (newest event wins)."""
    dates: dict[str, str] = {}
    params: dict[str, Any] = {"start_date": "2000-01-01T00:00:00Z"}
    for page in range(20):
        try:
            reply = client.get("1.0/stats/status/finished", **params)
        except Exception as e:  # not essential: the library's own flags still say what's finished
            say(f"  (couldn't read finish dates: {e})")
            break
        if debug is not None:
            debug[f"finished-{page}"] = reply
        for d in walk(reply):
            asin = d.get("asin")
            when = first_time(d)
            if isinstance(asin, str) and when and d.get("is_marked_as_finished", True) is not False:
                if when > dates.get(asin, ""):
                    dates[asin] = when
        token = reply.get("continuation_token") if isinstance(reply, dict) else None
        if not token:
            break
        params = {"start_date": "2000-01-01T00:00:00Z", "continuation_token": token}
    return dates


def fetch_last_heard(client, asins: list[str], debug: dict[str, Any] | None) -> dict[str, str]:
    """ASIN -> when it was last listened to."""
    heard: dict[str, str] = {}
    for i in range(0, len(asins), 25):
        try:
            reply = client.get("1.0/annotations/lastpositions", asins=",".join(asins[i:i + 25]))
        except Exception as e:
            say(f"  (couldn't read last positions: {e})")
            break
        if debug is not None:
            debug[f"lastpositions-{i}"] = reply
        for d in walk(reply):
            asin = d.get("asin")
            if not isinstance(asin, str):
                continue
            when = None
            for inner in walk(d):
                when = first_time(inner) or when
            if when and when > heard.get(asin, ""):
                heard[asin] = when
    return heard


def fetch_hours(client, today: dt.date, debug: dict[str, Any] | None) -> tuple[int | None, int | None]:
    """(all-time hours, hours this calendar year) from Audible's listening stats, in milliseconds."""
    start = dt.date(today.year if today.month == 12 else today.year - 1, today.month % 12 + 1, 1)
    try:
        reply = client.get(
            "1.0/stats/aggregates",
            monthly_listening_interval_duration="12",
            monthly_listening_interval_start_date=start.strftime("%Y-%m"),
            store="Audible",
            response_groups="total_listening_stats",
        )
    except Exception as e:
        say(f"  (couldn't read listening stats: {e})")
        return None, None
    if debug is not None:
        debug["stats"] = reply
    total = None
    year_ms = 0
    found_months = False
    if isinstance(reply, dict):
        tls = reply.get("total_listening_stats")
        if isinstance(tls, dict) and isinstance(tls.get("aggregated_sum"), (int, float)):
            total = tls["aggregated_sum"]
        for key, value in reply.items():
            if "monthly" in key and isinstance(value, list):
                for m in value:
                    ident = str(m.get("interval_identifier", ""))
                    if ident.startswith(str(today.year)) and isinstance(m.get("aggregated_sum"), (int, float)):
                        year_ms += m["aggregated_sum"]
                        found_months = True
    to_hours = lambda ms: int(round(ms / 3_600_000))
    return (to_hours(total) if total is not None else None, to_hours(year_ms) if found_months else None)


def is_book(item: dict[str, Any]) -> bool:
    if not item.get("title") or not item.get("asin"):
        return False
    if item.get("content_delivery_type") in PODCAST_TYPES:
        return False
    return str(item.get("content_type", "")).lower() not in {"podcast", "episode", "newspaper / magazine"}


def is_finished(item: dict[str, Any]) -> bool:
    ls = item.get("listening_status") or {}
    return bool(item.get("is_finished") or ls.get("is_finished"))


def percent(item: dict[str, Any]) -> float:
    ls = item.get("listening_status") or {}
    for value in (item.get("percent_complete"), ls.get("percent_complete")):
        if isinstance(value, (int, float)):
            return float(value)
    return 0.0


def card(item: dict[str, Any]) -> dict[str, Any]:
    authors = ", ".join(a.get("name", "") for a in (item.get("authors") or [])[:2] if a.get("name"))
    images = item.get("product_images") or {}
    cover = images.get("500") or next(iter(images.values()), None)
    out = {
        "title": item.get("title"),
        "author": authors or None,
        "cover": cover,
        "url": f"https://www.audible.{audible_domain()}/pd/{item['asin']}",
    }
    return {k: v for k, v in out.items() if v}


_DOMAIN = "com"


def audible_domain() -> str:
    return _DOMAIN


def hidden(item: dict[str, Any], hide: list[str]) -> bool:
    title = str(item.get("title", "")).lower()
    return any(h == item.get("asin") or (len(h) > 2 and h.lower() in title) for h in hide)


def gather(config: dict[str, Any], debug: dict[str, Any] | None = None) -> tuple[dict[str, Any], Any]:
    import audible

    global _DOMAIN
    auth = load_auth()
    _DOMAIN = auth.locale.domain
    today = dt.date.today()
    with audible.Client(auth=auth, country_code=config.get("country") or None) as client:
        say("Reading your Audible library…")
        books = [i for i in fetch_library(client, debug) if is_book(i)]
        finished_dates = fetch_finish_dates(client, debug)
        in_progress = [i for i in books if not is_finished(i) and 0 < percent(i) < 100]
        heard = fetch_last_heard(client, [i["asin"] for i in in_progress[:100]], debug) if in_progress else {}
        hours_total, hours_year = fetch_hours(client, today, debug)

    hide = [str(h) for h in config.get("hide") or []]
    finished = [i for i in books if is_finished(i)]

    current = sorted((i for i in in_progress if not hidden(i, hide)), key=lambda i: heard.get(i["asin"], ""), reverse=True)
    current_cards = []
    for item in current[: int(config.get("show_current", 1))]:
        c = card(item)
        c["percent"] = int(round(percent(item)))
        left = (item.get("listening_status") or {}).get("time_remaining_seconds")
        if isinstance(left, (int, float)):
            c["minutesLeft"] = int(round(left / 60))
        elif isinstance(item.get("runtime_length_min"), (int, float)):
            c["minutesLeft"] = int(round(item["runtime_length_min"] * (1 - percent(item) / 100)))
        current_cards.append(c)

    def finished_on(item: dict[str, Any]) -> str:
        ls = item.get("listening_status") or {}
        return finished_dates.get(item["asin"]) or str(ls.get("finished_at_timestamp") or "")

    recent = sorted((i for i in finished if not hidden(i, hide)), key=finished_on, reverse=True)
    finished_cards = []
    for item in recent[: int(config.get("show_finished", 6))]:
        c = card(item)
        when = finished_on(item)
        if when:
            c["finished"] = when[:10]
        finished_cards.append(c)

    stats = {
        "hoursTotal": hours_total,
        "hoursThisYear": hours_year,
        "year": today.year,
        "titlesFinished": len(finished),
        "titlesInLibrary": len(books),
    }
    data = {
        "updated": today.isoformat(),
        "profile": config.get("profile") or None,
        "stats": {k: v for k, v in stats.items() if v is not None},
        "current": current_cards,
        "finished": finished_cards,
    }
    return {k: v for k, v in data.items() if v is not None}, auth


def render_js(data: dict[str, Any]) -> str:
    return (
        "// Zamilur's Audible listening, for the Listening section on zamilur.com.\n"
        "// Written by tools/listening/zr_listening.py on his Mac once a week; edits here are overwritten.\n"
        "window.ZR_LISTENING = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
    )


def parse_js(text: str) -> dict[str, Any] | None:
    m = re.search(r"window\.ZR_LISTENING\s*=\s*(.*);\s*$", text, re.S)
    try:
        return json.loads(m.group(1)) if m else None
    except ValueError:
        return None


def describe(data: dict[str, Any]) -> None:
    s = data.get("stats", {})
    say()
    if "hoursTotal" in s:
        say(f"  Listening time:     {s['hoursTotal']:,} hours in total"
            + (f", {s['hoursThisYear']:,} in {s['year']}" if "hoursThisYear" in s else ""))
    else:
        say("  Listening time:     not available")
    say(f"  Titles finished:    {s.get('titlesFinished', 0):,} of {s.get('titlesInLibrary', 0):,} in your library")
    for c in data.get("current", []):
        say(f"  Now listening:      {c.get('title')} ({c.get('percent', 0)}%)")
    if not data.get("current"):
        say("  Now listening:      nothing in progress")
    for n, c in enumerate(data.get("finished", [])):
        say(f"  {'Recently finished:' if n == 0 else '':19} {c.get('title')}" + (f" ({c['finished']})" if c.get("finished") else ""))
    say()


# ---------- GitHub ----------

def github(token: str, method: str, path: str, **kwargs):
    import httpx

    r = httpx.request(
        method,
        f"https://api.github.com/{path}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json",
                 "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "zr-listening"},
        timeout=30,
        **kwargs,
    )
    return r


def check_token(token: str) -> str | None:
    """None if the token can write to the repo, otherwise what's wrong."""
    try:
        r = github(token, "GET", f"repos/{REPO}")
    except Exception as e:
        return f"couldn't reach GitHub ({e})"
    if r.status_code == 401:
        return "GitHub didn't accept the token"
    if r.status_code == 404:
        return f"the token can't see {REPO}"
    if r.status_code != 200:
        return f"GitHub answered {r.status_code}"
    if not (r.json().get("permissions") or {}).get("push"):
        return "the token can read the repo but not write to it (give it Contents: Read and write)"
    return None


def publish(token: str, data: dict[str, Any]) -> str:
    url = f"repos/{REPO}/contents/{TARGET}"
    r = github(token, "GET", url, params={"ref": BRANCH})
    sha = None
    if r.status_code == 200:
        body = r.json()
        sha = body.get("sha")
        old = parse_js(base64.b64decode(body.get("content", "")).decode("utf-8", "replace"))
        if old is not None:
            strip = lambda d: {k: v for k, v in d.items() if k != "updated"}
            if strip(old) == strip(data):
                return "unchanged"
    elif r.status_code != 404:
        raise SystemExit(f"GitHub answered {r.status_code} when reading {TARGET}: {r.text[:200]}")
    payload = {
        "message": "Update listening stats",
        "content": base64.b64encode(render_js(data).encode("utf-8")).decode("ascii"),
        "branch": BRANCH,
    }
    if sha:
        payload["sha"] = sha
    r = github(token, "PUT", url, json=payload)
    if r.status_code in (403, 404):
        raise SystemExit("GitHub didn't let the token save the file. Make sure it has access to "
                         f"{REPO.split('/')[1]} with Contents: Read and write, then run setup again.")
    if r.status_code not in (200, 201):
        raise SystemExit(f"GitHub answered {r.status_code} when saving {TARGET}: {r.text[:200]}")
    return "published"


# ---------- weekly schedule (launchd) ----------

def uv_path() -> str:
    for candidate in (os.environ.get("UV"), shutil.which("uv"), str(HOME / ".local" / "bin" / "uv"), "/opt/homebrew/bin/uv"):
        if candidate and Path(candidate).exists():
            return candidate
    raise SystemExit("Couldn't find uv. Run the installer again.")


def install_schedule() -> None:
    PLIST.parent.mkdir(parents=True, exist_ok=True)
    plist = {
        "Label": LABEL,
        "ProgramArguments": [uv_path(), "run", "--quiet", str(DIR / "zr_listening.py"), "update"],
        "StartCalendarInterval": {"Weekday": 1, "Hour": 8, "Minute": 0},
        "StandardOutPath": str(DIR / "launchd.log"),
        "StandardErrorPath": str(DIR / "launchd.log"),
        "EnvironmentVariables": {"PATH": f"{HOME}/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"},
        "ProcessType": "Background",
    }
    with PLIST.open("wb") as f:
        plistlib.dump(plist, f)
    domain = f"gui/{os.getuid()}"
    subprocess.run(["launchctl", "bootout", domain, str(PLIST)], capture_output=True)
    r = subprocess.run(["launchctl", "bootstrap", domain, str(PLIST)], capture_output=True, text=True)
    if r.returncode != 0:
        subprocess.run(["launchctl", "load", "-w", str(PLIST)], capture_output=True)


def remove_schedule() -> None:
    if PLIST.exists():
        subprocess.run(["launchctl", "bootout", f"gui/{os.getuid()}", str(PLIST)], capture_output=True)
        PLIST.unlink()


# ---------- commands ----------

def cmd_setup(args) -> None:
    config = load_config()
    if args.country:
        config["country"] = args.country
    save_config(config)
    say("zr-listening setup: your Audible listening on zamilur.com, updated weekly from this Mac.")

    # 1. Audible
    signed_in = False
    if AUTH_FILE.exists() and keychain_get(KEY_AUDIBLE):
        signed_in = ask_yes("You're already signed in to Audible on this Mac. Keep that sign-in?")
    if not signed_in:
        audible_login(config["country"])
        say("Signed in to Audible. This Mac now shows in your Audible devices as an app.")

    # 2. GitHub token
    token = keychain_get(KEY_GITHUB)
    if token and not check_token(token) and ask_yes("A GitHub token is already saved and works. Keep it?"):
        pass
    else:
        say()
        say("Now a GitHub token, so this Mac can update one file on your website.")
        say("  1. Open https://github.com/settings/personal-access-tokens/new (it opens now).")
        say("  2. Name: zr-listening. Expiration: up to a year (put a reminder in your calendar).")
        say(f"  3. Repository access: Only select repositories, then {REPO.split('/')[1]}.")
        say("  4. Permissions, Repository permissions: Contents, Read and write. Nothing else.")
        say("  5. Generate token, copy it and paste it here (it won't show as you paste).")
        webbrowser.open("https://github.com/settings/personal-access-tokens/new")
        while True:
            token = getpass.getpass("GitHub token: ").strip()
            problem = check_token(token)
            if not problem:
                break
            say(f"That didn't work: {problem}. Try again, or press Ctrl+C to stop.")
        keychain_set(KEY_GITHUB, token)
        say("Saved in your Keychain.")

    # 3. First run
    say()
    data, auth = gather(config)
    save_auth(auth)
    say("This is what the Listening section on zamilur.com will show:")
    describe(data)
    if ask_yes("Publish it now?"):
        result = publish(token, data)
        log(f"setup: {result}")
        say("Published. zamilur.com shows it in about a minute." if result == "published" else "Already up to date.")
    else:
        say("Not published. You can publish any time with: ~/.zr-listening/zr-listening update")

    # 4. Weekly run
    install_schedule()
    say()
    say("Done. It runs every Monday at 08:00 (or when your Mac next wakes up after that).")
    say("Useful commands:")
    say("  ~/.zr-listening/zr-listening update      publish now")
    say("  ~/.zr-listening/zr-listening preview     see what would be published")
    say("  ~/.zr-listening/zr-listening status      schedule and last run")
    say("  ~/.zr-listening/zr-listening uninstall   remove everything")
    say(f"To keep a book off the site, add its ASIN or a word from its title to \"hide\" in {CONFIG_FILE}.")


def cmd_update(args) -> None:
    config = load_config()
    token = keychain_get(KEY_GITHUB)
    if not token:
        raise SystemExit("There's no GitHub token on this Mac yet. Run: ~/.zr-listening/zr-listening setup")
    try:
        data, auth = gather(config)
        save_auth(auth)  # keeps the refreshed sign-in
        result = publish(token, data)
    except SystemExit as e:
        log(f"failed: {e}")
        notify(f"Couldn't update your Listening section: {e}")
        raise
    except Exception as e:
        log(f"failed: {type(e).__name__}: {e}")
        notify("Couldn't update your Listening section. Run ~/.zr-listening/zr-listening update to see why.")
        raise SystemExit(f"Failed: {type(e).__name__}: {e}")
    s = data.get("stats", {})
    log(f"{result}: {s.get('hoursTotal', '?')} h, {s.get('titlesFinished', '?')} finished, "
        f"{len(data.get('current', []))} in progress")
    say(f"{result.capitalize()}.")
    describe(data)


def cmd_preview(args) -> None:
    config = load_config()
    debug: dict[str, Any] | None = {} if args.debug else None
    data, auth = gather(config, debug)
    save_auth(auth)
    describe(data)
    out = DIR / "preview.js"
    out.write_text(render_js(data))
    say(f"Saved the file it would publish: {out}")
    if debug is not None:
        raw = DIR / "debug-replies.json"
        raw.write_text(json.dumps(debug, indent=2, ensure_ascii=False))
        os.chmod(raw, 0o600)
        say(f"Saved Audible's raw replies (your library, keep it private): {raw}")


def cmd_status(args) -> None:
    say(f"Weekly run:      {'on, Mondays at 08:00' if PLIST.exists() else 'off'}")
    say(f"Audible sign-in: {'saved' if AUTH_FILE.exists() and keychain_get(KEY_AUDIBLE) else 'missing'}")
    say(f"GitHub token:    {'saved' if keychain_get(KEY_GITHUB) else 'missing'}")
    if LOG_FILE.exists():
        lines = LOG_FILE.read_text().strip().splitlines()[-5:]
        say("Last runs:")
        for line in lines:
            say(f"  {line}")


def cmd_uninstall(args) -> None:
    if not ask_yes("Stop the weekly run, remove this Mac from your Audible devices and delete the stored sign-ins?", False):
        return
    remove_schedule()
    if AUTH_FILE.exists() and keychain_get(KEY_AUDIBLE):
        try:
            load_auth().deregister_device()
            say("Removed this Mac from your Audible devices.")
        except Exception as e:
            say(f"Couldn't remove the Audible device ({e}). You can remove it in Amazon's "
                "Manage Your Content and Devices, under Devices.")
    keychain_delete(KEY_AUDIBLE)
    keychain_delete(KEY_GITHUB)
    for f in (AUTH_FILE, DIR / "preview.js", DIR / "debug-replies.json"):
        if f.exists():
            f.unlink()
    say("Done. Also delete the zr-listening token on GitHub (Settings, Developer settings, Personal access tokens).")
    say(f"The last published list stays on zamilur.com until it's removed from {TARGET}.")


def main() -> None:
    parser = argparse.ArgumentParser(prog="zr-listening", description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("setup", help="sign in, publish once, schedule weekly runs")
    p.add_argument("--country", help="Audible store if not the US one: uk, ca, au, de, fr, it, es, in, jp")
    sub.add_parser("update", help="publish now")
    p = sub.add_parser("preview", help="show what would be published")
    p.add_argument("--debug", action="store_true", help="also save Audible's raw replies")
    sub.add_parser("status", help="schedule and last run")
    sub.add_parser("uninstall", help="remove everything")
    args = parser.parse_args()
    if sys.platform != "darwin" and args.command in ("setup", "uninstall"):
        say("Note: this was made for macOS (Keychain and launchd); other systems need changes.")
    {"setup": cmd_setup, "update": cmd_update, "preview": cmd_preview,
     "status": cmd_status, "uninstall": cmd_uninstall}[args.command](args)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        say("\nStopped.")
        sys.exit(130)
