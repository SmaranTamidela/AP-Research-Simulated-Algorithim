// ------------------ Recommendation Map ------------------
const recommendationMap = {
  "Earth": ["Science", "Technology", "Travel"],
  "Food": ["Travel", "Party", "Science"],
  "Soccer": ["Basketball", "Boxing", "Driving"],
  "Travel": ["Food", "Singing", "Earth"],
  "Knitting": ["Art", "Technology", "Food"],
  "Science": ["Technology", "Earth", "Food"],
  "Basketball": ["Soccer", "Boxing", "Driving"],
  "Boxing": ["Soccer", "Basketball", "Travel"],
  "Driving": ["Boxing", "Soccer", "Technology"],
  "Animal": ["Earth", "Science", "Travel"],
  "Technology": ["Science", "Earth", "Art"],
  "Art": ["Knitting", "Technology", "Singing"],
  "Singing": ["Travel", "Food", "Art"],
  "Gaming": ["Party", "Soccer", "Technology"],
  "Party": ["Gaming", "Singing", "Food"]
};

// ------------------ Video Library ------------------
const videos = [
  {src: "../videos/animaltiktok.mp4", category: "Animal"},
  {src: "../videos/arttiktok.mp4", category: "Art"},
  {src: "../videos/basketballtiktok.mp4", category: "Basketball"},
  {src: "../videos/boxingtiktok.mp4", category: "Boxing"},
  {src: "../videos/drivingtiktok.mp4", category: "Driving"},
  {src: "../videos/earthtiktok.mp4", category: "Earth"},
  {src: "../videos/foodtiktok.mp4", category: "Food"},
  {src: "../videos/gamingtiktok.mp4", category: "Gaming"},
  {src: "../videos/knittingtiktok.mp4", category: "Knitting"},
  {src: "../videos/partytiktok.mp4", category: "Party"},
  {src: "../videos/sciencetiktok.mp4", category: "Science"},
  {src: "../videos/singingtiktok.mp4", category: "Singing"},
  {src: "../videos/soccertiktok.mp4", category: "Soccer"},
  {src: "../videos/technologytiktok.mp4", category: "Technology"},
  {src: "../videos/traveltiktok.mp4", category: "Travel"}
];

// ------------------ Pick Random Video ------------------
function pickRandomVideo() {
  return videos[Math.floor(Math.random() * videos.length)];
}

// ------------------ Create Video Card ------------------
function createVideoCard(videoObj) {
  const card = document.createElement("div");
  card.className = "video-card";

  const vid = document.createElement("video");
  vid.src = videoObj.src;
  vid.controls = false;
  vid.autoplay = true;
  vid.loop = false;

  let counted25 = false;
  vid.addEventListener("timeupdate", () => {
    if (!counted25 && vid.duration > 0 && vid.currentTime / vid.duration >= 0.25) {
      console.log("Moderate engagement:", videoObj.category);
      counted25 = true;
    }
  });

  const actions = document.createElement("div");
  actions.className = "actions";

  const likeBtn = document.createElement("div");
  likeBtn.className = "action-btn";
  likeBtn.innerHTML = "❤";
  likeBtn.onclick = () => {
    likeBtn.classList.toggle("liked");
  };

  const favBtn = document.createElement("div");
  favBtn.className = "action-btn";
  favBtn.innerHTML = "★";
  favBtn.onclick = () => {
    favBtn.classList.toggle("favorited");
  };

  const favText = document.createElement("div");
  favText.className = "favorite-label";
  favText.textContent = "Favorite";

  actions.appendChild(likeBtn);
  actions.appendChild(favBtn);
  actions.appendChild(favText);

  card.appendChild(vid);
  card.appendChild(actions);

  return card;
}

// ------------------ Load Next Video ------------------
function loadNext(category) {
  const options = recommendationMap[category] || [];
  const nextCat = options[Math.floor(Math.random() * options.length)];
  return videos.find(v => v.category === nextCat) || videos[0];
}

// ------------------ Initialize Feed ------------------
function initFeed() {
  const feed = document.getElementById("feedContainer");
  let current = pickRandomVideo();
  feed.appendChild(createVideoCard(current));

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      const nextVideo = loadNext(current.category);
      feed.appendChild(createVideoCard(nextVideo));
      current = nextVideo;
    }
  });
}

initFeed();
