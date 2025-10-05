import { animate, createTimeline, stagger } from "animejs";
const items = document.querySelectorAll(".mobile-tut-list span");
const line = document.querySelector(".mobile-block-nav");
const wrapper = document.querySelector(".mobile-tutorial");

const loaderItems = [...document.querySelectorAll(".loader path")];
const loader = [...document.querySelectorAll(".loader")];
let time = 0;
let FINISH_TIME = 1500;

const logo = animate(loaderItems, {
  keyframes: {
    "0%": { y: -10, scaleY: 1.1, opacity: 0, ease: "outCirc" },
    "25%": { y: 0, scaleY: 1, opacity: 1 },
    "75%": { y: 0, scaleY: 1, opacity: 1 },
    "100%": { y: -10, scaleY: 1.1, opacity: 0, ease: "inCirc" },
  },
  delay: stagger(100),
  loop: true,
  loopDelay: 200,
  duration: 2000,
});

if (window.matchMedia("(width <= 460px)").matches) {
  const tl = createTimeline({ loop: true });
  tl.add(line, {
    x: [0, -20],
    duration: 500,
  })
    .add(items, {
      opacity: [0, 1],
      x: [0, -20],
      delay: 300,
      duration: 500,
    })
    .add(items, {
      opacity: [1, 0],
      x: [-20, 0],
      delay: 1200,
      duration: 500,
    })
    .add(line, {
      x: [-20, 0],
      duration: 500,
    });

  function animateOut() {
    // if (!allowClick) return;
    logo.pause();
    animate(loader, {
      x: [0, 10],
      opacity: 0,
      onComplete() {
        wrapper.classList.add("hide");
        setTimeout(() => tl.cancel(), 600);
      },
    });
  }
  let timer = setInterval((time += 10), 10);

  document.addEventListener("DOMContentLoaded", () => {
    console.log("loaded");
    if (time > FINISH_TIME) {
      animateOut();
    } else {
      setTimeout(animateOut, FINISH_TIME - time);
      clearInterval(timer);
    }
  });
}
