// ---------- Recommendation map ----------
const recommendationMap = {
  "earth": { high: ["science","technology"], moderate: ["travel","animal"], low: ["art","knitting"] },
  "food":  { high: ["travel","party"], moderate: ["science","technology"], low: ["knitting","art"] },
  "soccer":{ high: ["basketball","boxing"],moderate: ["boxing","driving"], low: ["travel","earth"] },
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

// ---------- Full video list ----------
const videos = [
  { src: "../videos/animaltiktok.mp4", category: "animal" },
  { src: "../videos/arttiktok.mp4", category: "art" },
  { src: "../videos/basketballtiktok.mp4", category: "basketball" },
  { src: "../videos/boxingtiktok.mp4", category: "boxing" },
  { src: "../videos/drivingtiktok.mp4", category: "driving" },
  { src: "../videos/earthtiktok.mp4", category: "earth" },
  { src: "../videos/foodtiktok.mp4", category: "food" },
  { src: "../videos/gamingtiktok.mp4", category: "gaming" },
  { src: "../videos/knittingtiktok.mp4", category: "knitting" },
  { src: "../videos/partytiktok.mp4", category: "party" },
  { src: "../videos/sciencetiktok.mp4", category: "science" },
  { src: "../videos/singingtiktok.mp4", category: "singing" },
  { src: "../videos/soccertiktok.mp4", category: "soccer" },
  { src: "../videos/technologytiktok.mp4", category: "technology" },
  { src: "../videos/traveltiktok.mp4", category: "travel" }
];

// ---------- Generate feed ----------
function generateFeed(mode = "opaque", startIndex = 0, count = 10) {
  const feedContainer = document.getElementById('feed');
  feedContainer.innerHTML = ""; // Clear existing feed
  let currentIndex = startIndex;

  for (let i = 0; i < count; i++) {
    const videoData = videos[currentIndex];

    // Create video card
    const card = document.createElement('div');
    card.className = 'video-card';

    // Video element
    const videoEl = document.createElement('video');
    videoEl.src = videoData.src;
    videoEl.className = 'video';
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.autoplay = true;
    card.appendChild(videoEl);

    // Video title
    const titleEl = document.createElement('div');
    titleEl.className = 'video-title';
    titleEl.innerText = i === 0 ? 'this video' : 'previous video';
    card.appendChild(titleEl);

    // Right sidebar buttons
    const actions = document.createElement('div');
    actions.className = 'video-actions';
    const like = document.createElement('div');
    like.innerText = '❤️';
    const comment = document.createElement('div');
    comment.innerText = '💬';
    const share = document.createElement('div');
    share.innerText = '🔗';
    actions.appendChild(like);
    actions.appendChild(comment);
    actions.appendChild(share);

    card.appendChild(actions);

    feedContainer.appendChild(card);

    // Choose next video based on mode
    const category = videoData.category;
    let options = [];

    if (mode === "opaque") options = recommendationMap[category].high;
    else if (mode === "partial") options = [...recommendationMap[category].high, ...recommendationMap[category].moderate];
    else if (mode === "full") options = [...recommendationMap[category].high, ...recommendationMap[category].moderate, ...recommendationMap[category].low];

    const nextCategory = options[Math.floor(Math.random() * options.length)];
    const nextIndex = videos.findIndex(v => v.category === nextCategory);
    currentIndex = nextIndex !== -1 ? nextIndex : Math.floor(Math.random() * videos.length);
  }

  // Autoplay/pause with IntersectionObserver
  const videoCards = document.querySelectorAll('.video-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (entry.isIntersecting) video.play();
      else video.pause();
    });
  }, { threshold: 0.75 });

  videoCards.forEach(card => observer.observe(card));
}
