const sliders = [...document.querySelectorAll(".keen-slider")];
const soundButton = document.querySelector(".sound");
const videos = [...document.querySelectorAll("video")];
soundButton.addEventListener("click", () => {
  soundButton.classList.toggle("on");

  const isOn = soundButton.classList.contains("on");

  videos.forEach((el) => {
    el.muted = !isOn; // если кнопка "on", то звук включаем
  });
});

var animation = {
  duration: 2000,
  easing: (x) => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  },
};

const DOT_CLASSNAME = "keen-dot";
const DOT_WRAPPER_CLASSNAME = "keen-dots";
const ARROW_CLASSNAME = "keen-arrow";
const ARROW_WRAPPER_CLASSNAME = "keen-arrows";

function navigation(slider, naviationDopClassName) {
  let wrapper, dots, arrowLeft, arrowRight, arrows;
  const slides = slider.slides;

  function markup() {
    wrapperMarkup();
    if (slides.length <= 1) return;
    arrowMarkup();
    dotMarkup();
  }
  function createDiv(className) {
    var div = document.createElement("div");
    var classNames = className.split(" ");
    classNames.forEach((name) => div.classList.add(name));
    return div;
  }

  function wrapperMarkup() {
    wrapper = createDiv("keen-navigation " + naviationDopClassName ?? "");

    slider.container.parentNode.appendChild(wrapper);
    wrapper.appendChild(slider.container);
  }

  function dotMarkup() {
    dots = createDiv(DOT_WRAPPER_CLASSNAME);
    slider.track.details.slides.forEach((_e, idx) => {
      var dot = createDiv(DOT_CLASSNAME);
      dot.addEventListener("click", () => slider.moveToIdx(idx));
      dots.appendChild(dot);
    });
    wrapper.appendChild(dots);
  }

  function arrowMarkup() {
    arrows = createDiv(ARROW_WRAPPER_CLASSNAME);
    arrowLeft = createDiv("arrow arrow--left");
    arrowLeft.addEventListener("click", () => slider.prev());
    arrowLeft.innerHTML = `
                          <svg
                            width="31"
                            height="24"
                            class="stroke-secondary transition-colors h-10 w-10"
                            viewBox="0 0 31 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.73797 5.92969C9.73797 5.92969 8.70056 8.38726 7.5432 9.58367C6.30323 10.8655 3.66797 11.9997 3.66797 11.9997C3.66797 11.9997 6.29704 13.2057 7.5432 14.5085C8.67239 15.6891 9.73797 18.0697 9.73797 18.0697"
                              stroke="inherit"
                              stroke-miterlimit="10"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M27.4899 12H3.66797"
                              stroke="inherit"
                              stroke-miterlimit="10"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>`;
    arrowRight = createDiv("arrow arrow--right");
    arrowRight.addEventListener("click", () => slider.next());
    arrowRight.innerHTML = ` <svg
                            width="31"
                            height="24"
                            class="stroke-secondary transition-colors -scale-100 h-10 w-10"
                            viewBox="0 0 31 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.73797 5.92969C9.73797 5.92969 8.70056 8.38726 7.5432 9.58367C6.30323 10.8655 3.66797 11.9997 3.66797 11.9997C3.66797 11.9997 6.29704 13.2057 7.5432 14.5085C8.67239 15.6891 9.73797 18.0697 9.73797 18.0697"
                              stroke="inherit"
                              stroke-miterlimit="10"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M27.4899 12H3.66797"
                              stroke="inherit"
                              stroke-miterlimit="10"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>`;

    arrows.appendChild(arrowLeft);
    arrows.appendChild(arrowRight);
    wrapper.appendChild(arrows);
  }

  function updateClasses() {
    if (slides.length <= 1) return;
    var slide = slider.track.details.rel;
    Array.from(dots.children).forEach(function (dot, idx) {
      idx === slide
        ? dot.classList.add("dot--active")
        : dot.classList.remove("dot--active");
    });

    slide === 0
      ? arrowLeft.classList.add("arrow--disabled")
      : arrowLeft.classList.remove("arrow--disabled");
    slide === slider.track.details.slides.length - 1
      ? arrowRight.classList.add("arrow--disabled")
      : arrowRight.classList.remove("arrow--disabled");
  }

  slider.on("created", () => {
    markup();
    updateClasses();
  });
  slider.on("slideChanged", () => {
    updateClasses();
  });
}

sliders.forEach((el) => {
  const keen = new KeenSlider(
    el,
    {
      sliders: {
        perView: 1,
        spacing: 0,
      },
      defaultAnimation: {
        duration: 2000,
      },
      // detailsChanged: (s) => {
      //   s.slides.forEach((element, idx) => {
      //     element.style.opacity = s.track.details.slides[idx].portion;
      //   });
      // },
      // renderMode: "custom",
      created: () => {
        console.log("created");
      },
      slideChanged(e) {
        const activeElement = e.slides[e.track.details.abs];
        activeElement.classList.add("keen-active");
        const prevIndex =
          (e.track.details.abs - 1 + e.slides.length) % e.slides.length;
        const prevElement = e.slides[prevIndex];
        prevElement.classList.remove("keen-active");
        const video = activeElement.querySelector("video");
        const prevVideo = prevElement.querySelector("video");

        if (video) {
          video.play();
        }
        if (prevVideo) {
          prevVideo.pause();
        }
      },
    },
    [navigation]
  );
});
