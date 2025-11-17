// js/tiktokAlgorithm.js (opaque feed)

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

// ---------- Video Library with usernames and captions ----------
const videos = [
  { src: "../videos/animaltiktok.mp4", category: "animal", username: "wildlifeFan", caption: "Check out this cute animal moment!" },
  { src: "../videos/arttiktok.mp4", category: "art", username: "artsyJane", caption: "Creating some modern masterpieces 🎨" },
  { src: "../videos/basketballtiktok.mp4", category: "basketball", username: "hoopDreamer", caption: "Epic dunk highlights!" },
  { src: "../videos/boxingtiktok.mp4", category: "boxing", username: "fightNight", caption: "Training session knockout combos 🥊" },
  { src: "../videos/drivingtiktok.mp4", category: "driving", username: "roadRider", caption: "Scenic drive vibes 🚗" },
  { src: "../videos/earthtiktok.mp4", category: "earth", username: "naturelover123", caption: "Exploring the wonders of our planet 🌍" },
  { src: "../videos/foodtiktok.mp4", category: "food", username: "chefLife", caption: "Delicious recipes you need to try 🍔" },
  { src: "../videos/gamingtiktok.mp4", category: "gaming", username: "gamerGuy", caption: "Top plays from last night 🎮" },
  { src: "../videos/knittingtiktok.mp4", category: "knitQueen", caption: "Cozy knitting patterns for beginners" },
  { src: "../videos/partytiktok.mp4", category: "party", username: "partyAnimal", caption: "Epic weekend vibes 🎉" },
  { src: "../videos/sciencetiktok.mp4", category: "science", username: "scienceGeek", caption: "Amazing science experiments 🔬" },
  { src: "../videos/singingtiktok.mp4", category: "singing", username: "vocalStar", caption: "Covering my favorite song 🎤" },
  { src: "../videos/soccertiktok.mp4", category: "soccer", username: "footieFan", caption: "Incredible goal compilation ⚽" },
  { src: "../videos/technologytiktok.mp4", category: "technology", username: "techGuru", caption: "Latest gadgets and reviews 💻" },
  { src: "../videos/traveltiktok.mp4", category: "travel", username: "globeTrotter", caption: "Bucket list destinations ✈️" }
];

// ---------- Session State ----------
const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();
videos.forEach(v => { sessionCategoryScores[v.category] = 0; videoMetrics.set(v.src, { watchedPercent:0, liked:false, favorited:false }); });

// ---------- Helper functions ----------
function randomUnplayedVideo() {
  const unplayed = videos.filter(v => !playedVideos.has(v.src));
  if (unplayed.length === 0) { playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)]; }
  return unplayed[Math.floor(Math.random()*unplayed.length)];
}

function scoreFromMetrics(metrics) {
  return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100);
}

// ---------- Choose next video ----------
function chooseNextVideo(currentCategory) {
  if (!recommendationMap[currentCategory]) return randomUnplayedVideo();
  const levels = ["high","moderate","low"];
  const candidateCategories = [];
  levels.forEach(l => { const arr = recommendationMap[currentCategory][l]; if (Array.isArray(arr)) arr.forEach(c=>{ if(!candidateCategories.includes(c)) candidateCategories.push(c); }); });
  let bestCategory=null, bestScore=-Infinity;
  candidateCategories.forEach(cat=>{ const key=cat.toLowerCase(); const s=sessionCategoryScores[key]||0; if(s>bestScore){bestScore=s; bestCategory=key;} });

  if(!bestCategory || bestScore<=0) {
    const setCand=new Set(candidateCategories.map(c=>c.toLowerCase()));
    const unplayed = videos.filter(v=>!playedVideos.has(v.src) && setCand.has(v.category));
    if(unplayed.length) return unplayed[Math.floor(Math.random()*unplayed.length)];
    return randomUnplayedVideo();
  } else {
    const unplayed = videos.filter(v=>!playedVideos.has(v.src) && v.category===bestCategory);
    if(unplayed.length) return unplayed[Math.floor(Math.random()*unplayed.length)];
    const alt = videos.filter(v=>!playedVideos.has(v.src) && candidateCategories.map(c=>c.toLowerCase()).includes(v.category));
    if(alt.length) return alt[Math.floor(Math.random()*alt.length)];
    return randomUnplayedVideo();
  }
}

// ---------- DOM / Feed ----------
function createVideoCard(videoObj) {
  const card = document.createElement("div");
  card.className="video-card";

  const vid = document.createElement("video");
  vid.src=videoObj.src;
  vid.controls=false;
  vid.autoplay=true;
  vid.loop=false;
  vid.muted=true;

  const metrics = videoMetrics.get(videoObj.src);
  vid.addEventListener("timeupdate", ()=>{ if(vid.duration>0){ metrics.watchedPercent=Math.min(100,(vid.currentTime/vid.duration)*100); } });

  vid.addEventListener("ended", ()=>{
    const add = scoreFromMetrics(metrics);
    sessionCategoryScores[videoObj.category] = (sessionCategoryScores[videoObj.category]||0) + add;
    playedVideos.add(videoObj.src);
  });

  // actions
  const actions = document.createElement("div");
  actions.className="actions";
  const likeBtn=document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick=()=>{ metrics.liked=!metrics.liked; likeBtn.classList.toggle("liked",metrics.liked); };
  const favBtn=document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick=()=>{ metrics.favorited=!metrics.favorited; favBtn.classList.toggle("favorited",metrics.favorited); };
  const favText=document.createElement("div"); favText.className="favorite-label"; favText.textContent="Favorite";
  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);

  // username & caption
  const captionDiv = document.createElement("div");
  captionDiv.style.position="absolute";
  captionDiv.style.left="10px";
  captionDiv.style.bottom="50px";
  captionDiv.style.color="white";
  captionDiv.style.fontSize="14px";
  captionDiv.style.textShadow="0 0 5px black";
  captionDiv.innerHTML=`<b>@${videoObj.username}</b> ${videoObj.caption}`;

  card.appendChild(vid);
  card.appendChild(actions);
  card.appendChild(captionDiv);

  return card;
}

function initOpaqueFeed() {
  const feed = document.getElementById("feedContainer");
  const start = randomUnplayedVideo();
  playedVideos.add(start.src);
  feed.appendChild(createVideoCard(start));
  let current=start;

  window.addEventListener("scroll", ()=>{
    if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 180){
      const next = chooseNextVideo(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCard(next));
      current=next;
    }
  });
}

initOpaqueFeed();
