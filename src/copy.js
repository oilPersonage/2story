import { animate } from "animejs";

const items = [...document.querySelectorAll("[data-for-copy]")];

items.forEach((el) => {
  el.addEventListener("click", async (e) => {
    const copyText = el.querySelector(".notification-text");
    e.preventDefault();
    const { forCopy } = e.target.dataset;
    await navigator.clipboard.writeText(forCopy);
    animate(copyText, {
      x: [
        { from: 0, duration: 300, to: "+=10" },
        { to: "-=10", delay: 1000 },
      ],
      opacity: [
        { from: 0, duration: 300, to: 1 },
        { to: 0, delay: 1000 },
      ],
    });
  });
});
