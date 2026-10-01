# zr-listening

Puts Zamilur's Audible listening on zamilur.com: what he's listening to now, the books he finished
most recently, his total listening time and how many titles he has finished. It runs on his own Mac
once a week. This folder isn't published; only `site/` goes live.

## How it works

1. A weekly job on the Mac (launchd, Mondays at 08:00, or at the next wake after that) runs
   `zr_listening.py update`.
2. The script signs in to Audible with the sign-in saved on the Mac and reads the library, the
   dates books were marked finished, the last listening positions and the listening stats.
3. It writes `site/listening.js` (`window.ZR_LISTENING = {...}`) and commits it to this repo through
   GitHub's API, only when something changed. Netlify publishes it a minute later, and the Listening
   section on the main page reads it. The section stays hidden until the file has data.

Nothing else on the site is touched, and only the current book, the last six finished books
(configurable) and the totals are published, not the whole library.

## Install (on the Mac)

```
bash -c "$(curl -fsSL https://raw.githubusercontent.com/zamilurpersonal-source/personal_website/main/tools/listening/install.sh)"
```

The installer puts the script in `~/.zr-listening`, installs [uv](https://docs.astral.sh/uv/) if
needed (it runs the script with its own Python and the `audible` library) and starts the setup:

- **Audible sign-in:** Amazon's sign-in page opens in the browser. After signing in the browser shows
  "Page not found"; its address is pasted back into Terminal. This registers the Mac as an Audible
  app on the account.
- **GitHub token:** a fine-grained token limited to this repo with Contents: Read and write
  (github.com/settings/personal-access-tokens/new).
- A preview of what will be published, a first publish, and the weekly job.

## Where things are kept

- `~/.zr-listening/audible-auth.json`: the Audible sign-in, encrypted. The key is in the macOS
  Keychain ("zr-listening Audible file key").
- The GitHub token: in the Keychain ("zr-listening GitHub token").
- `~/.zr-listening/config.json`: `country`, `show_current`, `show_finished`, `hide` (ASINs or words
  from titles to keep off the site), `profile` (an Audible profile link to show, optional).
- `~/.zr-listening/last-run.log`: one line per run. A failed weekly run also shows a macOS notification.
- `~/Library/LaunchAgents/com.zamilur.listening.plist`: the weekly job.

## Commands

```
~/.zr-listening/zr-listening update      publish now
~/.zr-listening/zr-listening preview     show what would be published (--debug saves Audible's raw replies)
~/.zr-listening/zr-listening status      schedule, sign-ins and last runs
~/.zr-listening/zr-listening setup       run the setup again (new sign-in or token)
~/.zr-listening/zr-listening uninstall   stop the job, remove the Mac from Audible devices, delete the sign-ins
```

## Good to know

- It uses Audible's private app interface through the open-source
  [audible](https://github.com/mkb79/Audible) library. Audible doesn't support this and may change it,
  and automated access is against Amazon's terms; one read-only run a week is the gentlest use.
- If Audible changes something, a run fails, the notification shows and the site keeps the last
  published list. `preview --debug` saves the raw replies to work out what changed.
- To revoke access without the Mac: remove the device in Amazon's Manage Your Content and Devices
  (Devices, Audible) and delete the token on GitHub.
- The GitHub token expires on the date chosen when making it; make a new one and run `setup` again.
