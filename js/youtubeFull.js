// js/youtubeFull.js
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
  { src: "../videos/knittingyoutube.mp4", category: "knitting", username:"@craftyYT", caption:"DIY knitting tutorials!" },
  { src: "../videos/socceryoutube.mp4", category: "soccer", username:"@soccerlifeYT", caption:"Top goals of the week" },
  { src: "../videos/earthyoutube.mp4", category: "earth", username:"@planetloveYT", caption:"Earth in all its beauty" },
  { src: "../videos/foodyoutube.mp4", category: "food", username:"@foodieYT", caption:"Must-try recipes" },
  { src: "../videos/travelyoutube.mp4", category: "travel", username:"@travelerYT", caption:"Hidden travel gems" },
  { src: "../videos/scienceyoutube.mp4", category: "science", username:"@sciencenerdYT", caption:"Cool science experiments" },
  { src: "../videos/basketballyoutube.mp4", category: "basketball", username:"@ballerYT", caption:"Top dunk highlights" },
  { src: "../videos/boxingyoutube.mp4", category: "boxing", username:"@fightclubYT", caption:"Knockout moments" },
  { src: "../videos/drivingyoutube.mp4", category: "driving", username:"@carguyYT", caption:"Epic rides on the road" },
  { src: "../videos/animalyoutube.mp4", category: "animal", username:"@natureYT", caption:"Cute wildlife clips" },
  { src: "../videos/technologyyoutube.mp4", category: "technology", username:"@techguruYT", caption:"Latest tech gadgets" },
  { src: "../videos/artyoutube.mp4", category: "art", username:"@artistlifeYT", caption:"Amazing timelapses" },
  { src: "../videos/singingyoutube.mp4", category: "singing", username:"@singerYT", caption:"Beautiful performances" },
  { src: "../videos/gamingyoutube.mp4", category: "gaming", username:"@gamerYT", caption:"Top gaming moments" },
  { src: "../videos/partyyoutube.mp4", category: "party", username:"@partytimeYT", caption:"Best party clips" }
];

const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();

videos.forEach(v=>{
  sessionCategoryScores[v.category]=0;
  videoMetrics.set(v.src,{watchedPercent:0,liked:false,favorited:false,lastLogged:0});
});

// ---------- LOGGING TO GOOGLE FORMS ----------
function logEngagementToSheets(videoObj, metrics) {
  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSdkUUT3CdjMqUaXOxwR8hH7cQxElFWofbSBp0eMwvmSnxIP5A/formResponse";
  const formData = new FormData();

  formData.append("entry.1185112904", videoObj.src);
  formData.append("entry.1609086113", videoObj.category);
  formData.append("entry.963841116", videoObj.username);
  formData.append("entry.1254643475", metrics.liked ? "TRUE" : "FALSE");
  formData.append("entry.1133210952", metrics.favorited ? "TRUE" : "FALSE");
  formData.append("entry.279283926", metrics.watchedPercent);

  navigator.sendBeacon(formURL, formData);
}

// ---------- VIDEO SELECTION ----------
function randomUnplayedVideo(){ 
  const unplayed = videos.filter(v=>!playedVideos.has(v.src)); 
  if(unplayed.length===0){playedVideos.clear(); return videos[Math.floor(Math.random()*videos.length)];} 
  return unplayed[Math.floor(Math.random()*unplayed.length)]; 
}
function scoreFromMetrics(metrics){ return (metrics.favorited?2:0)+(metrics.liked?1:0)+(metrics.watchedPercent/100); }
function chooseNextVideo(currentCategory){
  if(!recommendationMap[currentCategory]) return randomUnplayedVideo();
  const levels=["high","moderate","low"],candidateCats=[];
  levels.forEach(l=>{const arr=recommendationMap[currentCategory][l];if(Array.isArray(arr)) arr.forEach(c=>{if(!candidateCats.includes(c))candidateCats.push(c);});});
  let bestCategory=null,bestScore=-Infinity;
  candidateCats.forEach(cat=>{const key=cat.toLowerCase(),score=sessionCategoryScores[key]||0;if(score>bestScore){bestScore=score;bestCategory=key;}});
  if(!bestCategory||bestScore<=0){const setCand=new Set(candidateCats.map(c=>c.toLowerCase()));const unplayed=videos.filter(v=>!playedVideos.has(v.src)&&setCand.has(v.category));return unplayed.length?unplayed[Math.floor(Math.random()*unplayed.length)]:randomUnplayedVideo();}
  const unplayed=videos.filter(v=>!playedVideos.has(v.src)&&v.category===bestCategory);return unplayed.length?unplayed[Math.floor(Math.random()*unplayed.length)]:randomUnplayedVideo();
}

// ---------- VIDEO CARD CREATION ----------
function createVideoCardFull(videoObj){
  const card=document.createElement("div"); card.className="video-card";
  const vid=document.createElement("video"); vid.src=videoObj.src; vid.controls=false; vid.autoplay=true; vid.loop=false; vid.muted=true;

  const metrics=videoMetrics.get(videoObj.src);
  const expBox=document.createElement("div"); expBox.className="explanation-box";

  function updateExp() {
    const Z = videoObj.category;

    const sortedCats = Object.entries(sessionCategoryScores)
      .filter(([cat]) => cat !== Z)
      .sort((a, b) => b[1] - a[1]);

    const connectedCats = sortedCats
      .map(([cat]) => cat)
      .filter(cat => {
        const map = recommendationMap[cat];
        return map && (map.high.includes(Z) || map.moderate.includes(Z) || map.low.includes(Z));
      })
      .slice(0, 2);

    if (connectedCats.length > 0) {
      expBox.textContent = `This video was recommended to you because you showed high engagement in ${connectedCats.join(" and ")} videos which connects to ${Z} videos.`;
    } else {
      expBox.textContent = "";
    }
  }

  vid.addEventListener("timeupdate", ()=>{
    if(vid.duration>0){
      const percent = Math.floor((vid.currentTime/vid.duration)*100);
      metrics.watchedPercent = percent;

      if(percent - metrics.lastLogged >= 25){
        metrics.lastLogged = percent;
        logEngagementToSheets(videoObj, metrics);
      }
    }
    updateExp();
  });

  vid.addEventListener("ended", ()=>{
    sessionCategoryScores[videoObj.category] += scoreFromMetrics(metrics);
    playedVideos.add(videoObj.src);
    logEngagementToSheets(videoObj, metrics);
  });

  const actions=document.createElement("div"); actions.className="actions";
  const likeBtn=document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick=()=>{metrics.liked=!metrics.liked; likeBtn.classList.toggle("liked",metrics.liked); updateExp(); };
  const favBtn=document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick=()=>{metrics.favorited=!metrics.favorited; favBtn.classList.toggle("favorited",metrics.favorited); updateExp(); };
  const favText=document.createElement("div"); favText.className="favorite-label"; favText.textContent="Favorite";
  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);

  const captionBox=document.createElement("div"); captionBox.className="caption-box";
  captionBox.innerHTML=`<div class="username">${videoObj.username}</div>${videoObj.caption}`;

  card.appendChild(vid); card.appendChild(actions); card.appendChild(expBox); card.appendChild(captionBox);
  updateExp();
  return card;
}

// ---------- INITIALIZE FEED ----------
function initFullFeed(){
  const feed=document.getElementById("feedContainer");
  const start=randomUnplayedVideo(); playedVideos.add(start.src);
  feed.appendChild(createVideoCardFull(start));
  let current=start;

  window.addEventListener("scroll", ()=>{
    if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 180){
      const next=chooseNextVideo(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCardFull(next));
      current=next;
    }
  });
}

initFullFeed();
