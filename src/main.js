import { animate, createTimeline, createTimer, spring, utils } from "animejs";
import "./player.js";
import "./copy.js";
import "./glide.js";
import "./modal.js";
import { hideModalPhotoFn } from "./modalPhotos.js";
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
const modalPhoto = document.querySelector(".modal-photo");

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

if (!isMobile) {
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

  sidebar.addEventListener("mouseenter", () => {
    main.classList.add("scrolled");
    mainContainer.classList.add("scrolled");
    animateBlocks.play();
    if (window.wistiaVideos) {
      // stop video
      window.wistiaVideos.forEach((el) => el.pause());
    }

    bodyBgImg.style.opacity = 0.66;
    topLogotype.classList.add("animated");
    animateLogotype.play();
    hideModalPhotoFn();
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
} else {
  window.addEventListener(
    "scroll",
    (e) => {
      // if (e.target.closest("[data-prevent-scroll]")) {
      //   return;
      // } // block with photos

      const progress =
        document.documentElement.scrollTop /
        (document.documentElement.scrollHeight - window.innerHeight);
      const cIdx = Math.round(progress * (blocks.size - 1));

      const prevEl = [...blocks.values()][activeScreenIdx];
      prevEl.classList.remove("active");

      activeScreenIdx = cIdx;
      const el = [...blocks.values()][cIdx];
      el.classList.add("active");
    },
    { passive: false },
  );
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
