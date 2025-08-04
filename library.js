let videos = JSON.parse(localStorage.getItem("videos") || "[]");
let allTags = new Set();
let coffeeClicks = 0;

const coffeeCup = document.getElementById("coffee-cup");
const adminPanel = document.getElementById("admin-panel");
const videoContainer = document.getElementById("video-container");
const searchInput = document.getElementById("search");
const tagsContainer = document.getElementById("tags");
const videoModal = document.getElementById("video-modal");
const modalVideo = document.getElementById("modal-video");

// Coffee cup unlock
coffeeCup.addEventListener("click", () => {
  coffeeClicks++;
  if (coffeeClicks >= 5) {
    const pw = prompt("Enter admin password:");
    if (pw === "ownyouradmin") {
      adminPanel.style.display = "block";
    } else {
      alert("Incorrect password");
    }
    coffeeClicks = 0;
  }
});

// Render videos
function renderVideos(list) {
  videoContainer.innerHTML = "";
  allTags.clear();

  list.forEach((v, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.background = "#f5ebe0";
    card.style.borderRadius = "10px";
    card.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
    card.style.padding = "15px";
    card.style.cursor = "pointer";
    card.style.textAlign = "center";
    card.style.transition = "all 0.3s ease";

    const title = document.createElement("h3");
    title.innerText = v.title;
    title.style.color = "#333";
    title.style.margin = "0";
    title.style.transition = "color 0.3s ease";

    card.appendChild(title);

    // Hover effect
    card.addEventListener("mouseenter", () => {
      card.style.background = "#a3b18a";
      title.style.color = "#fff";
    });
    card.addEventListener("mouseleave", () => {
      card.style.background = "#f5ebe0";
      title.style.color = "#333";
    });

    // Click action
    card.addEventListener("click", () => {
      if (v.embed) {
        openModal(v.embed);
      } else if (v.download) {
        openDownloadModal(v.download);
      }
    });

    videoContainer.appendChild(card);

    if (v.tags) {
      v.tags.split(",").forEach(tag => allTags.add(tag.trim()));
    }
  });
  renderTags();
}

// Render tags
function renderTags() {
  tagsContainer.innerHTML = "";
  ["All", ...Array.from(allTags)].forEach(tag => {
    const tagEl = document.createElement("span");
    tagEl.className = "tag";
    tagEl.textContent = tag;
    tagEl.addEventListener("click", () => filterByTag(tag));
    tagsContainer.appendChild(tagEl);
  });
}

function filterByTag(tag) {
  if (tag === "All") {
    renderVideos(videos);
  } else {
    const filtered = videos.filter(v => v.tags && v.tags.toLowerCase().includes(tag.toLowerCase()));
    renderVideos(filtered);
  }
}

// Search
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(term) ||
    (v.tags && v.tags.toLowerCase().includes(term))
  );
  renderVideos(filtered);
});

// Add video or download
document.getElementById("add-video").addEventListener("click", () => {
  const title = document.getElementById("video-title").value.trim();
  const tags = document.getElementById("video-tags").value.trim();
  const embed = document.getElementById("video-embed").value.trim();
  const download = document.getElementById("video-download").value.trim();

  if (!title) {
    alert("Title is required");
    return;
  }

  videos.push({ title, tags, embed, download });
  localStorage.setItem("videos", JSON.stringify(videos));
  renderVideos(videos);
});

// Modal handling
function openModal(embed) {
  modalVideo.innerHTML = embed;
  videoModal.style.display = "flex";
}
document.getElementById("modal-close").addEventListener("click", () => {
  videoModal.style.display = "none";
  modalVideo.innerHTML = "";
});

// Gated download
function openDownloadModal(downloadUrl) {
  const dlModal = document.getElementById("download-modal");
  dlModal.dataset.downloadUrl = downloadUrl;
  dlModal.style.display = "block";
}
document.getElementById("dl-submit").addEventListener("click", async () => {
  const name = document.getElementById("dl-name").value.trim();
  const email = document.getElementById("dl-email").value.trim();
  const message = document.getElementById("dl-message");

  if (!name || !email) {
    alert("Name and email are required");
    return;
  }

  message.textContent = "Adding you to the list...";
  try {
    const res = await fetch("/.netlify/functions/add-subscriber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    const result = await res.json();

    if (res.ok && result.message) {
      message.innerHTML = `
        <div class="download-success">
          ✅ You're in!  
          <a href="${document.getElementById("download-modal").dataset.downloadUrl}" target="_blank">⬇ Download Now</a>
        </div>
      `;
    } else {
      message.textContent = "Something went wrong. Please try again.";
    }
  } catch (err) {
    message.textContent = "Error connecting to server.";
  }
});

// Initial render
renderVideos(videos);
