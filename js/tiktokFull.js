// js/tiktokFull.js  (FULL TRANSPARENCY)

// ---------- Recommendation Map ----------
const recommendationMap = {
  "earth": { high: ["science","technology"], moderate: ["travel","animal"], low: ["art","knitting"] },
  "food":  { high: ["travel","party"], moderate: ["science","technology"], low: ["knitting","art"] },
  "soccer":{ high: ["basketball","boxing"], moderate: ["boxing","driving"], low: ["travel","earth"] },
  "travel":{ high: ["food","singing"], moderate: ["earth","animal"], low: ["science","technology"] },
  "knitting":{high: ["art","technology"], moderate: ["food","travel"], low: ["singing","knitting"] },
  "science":{high: ["technology","earth"], moderate: ["animal","food"], low: ["soccer","basketball"] },
  "basketball":{high:["soccer","boxing"], moderate:["boxing","driving"], low:["knitting","art"] },
  "boxing":{high:["soccer","basketball"], moderate:["driving","soccer"], low:["travel","earth"] },
  "driving":{high:["boxing","soccer"], moderate:["travel","food"], low:["technology","science"] },
  "animal":{high:["earth","science"], moderate:["travel","food"], low:["knitting","art"] },
  "technology":{high:["science","earth"], moderate:["art","knitting"], low:["driving","boxing"] },
  "art":{high:["knitting","technology"], moderate:["food","travel"], low:["singing","art"] },
  "singing":{high:["travel","food"], moderate:["art","knitting"], low:["science","technology"] },
  "gaming":{high:["party","soccer"], moderate:["technology","science"], low:["driving","boxing"] },
  "party":{high:["gaming","singing"], moderate:["food","travel"], low:["knitting","art"] }
};

// ---------- Video Library ----------
const fullVideos = [
  { src: "../videos/animaltiktok.mp4", category: "animal", username: "wildlifeFan", caption: "Animals always make the day better 🐾" },
  { src: "../videos/arttiktok.mp4", category: "art", username: "artsyJane", caption: "Experimenting with new colors" },
  { src: "../videos/basketballtiktok.mp4", category: "basketball", username: "hoopDreamer", caption: "Back at it again 🏀" },
  { src: "../videos/boxingtiktok.mp4", category: "boxing", username: "fightNight", caption: "Working on speed" },
  { src: "../videos/drivingtiktok.mp4", category: "driving", username: "roadRider", caption: "Cruising on empty streets" },
  { src: "../videos/earthtiktok.mp4", category: "earth", username: "naturelover", caption: "Earth is incredible 🌍" },
  { src: "../videos/foodtiktok.mp4", category: "food", username: "chefLife", caption: "New dish every day" },
  { src: "../videos/gamingtiktok.mp4", category: "gaming", username: "gamerGuy", caption: "New game drop 🎮" },
  { src: "../videos/knittingtiktok.mp4", category: "knitting", username: "knitQueen", caption: "Soft yarn magic" },
  { src: "../videos/partytiktok.mp4", category: "party", username: "partyAnimal", caption: "Weekend recap 🎉" },
  { src: "../videos/sciencetiktok.mp4", category: "science", username: "scienceGeek", caption: "This surprised me" },
  { src: "../videos/singingtiktok.mp4", category: "singing", username: "vocalStar", caption: "Quick warm-up 🎤" },
  { src: "../videos/soccertiktok.mp4", category: "soccer", username: "footieFan", caption: "Trying new drills ⚽" },
  { src: "../videos/technologytiktok.mp4", category: "technology", username: "techGuru", caption: "Testing a new setup" },
  { src: "../videos/traveltiktok.mp4", category: "travel", username: "globeTrotter", caption: "The world is so big ✈️" }
];

// ---------- State ----------
const fullPlayed = new Set();
const fullMetrics = new Map();
const fullScores = {};
fullVideos.forEach(v => {
  fullScores[v.category] = 0;
  fullMetrics.set(v.src, { watchedPercent:0, liked:false, favorited:false });
});

// ---------- Helpers ----------
function fullRandom() {
  const left = fullVideos.filter(v => !fullPlayed.has(v.src));
  if (!left.length) { fullPlayed.clear(); return fullVideos[Math.floor(Math.random()*fullVideos.length)]; }
  return left[Math.floor(Math.random()*left.length)];
}

function fullScore(m) {
  return (m.favorited ? 2 : 0) + (m.liked ? 1 : 0) + (m.watchedPercent / 100);
}

function fullChoose(category) {
  const r = recommendationMap[category];
  if (!r) return fullRandom();
  const all = [...r.high,...r.moderate,...r.low].map(c=>c.toLowerCase());

  let best=null, bestScore=-999;
  all.forEach(cat=>{
    const score=fullScores[cat]||0;
    if(score>bestScore){bestScore=score; best=cat;}
  });

  const match = fullVideos.filter(v=>!fullPlayed.has(v.src) && v.category===best);
  if(match.length) return match[Math.floor(Math.random()*match.length)];
  return fullRandom();
}

function fullExplanation(category, metrics) {
  const percent = metrics.watchedPercent.toFixed(0);

  const reasons = [
    `because you've watched around ${percent}% of videos related to ${category}`,
    `because you liked or favorited similar videos`,
    `based on your recent interest in ${category} content`,
    `because your activity suggests you're interested in this topic`,
    `because you've shown strong engagement with videos in this category`
  ];

  return "This video was recommended to you " +
    reasons[Math.floor(Math.random()*reasons.length)] +
    ".";
}

// ---------- Card ----------
function createFullCard(obj) {
  const wrap = document.createElement("div");
  wrap.className = "video-card";

  const v = document.createElement("video");
  v.src = obj.src;
  v.autoplay = true;
  v.muted = true;
  v.controls = false;

  const m = fullMetrics.get(obj.src);
  v.addEventListener("timeupdate", () => {
    if (v.duration) m.watchedPercent = (v.currentTime / v.duration) * 100;
  });

  wrap.appendChild(v);

  // username & caption
  const cap = document.createElement("div");
  cap.className = "caption-box";
  cap.innerHTML = `<b>@${obj.username}</b> ${obj.caption}`;
  wrap.appendChild(cap);

  // actions
  const act = document.createElement("div");
  act.className = "actions";

  const like = document.createElement("div");
  like.className = "action-btn";
  like.innerHTML = "❤";
  like.onclick = ()=>{
    m.liked = !m.liked;
    like.classList.toggle("liked", m.liked);
  };

  const fav = document.createElement("div");
  fav.className = "action-btn";
  fav.innerHTML = "★";
  fav.onclick = ()=>{
    m.favorited = !m.favorited;
    fav.classList.toggle("favorited", m.favorited);
  };

  act.appendChild(like);
  act.appendChild(fav);
  wrap.appendChild(act);

  // full transparency message
  const msg = document.createElement("div");
  msg.className = "full-message";
  msg.innerText = fullExplanation(obj.category, m);
  wrap.appendChild(msg);

  return wrap;
}

// ---------- Init ----------
function initFull() {
  const feed = document.getElementById("feedContainer");
  let cur = fullRandom();
  fullPlayed.add(cur.src);
  feed.appendChild(createFullCard(cur));

  window.addEventListener("scroll", ()=>{
    if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 180){
      fullScores[cur.category] += fullScore(fullMetrics.get(cur.src));
      const next = fullChoose(cur.category);
      fullPlayed.add(next.src);
      feed.appendChild(createFullCard(next));
      cur = next;
    }
  });
}

initFull();
