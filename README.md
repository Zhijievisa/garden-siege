# Siege Line

A Trello Power-Up that draws a board as a battle map. Every card is an enemy unit advancing on your headquarters;
every board member is a gun defending it. The nearer a unit is to headquarters, the sooner it needs you.

Version 1.3.4 · English and 简体中文

## What it shows

- **Zones from lists.** Each list is given a zone: At the walls, Shelling, Advancing, Midfield, Camped, Inbound,
  Truce (awaiting an outcome), Spoils (money to collect) or Hidden. Until zones are chosen they are guessed from
  list names.
- **Unit types from labels.** A card's first label decides what it is: tank, jet, attack helicopter, infantry,
  armoured car, bomber, drone, rocket truck or jeep, with its own colour and badge. Labels that share a number or a first word count as one type.
- **Guns from members.** Each member is an artillery piece. Dots under a unit are the members assigned to it. A
  red dashed ring means nobody is.
- **Due dates.** Orange flag for due soon, red flag for overdue.
- **Highlighting.** Click a gun to see everything that member is assigned to; click a type to see one label.
- **Firepower table.** Each member's card count by zone, plus unassigned cards.
- **Replay.** With the member's read-only permission, plays back the last 7, 30 or 90 days from the board's
  activity history: units appear, move between zones and leave.
- Click any unit or coin to open its card.

## Data and privacy

Static front-end files only. There is no server and no database. The Power-Up reads lists and cards in the
browser through the Trello Power-Up client library and writes one thing: its settings, in Trello Power-Up storage
on the board (`board/shared/cfg`).

Replay is optional. It uses the Power-Up REST API client: the member authorises a read-only token (kept by Trello in
the member's private Power-Up data), and the browser requests `GET /1/boards/{id}/actions` from api.trello.com for
card creation, list moves, archiving and deletion. Nothing is sent anywhere else. See `privacy.html`.

## Files

| File | Purpose |
|---|---|
| `index.html`, `connector.js` | Trello iframe connector: board button, welcome modal, settings popup |
| `battle.html`, `battle.js` | The battle map modal |
| `settings.html`, `settings.js` | Language, "due soon" window, list → zone mapping (also used inline in the map) |
| `welcome.html`, `welcome.js` | Getting-started modal shown when the Power-Up is enabled |
| `authorize.html`, `authorize.js` | History-access popup (show-authorization capability) |
| `shared.js` | Interface strings, settings, zone guessing, the board model, history fetching and reconstruction, demo data |
| `ui.css`, `icon.svg`, `icon-white.svg` | Styles and board-button icons |
| `privacy.html`, `support.html` | Privacy policy and help page |
| `LISTING.md`, `listing-icon.*`, `img/` | Copy, icon and screenshots for the Trello directory listing |

## Self-hosting

1. Serve this folder over HTTPS from a host that applies the `_headers` file (Cloudflare Pages, Netlify). GitHub Pages also works, but it cannot send the security response headers that Trello's review checks.
2. In https://trello.com/power-ups/admin create a Power-Up whose Iframe connector URL is `…/index.html`.
3. Enable the capabilities: **Board buttons**, **On enable**, **Show settings**, **Authorization status**,
   **Show authorization**.
4. For replay: in the Power-Up's Authorization → Trello Auth page generate an API key, add your hosting origin
   (for example `https://<you>.github.io`) to the allowed origins, and put the key in `GS.APP_KEY` in `shared.js`.
   The key is public by design. While `GS.APP_KEY` is empty, replay is hidden and everything else works.
5. Add it to a board from Power-Ups → Custom.

Opening `battle.html`, `settings.html`, `welcome.html` or `authorize.html` directly in a browser runs them in demo
mode with a fictional board and a made-up history. Add `?auth=0` to see the not-yet-authorised state.

## Releasing a change

GitHub Pages lets browsers keep files for about ten minutes. Bump `GS.VERSION` and the `?v=` value on the script
and style URLs in every `.html` file together, so users get one consistent set of files.

## Known limits

- Reads open cards in open lists only, as provided by the Trello client library.
- Only the nine most common first labels get their own unit and colour; other labels are grey trucks.
- A card shows at most five member dots.
- Replay follows list positions only: labels and members are today's, vanished cards are grey, and at most 10,000
  history events are loaded.
- Designed for Trello in a desktop browser.
- Artwork is original to this project.

## Changelog

**1.3.4** Review fix: `style-src` now allows inline styles, because Trello's Power-Up library (`power-up.min.js`) injects them and the stricter policy logged console errors; `script-src` is unchanged (no inline script, no eval). The `<meta>` copy of the policy is removed, so the response header in `_headers` is the only policy and a violation is reported once.

**1.3.3** Medals: one for every unit destroyed, shown on each gun; the gun with the most medals wears a crown.

**1.3.2** Replay shows who destroyed each unit: tracers from the guns of the assigned members, their names over the burst, a kill feed, a "Destroyed so far" scoreboard and a Destroyed column in the Firepower table.

**1.3.1** Replay switched on (API key set; allowed origin `https://siege-line.pages.dev`).

**1.3.0** Security hardening for Trello's public review: no inline scripts (pages start from `boot.js`), a strict
Content-Security-Policy on every page (`<meta>` tag) and as a response header (`_headers`), plus HSTS,
`X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`. Hosting moved to Cloudflare Pages, which
applies `_headers`; GitHub Pages cannot send custom response headers. Listing animation added.

**1.2.0** Military artwork: enemy units chosen by label, guns for members. Label variants that share a number or a
first word are one unit type. Renamed Siege Line.

**1.1.0** Replay from the board's activity history, with read-only authorisation.

**1.0.0** First version.
