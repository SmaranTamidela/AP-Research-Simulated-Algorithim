document.addEventListener("DOMContentLoaded", () => {

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

  const sessionCategoryScores = {};
  const playedVideos = new Set();
  const videoMetrics = new Map();
  videos.forEach(v => { 
    sessionCategoryScores[v.category] = 0; 
    videoMetrics.set(v.src, { watchedPercent: 0, liked: false, favorited: false, lastLogged: 0 }); 
  });

  function randomUnplayedVideo(){ 
    const unplayed = videos.filter(v => !playedVideos.has(v.src)); 
    if(unplayed.length === 0){ 
      playedVideos.clear(); 
      return videos[Math.floor(Math.random() * videos.length)]; 
    } 
    return unplayed[Math.floor(Math.random() * unplayed.length)]; 
  }

  function scoreFromMetrics(metrics){ 
    return (metrics.favorited?2:0) + (metrics.liked?1:0) + (metrics.watchedPercent/100); 
  }

  function chooseNextVideo(currentCategory){
    if(!recommendationMap[currentCategory]) return randomUnplayedVideo();
    const levels = ["high","moderate","low"], candidateCats=[];
    levels.forEach(l => {
      const arr = recommendationMap[currentCategory][l];
      if(Array.isArray(arr)) arr.forEach(c => { if(!candidateCats.includes(c)) candidateCats.push(c); });
    });
    let bestCategory = null, bestScore = -Infinity;
    candidateCats.forEach(cat => {
      const key = cat.toLowerCase(), score = sessionCategoryScores[key] || 0;
      if(score > bestScore){ bestScore = score; bestCategory = key; }
    });
    if(!bestCategory || bestScore <= 0){
      const setCand = new Set(candidateCats.map(c=>c.toLowerCase()));
      const unplayed = videos.filter(v => !playedVideos.has(v.src) && setCand.has(v.category));
      return unplayed.length ? unplayed[Math.floor(Math.random()*unplayed.length)] : randomUnplayedVideo();
    }
    const unplayed = videos.filter(v => !playedVideos.has(v.src) && v.category === bestCategory);
    return unplayed.length ? unplayed[Math.floor(Math.random()*unplayed.length)] : randomUnplayedVideo();
  }

  function createVideoCardPartial(videoObj){
    const card = document.createElement("div"); card.className="video-card";
    const vid = document.createElement("video"); 
    vid.src = videoObj.src; vid.controls = false; vid.autoplay = true; vid.loop = false; vid.muted = true;

    const metrics = videoMetrics.get(videoObj.src);

    const expBox = document.createElement("div"); expBox.className = "explanation-box";

    function updateExp(){
      if(Math.random() < 0.5){
        expBox.textContent = "You may like this video based on your recent activity.";
      }
    }

    vid.addEventListener("timeupdate", () => {
      if(vid.duration > 0){
        const percent = Math.floor((vid.currentTime / vid.duration) * 100);
        metrics.watchedPercent = percent;

        // Log at increments of 25%
        if(percent - metrics.lastLogged >= 25){
          metrics.lastLogged = percent;
          // TODO: call your logging function here, e.g. logToForm(videoObj, metrics, "Partial");
        }
      }
      updateExp();
    });

    vid.addEventListener("ended", () => {
      sessionCategoryScores[videoObj.category] += scoreFromMetrics(metrics);
      playedVideos.add(videoObj.src);
      // Final log at 100%
      // logToForm(videoObj, metrics, "Partial");
    });

    const actions = document.createElement("div"); actions.className="actions";
    const likeBtn = document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
    likeBtn.onclick = () => { metrics.liked = !metrics.liked; likeBtn.classList.toggle("liked", metrics.liked); updateExp(); };
    const favBtn = document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
    favBtn.onclick = () => { metrics.favorited = !metrics.favorited; favBtn.classList.toggle("favorited", metrics.favorited); updateExp(); };
    const favText = document.createElement("div"); favText.className="favorite-label"; favText.textContent = "Favorite";
    actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);

    const captionBox = document.createElement("div"); captionBox.className="caption-box";
    captionBox.innerHTML = `<div class="username">${videoObj.username}</div>${videoObj.caption}`;

    card.appendChild(vid); card.appendChild(actions); card.appendChild(expBox); card.appendChild(captionBox);

    return card;
  }

  function initPartialFeed(){
    const feed = document.getElementById("feedContainer");
    if(!feed) { console.error("No feedContainer element found!"); return; }
    const start = randomUnplayedVideo(); playedVideos.add(start.src);
    feed.appendChild(createVideoCardPartial(start));
    let current = start;
    window.addEventListener("scroll", () => {
      if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 180){
        const next = chooseNextVideo(current.category);
        playedVideos.add(next.src);
        feed.appendChild(createVideoCardPartial(next));
        current = next;
      }
    });
  }

  initPartialFeed();

});
