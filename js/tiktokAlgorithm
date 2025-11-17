// Video list
const tiktokVideos = [
  "animaltiktok.mp4",
  "arttiktok.mp4",
  "basketballtiktok.mp4",
  "boxingtiktok.mp4",
  "drivingtiktok.mp4",
  "earthtiktok.mp4",
  "foodtiktok.mp4",
  "gamingtiktok.mp4",
  "knittingtiktok.mp4",
  "partytiktok.mp4",
  "sciencetiktok.mp4",
  "singingtiktok.mp4",
  "soccertiktok.mp4",
  "technologytiktok.mp4",
  "traveltiktok.mp4"
];

// Recommendation mapping
const recommendationMap = {
  earth: { high: ["science", "technology"], moderate: ["travel", "animal"], low: ["art", "knitting"] },
  food: { high: ["travel", "party"], moderate: ["science", "technology"], low: ["knitting", "art"] },
  soccer: { high: ["basketball", "boxing"], moderate: ["boxing", "driving"], low: ["travel", "earth"] },
  travel: { high: ["food", "singing"], moderate: ["earth", "animal"], low: ["science", "technology"] },
  knitting: { high: ["art", "technology"], moderate: ["food", "travel"], low: ["singing", "knitting"] },
  science: { high: ["technology", "earth"], moderate: ["animal", "food"], low: ["soccer", "basketball"] },
  basketball: { high: ["soccer", "boxing"], moderate: ["boxing", "driving"], low: ["knitting", "art"] },
  boxing: { high: ["soccer", "basketball"], moderate: ["driving", "soccer"], low: ["travel", "earth"] },
  driving: { high: ["boxing", "soccer"], moderate: ["travel", "food"], low: ["technology", "science"] },
  animal: { high: ["earth", "science"], moderate: ["travel", "food"], low: ["knitting", "art"] },
  technology: { high: ["science", "earth"], moderate: ["art", "knitting"], low: ["driving", "boxing"] },
  art: { high: ["knitting", "technology"], moderate: ["food", "travel"], low: ["singing", "art"] },
  singing: { high: ["travel", "food"], moderate: ["art", "knitting"], low: ["science", "technology"] },
  gaming: { high: ["party", "soccer"], moderate: ["technology", "science"], low: ["driving", "boxing"] },
  party: { high: ["gaming", "singing"], moderate: ["food", "travel"], low: ["knitting", "art"] }
};

// Track engagement metrics
let engagementMetrics = {}; // { videoName: {liked: bool, favorited: bool, watchedPercent: number} }

// Select all video containers
const videoContainers = document.querySelectorAll(".video-container");

videoContainers.forEach((container, index) => {
  const videoEl = container.querySelector("video");
  const likeBtn = container.querySelector(".like");
  const favBtn = container.querySelector(".favorite");

  // Assign a random starting video
  let currentVideo = tiktokVideos[Math.floor(Math.random() * tiktokVideos.length)];
  videoEl.src = "../videos/" + currentVideo;

  // Initialize metrics
  engagementMetrics[currentVideo] = { liked: false, favorited: false, watchedPercent: 0 };

  // Button event listeners
  likeBtn.addEventListener("click", () => {
    engagementMetrics[currentVideo].liked = !engagementMetrics[currentVideo].liked;
    likeBtn.classList.toggle("active");
  });

  favBtn.addEventListener("click", () => {
    engagementMetrics[currentVideo].favorited = !engagementMetrics[currentVideo].favorited;
    favBtn.classList.toggle("active");
  });

  // Update watched percent while playing
  videoEl.addEventListener("timeupdate", () => {
    engagementMetrics[currentVideo].watchedPercent = (videoEl.currentTime / videoEl.duration) * 100;
  });

  // Load next video on end
  videoEl.addEventListener("ended", () => {
    const engagement = getEngagementLevel(engagementMetrics[currentVideo]);
    const nextVideo = getNextVideo(currentVideo, engagement);
    currentVideo = nextVideo;
    videoEl.src = "../videos/" + nextVideo;

    // Initialize metrics if not present
    if (!engagementMetrics[nextVideo]) engagementMetrics[nextVideo] = { liked: false, favorited: false, watchedPercent: 0 };

    videoEl.play();
  });
});

// Determine engagement level
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
  
  // fallback
  return tiktokVideos[Math.floor(Math.random() * tiktokVideos.length)];
}
