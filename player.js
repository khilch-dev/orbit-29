const get = id => document.getElementById(id);
const audio = get("audio");
const seek = get("seek");
const toggle = get("toggle");
const status = get("status");
let selected = 0;
const time = seconds => {
  const whole = Math.floor(seconds || 0);
  return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
};

get("edition").textContent = album.edition;
const rows = album.tracks.map((track, index) => {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.className = "track";
  for (const [className, value] of [
    ["track-number", String(index + 1).padStart(2, "0")],
    ["track-title", track.title],
    ["track-length", time(track.duration)],
    ["track-icon", "▶"]
  ]) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = value;
    if (className === "track-icon") span.setAttribute("aria-hidden", "true");
    button.append(span);
  }
  button.addEventListener("click", () => index === selected ? togglePlayback() : select(index, true));
  item.append(button);
  get("tracklist").append(item);
  return button;
});

function showError() {
  status.textContent = "mb bro song doesnt work";
  status.hidden = false;
}

function play() {
  status.hidden = true;
  audio.play().catch(error => {
    if (error.name !== "AbortError") showError();
  });
}

function select(index, autoplay) {
  selected = index;
  const track = album.tracks[index];
  audio.src = track.file;
  status.hidden = true;
  get("current").textContent = track.title;
  get("duration").textContent = time(track.duration);
  updateTime();
  if (autoplay) play();
  renderPlayback();
}

function renderPlayback() {
  const playing = !audio.paused && !audio.ended;
  toggle.textContent = playing ? "Ⅱ" : "▶";
  toggle.setAttribute("aria-label", playing ? "Pause" : "Play");
  rows.forEach((row, index) => {
    row.setAttribute("aria-current", String(index === selected));
    row.lastElementChild.textContent = index === selected && playing ? "Ⅱ" : "▶";
  });
}

function updateTime() {
  get("elapsed").textContent = time(audio.currentTime);
  const ready = Number.isFinite(audio.duration) && audio.duration > 0;
  seek.disabled = !ready;
  seek.value = ready ? audio.currentTime / audio.duration * 1000 : 0;
  seek.setAttribute("aria-valuetext", time(audio.currentTime));
}

function togglePlayback() {
  if (audio.paused || audio.ended) {
    if (audio.error) audio.load();
    play();
  } else {
    audio.pause();
  }
}

toggle.addEventListener("click", togglePlayback);
get("previous").addEventListener("click", () => select((selected + rows.length - 1) % rows.length, !audio.paused));
get("next").addEventListener("click", () => select((selected + 1) % rows.length, !audio.paused));
seek.addEventListener("input", () => {
  if (!seek.disabled) audio.currentTime = Number(seek.value) / 1000 * audio.duration;
});
audio.addEventListener("loadedmetadata", () => {
  get("duration").textContent = time(audio.duration);
  updateTime();
});
audio.addEventListener("timeupdate", updateTime);
audio.addEventListener("play", renderPlayback);
audio.addEventListener("pause", renderPlayback);
audio.addEventListener("error", showError);
audio.addEventListener("ended", () => {
  if (selected + 1 < rows.length) select(selected + 1, true);
  else renderPlayback();
});
select(0, false);
