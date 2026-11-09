# E-Start — Spatial New Tab Dashboard

E-Start is a lightweight, browser-based start page with a live clock, contextual greeting, configurable search engine, quick-launch dock, and compact workspace panels.

## Current experience

- Spatial glassmorphism interface with an optional animated Vanta.js background
- Live local-time clock and time-of-day greeting
- Google, Bing, DuckDuckGo, and Yahoo search selection
- Editable speed-dial links persisted in browser storage
- Workspace shortcuts for commonly used Google services
- History and bookmarks panels that are available only when the page runs with the required browser-extension APIs

## Run locally

1. Clone or download this repository.
2. Open `index.html` in a modern browser, or serve the folder with any static HTTP server.
3. Set the page as your browser's home page if desired.

The static page can also be deployed to GitHub Pages. Browser-extension-only APIs such as `chrome.history` and `chrome.bookmarks` are not available on an ordinary hosted webpage.

## Chrome extension mode

The repository includes a Manifest V3 manifest for a New Tab override. To test it as an unpacked extension:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked** and select this repository folder.
4. Open a new tab.

The manifest requests only the `history` and `bookmarks` permissions. The dashboard's quick links and search work as a normal webpage; history and bookmarks require the extension context and their corresponding permissions.

**Extension packaging note:** this repository currently references Bootstrap Icons, Google Fonts, Three.js, and Vanta.js from public CDNs. Manifest V3 extension pages restrict remotely hosted scripts and styles, so the animated Vanta background and some external presentation assets may be unavailable when loaded unpacked. For a fully self-contained extension release, vendor the required assets locally and verify the extension's Content Security Policy before publishing. The normal static-web experience can continue to use those CDN assets.

## Project structure

- `index.html` — dashboard markup and panels
- `style.css` — layout, visual system, and responsive behavior
- `script.js` — clock, search, panels, and speed-dial behavior
- `manifest.json` — Manifest V3 New Tab configuration

## Final verification checklist

Before publishing a release, verify these flows in a current desktop and mobile browser:

- [ ] Clock and greeting update correctly.
- [ ] Each search engine submits a non-empty query.
- [ ] Engine selection works with mouse, Enter, Space, Arrow keys, Home, End, and Escape.
- [ ] Speed dials accept only HTTP(S) URLs, reject duplicates, and survive a reload.
- [ ] Invalid or unavailable browser storage does not break the dashboard.
- [ ] History and bookmarks show a clear explanation outside extension context.
- [ ] Dialogs close from the close button, backdrop, and Escape; focus returns to the opener.
- [ ] Reduced-motion preference disables the animated background.
- [ ] Layout remains usable at narrow mobile widths and with a large shortcut collection.

This checklist is a release guide, not a claim that every browser/device combination has already been manually tested.

## Privacy

Search queries are sent directly to the search provider selected by the user. Speed-dial preferences are stored locally in the browser. No application backend or account system is included.

## Roadmap

The migration focuses on reliable browser behavior, accessible interactions, responsive layouts, maintainable settings, and accurate extension-versus-web capability handling.
