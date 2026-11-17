# Trello directory listing — copy to paste into the Power-Up admin portal

Bracketed items are for you to fill in. Nothing here is submitted automatically. The Power-Up is served from Cloudflare Pages (project `siege-line`, built from the repository
`Zhijievisa/garden-siege`), because Trello's review checks the HTTP security headers and GitHub Pages cannot send them.

## Basic information

| Field | Value |
|---|---|
| Name | Siege Line |
| Iframe connector URL | `https://siege-line.pages.dev/` |
| Author | ZHIJIEVISA PTY LTD |
| Email | info@zhijievisa.com |
| Support contact | info@zhijievisa.com (help page: `https://siege-line.pages.dev/support`) |
| Atlassian account email | [EMAIL OF YOUR ATLASSIAN ACCOUNT] |

## Capabilities to switch on

Board buttons · On enable · Show settings · Authorization status · Show authorization

Also: Authorization → Trello Auth → generate the API key, add `https://siege-line.pages.dev` to the allowed origins,
and put the key in `GS.APP_KEY` in `shared.js`.

## Privacy and compliance

| Field | Value |
|---|---|
| Privacy policy URL | `https://siege-line.pages.dev/privacy` |
| Stores personal data outside Trello? | No. Board data and history are read in the browser only; settings and the member's read-only token are stored in Trello Power-Up storage. |

## Listing

**Icon (URL field, 144 × 144 px, HTTPS):** `https://siege-line.pages.dev/listing-icon-144.png`
(`listing-icon.png` is the same design at 512 × 512.)

**Overview (one line):**

> See your whole board as a battle map: cards are tanks, jets and infantry closing on your headquarters, teammates are the guns defending it.

**Images (fictional data, hosted with the Power-Up):**

| Use | URL |
|---|---|
| Animation: hovering a unit, highlighting a member, highlighting a label | `https://siege-line.pages.dev/img/demo.gif` |
| The battle map with summary tiles and legend | `https://siege-line.pages.dev/img/battle-map.png` |
| One member highlighted, with lines to their cards | `https://siege-line.pages.dev/img/highlight.png` |
| Choosing a zone for each list | `https://siege-line.pages.dev/img/zones.png` |
| Animation: replay of a month (use only when replay is switched on) | `https://siege-line.pages.dev/img/replay.gif` |
| Replay controls, still image (use only when replay is switched on) | `https://siege-line.pages.dev/img/replay.png` |

**Description:** Markdown, paste as is. The section between the two `REPLAY` markers describes replay; include it
only when replay is live (an API key is set in `GS.APP_KEY`), and delete the marker lines. A listing must not
describe a feature the reviewer cannot find.

```
Siege Line is for teams whose Trello board has grown past what anyone can take in at a glance: agencies, law and migration practices, support desks, studios, anyone with dozens or hundreds of open cards. It redraws the whole board as one battle map. Every card is an enemy unit advancing on your headquarters, every board member is a gun defending it, and the nearer a unit is to headquarters, the sooner it needs you.

![Siege Line in action: hovering a unit, highlighting one member's cards, highlighting one label](https://siege-line.pages.dev/img/demo.gif)

## The problem it solves

A busy board is a wall of cards. You can scroll it, but you cannot see it. Which work is about to land on you? Where is someone waiting for your reply? Who is carrying the front line, and which cards belong to nobody? Siege Line answers those questions with position and colour, in a picture the team will actually look at.

## How it works

1. Click **Battle map** on the board.
2. Tell Siege Line which list belongs to which zone. It guesses from your list names to start with.
3. Read the map from headquarters outwards.

![The battle map: summary tiles, legend, zones from "At the walls" to "Inbound"](https://siege-line.pages.dev/img/battle-map.png)

## What you see

- **Zones.** At the walls (do these first), Shelling (someone is waiting on you), Advancing and Midfield (queued and in progress), Camped (on hold), Inbound (new leads and ideas), Truce (your part is done, awaiting an outcome), Spoils (finished work with money still to collect).
- **Units.** Kind, colour and badge come from the card's first label, so each kind of work is its own kind of unit: tanks, jets, attack helicopters, infantry, armoured cars, bombers, drones, rocket trucks, jeeps.
- **Who is on it.** Dots under a unit are the members assigned to the card. A red dashed ring means nobody is.
- **Deadlines.** An orange flag means due soon. A red flag means overdue.
- **Headline numbers.** Tiles count the units on the field, at the walls, shelling you, due soon, overdue and unguarded.

## See who is doing what

![One member highlighted, with tracer lines to every card they are assigned to](https://siege-line.pages.dev/img/highlight.png)

- Click a gun to light up every card that member is assigned to.
- Click a label in the legend to light up one kind of work.
- The Firepower table counts each member's cards in every zone, and lists the cards nobody has picked up.
- Hover over a unit for the card's details. Click it to open the card.

<!-- REPLAY: start -->
## Replay the last weeks

![Replay: a month of the board played back day by day](https://siege-line.pages.dev/img/replay.gif)

- Click **Replay** and watch the last 7, 30 or 90 days: units appear when cards were created, advance when cards moved, and leave when cards were archived.
- Pause, drag the slider to any day, or speed it up. Each step says what arrived, moved and left.
- Replay needs your permission to read the board's activity history. Access is read-only and you can disconnect at any time.
<!-- REPLAY: end -->

## Why use it

- **Triage in five seconds.** What is at the walls and what is shelling you is the first thing you see.
- **Nothing falls through.** Unassigned and overdue cards are marked on the map and counted at the top.
- **Balance the load.** See at once which member is covering the front line and who has room.
- **No new system.** It reads the lists, labels, members and due dates you already use. It never changes a card.

## Set up for your board

![Choosing a zone for each list](https://siege-line.pages.dev/img/zones.png)

- Choose the zone for each list on one screen.
- Choose how many days ahead counts as "due soon".
- English and Simplified Chinese. Light and dark themes.

## Your data stays in Trello

Siege Line reads the board in your browser to draw the picture. It does not change your cards. The only thing it saves is its own settings, on your board. There is no external server, no separate account to create, no analytics and no tracking.

## Good to know

- Everyone who can view the board sees the same map.
- Designed for Trello in a desktop browser.
- Free to use.

Help and support: https://siege-line.pages.dev/support
```

**Suggested categories:** Board utilities; Analytics & reporting. Choose from whatever the form offers.

## Before you submit

- [ ] The files are live at the connector URL and you have used the Power-Up on your own board for a while.
- [ ] `privacy.html`: you have reviewed it as a legal document for your own entity.
- [ ] Name, listing text and images do not mention or imitate any existing game or brand. The artwork in this
      folder is original; keep it that way if you change it.
- [ ] The five capabilities are on: Board buttons, On enable, Show settings, Authorization status, Show authorization.
- [ ] The API key is generated, `https://siege-line.pages.dev` is an allowed origin, and `GS.APP_KEY` in `shared.js` is set.
- [ ] Replay works in real Trello: Allow read access → Trello consent → the last 30 days play; Settings → Disconnect.
- [ ] All fields in Basic information, Listings and Privacy and compliance are complete.
- [ ] You have read the Atlassian developer terms, the Trello-specific terms and the public Power-Up guidelines.
- [ ] Test on a brand-new board: enable (the welcome modal opens), open the map, set zones, save, click a gun,
      click a unit (its card opens), open Settings from the Power-Ups menu.
- [ ] Test with a second Trello account that is only an observer: the map opens and the settings are read-only.
- [ ] Test in Trello's dark theme.
- [ ] No red errors in the browser Console (F12) while using the Power-Up. Reviewers reject Power-Ups with console errors.
- [ ] Submit through the form at go.trello.com/dev-support, then wait for the review team.

## Submission form answers

| Item | Value |
|---|---|
| Connector URL | `https://siege-line.pages.dev/` |
| Power-Up ID | `6afbcaea648fae9c55657ec3` |
| Preferred launch date | [DATE YOU WANT IT TO GO LIVE, or "as soon as approved"] |

**What it does (paste):**

> Siege Line draws the board as a battle map. Lists are mapped to zones from "At the walls" outwards; each card is
> drawn as an enemy unit in its list's zone, its kind and colour set by its first label, with its assigned members
> shown as dots and its due date as a flag. Members are drawn as guns; clicking one highlights their cards. A table counts each
> member's cards per zone. Optional replay plays back the last 7/30/90 days from the board's action history.

**How to test (paste):**

> 1. Enable the Power-Up on a board that has a few lists, cards, labels and members. A short welcome modal opens.
> 2. Click "Battle map" on the board. A full-screen modal shows the map.
> 3. Click "Set up zones", choose a zone for each list, and Save. The map redraws.
> 4. Hover over a unit to see its card details; click it to open the card.
> 5. Click a gun to highlight that member's cards; click a label in the legend to highlight that label.
> 6. Click "Replay" → "Allow read access" → approve Trello's consent screen. The last 30 days play back; use
>    Pause, the slider, the period and the speed.
> 7. Power-Up Settings (Power-Ups menu): language, "due soon" window, zones, and "Disconnect" for replay access.

**Data and privacy (paste):**

> The Power-Up reads lists and cards through the Power-Up client library, in the browser only. Replay uses the
> Power-Up REST API client with scope "read": the browser requests GET /1/boards/{id}/actions (card create, list
> move, archive, delete) from api.trello.com. The token stays in the member's private Power-Up data. The Power-Up
> implements authorization-status and show-authorization, and Settings has a Disconnect button. It stores only its
> settings (board/shared). There is no external server, no third-party account, no analytics and no tracking. No
> personal data is stored outside Trello.

## After approval

Any file you change at the connector URL is live for every user immediately. Test changes on a separate copy
(a second custom Power-Up pointing at a staging URL) before replacing the live files.
