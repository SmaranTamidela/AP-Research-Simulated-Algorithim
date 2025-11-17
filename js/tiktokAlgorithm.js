// Video list
const tiktokVideos = [
  "animaltiktok.mp4","arttiktok.mp4","basketballtiktok.mp4",
  "boxingtiktok.mp4","drivingtiktok.mp4","earthtiktok.mp4",
  "foodtiktok.mp4","gamingtiktok.mp4","knittingtiktok.mp4",
  "partytiktok.mp4","sciencetiktok.mp4","singingtiktok.mp4",
  "soccertiktok.mp4","technologytiktok.mp4","traveltiktok.mp4"
];

// Recommendation map
const recommendationMap = {
  "earth": { high: ["science", "technology"], moderate: ["travel", "animal"], low: ["art", "knitting"] },
  "food": { high: ["travel", "party"], moderate: ["science", "technology"], low: ["knitting", "art"] },
  "soccer": { high: ["basketball", "boxing"], moderate: ["boxing", "driving"], low: ["travel", "earth"] },
  "travel": { high: ["food", "singing"], moderate: ["earth", "animal"], low: ["science", "technology"] },
  "knitting": { high: ["art", "technology"], moderate: ["food", "travel"], low: ["singing", "knitting"] },
  "science": { high: ["technology", "earth"], moderate: ["animal", "food"], low: ["soccer", "basketball"] },
  "basketball": { high: ["soccer", "boxing"], moderate: ["boxing", "driving"], low: ["knitting", "art"] },
  "boxing": { high: ["soccer", "basketball"], moderate: ["driving", "soccer"], low: ["travel", "earth"] },
  "driving": { high: ["boxing", "soccer"], moderate: ["travel", "food"], low: ["technology", "science"] },
  "animal": { high: ["earth", "science"], moderate: ["travel", "food"], low: ["knitting", "art"] },
  "technology": { high: ["science", "earth"], moderate: ["art", "knitting"], low: ["driving", "boxing"] },
  "art": { high: ["knitting", "technology"], moderate: ["food", "travel"], low: ["singing", "art"] },
  "singing": { high: ["travel", "food"], moderate: ["art", "knitting"], low: ["science", "technology"] },
  "gaming": { high: ["party", "soccer"], moderate: ["technology", "science"], low: ["driving", "boxing"] },
  "party": { high: ["gaming", "singing"], moderate: ["food", "travel"], low: ["knitting", "art"] }
};

// Engagement tracking
let engagementMetrics = {};
let currentVideo;

const videoEl = document.getElementById("mainVideo");
const likeBtn = document.getElementById("likeBtn");
const bookmarkBtn = document.getElementById("bookmarkBtn");
const overlay = document.getElementById("overlay"); // Opaque feed can ignore this if not needed

// Load video
function loadVideo(videoName){
  currentVideo = videoName;
  videoEl.src = "../videos/" + videoName;
  if(!engagementMetrics[videoName]) engagementMetrics[videoName] = { liked:false, favorited:false, watchedPercent:0 };
  likeBtn.classList.toggle("active", engagementMetrics[videoName].liked);
  bookmarkBtn.classList.toggle("active", engagementMetrics[videoName].favorited);
  updateOverlay(videoName);
  videoEl.scrollIntoView({behavior: "smooth"});
}

// Like button
likeBtn.addEventListener("click", ()=>{
  engagementMetrics[currentVideo].liked = !engagementMetrics[currentVideo].liked;
  likeBtn.classList.toggle("active");
  updateOverlay(currentVideo);
});

// Bookmark button
bookmarkBtn.addEventListener("click", ()=>{
  engagementMetrics[currentVideo].favorited = !engagementMetrics[currentVideo].favorited;
  bookmarkBtn.classList.toggle("active");
  updateOverlay(currentVideo);
});

// Track watched percent
videoEl.addEventListener("timeupdate", ()=>{
  engagementMetrics[currentVideo].watchedPercent = (videoEl.currentTime / videoEl.duration) * 100;
  updateOverlay(currentVideo);
});

// Scroll detection for next video
window.addEventListener("scroll", ()=>{
  const rect = videoEl.getBoundingClientRect();
  if(rect.bottom < window.innerHeight/2){
    const engagement = getEngagementLevel(engagementMetrics[currentVideo]);
    const nextVideo = getNextVideo(currentVideo, engagement);
    loadVideo(nextVideo);
    videoEl.play();
  }
});

// Determine engagement level
function getEngagementLevel(metrics){
  if(metrics.favorited || metrics.watchedPercent>75) return "high";
  if(metrics.liked || metrics.watchedPercent>25) return "moderate";
  return "low";
}

// Pick next video
function getNextVideo(currentVideo, engagementLevel){
  const baseName = currentVideo.replace("tiktok.mp4","");
  const nextCategories = recommendationMap[baseName][engagementLevel];
  for(let cat of nextCategories){
    const nextVid = tiktokVideos.find(v=>v.includes(cat));
    if(nextVid) return nextVid;
  }
  // fallback random
  return tiktokVideos[Math.floor(Math.random()*tiktokVideos.length)];
}

// Overlay for partial/full feeds
function updateOverlay(videoName){
  if(!overlay) return; // skip for opaque feed
  const metrics = engagementMetrics[videoName];
  const engagementLevel = getEngagementLevel(metrics);
  const reasons = [];
  if(metrics.favorited) reasons.push("Bookmarked");
  if(metrics.liked) reasons.push("Liked");
  if(metrics.watchedPercent>0) reasons.push(`Watched ${metrics.watchedPercent.toFixed(0)}%`);
  overlay.textContent = `Recommendation Details:
Video: ${videoName}
Previous Activity: ${reasons.length?reasons.join(", "):"None"}
Engagement Level: ${engagementLevel}`;
}

// Load initial video randomly
loadVideo(tiktokVideos[Math.floor(Math.random()*tiktokVideos.length)]);
