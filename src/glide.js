const EmblaCarousel = window.EmblaCarousel;
import { animate, splitText, stagger } from "animejs";

const sliders = [...document.querySelectorAll(".embla__viewport")];
const soundButton = document.querySelector(".sound");
const videos = [...document.querySelectorAll("video")];

soundButton.addEventListener("click", () => {
  soundButton.classList.toggle("on");
  const isOn = soundButton.classList.contains("on");
  videos.forEach((el) => (el.muted = !isOn));
});

const DOT_CLASSNAME = "embla-dot";
const DOT_WRAPPER_CLASSNAME = "embla-dots";
const ARROW_CLASSNAME = "embla-arrow";
const ARROW_WRAPPER_CLASSNAME = "embla-arrows";

// ✅ Навигация для Embla (адаптация вашего кода)
function createNavigation(embla, slider) {
  const slides = embla.slideNodes();
  let dots, arrowLeft, arrowRight, arrows;

  function markup() {
    if (slides.length <= 1) return;
    arrowMarkup();
    dotMarkup();
  }
  function createDiv(className) {
    const div = document.createElement("div");
    className
      .trim()
      .split(" ")
      .forEach((name) => div.classList.add(name));
    return div;
  }

  function dotMarkup() {
    dots = createDiv(DOT_WRAPPER_CLASSNAME);
    slides.forEach((_, idx) => {
      const dot = createDiv(DOT_CLASSNAME);
      dot.addEventListener("click", () => embla.scrollTo(idx));
      dots.appendChild(dot);
    });
    slider.appendChild(dots);
  }

  function arrowMarkup() {
    arrows = createDiv(ARROW_WRAPPER_CLASSNAME);
    arrowLeft = createDiv("arrow arrow--left");
    arrowLeft.addEventListener("click", () => embla.scrollPrev());
    arrowLeft.innerHTML = `<svg width="31" height="24" class="stroke-secondary transition-colors h-10 w-10" viewBox="0 0 31 24" fill="none">
			<path d="M9.73797 5.92969C9.73797 5.92969 8.70056 8.38726 7.5432 9.58367C6.30323 10.8655 3.66797 11.9997 3.66797 11.9997C3.66797 11.9997 6.29704 13.2057 7.5432 14.5085C8.67239 15.6891 9.73797 18.0697 9.73797 18.0697" stroke="inherit" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M27.4899 12H3.66797" stroke="inherit" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>`;

    arrowRight = createDiv("arrow arrow--right");
    arrowRight.addEventListener("click", () => embla.scrollNext());
    arrowRight.innerHTML = `<svg width="31" height="24" class="stroke-secondary transition-colors -scale-100 h-10 w-10" viewBox="0 0 31 24" fill="none">
			<path d="M9.73797 5.92969C9.73797 5.92969 8.70056 8.38726 7.5432 9.58367C6.30323 10.8655 3.66797 11.9997 3.66797 11.9997C3.66797 11.9997 6.29704 13.2057 7.5432 14.5085C8.67239 15.6891 9.73797 18.0697 9.73797 18.0697" stroke="inherit" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M27.4899 12H3.66797" stroke="inherit" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>`;

    arrows.appendChild(arrowLeft);
    arrows.appendChild(arrowRight);
    slider.appendChild(arrows);
  }

  function updateClasses() {
    if (slides.length <= 1) return;
    const slide = embla.selectedScrollSnap();

    Array.from(dots.children).forEach((dot, idx) => {
      idx === slide
        ? dot.classList.add("dot--active")
        : dot.classList.remove("dot--active");
    });

    slide === 0
      ? arrowLeft.classList.add("arrow--disabled")
      : arrowLeft.classList.remove("arrow--disabled");
    slide === slides.length - 1
      ? arrowRight.classList.add("arrow--disabled")
      : arrowRight.classList.remove("arrow--disabled");
  }

  markup();
  embla.on("select", updateClasses);
}

let animList = {};
let animListDown = {};

export function animatedScrollSliderText(tName, nextIdx = "0") {
  if (!animList[tName]) return;
  const prevIdx = animList[tName].idx;
  animList[tName].list[nextIdx]?.restart();
  if (prevIdx === undefined) {
    animListDown[tName].list[nextIdx]?.restart();
    animList[tName].idx = nextIdx;
    return;
  }
  animList[tName].list[prevIdx]?.reverse();
  animListDown[tName].list[prevIdx]?.reverse().then(() => {
    animListDown[tName].list[nextIdx]?.restart();
  });
  animList[tName].idx = nextIdx;
}

// ✅ Основной цикл слайдеров
sliders.forEach((el) => {
  const tName = el.getAttribute("data-title-parent");
  animList[tName] = {
    idx: undefined, // заглушка, что бы проигрывался первый вох в экран
    list: []
  };
  animListDown[tName] = {
    list: []
  };
  animList[tName].list = [
    ...document.querySelectorAll(`[data-title="${tName}"] span`)
  ].map((item) => {
    const { chars, words } = splitText(item, { chars: true, words: true });
    return animate([chars, words], {
      y: { from: 10, to: 0 },
      opacity: { from: 0, to: 1 },
      easing: "easeInOutQuad",
      duration: 500,
      delay: stagger(100),
      autoplay: false
    });
  });

  animListDown[tName].list = [
    ...document.querySelectorAll(`[data-title-down="${tName}"] p`)
  ].map((item, idx) => {
    const { words } = splitText(item, {
      words: true
    });

    return animate(words, {
      y: { from: 10, to: 0 },
      opacity: { from: 0, to: 1 },
      easing: "easeInOutQuad",
      duration: 500,
      delay: stagger(30),
      autoplay: idx === 0
    });
  });

  const embla = EmblaCarousel(el, {
    loop: true,
    speed: 10,
    duration: 60,
    dragFree: false
  });

  // ✅ slideChanged → select (без глюков!)
  embla.on("select", () => {
    const { slideNodes } = embla;
    const nextIdx = embla.selectedScrollSnap();
    const activeElement = slideNodes()[nextIdx];
    const prevElement = slideNodes()[animList.idx];

    // ✅ АНИМАЦИИ — только при смене слайда
    if (nextIdx !== animList.idx) {
      animatedScrollSliderText(tName, nextIdx);

      // ✅ ВИДЕО — пауза ТОЛЬКО активных
      const prevVideo = prevElement?.querySelector("video");
      const prevTitleSpan = [
        ...(prevElement?.querySelectorAll(".animated-title span") || [])
      ];

      prevTitleSpan.forEach((el) => (el.style.opacity = "0"));
      if (prevVideo && !prevVideo.paused) {
        prevVideo.pause();
      }
    }

    // ✅ Классы active
    prevElement?.classList.remove("keen-active");
    activeElement?.classList.add("keen-active");
  });

  createNavigation(embla, el);
});
