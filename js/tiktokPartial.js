// js/tiktokPartial.js  (PARTIAL TRANSPARENCY)

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
const partialVideos = [
  { src: "../videos/animaltiktok.mp4", category: "animal", username: "wildlifeFan", caption: "A small wildlife moment today 🐾" },
  { src: "../videos/arttiktok.mp4", category: "art", username: "artsyJane", caption: "Trying a new painting style 🎨" },
  { src: "../videos/basketballtiktok.mp4", category: "basketball", username: "hoopDreamer", caption: "Trying new drills" },
  { src: "../videos/boxingtiktok.mp4", category: "boxing", username: "fightNight", caption: "Training my jab 🥊" },
  { src: "../videos/drivingtiktok.mp4", category: "driving", username: "roadRider", caption: "A calm night drive" },
  { src: "../videos/earthtiktok.mp4", category: "earth", username: "naturelover", caption: "The world is wild 🌍" },
  { src: "../videos/foodtiktok.mp4", category: "food", username: "chefLife", caption: "Tasting new recipes today" },
  { src: "../videos/gamingtiktok.mp4", category: "gaming", username: "gamerGuy", caption: "Trying to beat this level 🎮" },
  { src: "../videos/knittingtiktok.mp4", category: "knitting", username: "knitQueen", caption: "Working on a soft scarf" },
  { src: "../videos/partytiktok.mp4", category: "party", username: "partyAnimal", caption: "Last night was fun 🎉" },
  { src: "../videos/sciencetiktok.mp4", category: "science", username: "scienceGeek", caption: "New experiment results" },
  { src: "../videos/singingtiktok.mp4", category: "singing", username: "vocalStar", caption: "Singing warm-ups 🎤" },
  { src: "../videos/soccertiktok.mp4", category: "soccer", username: "footieFan", caption: "Goal practice today ⚽" },
  { src: "../videos/technologytiktok.mp4", category: "technology", username: "techGuru", caption: "Trying out this gadget" },
  { src: "../videos/traveltiktok.mp4", category: "travel", username: "globeTrotter", caption: "Another beautiful place ✈️" }
];

// ---------- State ----------
const partialMetrics = new Map();
const partialCatScores = {};
const partialPlayed = new Set();

partialVideos.forEach(v => {
  partialCatScores[v.category] = 0;
  partialMetrics.set(v.src, { watchedPercent: 0, liked: false, favorited: false });
});

// ---------- Helpers ----------
function partialRandom() {
  const left = partialVideos.filter(v => !partialPlayed.has(v.src));
  if (!left.length) {
    partialPlayed.clear();
    return partialVideos[Math.floor(Math.random() * partialVideos.length)];
  }
  return left[Math.floor(Math.random() * left.length)];
}

function partialScore(m) {
  return (m.favorited ? 2 : 0) + (m.liked ? 1 : 0) + (m.watchedPercent / 100);
}

function partialChoose(category) {
  if (!recommendationMap[category]) return partialRandom();
  const choices = [
    ...recommendationMap[category].high,
    ...recommendationMap[category].moderate,
    ...recommendationMap[category].low
  ].map(c => c.toLowerCase());

  let best = null, highest = -999;

  choices.forEach(cat => {
    const score = partialCatScores[cat] || 0;
    if (score > highest) { highest = score; best = cat; }
  });

  const match = partialVideos.filter(v => !partialPlayed.has(v.src) && v.category === best);
  if (match.length) return match[Math.floor(Math.random() * match.length)];
  return partialRandom();
}

// ---------- Create Card ----------
function createPartialCard(obj) {
  const wrap = document.createElement("div");
  wrap.className = "video-card";

  const vid = document.createElement("video");
  vid.src = obj.src;
  vid.autoplay = true;
  vid.muted = true;
  vid.loop = false;
  vid.controls = false;

  const m = partialMetrics.get(obj.src);
  vid.addEventListener("timeupdate", () => {
    if (vid.duration) m.watchedPercent = (vid.currentTime / vid.duration) * 100;
  });

  wrap.appendChild(vid);

  // username + caption
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
  like.onclick = () => {
    m.liked = !m.liked;
    like.classList.toggle("liked", m.liked);
  };

  const fav = document.createElement("div");
  fav.className = "action-btn";
  fav.innerHTML = "★";
  fav.onclick = () => {
    m.favorited = !m.favorited;
    fav.classList.toggle("favorited", m.favorited);
  };

  act.appendChild(like);
  act.appendChild(fav);
  wrap.appendChild(act);

  // partial transparency short message
  const msg = document.createElement("div");
  msg.className = "partial-message";
  msg.innerText = "Some videos you see are based on your recent activity.";
  wrap.appendChild(msg);

  return wrap;
}

// ---------- Init ----------
function initPartial() {
  const feed = document.getElementById("feedContainer");
  let current = partialRandom();
  partialPlayed.add(current.src);
  feed.appendChild(createPartialCard(current));

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 180) {
      const next = partialChoose(current.category);
      partialPlayed.add(next.src);
      feed.appendChild(createPartialCard(next));
      current = next;
    }
  });
}

initPartial();
