import { animate } from "animejs";
import { state } from "./main";

const links = [...document.querySelectorAll("[data-modal]")];
const modalChangeLinks = [...document.querySelectorAll(".modal-heading-link")];
const modal = document.querySelector(".modal");
const contents = new Map(
  [...document.querySelectorAll("[data-modal-content]")].map((el, i) => [
    el.dataset.modalContent,
    el,
  ])
);
const modalOverlay = document.querySelector(".modal-overlay");

let currentType = "terms";

const animateBody = animate(modal.querySelector(".modal-body"), {
  y: ["100%", 0],
  autoplay: false,
});
const animateOver = animate(modal.querySelector(".modal-overlay"), {
  opacity: [0, 0.6],
  autoplay: false,
  onComplete: (self) => {
    if (!self.reversed) return;
    modal.classList.remove("opened");
  },
});

function changeDocs(modalType) {
  contents.get(currentType).classList.remove("active");
  document
    .querySelector(`[data-modal-type=${currentType}]`)
    .classList.remove("active");
  currentType = modalType;
  console.log(document.querySelector(`[data-modal=${currentType}]`));
  document
    .querySelector(`[data-modal-type=${currentType}]`)
    .classList.add("active");
  contents.get(currentType).classList.add("active");
}

links.forEach((el) => {
  el.addEventListener("click", () => {
    state.allowScroll = false;
    modal.classList.add("opened");
    changeDocs(el.dataset.modal);
    animateBody.play();
    animateOver.play();
  });
});

modalChangeLinks.forEach((el) => {
  el.addEventListener("click", () => {
    const { modalType } = el.dataset;
    changeDocs(modalType);
  });
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target !== modalOverlay) return;
  state.allowScroll = true;
  animateBody.reverse();
  animateOver.reverse();
});
