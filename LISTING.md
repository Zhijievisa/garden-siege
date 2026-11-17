# Trello directory listing — copy to paste into the Power-Up admin portal

Bracketed items are for you to fill in. Nothing here is submitted automatically. URLs assume the repository is
`Zhijievisa/garden-siege` with GitHub Pages on; change them if you use another name.

## Basic information

| Field | Value |
|---|---|
| Name | Siege Line |
| Iframe connector URL | `https://zhijievisa.github.io/garden-siege/index.html` |
| Author | ZHIJIEVISA PTY LTD |
| Email | info@zhijievisa.com |
| Support contact | info@zhijievisa.com (help page: `https://zhijievisa.github.io/garden-siege/support.html`) |
| Atlassian account email | [EMAIL OF YOUR ATLASSIAN ACCOUNT] |

## Capabilities to switch on

Board buttons · On enable · Show settings · Authorization status · Show authorization

Also: Authorization → Trello Auth → generate the API key, add `https://zhijievisa.github.io` to the allowed origins,
and put the key in `GS.APP_KEY` in `shared.js`.

## Privacy and compliance

| Field | Value |
|---|---|
| Privacy policy URL | `https://zhijievisa.github.io/garden-siege/privacy.html` |
| Stores personal data outside Trello? | No. Board data and history are read in the browser only; settings and the member's read-only token are stored in Trello Power-Up storage. |

## Listing

**Icon (URL field, 144 × 144 px, HTTPS):** `https://zhijievisa.github.io/garden-siege/listing-icon-144.png`
(`listing-icon.png` is the same design at 512 × 512.)

**Overview (one line):**

> See your whole board as a battle map: cards are tanks, jets and infantry closing on your headquarters, teammates are the guns defending it.

**Images (fictional data, hosted with the Power-Up):**

| Use | URL |
|---|---|
| The battle map with summary tiles and legend | `https://zhijievisa.github.io/garden-siege/img/battle-map.png` |
| One member highlighted, with lines to their cards | `https://zhijievisa.github.io/garden-siege/img/highlight.png` |
| Choosing a zone for each list | `https://zhijievisa.github.io/garden-siege/img/zones.png` |
| Replay controls with the map part-way through a month | `https://zhijievisa.github.io/garden-siege/img/replay.png` |

**Description:** paste the text below into the editor, then insert each image where marked.

```
Siege Line turns a Trello board into one picture you can read in five seconds. Every card is an enemy unit advancing on your headquarters. Every board member is a gun defending it. The nearer a unit is to headquarters, the sooner it needs you.

[IMAGE: battle-map.png]

The problem it solves

A busy board is a wall of cards. You can scroll it, but you cannot see it. Which work is about to land on you? Where is someone waiting for your reply? Who is carrying the front line, and which cards belong to nobody? Siege Line answers those questions with position, colour and a little humour, so the team actually looks.

How it works

1. Click "Battle map" on the board.
2. Tell Siege Line which list is which zone. It guesses from your list names to start with.
3. Read the map from headquarters outwards.

The zones

- At the walls: closest to headquarters. Do these first.
- Shelling: someone is waiting on you and has opened fire.
- Advancing and Midfield: queued work and work in progress.
- Camped: on hold. In camp, not attacking.
- Inbound: leads and ideas just parachuting in.
- Truce: your part is done and you are waiting for an outcome.
- Spoils: finished work with money still to collect.
- Hidden: lists you leave off the map.

What each unit tells you

- Its kind, colour and badge come from the card's first label, so each kind of work is its own kind of unit: tanks, jets, attack helicopters, infantry, armoured cars, bombers, drones, rocket trucks, jeeps.
- Dots under it are the members assigned to the card.
- A red dashed ring means nobody is assigned.
- An orange flag means due soon. A red flag means overdue.
- Hover for the card's details. Click to open the card.

[IMAGE: highlight.png]

See who is doing what

- Click a gun to light up every card that member is assigned to.
- Click a label in the legend to light up one kind of work.
- The Firepower table counts each member's cards in every zone, and lists the cards nobody has picked up.

Replay the last weeks

[IMAGE: replay.png]

- Click Replay and watch the last 7, 30 or 90 days: units appear when cards were created, advance when cards moved, and leave when cards were archived.
- Pause, drag the slider to any day, or speed it up. Each step says what arrived, moved and left.
- Replay needs your permission to read the board's activity history. Access is read-only and you can disconnect at any time.

[IMAGE: zones.png]

Set up for your board

- Choose the zone for each list in one screen.
- Choose how many days ahead counts as "due soon".
- English and Simplified Chinese.

Your data stays in Trello

Siege Line only reads the board in your browser to draw the picture. It does not change your cards. The only thing it saves is its own settings, on your board. Replay is optional and uses read-only access that you grant through Trello; the history is read in your browser and sent nowhere. There is no external server, no separate account to create, no analytics and no tracking.

Good to know

- Everyone who can view the board sees the same map.
- Designed for Trello in a desktop browser.
- Free to use.

Help and support: https://zhijievisa.github.io/garden-siege/support.html
```

**Suggested categories:** Board utilities; Analytics & reporting. Choose from whatever the form offers.

## Before you submit

- [ ] The files are live at the connector URL and you have used the Power-Up on your own board for a while.
- [ ] `privacy.html`: you have reviewed it as a legal document for your own entity.
- [ ] Name, listing text and images do not mention or imitate any existing game or brand. The artwork in this
      folder is original; keep it that way if you change it.
- [ ] The five capabilities are on: Board buttons, On enable, Show settings, Authorization status, Show authorization.
- [ ] The API key is generated, `https://zhijievisa.github.io` is an allowed origin, and `GS.APP_KEY` in `shared.js` is set.
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
| Connector URL | `https://zhijievisa.github.io/garden-siege/index.html` |
| Power-Up ID | `6afbcaea648fae9c55657ec3` |
| Preferred launch date | [DATE YOU WANT IT TO GO LIVE, or "as soon as approved"] |

**What it does (paste):**

> Siege Line draws the board as a battle map. Lists are mapped to zones from "At the gate" outwards; each card is
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
