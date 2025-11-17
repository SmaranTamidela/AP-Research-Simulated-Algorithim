const tiktokVideos = [
  "animaltiktok.mp4","arttiktok.mp4","basketballtiktok.mp4",
  "boxingtiktok.mp4","drivingtiktok.mp4","earthtiktok.mp4",
  "foodtiktok.mp4","gamingtiktok.mp4","knittingtiktok.mp4",
  "partytiktok.mp4","sciencetiktok.mp4","singingtiktok.mp4",
  "soccertiktok.mp4","technologytiktok.mp4","traveltiktok.mp4"
];

// Recommendation mapping (same as opaque)
const recommendationMap = { 
  earth: { high:["science","technology"], moderate:["travel","animal"], low:["art","knitting"] },
  food: { high:["travel","party"], moderate:["science","technology"], low:["knitting","art"] },
  soccer: { high:["basketball","boxing"], moderate:["boxing","driving"], low:["travel","earth"] },
  travel: { high:["food","singing"], moderate:["earth","animal"], low:["science","technology"] },
  knitting: { high:["art","technology"], moderate:["food","travel"], low:["singing","knitting"] },
  science: { high:["technology","earth"], moderate:["animal","food"], low:["soccer","basketball"] },
  basketball: { high:["soccer","boxing"], moderate:["boxing","driving"], low:["knitting","art"] },
  boxing: { high:["soccer","basketball"], moderate:["driving","soccer"], low:["travel","earth"] },
  driving: { high:["boxing","soccer"], moderate:["travel","food"], low:["technology","science"] },
  animal: { high:["earth","science"], moderate:["travel","food"], low:["knitting","art"] },
  technology: { high:["science","earth"], moderate:["art","knitting"], low:["driving","boxing"] },
  art: { high:["knitting","technology"], moderate:["food","travel"], low:["singing","art"] },
  singing: { high:["travel","food"], moderate:["art","knitting"], low:["science","technology"] },
  gaming: { high:["party","soccer"], moderate:["technology","science"], low:["driving","boxing"] },
  party: { high:["gaming","singing"], moderate:["food","travel"], low:["knitting","art"] }
};

let engagementMetrics = {}; 

const videoContainers = document.querySelectorAll(".video-container");

videoContainers.forEach((container, idx) => {
  const videoEl = container.querySelector("video");
  const likeBtn = container.querySelector(".like");
  const favBtn = container.querySelector(".favorite");
  const overlay = container.querySelector(".recommendation-overlay");

  let currentVideo = tiktokVideos[Math.floor(Math.random()*tiktokVideos.length)];
  videoEl.src = "../videos/" + currentVideo;
  engagementMetrics[currentVideo] = { liked: false, favorited: false, watchedPercent: 0 };

  // Buttons
  likeBtn.addEventListener("click", ()=>{
    engagementMetrics[currentVideo].liked = !engagementMetrics[currentVideo].liked;
    likeBtn.classList.toggle("active");
    updateOverlay(currentVideo, overlay);
  });
  favBtn.addEventListener("click", ()=>{
    engagementMetrics[currentVideo].favorited = !engagementMetrics[currentVideo].favorited;
    favBtn.classList.toggle("active");
    updateOverlay(currentVideo, overlay);
  });

  // Watched percent
  videoEl.addEventListener("timeupdate", ()=>{
    engagementMetrics[currentVideo].watchedPercent = (videoEl.currentTime / videoEl.duration) * 100;
    updateOverlay(currentVideo, overlay);
  });

  // Next video
  videoEl.addEventListener("ended", ()=>{
    const engagement = getEngagementLevel(engagementMetrics[currentVideo]);
    const nextVideo = getNextVideo(currentVideo, engagement);
    currentVideo = nextVideo;
    if(!engagementMetrics[nextVideo]) engagementMetrics[nextVideo] = { liked:false, favorited:false, watchedPercent:0 };
    videoEl.src = "../videos/" + nextVideo;
    updateOverlay(currentVideo, overlay);
    videoEl.play();
  });

  updateOverlay(currentVideo, overlay);
});

// Engagement level
function getEngagementLevel(metrics){
  if(metrics.favorited || metrics.watchedPercent>75) return "high";
  if(metrics.liked || metrics.watchedPercent>25) return "moderate";
  return "low";
}

// Recommendation next video
function getNextVideo(currentVideo, engagementLevel){
  const baseName = currentVideo.replace("tiktok.mp4","");
  const nextCategories = recommendationMap[baseName][engagementLevel];
  for(let cat of nextCategories){
    const nextVid = tiktokVideos.find(v=>v.includes(cat));
    if(nextVid) return nextVid;
  }
  return tiktokVideos[Math.floor(Math.random()*tiktokVideos.length)];
}

// Partial transparency overlay update
function updateOverlay(videoName, overlay){
  const metrics = engagementMetrics[videoName];
  let reason = "Recommended based on your activity";
  if(metrics.favorited) reason = "Recommended because you favorited a similar video";
  else if(metrics.liked) reason = "Recommended because you liked a similar video";
  else if(metrics.watchedPercent>25) reason = "Recommended because you watched part of a similar video";
  overlay.textContent = reason;
}
