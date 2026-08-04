// Fetches events.json and renders the event grid on events.html.
// Each event becomes an .event-card with a "Details" trigger, plus a
// <dialog> listing every entry in event.performances (one .event-instance
// block each, with a divider automatically appearing between multiple
// performances). Each performance can have its own optional link/button
// — there's no single dialog-wide link anymore.
//
// Schema per event — required fields marked, everything else optional:
//   id [REQUIRED] — unique slug, used to build the dialog's element id.
//                    Two events sharing an id will collide; an event
//                    missing one is skipped entirely (see below).
//   date      — overall date range, shown on the card front. Blank line
//               if omitted.
//   title     — WHO is presenting (ensemble/presenter/festival) — never
//               a piece title. Shown on the card front and dialog header.
//   location  — short place, shown on the card front, one line.
//   performances[] — one entry per actual dated occurrence. Omit the
//                     whole array (or leave it empty) for an event with
//                     no dialog content at all — no "Details" button
//                     will be rendered in that case.
//     work    — the piece being performed at that date. Omit (or use
//                null) if there isn't a distinct one to name — the
//                heading line is simply skipped, no placeholder text.
//     when    — date + time for that performance. Optional.
//     venue   — venue name + address for that performance. Optional.
//     link    — optional button for THIS performance: { label, url }.
//               `url` is required *if* `link` is present — a link
//               object without a url is dropped (with a console
//               warning) rather than rendering a broken href.
//               `label` defaults to "More Info" if omitted.
//   A performance entry with no work, when, venue, or link renders
//   nothing at all (rather than an empty box).
//
// Requires the page to be served over http(s); fetch() will fail if the
// file is opened directly (file://). For local testing, run e.g.
// `python3 -m http.server` in the site folder and open localhost.
//
// Plain-text fields (date/title/location/link label) are set via
// textContent, so venue names etc. are always safe even if they contain
// characters like & or <. "work"/"when"/"venue" inside performances are
// inserted as HTML on purpose, since that text should stay freely
// customizable (e.g. an em dash or a <br> for a multi-line address) —
// only put trusted text there, since it isn't escaped.

async function loadEvents() {
  const grid = document.getElementById("event-grid");
  if (!grid) return;

  let events;
  try {
    const response = await fetch("events.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    events = await response.json();
  } catch (err) {
    console.error("Could not load events.json:", err);
    grid.innerHTML = '<p class="event-load-error">Events could not be loaded right now.</p>';
    return;
  }

  events.forEach((event) => grid.appendChild(renderEventCard(event)));
}

// Builds the HTML for each non-empty performance entry, including its
// own optional link/button. Returns an array of ready-to-join HTML
// strings (empty entries already filtered out).
function buildPerformanceEntries(event) {
  return (event.performances || [])
    .map((performance) => {
      const workHtml = performance.work
        ? `<p class="event-instance-heading">${performance.work}</p>`
        : "";

      const detailLines = [performance.when, performance.venue].filter(Boolean);
      const detailsHtml = detailLines.length
        ? `<p class="event-instance-details">${detailLines.join("<br>")}</p>`
        : "";

      if (performance.link && !performance.link.url) {
        console.warn(`Event "${event.id}" has a performance with a "link" but no "url" — dropping it.`, performance.link);
      }
      const hasLink = !!(performance.link && performance.link.url);
      const linkHtml = hasLink
        ? `<a class="btn" href="${performance.link.url}" target="_blank" rel="noopener noreferrer">${performance.link.label || "More Info"}</a>`
        : "";

      if (!workHtml && !detailsHtml && !linkHtml) return "";

      return `<div class="event-instance">${workHtml}${detailsHtml}${linkHtml}</div>`;
    })
    .filter(Boolean);
}

function renderEventCard(event) {
  if (!event.id) {
    console.warn('Skipping an event with no "id" — every event needs a unique id.', event);
    return document.createComment("event skipped: missing id");
  }

  const dialogId = `dialog-${event.id}`;
  const entries = buildPerformanceEntries(event);
  const hasDialogContent = entries.length > 0;

  const card = document.createElement("article");
  card.className = "event-card";
  card.innerHTML = `
    <span class="event-card-date"></span>
    <h3></h3>
    <p></p>
    ${hasDialogContent ? `<button type="button" class="event-card-more" data-open-dialog="${dialogId}">Details</button>` : ""}
  `;
  card.querySelector(".event-card-date").textContent = event.date || "";
  card.querySelector("h3").textContent = event.title || "";
  card.querySelector("p").textContent = event.location || "";

  if (hasDialogContent) {
    card.appendChild(renderEventDialog(event, dialogId, entries));
  }

  return card;
}

function renderEventDialog(event, dialogId, entries) {
  const dialog = document.createElement("dialog");
  dialog.className = "event-dialog";
  dialog.id = dialogId;

  dialog.innerHTML = `
    <button type="button" class="dialog-close" data-close-dialog aria-label="Close details">&times;</button>
    <span class="event-card-date"></span>
    <h3></h3>
    ${entries.join("")}
  `;
  dialog.querySelector(".event-card-date").textContent = event.title || "";
  dialog.querySelector("h3").textContent = event.location || "";

  return dialog;
}

// The container (#event-grid) is already in the DOM by the time this
// script runs, since its <script> tag sits at the end of the body — no
// need to wait for DOMContentLoaded.
loadEvents();

// Dialog open/close — delegated on document, so it works for cards
// rendered dynamically above without needing per-card listeners.
document.addEventListener("click", (event) => {
  const opener = event.target.closest("[data-open-dialog]");
  if (opener) {
    document.getElementById(opener.dataset.openDialog)?.showModal();
    return;
  }

  const closer = event.target.closest("[data-close-dialog]");
  if (closer) {
    closer.closest("dialog")?.close();
    return;
  }

  // Click on the ::backdrop itself (not any element inside the dialog)
  // dispatches with the <dialog> as event.target — including clicks that
  // land on the dialog's own padding box (e.g. near its edges, or in the
  // gap between .event-instance blocks), since there's no child element
  // under the cursor there either. tagName alone can't tell those apart
  // from a genuine backdrop click, so we compare the click coordinates
  // against the dialog's actual rendered box instead: only close when
  // the click falls outside it.
  if (event.target.tagName === "DIALOG") {
    const rect = event.target.getBoundingClientRect();
    const inBounds =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
 
    if (!inBounds) {
      event.target.close();
    }
  }
});
