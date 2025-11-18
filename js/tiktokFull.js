// js/tiktokFull.js
const recommendationMap = {
  "earth": { high:["science","technology"], moderate:["travel","animal"], low:["art","knitting"] },
  "food":  { high:["travel","party"], moderate:["science","technology"], low:["knitting","art"] },
  "soccer":{ high:["basketball","boxing"], moderate:["boxing","driving"], low:["travel","earth"] },
  "travel":{ high:["food","singing"], moderate:["earth","animal"], low:["science","technology"] },
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
  { src:"../videos/animaltiktok.mp4", category:"animal", username:"@naturefan", caption:"Cute wildlife compilation!" },
  { src:"../videos/arttiktok.mp4", category:"art", username:"@artistlife", caption:"Amazing painting timelapse" },
  { src:"../videos/basketballtiktok.mp4", category:"basketball", username:"@baller23", caption:"Epic dunk highlights!" },
  { src:"../videos/boxingtiktok.mp4", category:"boxing", username:"@fightclub", caption:"Top knockout moments" },
  { src:"../videos/drivingtiktok.mp4", category:"driving", username:"@carguy", caption:"Supercars on the highway" },
  { src:"../videos/earthtiktok.mp4", category:"earth", username:"@planetlover", caption:"Beautiful earth landscapes" },
  { src:"../videos/foodtiktok.mp4", category:"food", username:"@foodie", caption:"Delicious recipes you must try" },
  { src:"../videos/gamingtiktok.mp4", category:"gaming", username:"@gamerlife", caption:"Top gaming moments" },
  { src:"../videos/knittingtiktok.mp4", category:"knitting", username:"@crafty", caption:"DIY knitting projects" },
  { src:"../videos/partytiktok.mp4", category:"party", username:"@partytime", caption:"Best party clips!" },
  { src:"../videos/sciencetiktok.mp4", category:"science", username:"@sciencenerd", caption:"Amazing science experiments" },
  { src:"../videos/singingtiktok.mp4", category:"singing", username:"@singerlife", caption:"Beautiful singing performances" },
  { src:"../videos/soccertiktok.mp4", category:"soccer", username:"@soccerpro", caption:"Top soccer goals" },
  { src:"../videos/technologytiktok.mp4", category:"technology", username:"@techguru", caption:"Cool gadgets and inventions" },
  { src:"../videos/traveltiktok.mp4", category:"travel", username:"@traveler", caption:"Best travel destinations" }
];

const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();
videos.forEach(v => { 
  sessionCategoryScores[v.category]=0; 
  videoMetrics.set(v.src,{watchedPercent:0,liked:false,favorited:false}); 
});

// ---------- LOGGING ----------
function logEngagementToSheets(videoObj, metrics) {
  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSdJnRAKgYwzLP--lXJLzrT--Iq8WTKC8byyZcGJEF75gx3Y_w/formResponse";
  const formData = new FormData();
  formData.append("entry.91855232", videoObj.src);
  formData.append("entry.1156097743", videoObj.category);
  formData.append("entry.2074017099", videoObj.username);
  formData.append("entry.826921378", metrics.liked);
  formData.append("entry.226106810", metrics.favorited);
  formData.append("entry.112706924", metrics.watchedPercent);
  formData.append("entry.1935073296", "fully transparent");
  navigator.sendBeacon(formURL, formData);
}

// ---------- VIDEO SELECTION ----------
function randomUnplayedVideo(){ 
  const unplayed = videos.filter(v=>!playedVideos.has(v.src)); 
  if(unplayed.length===0){playedVideos.clear();return videos[Math.floor(Math.random()*videos.length)];} 
  return unplayed[Math.floor(Math.random()*unplayed.length)]; 
}

function scoreFromMetrics(metrics){ return (metrics.favorited?2:0)+(metrics.liked?1:0)+(metrics.watchedPercent/100); }

function chooseNextVideo(currentCategory){
  if(!recommendationMap[currentCategory]) return randomUnplayedVideo();
  const levels=["high","moderate","low"],candidateCats=[];
  levels.forEach(l=>{recommendationMap[currentCategory][l].forEach(c=>{if(!candidateCats.includes(c))candidateCats.push(c);});});
  let bestCategory=null,bestScore=-Infinity;
  candidateCats.forEach(cat=>{const score=sessionCategoryScores[cat]||0;if(score>bestScore){bestScore=score;bestCategory=cat;}});
  if(!bestCategory||bestScore<=0){
    const unplayed=videos.filter(v=>!playedVideos.has(v.src)&&candidateCats.includes(v.category));
    return unplayed.length?unplayed[Math.floor(Math.random()*unplayed.length)]:randomUnplayedVideo();
  }
  const unplayed=videos.filter(v=>!playedVideos.has(v.src)&&v.category===bestCategory);
  return unplayed.length?unplayed[Math.floor(Math.random()*unplayed.length)]:randomUnplayedVideo();
}

// ---------- VIDEO CARD ----------
function createVideoCardFull(videoObj){
  const card=document.createElement("div");card.className="video-card";
  const vid=document.createElement("video");vid.src=videoObj.src;vid.controls=false;vid.autoplay=true;vid.loop=false;vid.muted=true;

  const metrics=videoMetrics.get(videoObj.src);
  let lastLoggedPercent=0;
  vid.addEventListener("timeupdate", ()=>{
    if(vid.duration>0){
      metrics.watchedPercent=Math.min(100,(vid.currentTime/vid.duration)*100);
      const rounded=Math.floor(metrics.watchedPercent/25)*25;
      if(rounded>lastLoggedPercent){
        lastLoggedPercent=rounded;
        logEngagementToSheets(videoObj, metrics);
      }
    }
  });

  vid.addEventListener("ended", ()=>{
    sessionCategoryScores[videoObj.category]+=scoreFromMetrics(metrics);
    playedVideos.add(videoObj.src);
    logEngagementToSheets(videoObj, metrics);
  });

  const actions=document.createElement("div");actions.className="actions";
  const likeBtn=document.createElement("div");likeBtn.className="action-btn";likeBtn.innerHTML="❤";
  likeBtn.onclick=()=>{metrics.liked=!metrics.liked;likeBtn.classList.toggle("liked",metrics.liked); logEngagementToSheets(videoObj, metrics);};
  const favBtn=document.createElement("div");favBtn.className="action-btn";favBtn.innerHTML="★";
  favBtn.onclick=()=>{metrics.favorited=!metrics.favorited;favBtn.classList.toggle("favorited",metrics.favorited); logEngagementToSheets(videoObj, metrics);};
  actions.appendChild(likeBtn);actions.appendChild(favBtn);

  const captionBox=document.createElement("div");captionBox.className="caption-box";
  captionBox.innerHTML=`<div class="username">${videoObj.username}</div>${videoObj.caption}`;

  const expBox=document.createElement("div");expBox.className="explanation-box";
function updateExp() {
  // Sort categories by score descending
  const topCats = Object.entries(sessionCategoryScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2); // top 2 categories

  // Build messages for top categories
  const messages = topCats.map(c => {
    const catName = c[0];
    const score = c[1];
    if (score === 0) return null; // ignore categories with 0
    return `You have engaged with videos related to ${catName}`;
  }).filter(Boolean); // remove nulls

  // Display messages, or fallback if none yet
  expBox.textContent = messages.length ? messages.join("\n") : "You have not engaged with any categories yet.";
}


  card.appendChild(vid);card.appendChild(actions);card.appendChild(expBox);card.appendChild(captionBox);
  vid.addEventListener("timeupdate", updateExp);
  updateExp();
  return card;
}

// ---------- INITIALIZE FEED ----------
function initFullFeed(){
  const feed=document.getElementById("feedContainer");
  const start=randomUnplayedVideo();playedVideos.add(start.src);feed.appendChild(createVideoCardFull(start));
  let current=start;
  window.addEventListener("scroll", ()=>{
    if(window.innerHeight+window.scrollY>=document.body.offsetHeight-180){
      const next=chooseNextVideo(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCardFull(next));
      current=next;
    }
  });
}

initFullFeed();
 
