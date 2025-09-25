import { animate } from "animejs";

const items = [...document.querySelectorAll("[data-for-copy]")];
const notify = document.querySelector(".notification");

items.forEach((el) => {
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    const { top, left, height } = e.target.getBoundingClientRect();
    const { forCopy } = e.target.dataset;
    await navigator.clipboard.writeText(forCopy);
    notify.style.left = left + "px";
    animate(notify, {
      y: [
        { from: top - height, duration: 300, to: "-=10" },
        { to: "+=10", delay: 1000 },
      ],
      opacity: [
        { from: 0, duration: 300, to: 1 },
        { to: 0, delay: 1000 },
      ],
    });
  });
});
