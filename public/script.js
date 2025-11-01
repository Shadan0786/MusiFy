document.addEventListener("DOMContentLoaded", () => {
  // 🎤 Left Section (Artist list)
  const artistList = document.getElementById("artistList");
  const artistNameEl = document.getElementById("artistName");
  const songContainer = document.getElementById("songContainer");

  // 🎧 Bottom Player Controls
  const playPauseBtn = document.getElementById("playPauseBtn");
  const playIcon = document.getElementById("playIcon");
  const progressBar = document.querySelector("input[type='range']");
  const songTimer = document.getElementById("songTimer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // 🔊 Audio Element
  const audio = new Audio();
  let currentSongs = [];
  let currentArtist = "";
  let currentIndex = -1;
  let isPlaying = false;

  // 🔹 Format seconds → mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 🔹 Update progress bar & timer
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    songTimer.textContent = `${formatTime(audio.currentTime)} / ${formatTime(
      audio.duration
    )}`;
  });

  // 🔹 Allow seeking using progress bar
  progressBar.addEventListener("input", () => {
    if (audio.duration) {
      audio.currentTime = (progressBar.value / 100) * audio.duration;
    }
  });

  // 🔹 Play / Pause toggle
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

  // 🔹 Play specific song
  const playSong = (artist, index) => {
    const song = currentSongs[index];
    if (!song) return;

    currentArtist = artist;
    currentIndex = index;

    const songSrc = `http://localhost:3000/songs/${artist}/${song}`;
    audio.src = songSrc;
    audio.play();

    isPlaying = true;
    playIcon.textContent = "pause";

    // ✅ Highlight active song
    document.querySelectorAll("#songContainer li").forEach((li, i) => {
      li.classList.remove("text-green-400");
      if (i === index) li.classList.add("text-green-400");
    });
  };

  // 🔹 Next song
  const playNext = () => {
    if (currentIndex < currentSongs.length - 1) {
      playSong(currentArtist, currentIndex + 1);
    }
  };

  // 🔹 Previous song
  const playPrevious = () => {
    if (currentIndex > 0) {
      playSong(currentArtist, currentIndex - 1);
    }
  };

  // Attach Next/Prev button events
  prevBtn.addEventListener("click", playPrevious);
  nextBtn.addEventListener("click", playNext);

  // 🎤 When clicking an artist name → fetch songs
  artistList.addEventListener("click", async (e) => {
    if (e.target.tagName === "LI") {
      const artist = e.target.dataset.artist;
      currentArtist = artist;

      // ✅ Only update heading when artist changes
      artistNameEl.textContent = ` ${artist}`;
      songContainer.innerHTML = `<p>Loading songs...</p>`;

      try {
        const res = await fetch(`http://localhost:3000/songs/${artist}`);
        if (!res.ok) throw new Error("Songs not found");
        const songs = await res.json();

        currentSongs = songs;

        if (songs.length === 0) {
          songContainer.innerHTML = `<p>No songs found for ${artist}</p>`;
          return;
        }

        // Display songs
        songContainer.innerHTML = songs
          .map(
            (song, i) => `
            <li data-index="${i}" 
                class="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors duration-200">
              🎶 ${song}
            </li>`
          )
          .join("");

        // Click a song to play
        document.querySelectorAll("#songContainer li").forEach((li) => {
          li.addEventListener("click", () => {
            const index = parseInt(li.dataset.index);
            playSong(artist, index);
          });
        });
      } catch (error) {
        console.error(error);
        songContainer.innerHTML = `<p>Error fetching songs for ${artist}</p>`;
      }
    }
  });
});
