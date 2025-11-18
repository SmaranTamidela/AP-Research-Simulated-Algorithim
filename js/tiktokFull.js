// js/tiktokFull.js
// FULL copy-paste ready file — includes recommendation map, videos, algorithm, UI, and logging

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzGlnQLPJVEfGwAK3v4E9P1OSJHyx0nSNRYgIgIp1jTpj5LEi5vst129xsLtE_jH5So/exec";

// ---------- Recommendation map ----------
const recommendationMap = {
  "earth": { high: ["science","technology"], moderate: ["travel","animal"], low: ["art","knitting"] },
  "food":  { high: ["travel","party"], moderate: ["science","technology"], low: ["knitting","art"] },
  "soccer":{ high: ["basketball","boxing"], moderate: ["boxing","driving"], low: ["travel","earth"] },
  "travel":{ high: ["food","singing"], moderate: ["earth","animal"], low: ["science","technology"] },
  "knitting":{high:["art","technology"],moderate:["food","travel"],low:["singing","knitting"]},
  "science":{high:["technology","earth"],moderate:["animal","food"],low:["soccer","basketball"]},
  "basketball":{high:["soccer","boxing"],moderate:["boxing","driving"],low:["knitting","art"]},
  "boxing":{high:["soccer","basketball"],moderate:["driving","soccer"],low:["travel","earth"]},
  "driving":{high:["boxing","soccer"],moderate:["travel","food"],low:["technology","science"]},
  "animal":{high:["earth","science"],moderate:["travel","food"],low:["knitting","art"]},
  "technology":{high:["science","earth"],moderate:["art","knitting"],low:["driving","boxing"]},
  "art":{high:["knitting","technology"],moderate:["food","travel"],low:["singing","art"]},
  "singing":{high:["travel","food"],moderate:["art","knitting"],low:["science","technology"]},
  "gaming":{high:["party","soccer"],moderate:["technology","science"],low:["driving","boxing"]},
  "party":{high:["gaming","singing"],moderate:["food","travel"],low:["knitting","art"]}
};

// ---------- Video library (with usernames and captions) ----------
const videos = [
  { src: "../videos/animaltiktok.mp4", category: "animal", username:"@naturefan", caption:"Cute wildlife compilation!" },
  { src: "../videos/arttiktok.mp4", category: "art", username:"@artistlife", caption:"Amazing painting timelapse" },
  { src: "../videos/basketballtiktok.mp4", category: "basketball", username:"@baller23", caption:"Epic dunk highlights!" },
  { src: "../videos/boxingtiktok.mp4", category: "boxing", username:"@fightclub", caption:"Top knockout moments" },
  { src: "../videos/drivingtiktok.mp4", category: "driving", username:"@carguy", caption:"Supercars on the highway" },
  { src: "../videos/earthtiktok.mp4", category: "earth", username:"@planetlover", caption:"Beautiful earth landscapes" },
  { src: "../videos/foodtiktok.mp4", category: "food", username:"@foodie", caption:"Delicious recipes you must try" },
  { src: "../videos/gamingtiktok.mp4", category: "gaming", username:"@gamerlife", caption:"Top gaming moments" },
  { src: "../videos/knittingtiktok.mp4", category: "knitting", username:"@crafty", caption:"DIY knitting projects" },
  { src: "../videos/partytiktok.mp4", category: "party", username:"@partytime", caption:"Best party clips!" },
  { src: "../videos/sciencetiktok.mp4", category: "science", username:"@sciencenerd", caption:"Amazing science experiments" },
  { src: "../videos/singingtiktok.mp4", category: "singing", username:"@singerlife", caption:"Beautiful singing performances" },
  { src: "../videos/soccertiktok.mp4", category: "soccer", username:"@soccerpro", caption:"Top soccer goals" },
  { src: "../videos/technologytiktok.mp4", category: "technology", username:"@techguru", caption:"Cool gadgets and inventions" },
  { src: "../videos/traveltiktok.mp4", category: "travel", username:"@traveler", caption:"Best travel destinations" }
];

// ---------- Session state ----------
const sessionCategoryScores = {}; // aggregate signal by category
const playedVideos = new Set();   // avoid repeats until pool exhausted
const videoMetrics = new Map();   // per video metrics object

videos.forEach(v => {
  sessionCategoryScores[v.category] = 0;
  videoMetrics.set(v.src, { watchedPercent: 0, liked: false, favorited: false, username: v.username, caption: v.caption });
});

// ---------- Utilities ----------
function randomUnplayedVideoFull(){
  const unplayed = videos.filter(v => !playedVideos.has(v.src));
  if (unplayed.length === 0) { playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)]; }
  return unplayed[Math.floor(Math.random()*unplayed.length)];
}

function scoreFromMetrics(metrics){
  // favorited heavy (2), liked medium (1), watchedPercent normalized
  return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100);
}

function chooseNextVideoFull(currentCategory){
  if (!recommendationMap[currentCategory]) return randomUnplayedVideoFull();
  const levels = ["high","moderate","low"];
  const candidateCategories = [];
  levels.forEach(l => {
    const arr = recommendationMap[currentCategory][l];
    if (Array.isArray(arr)) arr.forEach(c => { if (!candidateCategories.includes(c)) candidateCategories.push(c); });
  });

  // pick candidate category with highest session score
  let bestCategory = null, bestScore = -Infinity;
  candidateCategories.forEach(cat => {
    const key = cat.toLowerCase();
    const s = sessionCategoryScores[key] || 0;
    if (s > bestScore) { bestScore = s; bestCategory = key; }
  });

  if (!bestCategory || bestScore <= 0) {
    const setCand = new Set(candidateCategories.map(c => c.toLowerCase()));
    const unplayed = videos.filter(v => !playedVideos.has(v.src) && setCand.has(v.category));
    if (unplayed.length > 0) return unplayed[Math.floor(Math.random()*unplayed.length)];
    return randomUnplayedVideoFull();
  } else {
    const unplayed = videos.filter(v => !playedVideos.has(v.src) && v.category === bestCategory);
    if (unplayed.length > 0) return unplayed[Math.floor(Math.random()*unplayed.length)];
    const alt = videos.filter(v => !playedVideos.has(v.src) && candidateCategories.map(c=>c.toLowerCase()).includes(v.category));
    if (alt.length > 0) return alt[Math.floor(Math.random()*alt.length)];
    return randomUnplayedVideoFull();
  }
}

// ---------- Logging helper ----------
function logEngagement(data){
  fetch(WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(r => {
    // optional: try to parse response
    return r.text();
  })
  .then(txt => {
    // uncomment to debug in console: console.log("Log response:", txt);
  })
  .catch(err => {
    console.error("Logging failed:", err);
  });
}

// ---------- DOM / Feed logic ----------
function createVideoCardFull(videoObj){
  const card = document.createElement("div");
  card.className = "video-card";

  // video element (9:16 container should be handled by CSS)
  const vid = document.createElement("video");
  vid.src = videoObj.src;
  vid.controls = false;
  vid.autoplay = true;
  vid.loop = false;
  vid.muted = true; // videos muted by default
  vid.playsInline = true;

  const metrics = videoMetrics.get(videoObj.src);
  let counted25 = false;

  // update watched percent live
  vid.addEventListener("timeupdate", () => {
    if (vid.duration > 0) {
      metrics.watchedPercent = Math.min(100, (vid.currentTime / vid.duration) * 100);
      if (!counted25 && metrics.watchedPercent >= 25) { counted25 = true; }
    }
  });

  // when video ends
  vid.addEventListener("ended", () => {
    const add = scoreFromMetrics(metrics);
    sessionCategoryScores[videoObj.category] = (sessionCategoryScores[videoObj.category] || 0) + add;
    playedVideos.add(videoObj.src);

    // send metrics to Google Sheet
    logEngagement({
      timestamp: (new Date()).toISOString(),
      src: videoObj.src,
      category: videoObj.category,
      watchedPercent: metrics.watchedPercent,
      liked: metrics.liked,
      favorited: metrics.favorited,
      username: videoObj.username,
      caption: videoObj.caption
    });
  });

  // actions (like + favorite)
  const actions = document.createElement("div");
  actions.className = "actions";

  const likeBtn = document.createElement("div");
  likeBtn.className = "action-btn";
  likeBtn.innerHTML = "❤";
  likeBtn.title = "Like";

  likeBtn.onclick = () => {
    metrics.liked = !metrics.liked;
    likeBtn.classList.toggle("liked", metrics.liked);

    // log the event immediately when user likes/unlikes
    logEngagement({
      event: "like_toggle",
      timestamp: (new Date()).toISOString(),
      src: videoObj.src,
      category: videoObj.category,
      liked: metrics.liked,
      favorited: metrics.favorited,
      watchedPercent: metrics.watchedPercent,
      username: videoObj.username,
      caption: videoObj.caption
    });
  };

  const favBtn = document.createElement("div");
  favBtn.className = "action-btn";
  favBtn.innerHTML = "★";
  favBtn.title = "Favorite";

  favBtn.onclick = () => {
    metrics.favorited = !metrics.favorited;
    favBtn.classList.toggle("favorited", metrics.favorited);

    // log favorite toggle
    logEngagement({
      event: "favorite_toggle",
      timestamp: (new Date()).toISOString(),
      src: videoObj.src,
      category: videoObj.category,
      liked: metrics.liked,
      favorited: metrics.favorited,
      watchedPercent: metrics.watchedPercent,
      username: videoObj.username,
      caption: videoObj.caption
    });
  };

  const favText = document.createElement("div");
  favText.className = "favorite-label";
  favText.textContent = "Favorite";

  actions.appendChild(likeBtn);
  actions.appendChild(favBtn);
  actions.appendChild(favText);

  // caption & username
  const captionBox = document.createElement("div");
  captionBox.className = "caption-box";
  captionBox.innerHTML = `<div class="username">${videoObj.username}</div>${videoObj.caption}`;

  // full transparency explanation box (fixed at top)
  const expBox = document.querySelector(".full-transparency-box") || document.createElement("div");
  if (!expBox.parentElement) {
    expBox.className = "explanation-box full-transparency-box";
    // style the box for visibility (you can adjust in CSS instead)
    expBox.style.position = "fixed";
    expBox.style.top = "12px";
    expBox.style.left = "50%";
    expBox.style.transform = "translateX(-50%)";
    expBox.style.background = "rgba(0,0,0,0.75)";
    expBox.style.color = "#fff";
    expBox.style.padding = "8px 12px";
    expBox.style.borderRadius = "10px";
    expBox.style.zIndex = "9999";
    expBox.style.fontSize = "13px";
    expBox.style.maxWidth = "92%";
    expBox.style.textAlign = "center";
    document.body.appendChild(expBox);
  }

  // update the full explanation content
  function updateFullExp() {
    // Build message(s) — show one clear reason (no percentages)
    // Use top 1-2 session categories as basis
    const sorted = Object.entries(sessionCategoryScores).slice().sort((a,b) => b[1]-a[1]).filter(s => s[1] > 0).slice(0,2);
    let reason = `This video was recommended to you because you have shown engagement in videos related to ${videoObj.category}.`;
    if (sorted.length > 0) {
      // if session shows a clear top category other than the video category, mention it
      const top = sorted[0][0];
      if (top !== videoObj.category) {
        reason = `This video was recommended to you because you have shown high engagement in videos related to ${top}.`;
      } else if (sorted.length > 1) {
        reason = `This video was recommended because you showed engagement in ${top} and ${sorted[1][0]}.`;
      }
    } else {
      // fallback generic
      reason = `This video was recommended to you because of your recent session activity.`;
    }
    // note that videos are muted
    reason += " (Videos are muted.)";
    expBox.textContent = reason;
  }

  // initial update and live update while video plays
  vid.addEventListener("timeupdate", updateFullExp);
  updateFullExp();

  // build card
  card.appendChild(vid);
  card.appendChild(actions);
  card.appendChild(captionBox);
  // NOTE: expBox is fixed at top of page (added to document.body) — not appended into card

  return card;
}

// ---------- initialize feed ----------
function initFullFeed(){
  const feed = document.getElementById("feedContainer");
  if (!feed) {
    console.error("No #feedContainer element found.");
    return;
  }

  // Start with a random video (session start)
  const start = randomUnplayedVideoFull();
  playedVideos.add(start.src);
  const startMetrics = videoMetrics.get(start.src);
  feed.appendChild(createVideoCardFull(start));

  // Preload one more so scrolling feels continuous
  let current = start;

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 180) {
      const next = chooseNextVideoFull(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCardFull(next));
      current = next;
    }
  });
}

// Auto init
document.addEventListener("DOMContentLoaded", initFullFeed);
