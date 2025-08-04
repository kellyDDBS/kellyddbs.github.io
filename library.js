
let coffeeClicks = 0;

// Hardcoded first video so something always shows
let videos = [
  {
    title: "Getting Started with MailerLite: Setup & DNS Configuration",
    tags: "MailerLite,DNS,Email Setup",
    embed: `<iframe src="https://gamma.app/embed/ca6xz0wmw6bubrl" allow="fullscreen"></iframe>`,
    download: "https://drive.google.com/file/d/1HOaDYl6pJcb4iFToTT-PbrYCF089gkmn/view?usp=sharing"
  }
];

let allTags = new Set();

// DOM references
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

// Initial render
renderVideos(videos);
renderTags();

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

function renderVideos(list) {
  videoContainer.innerHTML = "";
  allTags.clear();

  list.forEach((v, idx) => {
    const card = document.createElement("div");
    card.className = "card";

    let buttonHTML = "";

    if (v.download && v.download.toLowerCase().endsWith(".pdf")) {
      buttonHTML = `<a href="\${v.download}" target="_blank" class="button">📄 View PDF</a>`;
    } else if (v.download) {
      buttonHTML = `<button onclick="openDownloadModal('\${v.download}')">⬇ Download This</button>`;
    } else {
      buttonHTML = `<button onclick="saveForLater(\${idx})">⭐ Save for Later</button>`;
    }

    card.innerHTML = \`
      \${v.embed ? `<div class="embed" onclick="openModal('\${encodeURIComponent(v.embed)}')">\${v.embed}</div>` : ""}
      <div class="content">
        <h3>\${v.title}</h3>
        <div class="buttons">\${buttonHTML}</div>
      </div>
    \`;
    videoContainer.appendChild(card);

    if (v.tags) {
      v.tags.split(",").forEach(tag => allTags.add(tag.trim()));
    }
  });
}

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
    const filtered = videos.filter(v => v.tags.toLowerCase().includes(tag.toLowerCase()));
    renderVideos(filtered);
  }
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = videos.filter(v => 
    v.title.toLowerCase().includes(term) ||
    v.tags.toLowerCase().includes(term)
  );
  renderVideos(filtered);
});

// Video modal
function openModal(embed) {
  const decoded = decodeURIComponent(embed);
  modalVideo.innerHTML = decoded;
  videoModal.style.display = "flex";
}
modalClose.addEventListener("click", () => {
  videoModal.style.display = "none";
  modalVideo.innerHTML = "";
});

// Download modal
function openDownloadModal(downloadUrl) {
  downloadModal.dataset.downloadUrl = downloadUrl;
  downloadModal.style.display = "flex";
}
downloadClose.addEventListener("click", () => {
  downloadModal.style.display = "none";
});

function saveForLater(index) {
  alert("Saved for later!");
}
document.getElementById("coffee-cup").addEventListener("click", function () {
    // Toggle admin panel visibility
    const adminPanel = document.getElementById("admin-panel");
    if (adminPanel) {
        adminPanel.style.display =
            adminPanel.style.display === "block" ? "none" : "block";
    } else {
        alert("Admin panel element not found!");
    }
});


// Add video (admin panel)
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
  renderTags();
});

// Gated download via Netlify function
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
    const res = await fetch("/.netlify/functions/add-subscriber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: dlName.value.trim(),
        email: dlEmail.value.trim()
      })
    });

    const result = await res.json();

    if (res.ok && result.message) {
      dlMessage.innerHTML = `
        <div class="download-success">
          ✅ You're in!  
          <a href="${downloadModal.dataset.downloadUrl}" target="_blank">⬇ Download Now</a>
        </div>
      `;
    } else {
      dlMessage.textContent = "Something went wrong. Please try again.";
    }
  } catch (err) {
    console.error(err);
    dlMessage.textContent = "Error connecting to server.";
  }
});
