// js/tiktokPartial.js
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

const videos = [
  { src: "../videos/knittinginstagram.mp4", category: "knitting", username:"@craftygram", caption:"DIY knitting ideas you’ll love!" },
  { src: "../videos/soccerinstagram.mp4", category: "soccer", username:"@goalgetter", caption:"Top soccer highlights from around the world ⚽️" },
  { src: "../videos/earthinstagram.mp4", category: "earth", username:"@earthlover", caption:"Breathtaking landscapes and nature shots 🌍" },
  { src: "../videos/foodinstagram.mp4", category: "food", username:"@foodieheaven", caption:"Delicious recipes you can try at home 🍳" },
  { src: "../videos/travelinstagram.mp4", category: "travel", username:"@wanderlust", caption:"Explore the most stunning destinations ✈️" },
  { src: "../videos/scienceinstagram.mp4", category: "science", username:"@sciencemind", caption:"Cool science experiments you can do at home 🔬" },
  { src: "../videos/basketballinstagram.mp4", category: "basketball", username:"@hoopdreams", caption:"Epic basketball dunks and plays 🏀" },
  { src: "../videos/boxinginstagram.mp4", category: "boxing", username:"@fightnight", caption:"Best knockout moments from recent matches 🥊" },
  { src: "../videos/drivinginstagram.mp4", category: "driving", username:"@carlifestyle", caption:"Supercars and driving adventures 🚗💨" },
  { src: "../videos/animalinstagram.mp4", category: "animal", username:"@wildlife_daily", caption:"Adorable animal videos to brighten your day 🐾" },
  { src: "../videos/technologyinstagram.mp4", category: "technology", username:"@techworld", caption:"Latest gadgets and tech innovations 🤖" },
  { src: "../videos/artinstagram.mp4", category: "art", username:"@artisticvibes", caption:"Creative art and painting inspiration 🎨" },
  { src: "../videos/singinginstagram.mp4", category: "singing", username:"@vocalpower", caption:"Amazing singing performances to enjoy 🎤" },
  { src: "../videos/gaminginstagram.mp4", category: "gaming", username:"@gamersunite", caption:"Top gaming clips and epic plays 🎮" },
  { src: "../videos/partyinstagram.mp4", category: "party", username:"@partycentral", caption:"Fun party moments you don’t want to miss 🎉" }
];


const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();

videos.forEach(v => {
  sessionCategoryScores[v.category] = 0;
  videoMetrics.set(v.src, { watchedPercent:0, liked:false, favorited:false, lastLogged:0 });
});

// ---------- LOGGING TO GOOGLE FORMS ----------
function logEngagementToSheets(videoObj, metrics) {
  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSeAebR1LAfa0D4AmABTowEAu6L8CGDo2WKt5eWnaeuYI-IbLw/formResponse";
  const formData = new FormData();

  formData.append("entry.874302524", videoObj.src);
  formData.append("entry.849413165", videoObj.category);
  formData.append("entry.892416275", videoObj.username);
  formData.append("entry.1181897329", metrics.liked ? "TRUE" : "FALSE");
  formData.append("entry.1516107255", metrics.favorited ? "TRUE" : "FALSE");
  formData.append("entry.777927080", metrics.watchedPercent);

  navigator.sendBeacon(formURL, formData);
}


// ---------- VIDEO SELECTION ----------
function randomUnplayedVideo(){ 
  const unplayed = videos.filter(v => !playedVideos.has(v.src)); 
  if(unplayed.length === 0){ playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)]; } 
  return unplayed[Math.floor(Math.random()*unplayed.length)]; 
}
function scoreFromMetrics(metrics){ return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100); }
function chooseNextVideo(currentCategory){
  if(!recommendationMap[currentCategory]) return randomUnplayedVideo();
  const levels=["high","moderate","low"],candidateCats=[];
  levels.forEach(l=>{ const arr=recommendationMap[currentCategory][l]; if(Array.isArray(arr)) arr.forEach(c=>{ if(!candidateCats.includes(c)) candidateCats.push(c); }); });
  let bestCategory=null,bestScore=-Infinity;
  candidateCats.forEach(cat=>{ const key=cat.toLowerCase(),score=sessionCategoryScores[key]||0; if(score>bestScore){ bestScore=score; bestCategory=key; } });
  if(!bestCategory||bestScore<=0){ const setCand=new Set(candidateCats.map(c=>c.toLowerCase())); const unplayed=videos.filter(v=>!playedVideos.has(v.src)&&setCand.has(v.category)); return unplayed.length ? unplayed[Math.floor(Math.random()*unplayed.length)] : randomUnplayedVideo(); }
  const unplayed=videos.filter(v=>!playedVideos.has(v.src)&&v.category===bestCategory); return unplayed.length ? unplayed[Math.floor(Math.random()*unplayed.length)] : randomUnplayedVideo();
}

// ---------- VIDEO CARD CREATION ----------
function createVideoCardPartial(videoObj){
  const card = document.createElement("div"); 
  card.className = "video-card";

  const vid = document.createElement("video"); 
  vid.src = videoObj.src; 
  vid.controls = false; 
  vid.autoplay = true; 
  vid.loop = false; 
  vid.muted = true;

  const metrics = videoMetrics.get(videoObj.src);

  const expBox = document.createElement("div"); 
  expBox.className = "explanation-box";

  // decide once per video whether to show the message (~50%)
  const showExp = Math.random() < 0.5;

  function updateExp() {
    if(!showExp){
      expBox.textContent = "";
      return;
    }
    const X = videoObj.category;
    expBox.textContent = `This video is recommended to you because you showed high engagement to videos related to ${X}.`;
  }

  vid.addEventListener("timeupdate", () => {
    if(vid.duration > 0){
      const percent = Math.floor((vid.currentTime / vid.duration) * 100);
      metrics.watchedPercent = percent;
      if(percent - metrics.lastLogged >= 25){
        metrics.lastLogged = percent;
        logEngagementToSheets(videoObj, metrics, "Partial");
      }
    }
    updateExp();
  });

  vid.addEventListener("ended", () => {
    sessionCategoryScores[videoObj.category] += scoreFromMetrics(metrics);
    playedVideos.add(videoObj.src);
    logEngagementToSheets(videoObj, metrics, "Partial");
  });

  const actions = document.createElement("div"); 
  actions.className = "actions";

  const likeBtn = document.createElement("div"); 
  likeBtn.className = "action-btn"; 
  likeBtn.innerHTML = "❤";
  likeBtn.onclick = () => { metrics.liked = !metrics.liked; likeBtn.classList.toggle("liked", metrics.liked); updateExp(); };

  const favBtn = document.createElement("div"); 
  favBtn.className = "action-btn"; 
  favBtn.innerHTML = "★";
  favBtn.onclick = () => { metrics.favorited = !metrics.favorited; favBtn.classList.toggle("favorited", metrics.favorited); updateExp(); };

  const favText = document.createElement("div"); 
  favText.className = "favorite-label"; 
  favText.textContent = "Favorite";

  actions.appendChild(likeBtn); 
  actions.appendChild(favBtn); 
  actions.appendChild(favText);

  const captionBox = document.createElement("div"); 
  captionBox.className = "caption-box";
  captionBox.innerHTML = `<div class="username">${videoObj.username}</div>${videoObj.caption}`;

  card.appendChild(vid); 
  card.appendChild(actions); 
  card.appendChild(expBox); 
  card.appendChild(captionBox);

  // initial update
  updateExp();

  return card;
}

// ---------- INITIALIZE FEED ----------
function initPartialFeed(){
  const feed = document.getElementById("feedContainer");
  const start = randomUnplayedVideo(); 
  playedVideos.add(start.src);
  feed.appendChild(createVideoCardPartial(start));
  let current = start;

  window.addEventListener("scroll", () => {
    if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 180){
      const next = chooseNextVideo(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCardPartial(next));
      current = next;
    }
  });
}

initPartialFeed();

