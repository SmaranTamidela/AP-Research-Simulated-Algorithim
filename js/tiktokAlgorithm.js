// js/tiktokAlgorithm.js (opaque feed)
// Full recommendation map and video list included; session-based selection (Option B)

// ---------- Recommendation Map ---------- 
const recommendationMap = {
  "earth": { high: ["science","technology"], moderate: ["travel","animal"], low: ["art","knitting"] },
  "food":  { high: ["travel","party"],     moderate: ["science","technology"], low: ["knitting","art"] },
  "soccer":{ high: ["basketball","boxing"],moderate: ["boxing","driving"],     low: ["travel","earth"] },
  "travel":{ high: ["food","singing"],     moderate: ["earth","animal"],        low: ["science","technology"] },
  "knitting":{high: ["art","technology"], moder: ["food","travel"],            low: ["singing","knitting"] },
  "science":{high: ["technology","earth"], moderate: ["animal","food"],         low: ["soccer","basketball"] },
  "basketball":{high:["soccer","boxing"],  moderate:["boxing","driving"],       low:["knitting","art"] },
  "boxing":{high:["soccer","basketball"],  moderate:["driving","soccer"],       low:["travel","earth"]},
  "driving":{high:["boxing","soccer"],     moderate:["travel","food"],          low:["technology","science"]},
  "animal":{high:["earth","science"],      moderate:["travel","food"],          low:["knitting","art"]},
  "technology":{high:["science","earth"],  moderate:["art","knitting"],         low:["driving","boxing"]},
  "art":{high:["knitting","technology"],   moderate:["food","travel"],          low:["singing","art"]},
  "singing":{high:["travel","food"],       moderate:["art","knitting"],         low:["science","technology"]},
  "gaming":{high:["party","soccer"],       moderate:["technology","science"],   low:["driving","boxing"]},
  "party":{high:["gaming","singing"],      moderate:["food","travel"],          low:["knitting","art"]}
};

// ---------- Video Library ----------
const videos = [
  { src: "../videos/animaltiktok.mp4", category: "animal" },
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
  { src: "../videos/traveltiktok.mp4", category: "travel" }
];

// ---------- Session State ----------
const sessionCategoryScores = {}; // aggregate engagement per category
const playedVideos = new Set();   // avoid repeats until pool exhausted
const videoMetrics = new Map();   // per-video metrics { watchedPercent, liked, favorited }

// helper init
videos.forEach(v => {
  if (!(v.category in sessionCategoryScores)) sessionCategoryScores[v.category] = 0;
  videoMetrics.set(v.src, { watchedPercent: 0, liked: false, favorited: false });
});

// ---------- Utilities ----------
function randomUnplayedVideo() {
  const unplayed = videos.filter(v => !playedVideos.has(v.src));
  if (unplayed.length === 0) {
    // reset played set if exhausted
    playedVideos.clear();
    return videos[Math.floor(Math.random() * videos.length)];
  }
  return unplayed[Math.floor(Math.random() * unplayed.length)];
}

function pickRandomVideo() {
  return videos[Math.floor(Math.random() * videos.length)];
}

// compute engagement score contribution for a video metrics
function scoreFromMetrics(metrics) {
  // favorited heavy (2), liked medium (1), watchedPercent normalized 0-1
  return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100);
}

// choose next video based on session-wide preferences and current video's recommendation list
function chooseNextVideo(currentCategory) {
  const recsObj = recommendationMap[currentCategory];
  const candidates = (recsObj && Object.keys(recsObj).length === 0) ? [] : (recsObj || []);

  // recsObj in this file is arrays per level; we just want unique candidate categories from all three levels
  // For this implementation we flatten the map entry into a single array of candidates (preserve order)
  // If currentCategory not found, fallback to random unplayed
  if (!recommendationMap[currentCategory]) {
    return randomUnplayedVideo();
  }

  // flatten possible categories (high/moderate/low are already arrays stored in objects)
  // but in this file each map value is an object with high/moderate/low arrays — convert to union:
  const candidateCategories = [];
  const levels = ["high","moderate","low"];
  levels.forEach(level => {
    const arr = recommendationMap[currentCategory][level];
    if (Array.isArray(arr)) arr.forEach(c => { if (!candidateCategories.includes(c)) candidateCategories.push(c); });
  });

  // pick candidate whose category has the highest session score (sessionCategoryScores uses lower-case keys)
  let bestCategory = null;
  let bestScore = -Infinity;
  candidateCategories.forEach(cat => {
    const key = cat.toLowerCase();
    const score = sessionCategoryScores[key] || 0;
    if (score > bestScore) { bestScore = score; bestCategory = key; }
  });

  // if bestScore is zero or null (no signal), pick an unseen candidate video; else pick unseen video from bestCategory
  if (!bestCategory || bestScore <= 0) {
    // find any unplayed video that matches candidateCategories; else random unplayed
    const candidateCategorySet = new Set(candidateCategories.map(c => c.toLowerCase()));
    const unplayed = videos.filter(v => !playedVideos.has(v.src) && candidateCategorySet.has(v.category));
    if (unplayed.length > 0) return unplayed[Math.floor(Math.random() * unplayed.length)];
    // fallback: random unplayed from whole set
    return randomUnplayedVideo();
  } else {
    const unplayed = videos.filter(v => !playedVideos.has(v.src) && v.category === bestCategory);
    if (unplayed.length > 0) return unplayed[Math.floor(Math.random() * unplayed.length)];
    // fallback to any unplayed candidate
    const allUnplayedCandidates = videos.filter(v => !playedVideos.has(v.src) && candidateCategories.map(c=>c.toLowerCase()).includes(v.category));
    if (allUnplayedCandidates.length > 0) return allUnplayedCandidates[Math.floor(Math.random() * allUnplayedCandidates.length)];
    // final fallback
    return randomUnplayedVideo();
  }
}

// ---------- DOM / Feed logic ----------
function createVideoCard(videoObj) {
  const card = document.createElement("div");
  card.className = "video-card";

  const vid = document.createElement("video");
  vid.src = videoObj.src;
  vid.controls = false;
  vid.autoplay = true;
  vid.loop = false;

  // attach metrics object
  const metrics = videoMetrics.get(videoObj.src);

  // update watched percent live
  vid.addEventListener("timeupdate", () => {
    if (vid.duration > 0) {
      metrics.watchedPercent = Math.min(100, (vid.currentTime / vid.duration) * 100);
    }
  });

  // when the video ends we treat it as 'user finished' and update session scores
  vid.addEventListener("ended", () => {
    // commit metrics into session score
    const add = scoreFromMetrics(metrics);
    sessionCategoryScores[videoObj.category] = (sessionCategoryScores[videoObj.category] || 0) + add;

    // mark video played
    playedVideos.add(videoObj.src);
  });

  // actions
  const actions = document.createElement("div");
  actions.className = "actions";

  const likeBtn = document.createElement("div");
  likeBtn.className = "action-btn";
  likeBtn.innerHTML = "❤";
  likeBtn.onclick = () => {
    metrics.liked = !metrics.liked;
    likeBtn.classList.toggle("liked", metrics.liked);
  };

  const favBtn = document.createElement("div");
  favBtn.className = "action-btn";
  favBtn.innerHTML = "★";
  favBtn.onclick = () => {
    metrics.favorited = !metrics.favorited;
    favBtn.classList.toggle("favorited", metrics.favorited);
  };

  const favText = document.createElement("div");
  favText.className = "favorite-label";
  favText.textContent = "Favorite";

  actions.appendChild(likeBtn);
  actions.appendChild(favBtn);
  actions.appendChild(favText);

  card.appendChild(vid);
  card.appendChild(actions);

  return card;
}

function initOpaqueFeed() {
  const feed = document.getElementById("feedContainer");
  // start with a random unplayed
  const start = randomUnplayedVideo();
  playedVideos.add(start.src); // mark started as played so not immediately repeated
  feed.appendChild(createVideoCard(start));
  // add one more in advance so scrolling feels continuous
  let current = start;

  window.addEventListener("scroll", () => {
    // when user scrolls near bottom, compute next based on session and append
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 180) {
      const next = chooseNextVideo(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCard(next));
      current = next;
    }
  });
}

// init
initOpaqueFeed();
