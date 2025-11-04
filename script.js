const posts = [
  { content: "Check out this cute puppy video!", category: "animals" },
  { content: "New study shows climate change effects", category: "science" },
  { content: "Top 10 anime to watch this year", category: "entertainment" },
  { content: "How to bake sourdough bread", category: "food" },
];

const feed = document.getElementById('feed');
const select = document.getElementById('transparency-select');

function displayFeed(level) {
  feed.innerHTML = '';
  let displayedPosts = [...posts];

  if (level === 'partial') {
    // Show posts with simple explanation
    displayedPosts = displayedPosts.map(p => ({...p, explanation: `Recommended because you liked ${p.category} content.`}));
  } else if (level === 'full') {
    // Show posts with detailed explanation
    displayedPosts = displayedPosts.map(p => ({...p, explanation: `This post is recommended based on your recent interactions with ${p.category} content, time spent on similar posts, and trending popularity.`}));
  }

  displayedPosts.forEach(p => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<p>${p.content}</p>` + (p.explanation ? `<small>${p.explanation}</small>` : '');
    feed.appendChild(div);
  });
}

// Initial load
displayFeed(select.value);

// Change transparency dynamically
select.addEventListener('change', () => displayFeed(select.value));
