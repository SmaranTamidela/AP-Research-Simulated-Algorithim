// Recommendation map
const recommendationMap = {
  "Earth":["Food","Science","Travel"],
  "Food":["Art","Travel","Earth"],
  "Soccer":["Basketball","Boxing","Driving"],
  "Travel":["Earth","Food","Art"],
  "Knitting":["Art","DIY","Crafts"],
  "Science":["Technology","Earth","Food"],
  "Basketball":["Soccer","Boxing"],
  "Boxing":["Soccer","Driving"],
  "Driving":["Technology","Travel"],
  "Animal":["Earth","Travel"],
  "Technology":["Science","Driving"],
  "Art":["Food","Knitting"],
  "Singing":["Art","Party"],
  "Gaming":["Technology"],
  "Party":["Singing"]
};

// Video library
const videos = [
  {src:"../videos/earthtiktok.mp4", category:"Earth"},
  {src:"../videos/foodtiktok.mp4", category:"Food"},
  {src:"../videos/sciencetiktok.mp4", category:"Science"},
  {src:"../videos/arttiktok.mp4", category:"Art"}
];

// Pick random starting video
function pickRandomVideo(){return videos[Math.floor(Math.random()*videos.length)];}

// Create video card
function createVideoCard(videoObj){
  const card=document.createElement("div"); card.className="video-card";

  const vid=document.createElement("video");
  vid.src=videoObj.src; vid.controls=false; vid.autoplay=true; vid.loop=false;

  let counted25=false;
  vid.addEventListener("timeupdate",()=>{
    if(!counted25 && vid.duration>0 && vid.currentTime/vid.duration>=0.25){
      console.log("Moderate engagement:",videoObj.category); counted25=true;
    }
  });

  const actions=document.createElement("div"); actions.className="actions";

  const likeBtn=document.createElement("div"); likeBtn.className="action-btn"; likeBtn.innerHTML="❤";
  likeBtn.onclick=()=>{likeBtn.classList.toggle("liked");};

  const favBtn=document.createElement("div"); favBtn.className="action-btn"; favBtn.innerHTML="★";
  favBtn.onclick=()=>{favBtn.classList.toggle("favorited");};

  const favText=document.createElement("div"); favText.className="favorite-label"; favText.textContent="Favorite";

  actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(favText);
  card.appendChild(vid); card.appendChild(actions);

  return card;
}

// Load next video
function loadNext(category){
  const options=recommendationMap[category]||[];
  const nextCat=options[Math.floor(Math.random()*options.length)];
  return videos.find(v=>v.category===nextCat)||videos[0];
}

// Initialize feed
function initFeed(){
  const feed=document.getElementById("feedContainer");
  let current=pickRandomVideo();
  feed.appendChild(createVideoCard(current));

  window.addEventListener("scroll",()=>{
    if(window.innerHeight+window.scrollY>=document.body.offsetHeight-200){
      const nextVideo=loadNext(current.category);
      feed.appendChild(createVideoCard(nextVideo));
      current=nextVideo;
    }
  });
}

initFeed();
