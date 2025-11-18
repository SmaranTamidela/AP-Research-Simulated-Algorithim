// js/tiktokFull.js 

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxqIwNTRS8NiCDaF4a1HV5Xq--3jHCPbcjhH9azqtjajNNpszFtsGzA6Vqf56tfSM8g/exec";

// ---------- Recommendation map ----------
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

// ---------- full video list ----------
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

// ---------- session and metrics ----------
const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();
videos.forEach(v => { 
  sessionCategoryScores[v.category] = 0; 
  videoMetrics.set(v.src, { watchedPercent:0, liked:false, favorited:false, username:v.username, caption:v.caption }); 
});

function randomUnplayedVideoFull() {
  const unplayed = videos.filter(v => !playedVideos.has(v.src));
  if (unplayed.length === 0) { playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)]; }
  return unplayed[Math.floor(Math.random()*unplayed.length)];
}

function scoreFromMetrics(metrics) {
  return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100);
}

// ---------- choose next video ----------
function chooseNextVideoFull(currentCategory) {
  if (!recommendationMap[currentCategory]) return randomUnplayedVideoFull();
  const levels = ["high","moderate","low"];
  const candidateCats=[];
  levels.forEach(l => { const arr = recommendationMap[currentCategory][l]; if(Array.isArray(arr)) arr.forEach(c=>{ if(!candidateCats.includes(c)) candidateCats.push(c); }); });
  let bestCategory=null, bestScore=-Infinity;
  candidateCats.forEach(cat => { const key=cat.toLowerCase(); const s=sessionCategoryScores[key]||0; if(s>bestScore){bestScore=s; bestCategory=key;} });
  if(!bestCategory||bestScore<=0) {
    const setCand=new Set(candidateCats.map(c=>c.toLowerCase()));
    const unplayed = videos.filter(v=>!playedVideos.has(v.src)&&setCand.has(v.category));
    if(unplayed.length) return unplayed[Math.floor(Math.random()*unplayed.length)];
    return randomUnplayedVideoFull();
  } else {
    const unplayed = videos.filter(v=>!playedVideos.has(v.src)&&v.category===bestCategory);
    if(unplayed.length) return unplayed[Math.floor(Math.random()*unplayed.length)];
    const alt = videos.filter(v=>!playedVideos.has(v.src)&&candidateCats.map(c=>c.toLowerCase()).includes(v.category));
    if(alt.length) return alt[Math.floor(Math.random()*alt.length)];
    return randomUnplayedVideoFull();
  }
}

// ---------- DOM and video card ----------
function createVideoCardFull(videoObj) {
  const card = document.createElement("div"); card.className="video-card";

  const vid = document.createElement("video");
  vid.src = videoObj.src; vid.controls=false; vid.autoplay=true; vid.loop=false; vid.muted=true;

  const metrics = videoMetrics.get(videoObj.src);
  let counted25=false;

  vid.addEventListener("timeupdate", () => {
    if(vid.duration>0) {
      metrics.watchedPercent = Math.min(100,(vid.currentTime/vid.duration)*100);
      if(!counted25 && metrics.watchedPercent>=25) { counted25=true; }
    }
  });

  vid.addEventListener("ended", () => {
    const add = scoreFromMetrics(metrics);
    sessionCategoryScores[videoObj.category] = (sessionCategoryScores[videoObj.category]||0) + add;
    playedVideos.add(videoObj.src);

    // Send engagement data to Google Sheets
    fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(metrics),
      headers: {"Content-Type":"application/json"}
    });
  });

  const actions = document.createElement("div"); actions.className="actions";
  const likeBtn = document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick = ()=>{ metrics.liked = !metrics.liked; likeBtn.classList.toggle("liked", metrics.liked); updateFullExp(); };
  const favBtn = document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick = ()=>{ metrics.favorited = !metrics.favorited; favBtn.classList.toggle("favorited", metrics.favorited); updateFullExp(); };
  const favText = document.createElement("div"); favText.className="favorite-label"; favText.textContent="Favorite";
  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);

  const captionBox = document.createElement("div"); captionBox.className="caption-box";
  captionBox.innerHTML = `<div class="username">${videoObj.username}</div>${videoObj.caption}`;

  const expBox = document.createElement("div"); expBox.className="explanation-box full-transparency-box";
  expBox.style.position="fixed"; expBox.style.top="0"; expBox.style.left="50%"; expBox.style.transform="translateX(-50%)";
  expBox.style.background="rgba(0,0,0,0.7)"; expBox.style.color="#fff"; expBox.style.padding="10px"; expBox.style.borderRadius="8px";
  expBox.style.zIndex="9999"; expBox.style.fontSize="14px"; expBox.style.maxWidth="90%"; expBox.style.textAlign="center";

  function updateFullExp() {
    let topCats = Object.entries(sessionCategoryScores).sort((a,b)=>b[1]-a[1]).slice(0,2);
    const messages = topCats.map(c => {
      return `This video was recommended to you because you have shown high engagement in videos related to ${c[0]}`;
    });
    expBox.textContent = messages.join(" | ");
  }

  card.appendChild(vid); card.appendChild(actions); card.appendChild(captionBox); card.appendChild(expBox);

  vid.addEventListener("timeupdate", updateFullExp);
  updateFullExp();

  return card;
}

// ---------- initialize feed ----------
function initFullFeed() {
  const feed = document.getElementById("feedContainer");
  const start = randomUnplayedVideoFull();
  playedVideos.add(start.src);
  feed.appendChild(createVideoCardFull(start));
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

initFullFeed();
