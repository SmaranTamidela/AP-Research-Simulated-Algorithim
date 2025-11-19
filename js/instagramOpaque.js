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
  { src:"../videos/knittinginstagram.mp4", category:"knitting", username:"@craftyIG", caption:"DIY knitting tutorials!" },
  { src:"../videos/soccerinstagram.mp4", category:"soccer", username:"@soccerlifeIG", caption:"Top goals of the week" },
  { src:"../videos/earthinstagram.mp4", category:"earth", username:"@planetloveIG", caption:"Earth in all its beauty" },
  { src:"../videos/foodinstagram.mp4", category:"food", username:"@foodieIG", caption:"Must-try recipes" },
  { src:"../videos/travelinstagram.mp4", category:"travel", username:"@travelerIG", caption:"Hidden travel gems" },
  { src:"../videos/scienceinstagram.mp4", category:"science", username:"@sciencenerdIG", caption:"Cool science experiments" },
  { src:"../videos/basketballinstagram.mp4", category:"basketball", username:"@ballerIG", caption:"Top dunk highlights" },
  { src:"../videos/boxinginstagram.mp4", category:"boxing", username:"@fightclubIG", caption:"Knockout moments" },
  { src:"../videos/drivinginstagram.mp4", category:"driving", username:"@carguyIG", caption:"Epic rides on the road" },
  { src:"../videos/animalinstagram.mp4", category:"animal", username:"@natureIG", caption:"Cute wildlife clips" },
  { src:"../videos/technologyinstagram.mp4", category:"technology", username:"@techguruIG", caption:"Latest tech gadgets" },
  { src:"../videos/artinstagram.mp4", category:"art", username:"@artistlifeIG", caption:"Amazing timelapses" },
  { src:"../videos/singinginstagram.mp4", category:"singing", username:"@singerIG", caption:"Beautiful performances" },
  { src:"../videos/gaminginstagram.mp4", category:"gaming", username:"@gamerIG", caption:"Top gaming moments" },
  { src:"../videos/partyinstagram.mp4", category:"party", username:"@partytimeIG", caption:"Best party clips" }
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
  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSe70_oKqzX8t2MZhNItXxsNTz7NxsaKqnDqu9HCnwbMwjYMUQ/formResponse";
  const formData = new FormData();

  formData.append("entry.45553537", videoObj.src);
  formData.append("entry.1051810371", videoObj.category);
  formData.append("entry.715142819", videoObj.username);
  formData.append("entry.1665859724", metrics.liked ? "TRUE" : "FALSE");
  formData.append("entry.1542961356", metrics.favorited ? "TRUE" : "FALSE");
  formData.append("entry.1960096440", metrics.watchedPercent);

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

      // Check for 25% increments
      const percentChunk = Math.floor(metrics.watchedPercent / 25) * 25;
      if (!loggedPercents.has(percentChunk) && percentChunk > 0) {
        loggedPercents.add(percentChunk);
        logEngagementToSheets(videoObj, { ...metrics }); // log current metrics
      }
    }
  });

  vid.addEventListener("ended", () => {
    sessionCategoryScores[videoObj.category] += scoreFromMetrics(metrics);
    playedVideos.add(videoObj.src);
    // Log final metrics at 100%
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
  favBtn.innerHTML = "➤";
  favBtn.onclick = () => {
    metrics.favorited = !metrics.favorited;
    favBtn.classList.toggle("favorited", metrics.favorited);
  };

  const favText = document.createElement("div");
  favText.className = "favorite-label";
  favText.textContent = "Repost";

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
 

