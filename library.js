let coffeeClicks = 0;
const coffeeCup = document.getElementById('coffee-cup');
const adminPanel = document.getElementById('admin-panel');
const videoContainer = document.getElementById('video-container');
const searchInput = document.getElementById('search');

// Preloaded videos
let videos = [
  {
    title: "Getting Started with MailerLite: Setup & DNS Configuration",
    tags: "MailerLite,DNS,Email Setup",
    embed: `<iframe src="https://gamma.app/embed/ca6xz0wmw6bubrl" allow="fullscreen"></iframe>`,
    download: "https://drive.google.com/file/d/1HOaDYl6pJcb4iFToTT-PbrYCF089gkmn/view?usp=sharing"
  },
  {
    title: "Coming Soon",
    tags: "Placeholder",
    embed: `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>`,
    download: ""
  }
];

coffeeCup.addEventListener('click', () => {
  coffeeClicks++;
  if (coffeeClicks >= 5) {
    const pw = prompt('Enter admin password:');
    if (pw === 'ownyouradmin') {
      adminPanel.style.display = 'block';
    } else {
      alert('Incorrect password');
    }
    coffeeClicks = 0;
  }
});

function renderVideos(list) {
  videoContainer.innerHTML = '';
  list.forEach((v, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="embed" onclick="openModal('${encodeURIComponent(v.embed)}')">${v.embed}</div>
      <div class="content">
        <h3>${v.title}</h3>
        <div class="buttons">
          ${v.download 
            ? `<a href="${v.download}" target="_blank" class="button">⬇ Download This</a>`
            : `<button onclick="saveForLater(${idx})">⭐ Save for Later</button>`
          }
          ${v.embed.includes('youtube.com') || v.embed.includes('youtu.be')
            ? `<a href="https://www.youtube.com/@ownyouradmin?sub_confirmation=1" target="_blank" class="button">📺 Subscribe</a>`
            : ''
          }
        </div>
      </div>
    `;
    videoContainer.appendChild(card);
  });
}

function saveForLater(index) {
  alert('Saved for later!');
}

document.getElementById('add-video').addEventListener('click', () => {
  const title = document.getElementById('video-title').value.trim();
  const tags = document.getElementById('video-tags').value.trim();
  const embed = document.getElementById('video-embed').value.trim();
  const download = document.getElementById('video-download').value.trim();
  
  if (!title || !embed) {
    alert('Title and Embed code are required');
    return;
  }

  videos.push({ title, tags, embed, download });
  localStorage.setItem('videos', JSON.stringify(videos));
  renderVideos(videos);
});

searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  const filtered = videos.filter(v => 
    v.title.toLowerCase().includes(term) ||
    v.tags.toLowerCase().includes(term)
  );
  renderVideos(filtered);
});

// Modal logic
function openModal(embed) {
  const decoded = decodeURIComponent(embed);
  document.getElementById('modal-video').innerHTML = decoded;
  document.getElementById('video-modal').style.display = 'flex';
}
document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('video-modal').style.display = 'none';
  document.getElementById('modal-video').innerHTML = '';
});

// Publish button
document.getElementById('publish').addEventListener('click', async () => {
  try {
    const res = await fetch('https://delicate-sorbet-309267.netlify.app/.netlify/functions/publish', {
      method: 'POST'
    });
    if (res.ok) {
      alert('Publish triggered!');
    } else {
      alert('Publish failed');
    }
  } catch (err) {
    alert('Error triggering publish');
  }
});

// Load stored videos from localStorage
const stored = JSON.parse(localStorage.getItem('videos') || '[]');
if (stored.length) videos = stored;

renderVideos(videos);
