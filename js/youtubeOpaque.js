const recommendationMap = {
  "earth": { high:["science","technology"], moderate:["travel","animal"], low:["art","knitting"] },
  "food": { high:["travel","party"], moderate:["science","technology"], low:["knitting","art"] },
  "soccer":{ high:["basketball","boxing"], moderate:["boxing","driving"], low:["travel","earth"] },
  "travel":{ high:["food","singing"], moderate:["earth","animal"], low:["science","technology"] },
  "knitting":{ high:["art","technology"], moderate:["food","travel"], low:["singing","knitting"] },
  "science":{ high:["technology","earth"], moderate:["animal","food"], low:["soccer","basketball"] },
  "basketball":{ high:["soccer","boxing"], moderate:["boxing","driving"], low:["knitting","art"] },
  "boxing":{ high:["soccer","basketball"], moderate:["driving","soccer"], low:["travel","earth"] },
  "driving":{ high:["boxing","soccer"], moderate:["travel","food"], low:["technology","science"] },
  "animal":{ high:["earth","science"], moderate:["travel","food"], low:["knitting","art"] },
  "technology":{ high:["science","earth"], moderate:["art","knitting"], low:["driving","boxing"] },
  "art":{ high:["knitting","technology"], moderate:["food","travel"], low:["singing","art"] },
  "singing":{ high:["travel","food"], moderate:["art","knitting"], low:["science","technology"] },
  "gaming":{ high:["party","soccer"], moderate:["technology","science"], low:["driving","boxing"] },
  "party":{ high:["gaming","singing"], moderate:["food","travel"], low:["knitting","art"] }
};

const videos = [
  { src:"../videos/knittingyoutube.mp4", category:"knitting", username:"@craftyYT", caption:"DIY knitting tutorials!" },
  { src:"../videos/socceryoutube.mp4", category:"soccer", username:"@soccerlifeYT", caption:"Top goals of the week" },
  { src:"../videos/earthyoutube.mp4", category:"earth", username:"@planetloveYT", caption:"Earth in all its beauty" },
  { src:"../videos/foodyoutube.mp4", category:"food", username:"@foodieYT", caption:"Must-try recipes" },
  { src:"../videos/travelyoutube.mp4", category:"travel", username:"@travelerYT", caption:"Hidden travel gems" },
  { src:"../videos/scienceyoutube.mp4", category:"science", username:"@sciencenerdYT", caption:"Cool science experiments" },
  { src:"../videos/basketballyoutube.mp4", category:"basketball", username:"@ballerYT", caption:"Top dunk highlights" },
  { src:"../videos/boxingyoutube.mp4", category:"boxing", username:"@fightclubYT", caption:"Knockout moments" },
  { src:"../videos/drivingyoutube.mp4", category:"driving", username:"@carguyYT", caption:"Epic rides on the road" },
  { src:"../videos/animalyoutube.mp4", category:"animal", username:"@natureYT", caption:"Cute wildlife clips" },
  { src:"../videos/technologyyoutube.mp4", category:"technology", username:"@techguruYT", caption:"Latest tech gadgets" },
  { src:"../videos/artyoutube.mp4", category:"art", username:"@artistlifeYT", caption:"Amazing timelapses" },
  { src:"../videos/singingyoutube.mp4", category:"singing", username:"@singerYT", caption:"Beautiful performances" },
  { src:"../videos/gamingyoutube.mp4", category:"gaming", username:"@gamerYT", caption:"Top gaming moments" },
  { src:"../videos/partyyoutube.mp4", category:"party", username:"@partytimeYT", caption:"Best party clips" }
];

const sessionCategoryScores = {};
const playedVideos = new Set();
const videoMetrics = new Map();

videos.forEach(v => {
  sessionCategoryScores[v.category] = 0;
  videoMetrics.set(v.src, { watchedPercent: 0, liked: false, favorited: false });
});

// ---------- LOGGING VIA GOOGLE FORM ----------
function logEngagementToSheets(videoObj, metrics) {
  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSeWNTceBisRBOxbQUN89q6fSct3Zhizj_LggbXUs1MOBd4gHw/formResponse";
  const formData = new FormData();

  formData.append("entry.1657387190", videoObj.src);
  formData.append("entry.1801237557", videoObj.category);
  formData.append("entry.772121250", videoObj.username);
  formData.append("entry.221932323", metrics.liked ? "TRUE" : "FALSE");
  formData.append("entry.641526103", metrics.favorited ? "TRUE" : "FALSE");
  formData.append("entry.1044441533", metrics.watchedPercent);

  navigator.sendBeacon(formURL, formData);
}

function randomUnplayedVideo() {
  const unplayed = videos.filter(v => !playedVideos.has(v.src));
  if (unplayed.length === 0) {
    playedVideos.clear();
    return videos[Math.floor(Math.random() * videos.length)];
  }
  return unplayed[Math.floor(Math.random() * unplayed.length)];
}

function scoreFromMetrics(metrics) {
  return (metrics.favorited ? 2 : 0) + (metrics.liked ? 1 : 0) + (metrics.watchedPercent / 100);
}

function chooseNextVideo(currentCategory) {
  if (!recommendationMap[currentCategory]) return randomUnplayedVideo();
  const levels = ["high","moderate","low"];
  const candidateCats = [];

  levels.forEach(level => {
    recommendationMap[currentCategory][level].forEach(cat => {
      if (!candidateCats.includes(cat)) candidateCats.push(cat);
    });
  });

  let bestCategory = null;
  let bestScore = -Infinity;

  candidateCats.forEach(cat => {
    const score = sessionCategoryScores[cat] || 0;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  });

  if (!bestCategory || bestScore <= 0) {
    const catSet = new Set(candidateCats);
    const unplayed = videos.filter(v => !playedVideos.has(v.src) && catSet.has(v.category));
    return unplayed.length ? unplayed[Math.floor(Math.random() * unplayed.length)] : randomUnplayedVideo();
  }

  const unplayed = videos.filter(v => !playedVideos.has(v.src) && v.category === bestCategory);
  return unplayed.length ? unplayed[Math.floor(Math.random() * unplayed.length)] : randomUnplayedVideo();
}

function createVideoCard(videoObj) {
  const card = document.createElement("div");
  card.className = "video-card";

  const vid = document.createElement("video");
  vid.src = videoObj.src;
  vid.autoplay = true;
  vid.controls = false;
  vid.loop = false;
  vid.muted = true;

  const metrics = videoMetrics.get(videoObj.src);
  const loggedPercents = new Set();

  vid.addEventListener("timeupdate", () => {
    if (vid.duration > 0) {
      metrics.watchedPercent = Math.min(100, (vid.currentTime / vid.duration) * 100);

      const percentChunk = Math.floor(metrics.watchedPercent / 25) * 25;
      if (!loggedPercents.has(percentChunk) && percentChunk > 0) {
        loggedPercents.add(percentChunk);
        logEngagementToSheets(videoObj, { ...metrics });
      }
    }
  });

  vid.addEventListener("ended", () => {
    sessionCategoryScores[videoObj.category] += scoreFromMetrics(metrics);
    playedVideos.add(videoObj.src);
    if (!loggedPercents.has(100)) logEngagementToSheets(videoObj, { ...metrics });
  });

  const actions = document.createElement("div");
  actions.className = "actions";

  const likeBtn = document.createElement("div");
  likeBtn.className = "action-btn";
  likeBtn.innerHTML = "❤";
  likeBtn.onclick = () => {
    metrics.liked = !metrics.liked;
    likeBtn.classList.toggle("liked", metrics.liked);
  };

  const favBtn = document.createElement("div");
  favBtn.className = "action-btn";
  favBtn.innerHTML = "★";
  favBtn.onclick = () => {
    metrics.favorited = !metrics.favorited;
    favBtn.classList.toggle("favorited", metrics.favorited);
  };

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
  card.appendChild(captionBox);

  return card;
}

function initOpaqueFeed() {
  const feed = document.getElementById("feedContainer");
  const start = randomUnplayedVideo();
  playedVideos.add(start.src);
  feed.appendChild(createVideoCard(start));

  let current = start;

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 180) {
      const next = chooseNextVideo(current.category);
      playedVideos.add(next.src);
      feed.appendChild(createVideoCard(next));
      current = next;
    }
  });
}

initOpaqueFeed();
