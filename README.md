# Garden Siege

A Trello Power-Up that draws a board as a battle map. Every card is a zombie walking towards your house; every
board member is a plant defending it. The nearer a zombie is to the house, the sooner it needs you.

Version 1.1.0 · English and 简体中文

## What it shows

- **Zones from lists.** Each list is given a zone: At the gate, Throwers, Advancing, Midfield, Dozing, Emerging,
  Bubbled (awaiting an outcome), Coins (money to collect) or Hidden. Until zones are chosen they are guessed from
  list names.
- **Zombie types from labels.** A card's first label decides its colour and badge.
- **Plants from members.** Dots under a zombie are the members assigned to it. A red dashed ring means nobody is.
- **Due dates.** Orange flag for due soon, red flag for overdue.
- **Highlighting.** Click a plant to see everything that member is assigned to; click a type to see one label.
- **Firepower table.** Each member's card count by zone, plus unassigned cards.
- **Replay.** With the member's read-only permission, plays back the last 7, 30 or 90 days from the board's
  activity history: cards appear, walk between zones and leave.
- Click any zombie or coin to open its card.

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

1. Serve this folder over HTTPS (for example GitHub Pages).
2. In https://trello.com/power-ups/admin create a Power-Up whose Iframe connector URL is `…/index.html`.
3. Enable the capabilities: **Board buttons**, **On enable**, **Show settings**, **Authorization status**,
   **Show authorization**.
4. For replay: in the Power-Up's Authorization → Trello Auth page generate an API key, add your hosting origin
   (for example `https://<you>.github.io`) to the allowed origins, and put the key in `GS.APP_KEY` in `shared.js`.
   The key is public by design. While `GS.APP_KEY` is empty, replay is hidden and everything else works.
5. Add it to a board from Power-Ups → Custom.

Opening `battle.html`, `settings.html`, `welcome.html` or `authorize.html` directly in a browser runs them in demo
mode with a fictional board and a made-up history. Add `?auth=0` to see the not-yet-authorised state.

## Known limits

- Reads open cards in open lists only, as provided by the Trello client library.
- Only the nine most common first labels get their own colour; other labels are grey.
- A card shows at most five member dots.
- Replay follows list positions only: labels and members are today's, vanished cards are grey, and at most 10,000
  history events are loaded.
- Designed for Trello in a desktop browser.
- Artwork is original to this project.

## Changelog

**1.1.0** Replay from the board's activity history, with read-only authorisation.

**1.0.0** First version.
