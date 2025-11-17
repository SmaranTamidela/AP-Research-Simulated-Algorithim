// js/tiktokPartial.js (partial transparency)

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

// ---------- Video List ----------
const videos = [
  { src: "../videos/animaltiktok.mp4", category: "animal", username: "@naturelover", caption: "Check out this cute animal!" },
  { src: "../videos/arttiktok.mp4", category: "art", username: "@artsy", caption: "Amazing art piece!" },
  { src: "../videos/basketballtiktok.mp4", category: "basketball", username: "@baller23", caption: "Epic dunk!" },
  { src: "../videos/boxingtiktok.mp4", category: "boxing", username: "@punchking", caption: "Knockout moves!" },
  { src: "../videos/drivingtiktok.mp4", category: "driving", username: "@fastlane", caption: "Crazy road trip!" },
  { src: "../videos/earthtiktok.mp4", category: "earth", username: "@earthwatch", caption: "Breathtaking nature!" },
  { src: "../videos/foodtiktok.mp4", category: "food", username: "@foodie", caption: "Yummy recipes!" },
  { src: "../videos/gamingtiktok.mp4", category: "gaming", username: "@gamerlife", caption: "Insane gameplay!" },
  { src: "../videos/knittingtiktok.mp4", category: "knitting", username: "@craftqueen", caption: "DIY knitting tutorial!" },
  { src: "../videos/partytiktok.mp4", category: "party", username: "@funvibes", caption: "Weekend party vibes!" },
  { src: "../videos/sciencetiktok.mp4", category: "science", username: "@labnerd", caption: "Cool science experiment!" },
  { src: "../videos/singingtiktok.mp4", category: "singing", username: "@musiclover", caption: "Cover song performance!" },
  { src: "../videos/soccertiktok.mp4", category: "soccer", username: "@footie", caption: "Goal of the season!" },
  { src: "../videos/technologytiktok.mp4", category: "technology", username: "@techguru", caption: "Latest gadgets review!" },
  { src: "../videos/traveltiktok.mp4", category: "travel", username: "@wanderlust", caption: "Amazing travel spots!" }
];

// ---------- Session ----------
const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();
videos.forEach(v => { sessionCategoryScores[v.category] = 0; videoMetrics.set(v.src, { watchedPercent:0, liked:false, favorited:false }); });

// ---------- Helpers ----------
function randomUnplayedVideoPartial() {
  const unplayed = videos.filter(v=>!playedVideos.has(v.src));
  if(unplayed.length===0){ playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)]; }
  return unplayed[Math.floor(Math.random()*unplayed.length)];
}

function scoreFromMetrics(metrics) { return (metrics.favorited?2:0)+(metrics.liked?1:0)+(metrics.watchedPercent/100); }

function chooseNextVideoPartial(currentCategory){
  if(!recommendationMap[currentCategory]) return randomUnplayedVideoPartial();
  const candidateCats=[].concat(...Object.values(recommendationMap[currentCategory]));
  const unplayed = videos.filter(v=>!playedVideos.has(v.src)&&candidateCats.includes(v.category));
  return unplayed.length ? unplayed[Math.floor(Math.random()*unplayed.length)] : randomUnplayedVideoPartial();
}

// ---------- DOM ----------
function createVideoCardPartial(videoObj){
  const card=document.createElement("div"); card.className="video-card";
  const vid=document.createElement("video");
  vid.src=videoObj.src; vid.controls=false; vid.autoplay=true; vid.loop=false; vid.muted=true;

  const metrics=videoMetrics.get(videoObj.src);
  vid.addEventListener("timeupdate",()=>{ if(vid.duration>0){ metrics.watchedPercent=Math.min(100,(vid.currentTime/vid.duration)*100); } });
  vid.addEventListener("ended",()=>{ sessionCategoryScores[videoObj.category]+=scoreFromMetrics(metrics); playedVideos.add(videoObj.src); });

  // actions
  const actions=document.createElement("div"); actions.className="actions";
  const likeBtn=document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick=()=>{ metrics.liked=!metrics.liked; likeBtn.classList.toggle("liked",metrics.liked); };
  const favBtn=document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick=()=>{ metrics.favorited=!metrics.favorited; favBtn.classList.toggle("favorited",metrics.favorited); };
  actions.appendChild(likeBtn); actions.appendChild(favBtn);

  // username + caption
  const infoBox=document.createElement("div"); infoBox.className="username-caption";
  infoBox.innerHTML=`<strong>${videoObj.username}</strong><br>${videoObj.caption}`;

  card.appendChild(vid); card.appendChild(actions); card.appendChild(infoBox);
  return card;
}

function initPartialFeed(){
  const feed=document.getElementById("feedContainer");
  let current=randomUnplayedVideoPartial();
  playedVideos.add(current.src);
  feed.appendChild(createVideoCardPartial(current));

  window.addEventListener("scroll",()=>{
    if(window.innerHeight+window.scrollY>=document.body.offsetHeight-180){
      const next=chooseNextVideoPartial(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCardPartial(next));
      current=next;
    }
  });
}

initPartialFeed();
