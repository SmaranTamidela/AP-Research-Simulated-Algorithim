// js/tiktokFull.js
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

const playedVideos = new Set();
const videoMetrics = new Map();
videos.forEach(v=>videoMetrics.set(v.src,{watchedPercent:0,liked:false,favorited:false}));

function randomUnplayedVideo(){ 
  const unplayed = videos.filter(v=>!playedVideos.has(v.src)); 
  if(unplayed.length===0){playedVideos.clear();return videos[Math.floor(Math.random()*videos.length)];} 
  return unplayed[Math.floor(Math.random()*unplayed.length)]; 
}

function createVideoCardFull(videoObj){
  const card=document.createElement("div");card.className="video-card";
  const vid=document.createElement("video");vid.src=videoObj.src;vid.controls=false;vid.autoplay=true;vid.loop=false;vid.muted=true;
  const metrics=videoMetrics.get(videoObj.src);

  vid.addEventListener("timeupdate",()=>{if(vid.duration>0){metrics.watchedPercent=Math.min(100,(vid.currentTime/vid.duration)*100);}});

  vid.addEventListener("ended",()=>{
    playedVideos.add(videoObj.src);

    // --- SEND DATA TO GOOGLE SHEET ---
    fetch("https://script.google.com/macros/s/AKfycbwIpBTgAQUNgDjoxX9Wrn34kAmsicU1wENjhEfijsj4rf72mDNvP-SkxZ6DV8f5Q_s/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        src: videoObj.src,
        category: videoObj.category,
        username: videoObj.username,
        liked: metrics.liked,
        favorited: metrics.favorited,
        watchedPercent: metrics.watchedPercent
      })
    });
  });

  const actions=document.createElement("div");actions.className="actions";
  const likeBtn=document.createElement("div");likeBtn.className="action-btn";likeBtn.innerHTML="❤";
  likeBtn.onclick=()=>{metrics.liked=!metrics.liked;likeBtn.classList.toggle("liked",metrics.liked);};
  const favBtn=document.createElement("div");favBtn.className="action-btn";favBtn.innerHTML="★";
  favBtn.onclick=()=>{metrics.favorited=!metrics.favorited;favBtn.classList.toggle("favorited",metrics.favorited);};
  const favText=document.createElement("div");favText.className="favorite-label";favText.textContent="Favorite";
  actions.appendChild(likeBtn);actions.appendChild(favBtn);actions.appendChild(favText);

  const captionBox=document.createElement("div");captionBox.className="caption-box";
  captionBox.innerHTML=`<div class="username">${videoObj.username}</div>${videoObj.caption}`;

  card.appendChild(vid);card.appendChild(actions);card.appendChild(captionBox);
  return card;
}

function initFullFeed(){
  const feed=document.getElementById("feedContainer");
  const start=randomUnplayedVideo();playedVideos.add(start.src);feed.appendChild(createVideoCardFull(start));
  let current=start;
  window.addEventListener("scroll",()=>{
    if(window.innerHeight+window.scrollY>=document.body.offsetHeight-180){
      const next=randomUnplayedVideo();
      playedVideos.add(next.src);
      feed.appendChild(createVideoCardFull(next));
      current=next;
    }
  });
}

initFullFeed();
