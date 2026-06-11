function createVideoPlayer(qualities = ["FHD"], name) {
	const template = document.createElement("template");

	template.innerHTML = `<div class="v-video-wrapper">
	    <video id="video-${name}" name="${name}" loop preload="metadata">
	      ${qualities.map((q) => `<source src="${name}-${q}.mov" data-quality="${q}">`).join("")}
	    </video>
     	<button class="play-btn">
      	<svg viewBox="0 0 24 24" width="80" height="80">
          <path d="M8 5v14l11-7z" fill="var(--color-bg)"/>
        </svg>
      </button>
	    <div class="controls">
	      <div class="top-controls">
	        <span class="time-el">0:00</span>
	      </div>
	      <div class="quality-wrapper">
					<div class="quality-btn-wrapper">
	        	${qualities.map((q) => `<button class="quality-btn ${q === "FHD" ? "active" : ""}" data-quality="${q}">${q}</button>`).join("")}
					</div>
	      </div>
	    </div>
    </div>
  `;

	return template.content.firstElementChild;
}
function initVideoHandlers(player) {
	const video = player.querySelector("video");
	const playBtn = player.querySelector(".play-btn");
	const qualityBtns = player.querySelectorAll(".quality-btn");
	const timeEl = player.querySelector(".time-el");

	let currentQuality = "FHD";

	function togglePlay(e) {
		e.preventDefault();
		e.stopPropagation();
		if (video.paused) {
			video
				.play()
				.then(() => {
					console.log("played");
					playBtn.classList.add("hidden");
				})
				.catch((e) => {
					if (!e.message.includes("fetching process")) console.error(e);
				});
		} else {
			video.pause();
			playBtn.classList.remove("hidden");
		}
	}
	playBtn.onclick = togglePlay;

	// Quality switch УПРОЩЁН
	qualityBtns.forEach((btn) => {
		btn.onclick = () => {
			const quality = btn.dataset.quality;
			if (quality === currentQuality) return;
			const currentTime = video.currentTime;

			// Меняем active
			qualityBtns.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			currentQuality = quality;

			// Меняем source через video.children
			const source = video.querySelector(`[data-quality="${quality}"]`);
			video.src = source.src; // только это!

			// Ждём загрузки и продолжаем
			video.addEventListener(
				"loadeddata",
				() => {
					video.currentTime = currentTime;
					if (video.paused) video.play();
				},
				{ once: true },
			);
		};
	});

	// Update progress + time
	function updateProgress() {
		timeEl.textContent = formatTime(video.duration - video.currentTime);
	}

	video.ontimeupdate = updateProgress;
	video.onloadedmetadata = updateProgress;

	video.onplay = () => playBtn.classList.add("hidden");
	video.onpause = () => playBtn.classList.remove("hidden");
}

function formatTime(s) {
	if (isNaN(s)) return "0:00";
	const m = Math.floor(s / 60);
	const sec = Math.floor(s % 60);
	return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Auto-init всех v-video
function initAllVideoPlayers() {
	document.querySelectorAll("v-video").forEach((el) => {
		const qualities = el.getAttribute("qualities")?.split(",") || ["FHD"];
		// const poster = el.getAttribute("poster") || "";
		const name = el.getAttribute("name") || "";

		// Заменяем элемент на плеер
		const player = createVideoPlayer(qualities, name);
		el.parentNode.replaceChild(player, el);

		// Инициализируем
		initVideoHandlers(player);
	});
}

// Запуск после загрузки DOM
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initAllVideoPlayers);
} else {
	initAllVideoPlayers();
}
