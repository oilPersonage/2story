import { animate, createTimeline, createTimer, spring, utils } from "animejs";
import "./player.js";
import "./copy.js";
import "./glide.js";
import "./modal.js";
import "./modalPhotos.js";
import { animatedScrollSliderText } from "./glide.js";

const headText = [...document.querySelectorAll(".about-us-text p")];
const sidebar = document.querySelector("#sidebar");
const mainContainer = document.querySelector(".main-perspective");
const main = document.querySelector("#main");
const mainWrapper = document.querySelector("#main-wrapper");
const decor1 = document.querySelector(".decor-1");
const decor2 = document.querySelector(".decor-2");
const decor3 = document.querySelector(".decor-3");
const bodyBgImg = document.querySelector(".body-bg-img img");
const topLogotype = document.querySelector(".desktop-logotype");

let animateDot = null;

const MIN_IMAGE_SIZE = 300;

// let progress = 0; // текущее положение (0..1)
let prevProgress = 0; // предыдущее
let velocity = 0; // велосити
export const state = {
  offset: 0,
  progress: 0,
  targetProgress: 0,
  allowScroll: true,
}; // скорость
let halfScreen = window.innerHeight / 2;
let maxScroll = mainWrapper.offsetHeight;
let lastTargetId = null;
let activeScreenIdx = 0;

const isMobile = window.matchMedia("(width <= 460px)").matches;
const linkDot = document.querySelector("nav .link-dot");
const links = [...document.querySelectorAll("nav a")];
const blocks = new Map();

[...document.querySelectorAll("[data-name]")].forEach((el) =>
  blocks.set(el.dataset.name, el),
);

const animateToShort = animate(state, {
  offset: halfScreen - MIN_IMAGE_SIZE / 2,
  autoplay: false,
  duration: 600,
});

const animateLogotype = animate(topLogotype, {
  // translateX: [-200, 0],
  // opacity: [0, 1],
  "--sat": [0, 0.8],
  rotate: [0, 12, 0],
  duration: 600,
  ease: "inOutElastic(1,0.3)",
  autoplay: false,
});

const animateBlocks = animate(".scrolled-block", {
  height: (el) => [el.clientHeight, MIN_IMAGE_SIZE + "px"],
  duration: 600,
  autoplay: false,
  onUpdate: (self) => {
    animateToShort.currentTime = self.reversed
      ? self.iterationDuration - self.currentTime
      : self.currentTime;
    applyScroll(0);
  },
});

function applyDotStyle(idx) {
  const { top, height } = links[idx].getBoundingClientRect();
  const { top: dTop } = linkDot.getBoundingClientRect();

  if (animateDot) animateDot.cancel();
  animateDot = animate(linkDot, {
    translateY: `+=${top + height / 2 - dTop - 2}`,
    duration: 300,
    ease: "ease-out",
  });
}

function applyStyles() {
  const cIdx = Math.round(state.progress * (blocks.size - 1));
  if (activeScreenIdx === cIdx) return;

  const prevEl = [...blocks.values()][activeScreenIdx];
  const prevVideo = [...prevEl.querySelectorAll("video")];
  prevVideo.forEach((el) => el.pause());

  prevEl.classList.remove("active");
  links[activeScreenIdx].classList.remove("active");

  activeScreenIdx = cIdx;
  const el = [...blocks.values()][cIdx];
  applyDotStyle(cIdx);
  el.classList.add("active");
  links[activeScreenIdx].classList.add("active");
}

function applyScroll(deltaY = 0) {
  maxScroll = mainWrapper.offsetHeight - main.clientHeight + state.offset * 2;

  const delta = deltaY / maxScroll;
  // Обновляем прогресс
  prevProgress = state.progress;
  state.progress = utils.clamp(state.progress + delta, 0, 1);
  // Считаем velocity (разница за событие)
  velocity = state.progress - prevProgress;
  const translateY = state.progress * maxScroll - state.offset;
  mainWrapper.style.translate = `0px ${translateY * -1}px`;

  // decor
  decor1.style.translate = `0px ${translateY * 0.3}px`;
  decor2.style.translate = `0px ${translateY * 0.1}px`;
  decor3.style.translate = `0px ${translateY * 0.2 * -1}px`;
  bodyBgImg.style.translate = `0px -${translateY * 0.08}px`;
}

if (!isMobile) {
  sidebar.addEventListener("mouseenter", () => {
    main.classList.add("scrolled");
    mainContainer.classList.add("scrolled");
    animateBlocks.play();

    bodyBgImg.style.opacity = 0.66;
    topLogotype.classList.add("animated");
    animateLogotype.play();
    main.style.transform =
      "rotateY(-5deg) rotateX(8deg) translateX(-100px) scale(0.8)";
  });

  sidebar.addEventListener("mouseleave", ({ target }) => {
    const step = 1 / (blocks.size - 1);
    const nearestPosition = Math.round(state.progress / step) * step;
    bodyBgImg.style.opacity = 0.35;
    main.classList.remove("scrolled");
    topLogotype.classList.remove("animated");
    mainContainer.classList.remove("scrolled");
    animateBlocks.reverse();
    animateLogotype.reverse();

    main.style.transform = "rotateY(0) translateX(0px)";

    animate(state, {
      progress: nearestPosition,
      duration: 600,
      onUpdate: () => {
        applyStyles();
        applyScroll(0);
      },
      onComplete() {
        const cIdx = Math.round(state.progress * (blocks.size - 1));
        const item = [...blocks.values()][cIdx];
        animatedScrollSliderText(item.getAttribute("data-name"));
      },
    });
  });

  sidebar.querySelectorAll("a").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
    });
    el.addEventListener("mouseover", (e) => {
      e.preventDefault();
      const { to } = e.target.dataset;
      if (!to || to === lastTargetId) return;
      lastTargetId = to;
      const item = blocks.get(to);
      // позиция блока внутри wrapper
      const itemTop = item.offsetTop;
      const progress = utils.clamp(itemTop / maxScroll, 0, 1);

      animate(state, {
        progress: progress,
        duration: 600,
        onUpdate: () => {
          applyStyles();
          applyScroll(0);
        },
      });
    });
  });
}

// Обработчик wheel
window.addEventListener(
  "wheel",
  (e) => {
    if (e.target.closest("[data-prevent-scroll]")) {
      return;
    } // block with photos

    e.preventDefault();
    if (!state.allowScroll) return;
    lastTargetId = null;
    applyScroll(e.deltaY);
    applyStyles();
  },
  { passive: false },
);

// MOBILE VERSION

if (isMobile) {
  let touching = false;
  let startY = 0;
  let lastY = 0;
  let offsetY = 0; // коэффициент трения (0.9–0.98 норм)
  const friction = 0.95; // коэффициент трения (0.9–0.98 норм)
  let currentMobileIdx = 0;

  const { height: sidebarHeight, top } = sidebar.getBoundingClientRect();

  // function createElementF(v) {
  //   const el = document.createElement("div");
  //   el.innerText = v;
  //   el.classList.add("helper");
  //   el.style.top = v + "px";
  //   document.body.append(el);
  // }
  // createElementF(top);
  // createElementF(top + sidebarHeight);

  const animateMobileOpen = animate(sidebar, {
    x: { to: -20 },
    rotateY: [0, -15],
    rotateX: [0, 8],
    maxWidth: { from: "10%", to: "100%" },
    autoplay: false,
    ease: "inOut(1.675)",
    duration: 300,
  });

  // слушаем touch
  sidebar.addEventListener(
    "touchstart",
    (e) => {
      sidebar.classList.add("touched");
      main.classList.add("touched");

      main.style.transform = "rotateY(5deg) rotateX(8deg) translateX(0px)";

      animateMobileOpen.play();
      touching = true;
    },
    { passive: true },
  );

  // слушаем touch
  sidebar.addEventListener("touchend", (e) => {
    touching = false;
    sidebar.classList.remove("touched");
    main.classList.remove("touched");

    main.style.transform = "rotateY(0) translateX(0px)";
    animateMobileOpen.reverse();
  });

  const blocksSize = blocks.size - 1;

  sidebar.addEventListener("touchmove", (e) => {
    if (!touching || e.touches[0].clientY < top) return;
    const clientY = e.touches[0].clientY;
    let localProgress = (clientY - top) / sidebarHeight;

    let cIdx = Math.floor(localProgress * (blocksSize + 1));

    if (currentMobileIdx === cIdx || cIdx > blocksSize) return;

    currentMobileIdx = utils.clamp(cIdx, 0, blocksSize);
    animate(state, {
      progress: cIdx / blocksSize,
      duration: 600,
      onUpdate: () => {
        applyScroll(0);
        applyStyles();
      },
      onComplete() {
        const cIdx = Math.round(state.progress * (blocks.size - 1));
        const item = [...blocks.values()][cIdx];
        animatedScrollSliderText(item.getAttribute("data-name"));
      },
    });

    // applyScroll(dy * -1);
  });

  // MAIN

  const timer = createTimer({
    duration: Infinity,
    frameRate: 60,
    onUpdate: () => {
      offsetY *= friction;

      if (Math.abs(velocity) < 0.0001 && !touching) return;
      velocity *= 0.9;
      applyScroll(offsetY);
      applyStyles();
    },
  });

  // TOUCH START
  main.addEventListener(
    "touchstart",
    (e) => {
      touching = true;
      lastY = e.touches[0].clientY; // обязательно инициализируем
      velocity = 0; // сбрасываем инерцию при начале взаимодействия
    },
    { passive: true },
  );

  // TOUCH MOVE
  main.addEventListener(
    "touchmove",
    (e) => {
      if (!touching || e.touches[0].clientY < top) return;

      const clientY = e.touches[0].clientY;
      const delta = clientY - lastY; // положительный — пальцем вниз
      lastY = clientY;
      offsetY = delta * -1.2;
      // краткосрочная скорость — нужна для инерции при отпускании
      // можно усилить: velocity = delta * 0.8; или нормализовать по dt
      velocity = delta;
    },
    { passive: false },
  ); // если блокируешь системный скролл, нужно passive: false

  // TOUCH END
  main.addEventListener("touchend", (e) => {
    touching = false;
    // инерция автоматически применяется в onUpdate таймера
  });
}

// HEAD
const slideCountContainer = document.querySelector(".about-us-counter-current");
const slideTotalContainer = document.querySelector(".about-us-counter-total");
const tl = createTimeline({ loop: true, loopDelay: 2000 });
const textDuration = 1000;
const textDelay = 6000;
slideTotalContainer.innerText = headText.length;

headText.forEach((el, idx) => {
  tl.add(el, {
    opacity: [0, 1],
    duration: textDuration,
    onComplete: () => (slideCountContainer.innerText = idx + 1),
  }).add(el, {
    opacity: [1, 0],
    delay: idx === 0 || idx === 3 ? 10000 : textDelay,
    duration: textDuration,
  });
});

// dataset
const dateText = `New York, ${new Date().toLocaleDateString("en-US", {
  month: "long",
})}, 1997`;
const data = [...document.querySelectorAll(".date-now")];
data.forEach((el) => (el.innerHTML = dateText));
