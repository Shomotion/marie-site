# Annemarie Schubert — site

## Pages

The nav links to five separate HTML files instead of anchors within one
page:

- `index.html` — Home. Keeps the original single-page layout: hero photo,
  fade-to-black gradient, the "Annemarie Schubert / Violin" text, and a
  full summary underneath (bio, events list, media grid, contact) ending
  in the footer — all in solid black `.content`, same as the very first
  version of this site. The nav's Biography/Events/Media/Contact links
  now point to the dedicated pages below rather than scrolling to an
  anchor on this page.
- `biography.html` — full bio, floating directly over the fixed photo.
- `events.html` — a grid of upcoming performances, floating over the photo.
- `media.html` — placeholder tiles; swap in real recordings/video later.
- `contact.html` — placeholder contact info.

Each of the four inner pages hardcodes which nav link gets the `active`
class (the current page's own link) directly in its markup, since there's
no single scrolling page to track a scroll position on anymore.

## Two different layouts, by design

**Home (`index.html`)** works the way it always has: the photo is fixed,
`.content` is solid black, and it slides up to cover the photo as you
scroll (see "How the fixed-image effect works" below).

**The four inner pages** work differently on purpose: the photo stays
fixed *and fully visible* for the entire page, from right under the nav
down to the footer — `.content-overlay` (used instead of `.content` on
these pages) never turns solid black. Instead:

- There's no `.hero-spacer` — content starts immediately below the nav.
- Body copy and event cards each get their own translucent, blurred
  "glass panel" background (`.content-overlay .section`, `.event-card`)
  so text stays legible over the photo, without hiding the image the way
  a full opaque panel would.
- The page title (`.page-lead`) stays plain text over the photo, like the
  nav does — no panel needed for a short heading.
- `.hero-fixed`'s dark overlay is boosted for these pages
  (`body.page-inner .hero-fixed::after`) for a bit of extra baseline
  contrast everywhere, on top of the per-panel glass treatment.
- Because `.hero-fixed` is `position: fixed` at `100vh`, it always fills
  whatever's currently in the viewport — so this works no matter how long
  the page's content is, or how far the user has scrolled; the photo
  itself never changes or gets covered, only the content scrolling over
  it does.

## How the fixed-image effect works (Home)

- `.hero-fixed` holds only the photo and is `position: fixed`, so it never
  moves — it stays pinned behind everything else, on every page.
- `.page` wraps the nav, the `.hero-spacer`, and the black `.content` —
  everything else on the page. It's normal (non-fixed) flow, so all of it,
  including the nav, scrolls up together at the same rate. It only needs a
  higher stacking order (`z-index`) than `.hero-fixed` so the photo shows
  through wherever `.page` is transparent (over the nav and the spacer).
- `.hero-spacer` is an empty `100vh`-tall block right after the nav. Because
  the photo itself is `fixed` (out of normal document flow), this spacer is
  what actually gives the page scrollable height for "one screen of photo."
- `.content` is the solid black section that comes after the spacer. As the
  user scrolls, it slides up the page like any regular content and visually
  covers the fixed photo from the bottom up, since it has a solid
  background and sits above the photo in stacking order.

**Home only:** `.content-gradient` and `.hero-text` are both absolutely
positioned at the same negative offset from the top of `.content`, so they
overlap the tail end of the photo and travel up together with the rest of
`.content` as you scroll — the gradient fade and the name/instrument text
move as one unit, anchored to the black content rather than to the photo.

The four inner pages don't use `.content` at all — see "Two different
layouts, by design" above for how `.content-overlay` differs.

## The scroll bounce

There's no custom JS for this — it's the browser's native rubber-band/
elastic overscroll, which runs automatically when you scroll past the top
or bottom of the page on a trackpad in Safari/Chrome on macOS (and on
touchscreens generally). `styles.css` just makes sure nothing disables it
(`overscroll-behavior` is left at its default `auto`).

This is also almost certainly what the original site was relying on —
Elementor doesn't ship custom bounce-physics JS either. A hand-rolled
JavaScript version (intercepting `wheel` events and animating a transform)
was tried here first and removed, because it can't access real trackpad
touch state the way the OS can, so it either fights the gesture while
you're mid-scroll or can't tell a paused two-finger drag from a released
one. The native version has neither problem, and needs zero code.

One consequence: on platforms without native elastic scrolling (Windows,
most of Linux, a plain mouse wheel), there's simply no bounce. That
matches how the original behaves there too.

## Setup

1. Drop your background photo into `assets/hero.jpg` (replace the file name
   or update the `background-image` path in `styles.css` under `.hero-bg`
   — it's referenced once, so it applies to every page).
2. Open `index.html` in a browser to preview locally, or run a tiny local
   server (recommended so relative paths behave the same as on GitHub):
   ```
   cd site
   python3 -m http.server 8000
   ```
   then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Create a new GitHub repo and push this folder's contents to it (this
   `README.md`, the five `.html` files, `styles.css`, `script.js`, and
   `assets/` should sit at the repo root, or inside `/docs` if you prefer
   that convention).
2. In the repo: **Settings → Pages → Build and deployment → Source**, choose
   **Deploy from a branch**, pick `main` (or `master`) and `/ (root)` (or
   `/docs`), then save.
3. GitHub will publish at `https://<username>.github.io/<repo-name>/`
   within a minute or two.

## Customizing

- Colors, type, and spacing are all controlled by CSS variables at the top
  of `styles.css` (`--black`, `--cream`, `--gold`, `--muted`, fonts).
- Page content is plain HTML in each respective file — edit the text
  directly. The events grid (`.event-grid` / `.event-card`) and media
  placeholder tiles (`.media-grid` / `.media-tile`) are just repeated
  markup blocks; copy/paste one to add another card or tile.
- To change how much photo is visible before the black content begins on
  Home, adjust `.hero-spacer { height: 100vh; }` and `.content-gradient
  { height: 42vh; top: -42vh; }` together (keep those two values equal and
  opposite so the fade lines up). Inner pages have no `.hero-spacer` at
  all — their content starts right under the nav.
- To adjust the glass-panel legibility treatment on inner pages, see
  `.content-overlay .section` / `.event-card` (background opacity and
  blur amount) and `body.page-inner .hero-fixed::after` (the baseline
  darkening wash) in `styles.css`.
- Adding a new page: copy any inner page (e.g. `contact.html`), update the
  `<title>`, move the `active` class to the right nav link on **every**
  page's copy of the nav (including this new file's own nav), and add a
  link to it from the other four pages' `.nav-links`.
