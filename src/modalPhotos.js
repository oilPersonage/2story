import { animate } from "animejs";

const links = document.querySelectorAll("[data-open-photos]");
const modal = document.querySelector(".modal-photo");
const closeBtn = modal.querySelector(".close-btn");

const animateBody = animate(modal.querySelector(".modal-body"), {
  y: ["100%", 0],
  opacity: [0, 1],
  autoplay: false,
});

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("open modal", modal);
    modal?.classList.add("opened");
    animateBody.play();
  });
});

[closeBtn, modal].forEach((el) => {
  el.addEventListener("click", async (e) => {
    if (!e.target === el) return;
    e.stopPropagation();
    e.preventDefault();
    await animateBody.reverse();
    modal?.classList.remove("opened");
  });
});
