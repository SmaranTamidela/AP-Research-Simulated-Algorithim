// js/tiktokPartial.js (partial transparency feed)

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

// ---------- Video Library ----------
const videos = [
  { src: "../videos/animaltiktok.mp4", category: "animal", username: "wildlife123", caption: "Check out this cute animal!" },
  { src: "../videos/arttiktok.mp4", category: "art", username: "artlover", caption: "Amazing painting skills" },
  { src: "../videos/basketballtiktok.mp4", category: "basketball", username: "baller01", caption: "Epic dunk compilation" },
  { src: "../videos/boxingtiktok.mp4", category: "boxing", username: "fightclub", caption: "Boxing knockout highlights" },
  { src: "../videos/drivingtiktok.mp4", category: "driving", username: "carenthusiast", caption: "Smooth driving tips" },
  { src: "../videos/earthtiktok.mp4", category: "earth", username: "naturelover", caption: "Beautiful landscapes around the world" },
  { src: "../videos/foodtiktok.mp4", category: "food", username: "chefdelight", caption: "Delicious recipe ideas" },
  { src: "../videos/gamingtiktok.mp4", category: "gaming", username: "gamerzone", caption: "Top gaming moments" },
  { src: "../videos/knittingtiktok.mp4", category: "knitting", username: "craftyhands", caption: "Cozy knitting tutorial" },
  { src: "../videos/partytiktok.mp4", category: "party", username: "partytime", caption: "Best party moments" },
  { src: "../videos/sciencetiktok.mp4", category: "science", username: "scienceguru", caption: "Amazing science experiments" },
  { src: "../videos/singingtiktok.mp4", category: "singing", username: "musiclover", caption: "Incredible singing cover" },
  { src: "../videos/soccertiktok.mp4", category: "soccer", username: "footballfan", caption: "Amazing goal compilation" },
  { src: "../videos/technologytiktok.mp4", category: "technology", username: "techgeek", caption: "Latest tech trends" },
  { src: "../videos/traveltiktok.mp4", category: "travel", username: "wanderlust", caption: "Top travel destinations" }
];

// ---------- Session State ----------
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

function chooseNextVideoPartial(currentCategory) {
  if (!recommendationMap[currentCategory]) return randomUnplayedVideoPartial();
  const levels = ["high","moderate","low"];
  const candidateCats=[];
  levels.forEach(l => { const arr = recommendationMap[currentCategory][l]; if(Array.isArray(arr)) arr.forEach(c=>{ if(!candidateCats.includes(c)) candidateCats.push(c); }); });

  let bestCategory=null, bestScore=-Infinity;
  candidateCats.forEach(cat => { const key=cat.toLowerCase(); const s=sessionCategoryScores[key]||0; if(s>bestScore){bestScore=s; bestCategory=key;} });

  if(!bestCategory||bestScore<=0) {
    const setCand=new Set(candidateCats.map(c=>c.toLowerCase()));
    const unplayed = videos.filter(v=>!playedVideos.has(v.src)&&setCand.has(v.category));
    if(unplayed.length) return unplayed[Math.floor(Math.random()*unplayed.length)];
    return randomUnplayedVideoPartial();
  } else {
    const unplayed = videos.filter(v=>!playedVideos.has(v.src)&&v.category===bestCategory);
    if(unplayed.length) return unplayed[Math.floor(Math.random()*unplayed.length)];
    const alt = videos.filter(v=>!playedVideos.has(v.src)&&candidateCats.map(c=>c.toLowerCase()).includes(v.category));
    if(alt.length) return alt[Math.floor(Math.random()*alt.length)];
    return randomUnplayedVideoPartial();
  }
}

// ---------- DOM ----------
function createVideoCardPartial(videoObj) {
  const card = document.createElement("div");
  card.className = "video-card";

  // Recommendation message at top
  const recMsg = document.createElement("div");
  recMsg.className = "recommendation-box";
  recMsg.textContent = "This video was recommended to you because you have liked or favorited videos similar to this one. Videos are muted by default.";
  card.appendChild(recMsg);

  // Video element
  const vid = document.createElement("video");
  vid.src = videoObj.src;
  vid.autoplay = true;
  vid.loop = false;
  vid.muted = true;
  vid.controls = false;
  card.appendChild(vid);

  // Username and caption
  const userCaption = document.createElement("div");
  userCaption.className = "username-caption";
  userCaption.innerHTML = `<strong>@${videoObj.username}</strong><br>${videoObj.caption}`;
  card.appendChild(userCaption);

  // Actions
  const actions = document.createElement("div");
  actions.className = "actions";
  const likeBtn = document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick = ()=>{ const m=videoMetrics.get(videoObj.src); m.liked=!m.liked; likeBtn.classList.toggle("liked", m.liked); };
  const favBtn = document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick = ()=>{ const m=videoMetrics.get(videoObj.src); m.favorited=!m.favorited; favBtn.classList.toggle("favorited", m.favorited); };
  const favText = document.createElement("div"); favText.className="favorite-label"; favText.textContent="Favorite";
  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);
  card.appendChild(actions);

  // Metrics tracking
  const metrics = videoMetrics.get(videoObj.src);
  vid.addEventListener("timeupdate", () => { if(vid.duration>0) metrics.watchedPercent=Math.min(100,(vid.currentTime/vid.duration)*100); });
  vid.addEventListener("ended", ()=>{ const add=scoreFromMetrics(metrics); sessionCategoryScores[videoObj.category]+=(add||0); playedVideos.add(videoObj.src); });

  return card;
}

function initPartialFeed() {
  const feed = document.getElementById("feedContainer");
  const start = randomUnplayedVideoPartial();
  playedVideos.add(start.src);
  feed.appendChild(createVideoCardPartial(start));
  let current = start;

  window.addEventListener("scroll", () => {
    if(window.innerHeight+window.scrollY >= document.body.offsetHeight-180){
      const next = chooseNextVideoPartial(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCardPartial(next));
      current = next;
    }
  });
}

initPartialFeed();
