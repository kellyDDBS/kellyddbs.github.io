// ===== CONFIG =====
const mailerLiteAPIKey = "YOUR_API_KEY_HERE"; // Replace with your MailerLite API key
const segmentId = "YOUR_SEGMENT_ID_HERE"; // Replace with your MailerLite segment ID

// ===== STATE =====
let coffeeClicks = 0;
let videos = [
  {
    title: "Getting Started with MailerLite: Setup & DNS Configuration",
    tags: "MailerLite,DNS,Email Setup",
    embed: `<iframe src="https://gamma.app/embed/ca6xz0wmw6bubrl" allow="fullscreen"></iframe>`,
    download: "https://drive.google.com/file/d/1HOaDYl6pJcb4iFToTT-PbrYCF089gkmn/view?usp=sharing"
  },
  {
    title: "Coming Soon",
    tags: "Placeholder,Fun",
    embed: `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>`,
    download: ""
  }
];
let allTags = new Set();

// ===== ELEMENTS =====
const coffeeCup = document.getElementById("coffee-cup");
const adminPanel = document.getElementById("admin-panel");
const videoContainer = document.getElementById("video-container");
const searchInput = document.getElementById("search");
const tagsContainer = document.getElementById("tags");
const videoModal = document.getElementById("video-modal");
const modalVideo = document.getElementById("modal-video");
const modalClose = document.getElementById("modal-close");
const downloadModal = document.getElementById("download-modal");
const downloadClose = document.getElementById("download-close");
const dlName = document.getElementById("dl-name");
const dlEmail = document.getElementById("dl-email");
const dlSubmit = document.getElementById("dl-submit");
const dlMessage = document.getElementById("dl-message");

// ===== INIT =====
renderVideos(videos);
renderTags();

// ===== COFFEE CUP UNLOCK =====
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

// ===== RENDER VIDEOS =====
function renderVideos(list) {
  videoContainer.innerHTML = "";
  list.forEach((v, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="embed" onclick="openModal('${encodeURIComponent(v.embed)}')">${v.embed}</div>
      <div class="content">
        <h3>${v.title}</h3>
        <div class="buttons">
          ${v.download 
            ? `<button onclick="openDownloadModal('${v.download}')">⬇ Download This</button>`
            : `<button onclick="saveForLater(${idx})">⭐ Save for Later</button>`
          }
          ${(v.embed.includes("youtube.com") || v.embed.includes("youtu.be"))
            ? `<a href="https://www.youtube.com/@ownyouradmin?sub_confirmation=1" target="_blank" class="button">📺 Subscribe</a>`
            : ""
          }
        </div>
      </div>
    `;
    videoContainer.appendChild(card);

    // Collect tags
    v.tags.split(",").forEach(tag => allTags.add(tag.trim()));
  });
}

// ===== RENDER TAGS =====
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

// ===== FILTER BY TAG =====
function filterByTag(tag) {
  if (tag === "All") {
    renderVideos(videos);
  } else {
    const filtered = videos.filter(v => v.tags.toLowerCase().includes(tag.toLowerCase()));
    renderVideos(filtered);
  }
}

// ===== SEARCH =====
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = videos.filter(v => 
    v.title.toLowerCase().includes(term) ||
    v.tags.toLowerCase().includes(term)
  );
  renderVideos(filtered);
});

// ===== MODAL =====
function openModal(embed) {
  const decoded = decodeURIComponent(embed);
  modalVideo.innerHTML = decoded;
  videoModal.style.display = "flex";
}
modalClose.addEventListener("click", () => {
  videoModal.style.display = "none";
  modalVideo.innerHTML = "";
});

// ===== DOWNLOAD MODAL =====
function openDownloadModal(downloadUrl) {
  downloadModal.dataset.downloadUrl = downloadUrl;
  downloadModal.style.display = "flex";
}
downloadClose.addEventListener("click", () => {
  downloadModal.style.display = "none";
});

// ===== SAVE FOR LATER =====
function saveForLater(index) {
  alert("Saved for later!");
}

// ===== ADD VIDEO =====
document.getElementById("add-video").addEventListener("click", () => {
  const title = document.getElementById("video-title").value.trim();
  const tags = document.getElementById("video-tags").value.trim();
  const embed = document.getElementById("video-embed").value.trim();
  const download = document.getElementById("video-download").value.trim();
  
  if (!title || !embed) {
    alert("Title and Embed code are required");
    return;
  }

  videos.push({ title, tags, embed, download });
  localStorage.setItem("videos", JSON.stringify(videos));
  renderVideos(videos);
  renderTags();
});

// ===== HANDLE DOWNLOAD FORM =====
dlSubmit.addEventListener("click", async () => {
  dlName.classList.remove("error");
  dlEmail.classList.remove("error");
  dlMessage.textContent = "";

  if (!dlName.value.trim()) {
    dlName.classList.add("error");
    return;
  }
  if (!dlEmail.value.trim()) {
    dlEmail.classList.add("error");
    return;
  }

  dlMessage.textContent = "Adding you to the list...";
  
  try {
    const res = await fetch(`https://connect.mailerlite.com/api/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mailerLiteAPIKey}`
      },
      body: JSON.stringify({
        email: dlEmail.value.trim(),
        fields: { name: dlName.value.trim() },
        status: "active",
        groups: [segmentId]
      })
    });

    if (res.ok) {
      dlMessage.textContent = "You're in! Click below to download.";
      dlMessage.innerHTML += `<br><a href="${downloadModal.dataset.downloadUrl}" target="_blank" class="button">Download Now</a>`;
    } else {
      dlMessage.textContent = "Something went wrong. Please try again.";
    }
  } catch (err) {
    dlMessage.textContent = "Error connecting to MailerLite.";
  }
});
