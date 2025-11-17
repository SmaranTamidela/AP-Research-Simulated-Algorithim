function createVideoCardFull(videoObj) {
  const card = document.createElement("div"); 
  card.className="video-card";

  // Recommendation message at top
  const recMsg = document.createElement("div");
  recMsg.className = "recommendation-box";
  card.appendChild(recMsg);

  // Video element
  const vid = document.createElement("video");
  vid.src = videoObj.src; 
  vid.autoplay = true; 
  vid.loop = false; 
  vid.muted = true; 
  vid.controls = false;
  card.appendChild(vid);

  // Username and caption
  const userCaption = document.createElement("div");
  userCaption.className = "username-caption";
  userCaption.innerHTML = `<strong>@${videoObj.username}</strong><br>${videoObj.caption}`;
  card.appendChild(userCaption);

  // Actions
  const actions = document.createElement("div"); actions.className="actions";
  const likeBtn = document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick = ()=>{ metrics.liked = !metrics.liked; likeBtn.classList.toggle("liked", metrics.liked); updateRecMsg(); };
  const favBtn = document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick = ()=>{ metrics.favorited = !metrics.favorited; favBtn.classList.toggle("favorited", metrics.favorited); updateRecMsg(); };
  const favText = document.createElement("div"); favText.className="favorite-label"; favText.textContent="Favorite";
  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);
  card.appendChild(actions);

  // Metrics tracking
  const metrics = videoMetrics.get(videoObj.src);
  vid.addEventListener("timeupdate", () => { 
    if(vid.duration>0) metrics.watchedPercent=Math.min(100,(vid.currentTime/vid.duration)*100); 
  });
  vid.addEventListener("ended", ()=>{ 
    const add = (metrics.favorited?2:0) + (metrics.liked?1:0) + (metrics.watchedPercent/100);
    sessionCategoryScores[videoObj.category] = (sessionCategoryScores[videoObj.category]||0) + add; 
    playedVideos.add(videoObj.src); 
  });

  // Update recommendation message
  function updateRecMsg() {
    const scores = Object.entries(sessionCategoryScores)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,2); // top 2 categories
    const topCats = scores.map(([cat,score]) => `${cat} (${(score*10).toFixed(0)}%)`);
    const reasons = [];
    if(metrics.liked) reasons.push("liked");
    if(metrics.favorited) reasons.push("favorited");
    const reasonText = reasons.length ? `because you have ${reasons.join(" or ")} videos related to ` : "because you have engaged with videos related to ";
    recMsg.textContent = `This video was recommended to you ${reasonText}${topCats.join(" or ")}.`;
  }

  // Live update
  vid.addEventListener("timeupdate", updateRecMsg);
  updateRecMsg();

  return card;
}
