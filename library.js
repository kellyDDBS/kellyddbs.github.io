...// ===== Pre-loaded videos array =====
let videos = [
  {
    title: "Starting with MailerLite from Scratch",
    tags: "SPF, Emails, MailerLite",
    embed: `<iframe id="gamma-embed"
                    src="https://gamma.app/embed/ca6xz0wmw6bubrl"
                    style="width:100%;height:100%;border:none;"
                    allow="fullscreen"
                    title="Getting Started with MailerLite: Setup & DNS Configuration from Scratch"></iframe>`,
    pdf: `https://drive.google.com/file/d/1HOaDYl6pJcb4iFToTT-PbrYCF089gkmn/preview`,
    download: "https://drive.google.com/file/d/1HOaDYl6pJcb4iFToTT-PbrYCF089gkmn/view?usp=drive_link"
  }
];

let allTags = new Set();
let coffeeClicks = 0;
let editingIndex = null; // Track which video is being edited

// ===== DOM references =====
const coffeeCup = document.getElementById("coffee-cup");
const adminPanel = document.getElementById("admin-panel");
const videoContainer = document.getElementById("video-container");
const searchInput = document.getElementById("search");
const tagsContainer = document.getElementById("tags");
const videoModal = document.getElementById("video-modal");
const modalVideo = document.getElementById("modal-video");

// ===== Coffee cup unlock =====
coffeeCup.addEventListener("click", () => {
  coffeeClicks++;
  if (coffeeClicks >= 5) {
    const pw = prompt("Enter admin password:");
    if (pw === "ownyouradmin") {
      adminPanel.style.display = "block";
      renderAdminList();
    } else {
      alert("Incorrect password");
    }
    coffeeClicks = 0;
  }
});

// ===== Render public video grid =====
function renderVideos(list) {
  videoContainer.innerHTML = "";
  allTags.clear();

  list.forEach((v) => {
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
      openModal(v);
    });

    videoContainer.appendChild(card);

    if (v.tags) {
      v.tags.split(",").forEach(tag => allTags.add(tag.trim()));
    }
  });
  renderTags();
}

// ===== Render tag filters =====
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

// ===== Search =====
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(term) ||
    (v.tags && v.tags.toLowerCase().includes(term))
  );
  renderVideos(filtered);
});

// ===== Add / Edit video =====
document.getElementById("add-video").addEventListener("click", () => {
  const title = document.getElementById("video-title").value.trim();
  const tags = document.getElementById("video-tags").value.trim();
  const embed = document.getElementById("video-embed").value.trim();
  const pdf = document.getElementById("video-pdf")?.value.trim() || "";
  const download = document.getElementById("video-download").value.trim();

  if (!title) {
    alert("Title is required");
    return;
  }

  const videoData = { title, tags, embed, pdf, download };

  if (editingIndex !== null) {
    videos[editingIndex] = videoData;
    editingIndex = null;
  } else {
    videos.push(videoData);
  }

  localStorage.setItem("videos", JSON.stringify(videos));
  renderVideos(videos);
  renderAdminList();
  clearAdminForm();
});

// ===== Admin list with Edit buttons =====
function renderAdminList() {
  const adminList = document.getElementById("admin-list") || document.createElement("div");
  adminList.id = "admin-list";
  adminList.innerHTML = "<h3>Current Videos</h3>";

  videos.forEach((v, i) => {
    const item = document.createElement("div");
    item.textContent = `${v.title} (${v.tags}) `;
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginLeft = "10px";
    editBtn.onclick = () => {
      loadVideoToForm(i);
    };
    item.appendChild(editBtn);
    adminList.appendChild(item);
  });

  adminPanel.appendChild(adminList);
}

// ===== Load video into form for editing =====
function loadVideoToForm(index) {
  const v = videos[index];
  document.getElementById("video-title").value = v.title;
  document.getElementById("video-tags").value = v.tags;
  document.getElementById("video-embed").value = v.embed;
  if (document.getElementById("video-pdf")) {
    document.getElementById("video-pdf").value = v.pdf || "";
  }
  document.getElementById("video-download").value = v.download;
  editingIndex = index;
}

// ===== Clear admin form =====
function clearAdminForm() {
  document.getElementById("video-title").value = "";
  document.getElementById("video-tags").value = "";
  document.getElementById("video-embed").value = "";
  if (document.getElementById("video-pdf")) {
    document.getElementById("video-pdf").value = "";
  }
  document.getElementById("video-download").value = "";
}

// ===== Modal with PDF fallback =====
function openModal(video) {
  modalVideo.innerHTML = "";

  // Video/PDF container
  const videoWrapper = document.createElement("div");
  videoWrapper.style.height = "90vh";
  videoWrapper.style.width = "100%";
  videoWrapper.style.flex = "1";
  videoWrapper.innerHTML = video.embed;

  // Download button (gated)
  const dlWrapper = document.createElement("div");
  dlWrapper.style.textAlign = "center";
  dlWrapper.style.marginTop = "15px";
  if (video.download) {
    dlWrapper.innerHTML = `<button class="button" onclick="openDownloadModal('${video.download}')">⬇ Download this resource</button>`;
  }

  modalVideo.appendChild(videoWrapper);
  modalVideo.appendChild(dlWrapper);
  videoModal.style.display = "flex";

  // PDF fallback if Gamma doesn't load
  const iframe = document.getElementById("gamma-embed");
  if (iframe) {
    let loaded = false;
    iframe.onload = () => { loaded = true; };
    setTimeout(() => {
      if (!loaded && video.pdf) {
        videoWrapper.innerHTML = `<iframe src="${video.pdf}" style="width:100%;height:100%;border:none;"></iframe>`;
      }
    }, 3000);
  }
}

document.getElementById("modal-close").addEventListener("click", () => {
  videoModal.style.display = "none";
  modalVideo.innerHTML = "";
});

// ===== Gated download =====
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

// ===== Initial render =====
renderVideos(videos);
