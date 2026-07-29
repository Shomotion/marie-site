// Photo carousel for media.html. Images dissolve from one to the next
// on a timer — the crossfade itself is a CSS transition (see .carousel
// img in styles.css); this script just swaps which image has the
// .is-active class.
const CAROUSEL_IMAGES = [
  { src: "assets/carousel/02282024_HP_Chamber_0032.jpg", alt: "Alt Text test" },
  { src: "assets/carousel/04042024_MC_JordiSavall_0149-e1755378504125.jpg", alt: "" },
  { src: "assets/carousel/12142023_HP_Chamber_0232-e1755378475684.jpg", alt: "" },
  { src: "assets/carousel/20241013-J415-concert-by-TWAN-VISION-36.jpg", alt: "" },
  { src: "assets/carousel/FilipWolak_JuliardPerformance_0061_1534-e1754749471907.jpg", alt: "" },
  { src: "assets/carousel/IMG_7744.jpg", alt: "" },
  { src: "assets/carousel/Juilliard415_Christie_RPapo_20250118_016.jpg", alt: "" },
  { src: "assets/carousel/quartetnovalis-08-scaled.jpg", alt: "" },
  { src: "assets/carousel/quartetnovalis-40-scaled-e1754749629198.jpg", alt: "" },
  { src: "assets/carousel/x2024-11-14_As-the-Crow-Flies_Midtown-Concerts-73_Annemarie-topaz-face-denoise-upscale-2x-scaled-e1754410913215.jpg", alt: "" },
  { src: "assets/carousel/x2024-11-14_As20the20Crow20Flies_Midtown20Concerts20287229_Annemarie20and20Ela-scaled.jpg", alt: "" },
  { src: "assets/carousel/x2024-11-14_As20the20Crow20Flies_Midtown20Concerts202810329_the20ensemble-topaz-face-denoise-scaled.jpg", alt: "" }
];

// How long each photo stays on screen before dissolving to the next, in
// milliseconds.
const CAROUSEL_INTERVAL_MS = 3000;

function initCarousel() {
  const frame = document.getElementById("media-carousel");
  if (!frame) return;

  if (CAROUSEL_IMAGES.length === 0) {
    frame.innerHTML = '<p class="carousel-empty-note">Add photo filenames to CAROUSEL_IMAGES in carousel.js.</p>';
    return;
  }

  frame.innerHTML = CAROUSEL_IMAGES
    .map(
      (image, i) =>
        `<img src="${image.src}" alt="${image.alt || ""}" loading="${i === 0 ? "eager" : "lazy"}">`
    )
    .join("");

  const slides = Array.from(frame.querySelectorAll("img"));
  slides[0].classList.add("is-active");

  if (slides.length < 2) return; // nothing to crossfade to

  // Respect reduced-motion preferences — show the first photo only,
  // don't keep animating in the background.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let current = 0;
  setInterval(() => {
    const next = (current + 1) % slides.length;
    slides[current].classList.remove("is-active");
    slides[next].classList.add("is-active");
    current = next;
  }, CAROUSEL_INTERVAL_MS);
}

// #media-carousel is already in the DOM by the time this script runs,
// since its <script> tag sits at the end of the body.
initCarousel();
