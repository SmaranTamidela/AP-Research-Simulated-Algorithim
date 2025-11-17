
// Same videos and recMap as opaque
const videos = ["earth": { high: ["science","technology"], moderate: ["travel","animal"], low: ["art","knitting"] },
  "food":  { high: ["travel","party"],     moderate: ["science","technology"], low: ["knitting","art"] },
  "soccer":{ high: ["basketball","boxing"],moderate: ["boxing","driving"],     low: ["travel","earth"] },
  "travel":{ high: ["food","singing"],     moderate: ["earth","animal"],        low: ["science","technology"] },
  "knitting":{high: ["art","technology"],  moderate: ["food","travel"],         low: ["singing","knitting"] },
  "science":{high: ["technology","earth"], moderate: ["animal","food"],         low: ["soccer","basketball"] },
  "basketball":{high:["soccer","boxing"],  moderate:["boxing","driving"],       low:["knitting","art"] },
  "boxing":{high:["soccer","basketball"],  moderate:["driving","soccer"],       low:["travel","earth"]},
  "driving":{high:["boxing","soccer"],     moderate:["travel","food"],          low:["technology","science"]},
  "animal":{high:["earth","science"],      moderate:["travel","food"],          low:["knitting","art"]},
  "technology":{high:["science","earth"],  moderate:["art","knitting"],         low:["driving","boxing"]},
  "art":{high:["knitting","technology"],   moderate:["food","travel"],          low:["singing","art"]},
  "singing":{high:["travel","food"],       moderate:["art","knitting"],         low:["science","technology"]},
  "gaming":{high:["party","soccer"],       moderate:["technology","science"],   low:["driving","boxing"]},
  "party":{high:["gaming","singing"],      moderate:["food","travel"],          low:["knitting","art"]}]; // copy the same array
const recMap = {  { src: "../videos/animaltiktok.mp4", category: "animal" },
  { src: "../videos/arttiktok.mp4", category: "art" },
  { src: "../videos/basketballtiktok.mp4", category: "basketball" },
  { src: "../videos/boxingtiktok.mp4", category: "boxing" },
  { src: "../videos/drivingtiktok.mp4", category: "driving" },
  { src: "../videos/earthtiktok.mp4", category: "earth" },
  { src: "../videos/foodtiktok.mp4", category: "food" },
  { src: "../videos/gamingtiktok.mp4", category: "gaming" },
  { src: "../videos/knittingtiktok.mp4", category: "knitting" },
  { src: "../videos/partytiktok.mp4", category: "party" },
  { src: "../videos/sciencetiktok.mp4", category: "science" },
  { src: "../videos/singingtiktok.mp4", category: "singing" },
  { src: "../videos/soccertiktok.mp4", category: "soccer" },
  { src: "../videos/technologytiktok.mp4", category: "technology" },
  { src: "../videos/traveltiktok.mp4", category: "travel" }}; // same as above

const feed = document.getElementById("feed");
let loading = false;

function addInitialVideo() {
  const first = videos[Math.floor(Math.random()*videos.length)];
  addVideoToFeed(first);
}

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

function getEngagement(videoEl) {
  const watched = videoEl.currentTime / videoEl.duration;
  if (watched >= 0.6) return "high";
  if (watched >= 0.2) return "moderate";
  return "low";
}

function getNextVideo(prevVideoEl) {
  const level = getEngagement(prevVideoEl);
  const prevSrc = prevVideoEl.src.split("/").pop();
  const options = recMap[prevSrc][level];
  return options[Math.floor(Math.random() * options.length)];
}

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

