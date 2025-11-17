// js/tiktokFull.js (full transparency feed with usernames, captions, and explanation)

// ---------- Recommendation Map ----------
const recommendationMap = {
  "earth": { high: ["science","technology"], moderate: ["travel","animal"], low: ["art","knitting"] },
  "food":  { high: ["travel","party"], moderate: ["science","technology"], low: ["knitting","art"] },
  "soccer":{ high: ["basketball","boxing"],moderate: ["boxing","driving"], low: ["travel","earth"] },
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

// ---------- Video List ----------
const videos = [
  { src: "../videos/animaltiktok.mp4", category: "animal", username: "@naturelover", caption: "Experience wildlife up close." },
  { src: "../videos/arttiktok.mp4", category: "art", username: "@creativevibes", caption: "Check out this stunning artwork." },
  { src: "../videos/basketballtiktok.mp4", category: "basketball", username: "@hoopsdaily", caption: "An amazing basketball highlight." },
  { src: "../videos/boxingtiktok.mp4", category: "boxing", username: "@fightclub", caption: "Intense boxing action!" },
  { src: "../videos/drivingtiktok.mp4", category: "driving", username: "@roadtripvibes", caption: "Smooth driving footage for you." },
  { src: "../videos/earthtiktok.mp4", category: "earth", username: "@earthwatch", caption: "Discover amazing earth visuals." },
  { src: "../videos/foodtiktok.mp4", category: "food", username: "@foodieheaven", caption: "Delicious dishes you’ll love." },
  { src: "../videos/gamingtiktok.mp4", category: "gaming", username: "@gamerzone", caption: "Top gaming moments captured." },
  { src: "../videos/knittingtiktok.mp4", category: "knitting", username: "@craftyhands", caption: "Knitting tips and patterns." },
  { src: "../videos/partytiktok.mp4", category: "party", username: "@partytime", caption: "Fun party highlights." },
  { src: "../videos/sciencetiktok.mp4", category: "science", username: "@sciencelab", caption: "Explore fascinating science facts." },
  { src: "../videos/singingtiktok.mp4", category: "singing", username: "@vocalqueen", caption: "Incredible singing performance." },
  { src: "../videos/soccertiktok.mp4", category: "soccer", username: "@soccerfan", caption: "Soccer action at its best." },
  { src: "../videos/technologytiktok.mp4", category: "technology", username: "@techguru", caption: "Cool technology insights." },
  { src: "../videos/traveltiktok.mp4", category: "travel", username: "@wanderlust", caption: "Travel destinations you’ll adore." }
];

// ---------- Session State ----------
const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();
videos.forEach(v => {
  sessionCategoryScores[v.category] = 0;
  videoMetrics.set(v.src, { watchedPercent:0, liked:false, favorited:false });
});

// ---------- Helpers ----------
function randomUnplayedVideoFull() {
  const unplayed = videos.filter(v => !playedVideos.has(v.src));
  if (!unplayed.length) { playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)]; }
  return unplayed[Math.floor(Math.random()*unplayed.length)];
}

function scoreFromMetrics(metrics) {
  return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100);
}

function chooseNextVideoFull(currentCategory) {
  if (!recommendationMap[currentCategory]) return randomUnplayedVideoFull();
  const candidateCats = [];
  ["high","moderate","low"].forEach(level => {
    recommendationMap[currentCategory][level].forEach(c => { if (!candidateCats.includes(c)) candidateCats.push(c); });
  });

  let bestCategory = null, bestScore = -Infinity;
  candidateCats.forEach(cat => {
    const score = sessionCategoryScores[cat] || 0;
    if (score > bestScore) { bestScore = score; bestCategory = cat; }
  });

  const unplayed = videos.filter(v => !playedVideos.has(v.src) && v.category === bestCategory);
  return unplayed.length ? unplayed[Math.floor(Math.random()*unplayed.length)] : randomUnplayedVideoFull();
}

// ---------- DOM ----------
function createVideoCardFull(videoObj) {
  const card = document.createElement("div"); card.className="video-card";

  const vid = document.createElement("video");
  vid.src = videoObj.src;
  vid.autoplay = true;
  vid.loop = false;
  vid.controls = false;
  vid.muted = true;

  const metrics = videoMetrics.get(videoObj.src);
  vid.addEventListener("timeupdate", () => {
    if (vid.duration > 0) metrics.watchedPercent = Math.min(100,(vid.currentTime/vid.duration)*100);
  });

  vid.addEventListener("ended", () => {
    sessionCategoryScores[videoObj.category] += scoreFromMetrics(metrics);
    playedVideos.add(videoObj.src);
  });

  // Actions
  const actions = document.createElement("div"); actions.className="actions";
  const likeBtn = document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick = ()=>{ metrics.liked=!metrics.liked; likeBtn.classList.toggle("liked", metrics.liked); updateExp(); };
  const favBtn = document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick = ()=>{ metrics.favorited=!metrics.favorited; favBtn.classList.toggle("favorited", metrics.favorited); updateExp(); };
  const favText = document.createElement("div"); favText.className="favorite-label"; favText.textContent="Favorite";
  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);

  // Username + Caption
  const videoInfo = document.createElement("div"); videoInfo.className="video-info";
  const username = document.createElement("div"); username.className="username"; username.textContent=videoObj.username;
  const caption = document.createElement("div"); caption.className="caption"; caption.textContent=videoObj.caption;
  videoInfo.appendChild(username); videoInfo.appendChild(caption);

  // Recommendation message (full transparency)
  const expBox = document.createElement("div"); expBox.className="explanation-box";
  function updateExp() {
    const engagementLevel = (metrics.favorited || metrics.watchedPercent>75) ? "High" : (metrics.liked || metrics.watchedPercent>25) ? "Moderate" : "Low";
    const sorted = Object.entries(sessionCategoryScores).sort((a,b)=>b[1]-a[1]).slice(0,4);
    const sessionTop = sorted.map(s => `${s[0]} (${s[1].toFixed(2)})`).join(", ") || "None";
    const recsObj = recommendationMap[videoObj.category] || {};
    const recs = [];
    ["high","moderate","low"].forEach(l => { if(Array.isArray(recsObj[l])) recsObj[l].forEach(c=>recs.push(c)); });

    const reasonParts = [];
    if (metrics.favorited || metrics.liked) reasonParts.push("you have liked or favorited similar videos");
    if (engagementLevel==="High") reasonParts.push("you watched videos in similar categories extensively");
    if (!reasonParts.length) reasonParts.push("based on your session activity");
    const reason = reasonParts.join(" and ");

    expBox.textContent = `Video: ${videoObj.category}\nEngagement: ${engagementLevel}\nSession top: ${sessionTop}\nCandidate recs: ${recs.join(", ")}\nReason: This video was recommended because ${reason}.`;
  }

  vid.addEventListener("timeupdate", updateExp);
  updateExp();

  card.appendChild(vid);
  card.appendChild(actions);
  card.appendChild(videoInfo);
  card.appendChild(expBox);

  return card;
}

// ---------- Initialize Feed ----------
function initFullFeed() {
  const feed = document.getElementById("feedContainer");
  let current = randomUnplayedVideoFull();
  playedVideos.add(current.src);
  feed.appendChild(createVideoCardFull(current));

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 180) {
      current = chooseNextVideoFull(current.category);
      playedVideos.add(current.src);
      feed.appendChild(createVideoCardFull(current));
    }
  });
}

initFullFeed();
