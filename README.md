# zamilur.com

Zamilur Rashid's personal website. Every push to `main` goes live on zamilur.com through Netlify
(see `netlify.toml`: no build step, the `site/` folder is published as it is).

## What's where

```
site/
  index.html, site.css, site.js   the main page
  schedule.js                     work days and hours, his holidays and breaks (timeOff),
                                  and Bangladesh government holidays for the Studios row
  img/                            photos, logos and icons
  prototypes.html, .css, .js      Play my prototypes: the game cards and the full-screen player
  play/list.js                    the list of games on the Prototypes page
  play/<game>/v1/                 each game's files
  listening.js                    Audible listening for the Listening section (written weekly, see below)
tools/listening/                  the script that writes site/listening.js from Zamilur's Mac (not published)
```

The main page and the Prototypes page change independently: main-page updates touch the top-level
files in `site/`, and shipping a game touches only `site/play/`.

`site/listening.js` is written by `tools/listening/zr_listening.py`, which runs once a week on
Zamilur's Mac, reads his Audible library and listening stats there, and commits only that file
through GitHub's API. See `tools/listening/README.md`.

## Good to know

- The weather comes live from Open-Meteo (open-meteo.com, free, no account), fetched by each
  visitor's browser and kept for 30 minutes. If a host blocks outside requests, it's hidden.
- Fonts load from Google Fonts.
- The cover photos and the Bangladesh photos come from Wikimedia Commons under Creative Commons
  licences; their credits are shown on the page. The New York State map is drawn from US Census
  boundaries (public domain, via the us-atlas package).
- To try it on your computer: `cd site && python3 -m http.server 8000`, then open
  http://localhost:8000 (the games need to be served over http).
