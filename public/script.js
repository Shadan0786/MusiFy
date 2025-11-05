document.addEventListener("DOMContentLoaded", () => {
  // 🎤 Left Section
  const artistList = document.getElementById("artistList");
  const artistNameEl = document.getElementById("artistName");
  const songContainer = document.getElementById("songContainer");
  const addArtistBtn = document.getElementById("addArtistBtn");

  // 🎧 Navbar Search
  const searchInput = document.getElementById("searchInput");

  // 🎧 Bottom Player
  const playPauseBtn = document.getElementById("playPauseBtn");
  const playIcon = document.getElementById("playIcon");
  const progressBar = document.querySelector("input[type='range']");
  const songTimer = document.getElementById("songTimer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // 🎵 Audio
  const audio = new Audio();
  let currentSongs = [];
  let currentArtist = "";
  let currentIndex = -1;
  let isPlaying = false;
  const localArtists = {};

  // 🔹 Format time helper
  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 🔹 Audio progress
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    songTimer.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });

  progressBar.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  playPauseBtn.addEventListener("click", () => {
    if (!audio.src) return alert("Please select a song first!");
    if (isPlaying) {
      audio.pause();
      playIcon.textContent = "play_arrow";
    } else {
      audio.play();
      playIcon.textContent = "pause";
    }
    isPlaying = !isPlaying;
  });

  // 🎵 Play Song
  const playSong = (artist, index) => {
    const song = currentSongs[index];
    if (!song) return;
    currentArtist = artist;
    currentIndex = index;

    if (localArtists[artist]) {
      alert(`🎶 Playing local song: ${song}`);
    } else {
      audio.src = `http://localhost:3000/songs/${artist}/${song}`;
      audio.play();
    }

    isPlaying = true;
    playIcon.textContent = "pause";

    document.querySelectorAll("#songContainer li").forEach((li, i) => {
      li.classList.toggle("text-green-400", i === index);
    });
  };

  // ⏮️ Prev / Next
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) playSong(currentArtist, currentIndex - 1);
  });
  nextBtn.addEventListener("click", () => {
    if (currentIndex < currentSongs.length - 1) playSong(currentArtist, currentIndex + 1);
  });

  // 🧾 Load songs for artist
  artistList.addEventListener("click", async (e) => {
    const target = e.target.closest("li");
    if (!target || e.target.classList.contains("delete-btn")) return;

    const artist = target.dataset.artist;
    currentArtist = artist;
    artistNameEl.textContent = artist;
    songContainer.innerHTML = `<p>Loading songs...</p>`;

    try {
      if (localArtists[artist]) {
        displaySongs(artist, localArtists[artist]);
      } else {
        const res = await fetch(`http://localhost:3000/songs/${artist}`);
        const songs = await res.json();
        displaySongs(artist, songs);
      }
    } catch (err) {
      console.error(err);
      songContainer.innerHTML = `<p>Error loading songs for ${artist}</p>`;
    }
  });

  // 🎶 Display Songs
  const displaySongs = (artist, songs) => {
    currentSongs = songs;
    songContainer.innerHTML = songs.length
      ? songs.map((s, i) => `<li data-index="${i}" class="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer">🎵 ${s}</li>`).join("")
      : `<p>No songs found for ${artist}</p>`;

    document.querySelectorAll("#songContainer li").forEach((li) => {
      li.addEventListener("click", () => playSong(artist, parseInt(li.dataset.index)));
    });
  };

  // ➕ Add artist
  if (addArtistBtn) {
    addArtistBtn.addEventListener("click", () => {
      const artist = prompt("Enter new artist name:");
      if (!artist) return;

      const songsInput = prompt("Enter songs (comma separated):");
      const songs = songsInput ? songsInput.split(",").map((s) => s.trim()).filter(Boolean) : [];

      localArtists[artist] = songs;
      const newArtist = createArtistItem(artist);
      artistList.appendChild(newArtist);
    });
  }

  // 🗑️ Create Artist Item
  const createArtistItem = (artistName) => {
    const li = document.createElement("li");
    li.dataset.artist = artistName;
    li.className =
      "flex justify-between items-center px-3 py-2 mb-2 rounded hover:bg-gray-700 cursor-pointer group";

    const span = document.createElement("span");
    span.textContent = artistName;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.className = "delete-btn opacity-0 group-hover:opacity-100 text-sm text-gray-400 hover:text-red-500 transition";

    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Delete artist "${artistName}"?`)) {
        delete localArtists[artistName];
        li.remove();
      }
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
  };

  // 🔍 Search Functionality — Using the Navbar Search Bar
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    // Filter Artists (left side)
    document.querySelectorAll("#artistList li").forEach((li) => {
      const name = li.dataset.artist.toLowerCase();
      li.style.display = name.includes(query) ? "flex" : "none";
    });

    // Filter Songs (right side, if any visible)
    document.querySelectorAll("#songContainer li").forEach((li) => {
      const songName = li.textContent.toLowerCase();
      li.style.display = songName.includes(query) ? "block" : "none";
    });
  });

  // 🧩 Convert static artists to dynamic (so they have delete button)
  document.querySelectorAll("#artistList li").forEach((li) => {
    const artistName = li.dataset.artist;
    const newLi = createArtistItem(artistName);
    li.replaceWith(newLi);
  });
});


document.getElementById("signupBtn").addEventListener("click", async () => {
  const name = prompt("Enter name:");
  const email = prompt("Enter email:");
  const password = prompt("Enter password:");
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  alert(data.msg);
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = prompt("Enter email:");
  const password = prompt("Enter password:");
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  alert(data.msg);
});