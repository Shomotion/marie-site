// Mobile nav toggle. Only does anything on pages whose header includes
// a #nav-toggle button and a #mobile-menu panel — harmless no-op on
// pages that don't have them yet.
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const iconMenu = toggle.querySelector(".nav-toggle-icon-menu");
  const iconClose = toggle.querySelector(".nav-toggle-icon-close");

  function setOpen(isOpen) {
    menu.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    if (iconMenu) iconMenu.hidden = isOpen;
    if (iconClose) iconClose.hidden = !isOpen;
  }

  toggle.addEventListener("click", () => {
    setOpen(!menu.classList.contains("is-open"));
  });

  // Tapping a link inside the menu closes it (the link navigation still
  // happens as normal).
  menu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") setOpen(false);
  });

  // If the viewport is resized/rotated back up past the mobile
  // breakpoint while the menu happens to be open, close it — otherwise
  // it'd stay stuck open (display:block) once desktop styles take over.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) setOpen(false);
  });
}

initMobileNav();
