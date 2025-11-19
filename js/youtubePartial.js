// js/youtubePartial.js
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
  { src: "../videos/knittingyoutube.mp4", category: "knitting", username:"@craftyyoutube", caption:"DIY knitting ideas you’ll love!" },
  { src: "../videos/socceryoutube.mp4", category: "soccer", username:"@goalgetterYT", caption:"Top soccer highlights from around the world ⚽️" },
  { src: "../videos/earthyoutube.mp4", category: "earth", username:"@earthloverYT", caption:"Breathtaking landscapes and nature shots 🌍" },
  { src: "../videos/foodyoutube.mp4", category: "food", username:"@foodieYT", caption:"Delicious recipes you can try at home 🍳" },
  { src: "../videos/travelyoutube.mp4", category: "travel", username:"@wanderlustYT", caption:"Explore the most stunning destinations ✈️" },
  { src: "../videos/scienceyoutube.mp4", category: "science", username:"@sciencemindYT", caption:"Cool science experiments you can do at home 🔬" },
  { src: "../videos/basketballyoutube.mp4", category: "basketball", username:"@hoopdreamsYT", caption:"Epic basketball dunks and plays 🏀" },
  { src: "../videos/boxingyoutube.mp4", category: "boxing", username:"@fightnightYT", caption:"Best knockout moments 🥊" },
  { src: "../videos/drivingyoutube.mp4", category: "driving", username:"@carlifestyleYT", caption:"Supercars and driving adventures 🚗💨" },
  { src: "../videos/animalyoutube.mp4", category: "animal", username:"@wildlife_dailyYT", caption:"Adorable animal videos to brighten your day 🐾" },
  { src: "../videos/technologyyoutube.mp4", category: "technology", username:"@techworldYT", caption:"Latest gadgets and tech innovations 🤖" },
  { src: "../videos/artyoutube.mp4", category: "art", username:"@artisticvibesYT", caption:"Creative art and painting inspiration 🎨" },
  { src: "../videos/singingyoutube.mp4", category: "singing", username:"@vocalpowerYT", caption:"Amazing singing performances to enjoy 🎤" },
  { src: "../videos/gamingyoutube.mp4", category: "gaming", username:"@gamersuniteYT", caption:"Top gaming clips and epic plays 🎮" },
  { src: "../videos/partyyoutube.mp4", category: "party", username:"@partycentralYT", caption:"Fun party moments you don’t want to miss 🎉" }
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
  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSeXih5hHSS4Cf_E6V6vay1qNqrVzx99mf9cReWEcM8aHJFOCg/formResponse";
  const formData = new FormData();

  formData.append("entry.630955797", videoObj.src);
  formData.append("entry.1566792278", videoObj.category);
  formData.append("entry.1319278615", videoObj.username);
  formData.append("entry.1044953448", metrics.liked ? "TRUE" : "FALSE");
  formData.append("entry.992246749", metrics.favorited ? "TRUE" : "FALSE");
  formData.append("entry.1953705351", metrics.watchedPercent);

  navigator.sendBeacon(formURL, formData);
}

// ---------- VIDEO SELECTION ----------
function randomUnplayedVideo(){ 
  const unplayed = videos.filter(v => !playedVideos.has(v.src)); 
  if(unplayed.length === 0){ playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)]; } 
  return unplayed[Math.floor(Math.random()*unplayed.length)]; 
}

function scoreFromMetrics(metrics){ 
  return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100); 
}

function chooseNextVideo(currentCategory){
  if(!recommendationMap[currentCategory]) return randomUnplayedVideo();
  const levels=["high","moderate","low"],candidateCats=[];
  levels.forEach(l=>{
    const arr=recommendationMap[currentCategory][l]; 
    if(Array.isArray(arr)) arr.forEach(c=>{ if(!candidateCats.includes(c)) candidateCats.push(c); });
  });
  let bestCategory=null,bestScore=-Infinity;
  candidateCats.forEach(cat=>{
    const score=sessionCategoryScores[cat]||0; 
    if(score>bestScore){ bestScore=score; bestCategory=cat; }
  });
  if(!bestCategory||bestScore<=0){ 
    const setCand=new Set(candidateCats); 
    const unplayed=videos.filter(v=>!playedVideos.has(v.src)&&setCand.has(v.category)); 
    return unplayed.length ? unplayed[Math.floor(Math.random()*unplayed.length)] : randomUnplayedVideo(); 
  }
  const unplayed=videos.filter(v=>!playedVideos.has(v.src)&&v.category===bestCategory); 
  return unplayed.length ? unplayed[Math.floor(Math.random()*unplayed.length)] : randomUnplayedVideo();
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
        logEngagementToSheets(videoObj, metrics);
      }
    }
    updateExp();
  });

  vid.addEventListener("ended", () => {
    sessionCategoryScores[videoObj.category] += scoreFromMetrics(metrics);
    playedVideos.add(videoObj.src);
    logEngagementToSheets(videoObj, metrics);
  });

  const actions=document.createElement("div"); actions.className="actions";
  const likeBtn=document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick=()=>{metrics.liked=!metrics.liked; likeBtn.classList.toggle("liked",metrics.liked); updateExp(); };
  const favBtn=document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="➤";
  favBtn.onclick=()=>{metrics.favorited=!metrics.favorited; favBtn.classList.toggle("favorited",metrics.favorited); updateExp(); };
  const favText=document.createElement("div"); favText.className="favorite-label"; favText.textContent="Repost";
  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);

  const captionBox = document.createElement("div"); 
  captionBox.className = "caption-box";
  captionBox.innerHTML = `<div class="username">${videoObj.username}</div>${videoObj.caption}`;

  card.appendChild(vid); 
  card.appendChild(actions); 
  card.appendChild(expBox); 
  card.appendChild(captionBox);

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
