let videos = [
  {
    title: "Starting with MailerLite from Scratch",
    tags: "SPF, Emails, MailerLite",
    embed: `<iframe id="gamma-embed"
                    src="https://gamma.app/embed/ca6xz0wmw6bubrl"
                    allow="fullscreen"
                    title="Getting Started with MailerLite: Setup & DNS Configuration from Scratch"></iframe>`,
    pdf: `https://drive.google.com/file/d/1HOaDYl6pJcb4iFToTT-PbrYCF089gkmn/preview`,
    download: "https://drive.google.com/file/d/1HOaDYl6pJcb4iFToTT-PbrYCF089gkmn/view?usp=drive_link"
  }
];

let allTags = new Set();
let coffeeClicks = 0;
let editingIndex = null;

const coffeeCup = document.getElementById("coffee-cup");
const adminPanel = document.getElementById("admin-panel");
const videoContainer = document.getElementById("video-container");
const searchInput = document.getElementById("search");
const tagsContainer = document.getElementById("tags");
const videoModal = document.getElementById("video-modal");
const modalVideo = document.getElementById("modal-video");

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

function renderVideos(list) {
  videoContainer.innerHTML = "";
  allTags.clear();
  list.forEach((v) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${v.title}</h3>`;
    card.addEventListener("click", () => openModal(v));
    videoContainer.appendChild(card);
    if (v.tags) v.tags.split(",").forEach(tag => allTags.add(tag.trim()));
  });
  renderTags();
}

function renderTags() {
  tagsContainer.innerHTML = "";
  ["All", ...Array.from(allTags)].forEach(tag => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = tag;
    el.addEventListener("click", () => filterByTag(tag));
    tagsContainer.appendChild(el);
  });
}

function filterByTag(tag) {
  if (tag === "All") renderVideos(videos);
  else renderVideos(videos.filter(v => v.tags && v.tags.toLowerCase().includes(tag.toLowerCase())));
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  renderVideos(videos.filter(v =>
    v.title.toLowerCase().includes(term) ||
    (v.tags && v.tags.toLowerCase().includes(term))
  ));
});

document.getElementById("add-video").addEventListener("click", () => {
  const title = document.getElementById("video-title").value.trim();
  const tags = document.getElementById("video-tags").value.trim();
  const embed = document.getElementById("video-embed").value.trim();
  const pdf = document.getElementById("video-pdf").value.trim();
  const download = document.getElementById("video-download").value.trim();
  if (!title) return alert("Title is required");
  const data = { title, tags, embed, pdf, download };
  if (editingIndex !== null) {
    videos[editingIndex] = data;
    editingIndex = null;
  } else {
    videos.push(data);
  }
  localStorage.setItem("videos", JSON.stringify(videos));
  renderVideos(videos);
  renderAdminList();
  clearAdminForm();
});

function renderAdminList() {
  const adminList = document.getElementById("admin-list") || document.createElement("div");
  adminList.id = "admin-list";
  adminList.innerHTML = "<h3>Current Videos</h3>";
  videos.forEach((v, i) => {
    const item = document.createElement("div");
    item.textContent = `${v.title} (${v.tags}) `;
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => loadVideoToForm(i);
    item.appendChild(editBtn);
    adminList.appendChild(item);
  });
  adminPanel.appendChild(adminList);
}

function loadVideoToForm(i) {
  const v = videos[i];
  document.getElementById("video-title").value = v.title;
  document.getElementById("video-tags").value = v.tags;
  document.getElementById("video-embed").value = v.embed;
  document.getElementById("video-pdf").value = v.pdf || "";
  document.getElementById("video-download").value = v.download;
  editingIndex = i;
}

function clearAdminForm() {
  document.getElementById("video-title").value = "";
  document.getElementById("video-tags").value = "";
  document.getElementById("video-embed").value = "";
  document.getElementById("video-pdf").value = "";
  document.getElementById("video-download").value = "";
}

function openModal(video) {
  modalVideo.innerHTML = "";
  const videoWrapper = document.createElement("div");
  videoWrapper.style.width = "100vw";
  videoWrapper.style.height = "100vh";
  videoWrapper.innerHTML = video.embed;
  const dlWrapper = document.createElement("div");
  dlWrapper.id = "download-btn-wrapper";
  if (video.download) {
    dlWrapper.innerHTML = `<button class="button" onclick="openDownloadModal('${video.download}')">⬇ Download this resource</button>`;
  }
  modalVideo.appendChild(videoWrapper);
  modalVideo.appendChild(dlWrapper);
  videoModal.style.display = "flex";
  const iframe = document.getElementById("gamma-embed");
  if (iframe) {
    let loaded = false;
    iframe.onload = () => loaded = true;
    setTimeout(() => {
      if (!loaded && video.pdf) {
        videoWrapper.innerHTML = `<iframe src="${video.pdf}" style="width:100vw;height:100vh;border:none;"></iframe>`;
      }
    }, 3000);
  }
}

document.getElementById("modal-close").addEventListener("click", () => {
  videoModal.style.display = "none";
  modalVideo.innerHTML = "";
});

window.openDownloadModal = function(downloadUrl) {
  const dlModal = document.getElementById("download-modal");
  dlModal.dataset.downloadUrl = downloadUrl;
  dlModal.style.display = "block";
};

document.getElementById("dl-submit").addEventListener("click", async () => {
  const name = document.getElementById("dl-name").value.trim();
  const email = document.getElementById("dl-email").value.trim();
  const message = document.getElementById("dl-message");
  if (!name || !email) return alert("Name and email are required");
  message.textContent = "Adding you to the list...";
  try {
    const res = await fetch("/.netlify/functions/add-subscriber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    const result = await res.json();
    if (res.ok && result.message) {
      message.innerHTML = `<div class="download-success">✅ You're in!  
        <a href="${document.getElementById("download-modal").dataset.downloadUrl}" target="_blank">⬇ Download Now</a>
      </div>`;
    } else {
      message.textContent = "Something went wrong. Please try again.";
    }
  } catch {
    message.textContent = "Error connecting to server.";
  }
});

renderVideos(videos);
