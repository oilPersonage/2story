import { animate } from "animejs";

const link = document.querySelector("[data-open-photos]");
const modal = document.querySelector(".modal-photo");
const closeBtn = modal.querySelector(".close-btn");

const animateBody = animate(modal.querySelector(".modal-body"), {
  y: ["10%", 0],
  duration: 300,
  opacity: [0, 1],
  autoplay: false,
});

link.addEventListener("click", (e, idx) => {
  e.stopPropagation();
  e.preventDefault();
  modal?.classList.add("opened");
  link.classList.add("hidden");
  animateBody.play();
});

export const hideModalPhotoFn = async (e) => {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  await animateBody.reverse();
  link.classList.remove("hidden");
  modal?.classList.remove("opened");
};

closeBtn.addEventListener("click", async (e) => hideModalPhotoFn(e));
