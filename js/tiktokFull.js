const tiktokVideos = [
  "animaltiktok.mp4","arttiktok.mp4","basketballtiktok.mp4",
  "boxingtiktok.mp4","drivingtiktok.mp4","earthtiktok.mp4",
  "foodtiktok.mp4","gamingtiktok.mp4","knittingtiktok.mp4",
  "partytiktok.mp4","sciencetiktok.mp4","singingtiktok.mp4",
  "soccertiktok.mp4","technologytiktok.mp4","traveltiktok.mp4"
];

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

// Initialize videos
videoContainers.forEach((container) => {
  const videoEl = container.querySelector("video");
  const likeBtn = container.querySelector(".like");
  const favBtn = container.querySelector(".favorite");
  const overlay = container.querySelector(".recommendation-overlay");

  let currentVideo = tiktokVideos[Math.floor(Math.random() * tiktokVideos.length)];
  videoEl.src = "../videos/" + currentVideo;
  engagementMetrics[currentVideo] = { liked: false, favorited: false, watchedPercent: 0 };

  // Like button
  likeBtn.addEventListener("click", () => {
    engagementMetrics[currentVideo].liked = !engagementMetrics[currentVideo].liked;
    likeBtn.classList.toggle("active");
    updateOverlay(currentVideo, overlay);
  });

  // Favorite/bookmark button
  favBtn.addEventListener("click", () => {
    engagementMetrics[currentVideo].favorited = !engagementMetrics[currentVideo].favorited;
    favBtn.classList.toggle("active");
    updateOverlay(currentVideo, overlay);
  });

  // Track watched percent
  videoEl.addEventListener("timeupdate", () => {
    engagementMetrics[currentVideo].watchedPercent = (videoEl.currentTime / videoEl.duration) * 100;
    updateOverlay(currentVideo, overlay);
  });

  updateOverlay(currentVideo, overlay);
});

// Engagement level
function getEngagementLevel(metrics) {
  if (metrics.favorited || metrics.watchedPercent > 75) return "high";
  if (metrics.liked || metrics.watchedPercent > 25) return "moderate";
  return "low";
}

// Get next video based on engagement
function getNextVideo(currentVideo, engagementLevel) {
  const baseName = currentVideo.replace("tiktok.mp4", "");
  const nextCategories = recommendationMap[baseName][engagementLevel];

  for (let cat of nextCategories) {
    const nextVid = tiktokVideos.find(v => v.includes(cat));
    if (nextVid) return nextVid;
  }

  return tiktokVideos[Math.floor(Math.random() * tiktokVideos.length)];
}

// Full transparency overlay
function updateOverlay(videoName, overlay) {
  const metrics = engagementMetrics[videoName];
  const engagementLevel = getEngagementLevel(metrics);
  const reasons = [];

  if (metrics.favorited) reasons.push("Favorited");
  if (metrics.liked) reasons.push("Liked");
  if (metrics.watchedPercent > 0) reasons.push(`Watched ${metrics.watchedPercent.toFixed(0)}%`);

  const baseCategory = videoName.replace("tiktok.mp4", "");
  overlay.textContent = `Recommendation Details:
Previous Activity: ${reasons.length ? reasons.join(", ") : "None"}
Engagement Level: ${engagementLevel}
Based on Category: ${baseCategory}`;
}

// Scroll-triggered recommendation
let lastContainer = null;
window.addEventListener("scroll", () => {
  videoContainers.forEach((container) => {
    const rect = container.getBoundingClientRect();
    const videoEl = container.querySelector("video");
    const overlay = container.querySelector(".recommendation-overlay");

    if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
      if (lastContainer !== container) {
        lastContainer = container;

        const currentVideo = videoEl.src.split("/").pop();
        const engagement = getEngagementLevel(engagementMetrics[currentVideo]);
        const nextVideo = getNextVideo(currentVideo, engagement);
        videoEl.src = "../videos/" + nextVideo;

        if (!engagementMetrics[nextVideo]) engagementMetrics[nextVideo] = { liked: false, favorited: false, watchedPercent: 0 };
        updateOverlay(nextVideo, overlay);
      }
    }
  });
});
