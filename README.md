# Afterglow — MVP1 + MVP2 Frontend

Vanilla HTML/CSS/JS, no build step, no framework. Split into pages, layouts, and sections as separate files so each concern can be worked on independently.

## Run it

The app shell (`pages/app.html`) fetches its sections (`partials/*.html`) at runtime, so it needs to be served over HTTP — opening it directly as a `file://` URL will fail (browsers block `fetch()` on local files).

From the project root:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:3000` (or `:8080`) in your browser. `index.html` is the entry point.

## Flow

```
index.html (auth)
   └─ signup → pages/onboarding.html (4-step profile builder)
        └─ finish → pages/app.html (shell)
                       ├─ partials/topbar.html
                       ├─ partials/discover.html   (swipe deck)
                       ├─ partials/matches.html    (sparks + chat list)
                       ├─ partials/chat.html       (message thread)
                       ├─ partials/profile.html    (settings)
                       ├─ partials/match-modal.html
                       └─ partials/bottomnav.html
```

State lives in `localStorage` (`js/state.js`) so it survives navigating between the three real pages above. Every place that fakes a backend call is marked with a `// API:` comment showing the real endpoint it maps to — see the architecture doc for the matching service design.

## File map

```
afterglow-mvp/
├── index.html                 # Auth page (login/signup) — entry point
├── pages/
│   ├── onboarding.html        # Profile builder (name, preferences, avatar, bio)
│   └── app.html                # Shell that mounts the partials below
├── partials/
│   ├── topbar.html
│   ├── bottomnav.html
│   ├── discover.html           # Swipe deck + action buttons
│   ├── matches.html            # Sparks strip + conversation list
│   ├── chat.html                # Message thread
│   ├── profile.html            # Settings, verification, safety center
│   └── match-modal.html        # "It's a Spark" mutual-match modal
├── css/
│   ├── variables.css           # Design tokens (colors, radius, shadow)
│   ├── base.css                 # Reset, typography, brandmark
│   ├── components.css           # Shared: buttons, cards, chips, toggles, forms
│   ├── auth.css
│   ├── onboarding.css
│   ├── app-shell.css            # Topbar + bottom nav + view switching
│   ├── discover.css
│   ├── matches.css
│   ├── chat.css
│   ├── profile.css
│   └── modal.css
└── js/
    ├── state.js                 # Shared STATE object, localStorage persistence
    ├── data.js                  # Fictional seed data for the discovery deck
    ├── utils.js                  # toast(), calcAge()
    ├── auth.js                   # index.html only
    ├── onboarding.js             # pages/onboarding.html only
    ├── partial-loader.js         # pages/app.html only — fetches partials, view router
    ├── discover.js                # swipe/match logic
    ├── matches.js                 # matches list rendering
    ├── chat.js                    # message thread logic
    └── profile.js                  # profile view + settings
```

## Next steps

- Replace `js/data.js` seed generator with a real `GET /discovery/candidates` call.
- Replace `localStorage` in `js/state.js` with real session/API calls once a backend exists.
- Wire `verifyProfile()` in `js/profile.js` to a real liveness-check vendor.
- Wire the chat WebSocket in `js/chat.js` instead of the simulated auto-reply.
