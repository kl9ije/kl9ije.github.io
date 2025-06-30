const titolo = document.getElementById("titolo");
const ora = new Date().getHours();
let langData = null;

const userId = "407804601551683584";

const activityDiv = document.getElementById("activity");
const detailsDiv = document.getElementById("details");
const stateDiv = document.getElementById("state");
const bar = document.getElementById("timebar");
const time = document.getElementById("time");
const progressBox = document.getElementById("progress");

const activityDivM = document.getElementById("activity-mobile");
const detailsDivM = document.getElementById("details-mobile");
const stateDivM = document.getElementById("state-mobile");
const barM = document.getElementById("timebar-mobile");
const timeM = document.getElementById("time-mobile");
const progressBoxM = document.getElementById("progress-mobile");

let spotifyData = null;
let timerInterval = null;

function getBadge(status) {
  return status === "offline"
    ? `<div class="badge badge-outline">OFFLINE</div>`
    : `<div class="badge badge-accent badge-outline">ONLINE</div>`;
}

function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  return `${min}:${String(sec % 60).padStart(2, "0")}`;
}

function updateLocalSpotifyTimer() {
  if (!spotifyData) return;

  const now = Date.now();
  const elapsed = now - spotifyData.start;
  const duration = spotifyData.end - spotifyData.start;

  if (elapsed >= duration || elapsed < 0) {
    progressBox.style.display = "none";
    progressBoxM.style.display = "none";
    clearInterval(timerInterval);
    timerInterval = null;
    return;
  }

  const progress = (elapsed / duration) * 100;
  bar.value = progress.toFixed(1);
  barM.value = progress.toFixed(1);
  time.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
  timeM.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
}

async function updateStatus() {
  try {
    // const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await res.json();
    const d = data.data;

    let content = getBadge(d.discord_status);
    const spotify = d.listening_to_spotify ? d.spotify : null;
    const game = d.activities.find((a) => a.type === 0);

    if (spotify) {
      const start = spotify.timestamps.start;
      const end = spotify.timestamps.end;
      const newId = `${spotify.song}-${spotify.artist}-${start}-${end}`;
      const oldId = spotifyData?.id;

      if (newId !== oldId) {
        spotifyData = {
          id: newId,
          song: spotify.song,
          artist: spotify.artist,
          start: start,
          end: end,
        };

        progressBox.style.display = "flex";
        detailsDiv.textContent = spotify.song;
        stateDiv.textContent = spotify.artist;

        progressBoxM.style.display = "flex";
        detailsDivM.textContent = spotify.song;
        stateDivM.textContent = spotify.artist;

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateLocalSpotifyTimer, 1000);
      }

      content += `listening Spotify`;
    } else {
      spotifyData = null;
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      progressBox.style.display = "none";

      detailsDiv.textContent = "";
      stateDiv.textContent = "";

      progressBoxM.style.display = "none";

      detailsDivM.textContent = "";
      stateDivM.textContent = "";

      if (game) {
        content += `playing ${game.name} 🎮`;
        detailsDiv.textContent = game.details;
        stateDiv.textContent = game.state;

        detailsDivM.textContent = game.details;
        stateDivM.textContent = game.state;
      } else {
        content += `doing nothing 😴`;
      }
    }

    activityDiv.innerHTML = content;
    activityDivM.innerHTML = content;
  } catch (err) {
    console.error("errore Lanyard:", err);
  }
}

setInterval(updateStatus, 5000);
updateStatus();

window.addEventListener('load', () => {
  const trackIds = ['frontend', 'backend', 'others'];
  const speed = 100;

  trackIds.forEach(id => {
    const track = document.getElementById(id);
    if (!track) return;

    const clone = track.cloneNode(true);
    clone.id = "";
    track.append(...clone.childNodes);

    const width = track.scrollWidth / 2;
    const duration = width / speed;

    track.style.animation = `scroll-${id} ${duration}s linear infinite`;

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes scroll-${id} {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${width}px); }
      }
    `;
    document.head.appendChild(style);
  });
});