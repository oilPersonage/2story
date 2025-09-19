import { animate, createTimer, utils } from "animejs";
import "./copy.js";
import "./modal.js";

const sidebar = document.querySelector("#sidebar");
const main = document.querySelector("#main");
const mainWrapper = document.querySelector("#main-wrapper");

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
let maxScroll = 0;
let lastTargetId = null;
let activeScreenIdx = 0;

const linkDot = document.querySelector("nav .link-dot");
const links = [...document.querySelectorAll("nav a")];
const blocks = new Map();
[...document.querySelectorAll("[data-name]")].forEach((el) =>
  blocks.set(el.dataset.name, el)
);

const animateToShort = animate(state, {
  offset: halfScreen - MIN_IMAGE_SIZE / 2,
  autoplay: false,
  duration: 600,
});

const animateBlocks = animate(".scrolled-block", {
  height: [main.clientHeight, MIN_IMAGE_SIZE + "px"],
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
  animate(linkDot, {
    translateY: `+=${top + height / 2 - dTop}`,
    duration: 300,
    ease: "linear",
  });
}

function applyStyles() {
  const cIdx = Math.round(state.progress * (blocks.size - 1));
  if (activeScreenIdx === cIdx) return;
  const prevEl = [...blocks.values()][activeScreenIdx];

  prevEl.classList.remove("active");
  links[activeScreenIdx].classList.remove("active");

  activeScreenIdx = cIdx;
  applyDotStyle(cIdx);
  const el = [...blocks.values()][cIdx];
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
  // console.log(state.offset);
  const translateY = state.progress * maxScroll - state.offset;
  // console.log(mainWrapper.offsetHeight, state.offset);
  mainWrapper.style.transform = `translateY(${translateY * -1}px)`;
}

sidebar.addEventListener("mouseenter", () => {
  main.classList.add("scrolled");
  animateBlocks.play();
});

sidebar.addEventListener("mouseleave", () => {
  const step = 1 / (blocks.size - 1);
  const nearestPosition = Math.round(state.progress / step) * step;
  main.classList.remove("scrolled");
  animateBlocks.reverse();
  animate(state, {
    progress: nearestPosition,
    duration: 600,
    onUpdate: () => {
      applyStyles();
      applyScroll(0);
    },
  });
});

sidebar.querySelectorAll("a").forEach((el) => {
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

// Обработчик wheel
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (!state.allowScroll) return;
    lastTargetId = null;
    applyScroll(e.deltaY);
    applyStyles();
  },
  { passive: false }
);

// MOBILE VERSION

let startY = 0;
let touching = false;

if (window.matchMedia("max-widht: 460px")) {
  createTimer({
    duration: 1000,
    loop: true,
    frameRate: 60,
    // Делаем догоняющее приближение
    onUpdate: () => {
      state.progress += ((state.targetProgress - state.progress) * 0.1).toFixed(
        3
      );
      console.log(state.targetProgress - state.progress);
      applyScroll(0);
      applyStyles();
    },
  });
  // слушаем touch
  document.addEventListener("touchstart", (e) => {
    touching = true;
    startY = e.touches[0].clientY;
  });

  // слушаем touch
  document.addEventListener("touchend", (e) => {
    touching = false;
  });

  document.addEventListener("touchmove", (e) => {
    if (!touching) return;
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY; // свайп вверх/вниз
    console.log(deltaY);
    state.targetProgress = utils.clamp(
      state.targetProgress + deltaY * 0.001,
      0,
      1
    ); // множитель чувствительности
    startY = currentY; // обновляем для плавного движения
  });
}
