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
let maxScroll = mainWrapper.offsetHeight;
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

if (window.matchMedia("(width <= 460px)").matches) {
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
    x: { to: -20, duration: 600 },
    maxWidth: { from: "10%", to: "100%", duration: 600 },
    autoplay: false,
    ease: "inOut(1.675)",
  });

  // слушаем touch
  sidebar.addEventListener(
    "touchstart",
    (e) => {
      sidebar.classList.add("touched");
      main.classList.add("touched");
      animateMobileOpen.play();
      touching = true;
    },
    { passive: true }
  );

  // слушаем touch
  sidebar.addEventListener("touchend", (e) => {
    touching = false;
    sidebar.classList.remove("touched");
    main.classList.remove("touched");
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
    { passive: true }
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
    { passive: false }
  ); // если блокируешь системный скролл, нужно passive: false

  // TOUCH END
  main.addEventListener("touchend", (e) => {
    touching = false;
    // инерция автоматически применяется в onUpdate таймера
  });
}
