// js/tiktokPartial.js (session-based recommendation; shows a short hint)

// ---------- Recommendation map (full) ----------
const recommendationMap = {
  "earth": { high: ["science","technology"], moderate: ["travel","animal"], low: ["art","knitting"] },
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
  "party":{high:["gaming","singing"],      moderate:["food","travel"],          low:["knitting","art"]}
};

// ---------- Video library (full) ----------
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

// ---------- Session state ----------
const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();
videos.forEach(v => { sessionCategoryScores[v.category] = 0; videoMetrics.set(v.src, { watchedPercent:0, liked:false, favorited:false }); });

// ---------- Helpers ----------
function randomUnplayedVideoPartial() {
  const unplayed = videos.filter(v => !playedVideos.has(v.src));
  if (unplayed.length === 0) { playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)]; }
  return unplayed[Math.floor(Math.random()*unplayed.length)];
}

function scoreFromMetrics(metrics) {
  return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100);
}

// Choose next based on session scores (same logic as opaque)
function chooseNextVideoPartial(currentCategory) {
  if (!recommendationMap[currentCategory]) return randomUnplayedVideoPartial();
  const levels = ["high","moderate","low"];
  const candidateCategories = [];
  levels.forEach(l => { const arr = recommendationMap[currentCategory][l]; if (Array.isArray(arr)) arr.forEach(c=>{ if(!candidateCategories.includes(c)) candidateCategories.push(c); }); });

  let bestCategory = null; let bestScore = -Infinity;
  candidateCategories.forEach(cat => { const key = cat.toLowerCase(); const s = sessionCategoryScores[key] || 0; if (s > bestScore) { bestScore = s; bestCategory = key; } });

  if (!bestCategory || bestScore <= 0) {
    const setCand = new Set(candidateCategories.map(c=>c.toLowerCase()));
    const unplayed = videos.filter(v => !playedVideos.has(v.src) && setCand.has(v.category));
    if (unplayed.length) return unplayed[Math.floor(Math.random()*unplayed.length)];
    return randomUnplayedVideoPartial();
  } else {
    const unplayed = videos.filter(v => !playedVideos.has(v.src) && v.category === bestCategory);
    if (unplayed.length) return unplayed[Math.floor(Math.random()*unplayed.length)];
    const alt = videos.filter(v => !playedVideos.has(v.src) && candidateCategories.map(c=>c.toLowerCase()).includes(v.category));
    if (alt.length) return alt[Math.floor(Math.random()*alt.length)];
    return randomUnplayedVideoPartial();
  }
}

// ---------- DOM ----------
function createVideoCardPartial(videoObj) {
  const card = document.createElement("div"); card.className = "video-card";

  const vid = document.createElement("video");
  vid.src = videoObj.src; vid.controls = false; vid.autoplay = true; vid.loop = false; vid.muted = true;


  const metrics = videoMetrics.get(videoObj.src);
  let counted25 = false;
  vid.addEventListener("timeupdate", () => { if (vid.duration>0) { metrics.watchedPercent = Math.min(100,(vid.currentTime/vid.duration)*100); if(!counted25 && metrics.watchedPercent>=25){ counted25=true; } } });

  vid.addEventListener("ended", () => {
    const add = scoreFromMetrics(metrics);
    sessionCategoryScores[videoObj.category] = (sessionCategoryScores[videoObj.category] || 0) + add;
    playedVideos.add(videoObj.src);
  });

  const actions = document.createElement("div"); actions.className = "actions";
  const likeBtn = document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick = ()=>{ const m=videoMetrics.get(videoObj.src); m.liked=!m.liked; likeBtn.classList.toggle("liked", m.liked); updatePartialExpBox(card, videoObj); };
  const favBtn = document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick = ()=>{ const m=videoMetrics.get(videoObj.src); m.favorited=!m.favorited; favBtn.classList.toggle("favorited", m.favorited); updatePartialExpBox(card, videoObj); };
  const favText = document.createElement("div"); favText.className="favorite-label"; favText.textContent="Favorite";
  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);

  // partial explanation box
  const expBox = document.createElement("div"); expBox.className="explanation-box";
  expBox.textContent = "Recommended based on your session activity"; // placeholder content, will update
  card.appendChild(vid); card.appendChild(actions); card.appendChild(expBox);

  // update box live
  function updateBox() {
    const m = videoMetrics.get(videoObj.src);
    const hints = [];
    if (m.favorited) hints.push("You favorited similar content");
    if (m.liked) hints.push("You liked similar content");
    if (m.watchedPercent > 25) hints.push("You often watch this type of video");
    expBox.textContent = hints.length ? hints[0] : "Recommended based on your session activity";
  }
  function updatePartialExpBox(cardRef, vObj){ updateBox(); }

  // ensure the expBox updates over time
  vid.addEventListener("timeupdate", updateBox);
  return card;
}

function initPartialFeed() {
  const feed = document.getElementById("feedContainer");
  const start = randomUnplayedVideoPartial();
  playedVideos.add(start.src);
  feed.appendChild(createVideoCardPartial(start));
  let current = start;

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 180) {
      const next = chooseNextVideoPartial(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCardPartial(next));
      current = next;
    }
  });
}

initPartialFeed();
