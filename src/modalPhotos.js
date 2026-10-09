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

console.log(1111, modalData)

modalData.forEach(async ({link, el, anim, closeBtn}) => {
  console.log('clicked', link)
  link.addEventListener("click", (e, idx) => {
    console.log('clicked', el)
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
    await anim.reverse();
    el?.classList.remove("opened");
  };

  el.addEventListener("click", async (e) => {
    if (e.target !== el) return;
    hideModalPhotoFn(e);
  })
  closeBtn.addEventListener("click", async (e) => hideModalPhotoFn(e));
})



