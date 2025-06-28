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
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
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

async function updateTitleAndPhrases() {
    if (!window.langData) return;
    
    const langData = window.langData;
    
    if (ora >= 5 && ora < 12) {
        titolo.innerHTML = `${langData.main.title.morning} <span class="gradient-text">gocciola</span>.`;
    } else if (ora >= 12 && ora < 18) {
        titolo.innerHTML = `${langData.main.title.afternoon} <span class="gradient-text">gocciola</span>.`;
    } else if (ora >= 18 && ora < 22) {
        titolo.innerHTML = `${langData.main.title.evening} <span class="gradient-text">gocciola</span>.`;
    } else {
        titolo.innerHTML = `${langData.main.title.night} <span class="gradient-text">gocciola</span>.`;
    }

    frasi = [
        langData.main.desc[1],
        langData.main.desc[2],
        langData.main.desc[3],
        "e ho creato /Galaxyde/"
    ];

    if (frasi.length > 0 && !hasStarted) {
        hasStarted = true;
        scrivi();
    }
}

const mobileStatus = document.querySelector(".mobile-status");
const content = document.querySelector(".mobile-status-content");

mobileStatus.addEventListener("click", () => {
  mobileStatus.classList.toggle("expanded");
});


let hasStarted = false;

const descrizione = document.getElementById("descrizione");

let frasi = [];

let fraseIndex = 0;
let charIndex = 0;

const typingSpeed = 150;
const deletingSpeed = 50;
const delayBetweenFrasi = 2000;
const blinkingSpeed = 500;

let isBlinking = false;
let cursorVisible = true;
let isColoring = false;
let tempText = "";

function aggiornaTestoVisibile(frase, finoA) {
    let output = "";
    let colorPart = "";
    let isInColor = false;

    for (let i = 0; i < finoA; i++) {
        const char = frase[i];
        if (char === "/") {
            isInColor = !isInColor;
            continue;
        }

        if (isInColor) {
            colorPart += char;
        } else {
            output += char;
        }
    }

    if (colorPart) {
        output += `<span class="gradient-text">${colorPart}</span>`;
    }

    return output;
}

function scrivi() {
    if (charIndex < frasi[fraseIndex].length) {
        const parziale = aggiornaTestoVisibile(frasi[fraseIndex], charIndex + 1) + "|";
        descrizione.innerHTML = parziale;
        charIndex++;
        setTimeout(scrivi, typingSpeed);
    } else {
        startBlinking();
        setTimeout(cancella, delayBetweenFrasi);
    }
}

function cancella() {
    stopBlinking();
    if (charIndex > 0) {
        const parziale = aggiornaTestoVisibile(frasi[fraseIndex], charIndex - 1) + "|";
        descrizione.innerHTML = parziale;
        charIndex--;
        setTimeout(cancella, deletingSpeed);
    } else {
        fraseIndex = (fraseIndex + 1) % frasi.length;
        setTimeout(scrivi, typingSpeed);
    }
}

function startBlinking() {
    if (!isBlinking) {
        isBlinking = true;
        blinkCursor();
    }
}

function stopBlinking() {
    isBlinking = false;
    descrizione.innerHTML = descrizione.innerHTML.replace("|", "");
}

function blinkCursor() {
    if (isBlinking) {
        cursorVisible = !cursorVisible;
        const testoCorrente = aggiornaTestoVisibile(frasi[fraseIndex], frasi[fraseIndex].length);
        descrizione.innerHTML = testoCorrente + (cursorVisible ? "|" : "");
        setTimeout(blinkCursor, blinkingSpeed);
    }
}
