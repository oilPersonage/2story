import { animate } from "animejs";

const links = [...document.querySelectorAll("[data-open-photos]")];
const modals = [...document.querySelectorAll(".modal-photo")];

const modalData = []

modals.forEach(modal => {
  const data = {};
  data.el = modal
  data.anim = animate(modal.querySelector('.modal-body'), {
    y: ['30px', 0],
    duration: 300,
    opacity: [0, 1],
    autoplay: false,
  });
  data.link = links.find(el => el.dataset.openPhotos === modal.dataset.photoName)
  data.closeBtn = modal.querySelector(".close-btn");
  modalData.push(data)
})

modalData.forEach(async ({link, el, anim, closeBtn, animBg}) => {
  link.addEventListener("click", (e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    el?.classList.add("opened");
    anim.play();
  });

  const hideModalPhotoFn = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    await anim.reverse()
    el?.classList.remove("opened");
  };

  el.addEventListener("click", (e) => {
    if (e.target !== el) return;
    hideModalPhotoFn(e);
  })
  closeBtn.addEventListener("click", async (e) => hideModalPhotoFn(e));
})



