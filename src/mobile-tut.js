import { createTimeline } from "animejs";
const items = document.querySelectorAll(".mobile-tut-list span");
const line = document.querySelector(".mobile-block-nav");
const wrapper = document.querySelector(".mobile-tutorial");

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

  wrapper.addEventListener("touchstart", () => {
    wrapper.classList.add("hide");
    setTimeout(() => tl.cancel(), 600);
  });
}
