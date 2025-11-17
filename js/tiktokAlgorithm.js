const videos = [
  "videos/animaltiktok.mp4",
  "videos/arttiktok.mp4",
  "videos/basketballtiktok.mp4",
  "videos/boxingtiktok.mp4",
  "videos/drivingtiktok.mp4",
  "videos/earthtiktok.mp4",
  "videos/foodtiktok.mp4",
  "videos/gamingtiktok.mp4",
  "videos/knittingtiktok.mp4",
  "videos/partytiktok.mp4",
  "videos/sciencetiktok.mp4",
  "videos/singingtiktok.mp4",
  "videos/soccertiktok.mp4",
  "videos/technologytiktok.mp4",
  "videos/traveltiktok.mp4"
];

const recMap = {
  "earthtiktok.mp4": {high:["sciencetiktok.mp4","technologytiktok.mp4"], moderate:["traveltiktok.mp4","animaltiktok.mp4"], low:["arttiktok.mp4","knittingtiktok.mp4"]},
  "foodtiktok.mp4": {high:["traveltiktok.mp4","partytiktok.mp4"], moderate:["sciencetiktok.mp4","technologytiktok.mp4"], low:["knittingtiktok.mp4","arttiktok.mp4"]},
  "soccertiktok.mp4": {high:["basketballtiktok.mp4","boxingtiktok.mp4"], moderate:["boxingtiktok.mp4","drivingtiktok.mp4"], low:["traveltiktok.mp4","earthtiktok.mp4"]},
  "traveltiktok.mp4": {high:["foodtiktok.mp4","singingtiktok.mp4"], moderate:["earthtiktok.mp4","animaltiktok.mp4"], low:["sciencetiktok.mp4","technologytiktok.mp4"]},
  "knittingtiktok.mp4": {high:["arttiktok.mp4","technologytiktok.mp4"], moderate:["foodtiktok.mp4","traveltiktok.mp4"], low:["singingtiktok.mp4","knittingtiktok.mp4"]},
  "sciencetiktok.mp4": {high:["technologytiktok.mp4","earthtiktok.mp4"], moderate:["animaltiktok.mp4","foodtiktok.mp4"], low:["soccertiktok.mp4","basketballtiktok.mp4"]},
  "basketballtiktok.mp4": {high:["soccertiktok.mp4","boxingtiktok.mp4"], moderate:["boxingtiktok.mp4","drivingtiktok.mp4"], low:["knittingtiktok.mp4","arttiktok.mp4"]},
  "boxingtiktok.mp4": {high:["soccertiktok.mp4","basketballtiktok.mp4"], moderate:["drivingtiktok.mp4","soccertiktok.mp4"], low:["traveltiktok.mp4","earthtiktok.mp4"]},
  "drivingtiktok.mp4": {high:["boxingtiktok.mp4","soccertiktok.mp4"], moderate:["traveltiktok.mp4","foodtiktok.mp4"], low:["technologytiktok.mp4","sciencetiktok.mp4"]},
  "animaltiktok.mp4": {high:["earthtiktok.mp4","sciencetiktok.mp4"], moderate:["traveltiktok.mp4","foodtiktok.mp4"], low:["knittingtiktok.mp4","arttiktok.mp4"]},
  "technologytiktok.mp4": {high:["sciencetiktok.mp4","earthtiktok.mp4"], moderate:["arttiktok.mp4","knittingtiktok.mp4"], low:["drivingtiktok.mp4","boxingtiktok.mp4"]},
  "arttiktok.mp4": {high:["knittingtiktok.mp4","technologytiktok.mp4"], moderate:["foodtiktok.mp4","traveltiktok.mp4"], low:["singingtiktok.mp4","arttiktok.mp4"]},
  "singingtiktok.mp4": {high:["traveltiktok.mp4","foodtiktok.mp4"], moderate:["arttiktok.mp4","knittingtiktok.mp4"], low:["sciencetiktok.mp4","technologytiktok.mp4"]},
  "gamingtiktok.mp4": {high:["partytiktok.mp4","soccertiktok.mp4"], moderate:["technologytiktok.mp4","sciencetiktok.mp4"], low:["drivingtiktok.mp4","boxingtiktok.mp4"]},
  "partytiktok.mp4": {high:["gamingtiktok.mp4","singingtiktok.mp4"], moderate:["foodtiktok.mp4","traveltiktok.mp4"], low:["knittingtiktok.mp4","arttiktok.mp4"]}
};

const feed = document.getElementById("feed");
let loading = false;

// Add initial random video
function addInitialVideo() {
  const first = videos[Math.floor(Math.random() * videos.length)];
  addVideoToFeed(first);
}

// Add video element with buttons
function addVideoToFeed(src) {
  const container = document.createElement("div");
  container.className = "video-container";

  const vid = document.createElement("video");
  vid.src = src;
  vid.autoplay = true;
  vid.loop = true;
  vid.muted = false;

  const controls = document.createElement("div");
  controls.className = "controls";

  const likeBtn = document.createElement("button");
  likeBtn.textContent = "❤️";
  likeBtn.addEventListener("click", () => likeBtn.classList.toggle("liked"));

  const favBtn = document.createElement("button");
  favBtn.textContent = "⭐ Favorite";
  favBtn.addEventListener("click", () => favBtn.classList.toggle("favorited"));

  controls.appendChild(likeBtn);
  controls.appendChild(favBtn);

  container.appendChild(vid);
  container.appendChild(controls);
  feed.appendChild(container);
}

// Engagement: watched percentage
function getEngagement(videoEl) {
  const watched = videoEl.currentTime / videoEl.duration;
  if (watched >= 0.75) return "high";
  if (watched >= 0.25) return "moderate";
  return "low";
}

// Next video based on last video
function getNextVideo(prevVideoEl) {
  const level = getEngagement(prevVideoEl);
  const prevSrc = prevVideoEl.src.split("/").pop();
  const options = recMap[prevSrc][level];
  return options[Math.floor(Math.random() * options.length)];
}

// Scroll listener
feed.addEventListener("scroll", () => {
  const scrollBottom = feed.scrollTop + feed.clientHeight;
  if (!loading && scrollBottom >= feed.scrollHeight - 5) {
    loading = true;
    const lastVidEl = feed.lastChild.querySelector("video");
    const nextSrc = getNextVideo(lastVidEl);
    addVideoToFeed(nextSrc);
    setTimeout(() => loading = false, 200);
  }
});

addInitialVideo();
