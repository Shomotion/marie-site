// Renders a compact preview of the first few upcoming events on the
// homepage — the image + event columns under the biography section.
// Pulls from the same events.json (and follows the same schema) that
// events-render.js uses to build the full events.html grid, so there's
// only ever one place event data gets entered.
//
//   - Shows up to PREVIEW_COUNT events, in events.json order. Bump the
//     constant to show more — the grid wraps on its own.
//   - Subtitle line: uses the first performance's "work" if the event
//     has one (inserted as HTML, same trusted-content convention as
//     event-instance-heading in events-render.js, so things like
//     "Händel's <i>Atalanta</i>" render correctly) — otherwise falls
//     back to the event's plain-text location.
//   - A single "More" button below the grid links to events.html —
//     see the markup in index.html.
//   - If events.json fails to load or is empty, the whole section
//     removes itself rather than showing an empty image + heading.
//
// Requires the page to be served over http(s) — see the fetch() note
// in events-render.js for local testing.

const PREVIEW_COUNT = 3;

async function loadEventsPreview() {
  const grid = document.getElementById("events-preview-grid");
  if (!grid) return;

  let events;
  try {
    const response = await fetch("events.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    events = await response.json();
  } catch (err) {
    console.error("Could not load events.json:", err);
    grid.closest(".events-preview")?.remove();
    return;
  }

  const upcoming = getUpcoming(events).slice(0, PREVIEW_COUNT);
  if (!upcoming.length) {
    grid.closest(".events-preview")?.remove();
    return;
  }

  upcoming.forEach((event) => grid.appendChild(renderPreviewItem(event)));
}

function getUpcoming(events) {
  const today = startOfToday();
  return events
    .filter((event) => event.id)
    .map((event) => ({ event, status: getEventStatus(event, today), start: parseDateField(event, "startDate") }))
    .filter((e) => e.status === "upcoming" || e.status === "ongoing")
    .sort((a, b) => a.start - b.start)
    .map((e) => e.event);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateField(event, field) {
  if (!event[field]) {
    console.warn(`Event "${event.id}" has no "${field}" — it may be excluded or mis-sorted.`);
    return null;
  }
  const d = new Date(`${event[field]}T00:00:00`);
  return isNaN(d) ? null : d;
}

// Returns "upcoming" | "ongoing" | "past" | null (null = can't determine, treat as past)
function getEventStatus(event, today = startOfToday()) {
  const start = parseDateField(event, "startDate");
  const end = parseDateField(event, "endDate");
  if (!start || !end) return null;
  if (today < start) return "upcoming";
  if (today > end) return "past";
  return "ongoing";
}

function renderPreviewItem(event) {
  const item = document.createElement("div");
  item.className = "events-preview-item";

  const firstPerformance = (event.performances || [])[0];

  item.innerHTML = `
    <span class="events-preview-date"></span>
    <h3></h3>
    <p class="events-preview-subtitle"></p>
  `;

  item.querySelector(".events-preview-date").textContent = event.date || "";
  item.querySelector("h3").textContent = event.title || "";

  const subtitleEl = item.querySelector(".events-preview-subtitle");
  if (firstPerformance?.work) {
    subtitleEl.innerHTML = firstPerformance.work;
  } else if (event.location) {
    subtitleEl.textContent = event.location;
  } else {
    subtitleEl.remove();
  }

  return item;
}

loadEventsPreview();
