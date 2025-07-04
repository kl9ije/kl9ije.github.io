const titolo = document.getElementById("titolo");
const ora = new Date().getHours();
let langData = null;

const userId = "407804601551683584";
const birthDate = new Date("2008-06-02T00:00:00Z");

const activityCard = document.getElementById("activity-card");
const activityDiv = document.getElementById("activity");
const detailsDiv = document.getElementById("details");
const stateDiv = document.getElementById("state");
const bar = document.getElementById("timebar");
const time = document.getElementById("time");
const progressBox = document.getElementById("progress");

let spotifyData = null;
let activityData = null;
let oldId = null;
let oldActivityId = null;
let timerInterval = null;

function getBadge(status) {
  return status === "offline"
    ? `<div class="badge badge-outline">OFFLINE</div>`
    : `<div class="badge badge-accent badge-outline">ONLINE</div>`;
}

function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  if (hr > 0) {
    return `${hr}:${String(min % 60).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  }
  return `${min}:${String(sec % 60).padStart(2, "0")}`;
}

function updateLocalSpotifyTimer() {
  if (!spotifyData) return;

  const now = Date.now();
  const elapsed = now - spotifyData.start;
  const duration = spotifyData.end - spotifyData.start;

  if (elapsed >= duration || elapsed < 0) {
    progressBox.style.display = "none";
    clearInterval(timerInterval);
    timerInterval = null;
    return;
  }

  const progress = (elapsed / duration) * 100;
  bar.value = progress.toFixed(1);
  bar.max = 100;
  time.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
}

function updateLocalActivityTimer() {

  const now = Date.now();
  const elapsed = now - activityData.start;

  time.textContent = `${formatTime(elapsed)}`;
}

async function updateStatus() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await res.json();
    const d = data.data;

    let content = getBadge(d.discord_status);

    const spotify = d.listening_to_spotify ? d.spotify : null;
    const game = d.activities.find(a => a.type === 0);

    if (!d.active_on_discord_web && !d.active_on_discord_desktop && !d.active_on_discord_mobile) {
      activityCard.style.display = "none";
      return
    }

    activityCard.style.display = "flex";

    // spotify attivo
    if (spotify) {
      // reset gioco
      activityData = null;
      oldActivityId = null;

      const start = spotify.timestamps.start;
      const end = spotify.timestamps.end;
      const newId = `${spotify.song}-${spotify.artist}-${start}-${end}`;

      if (newId !== oldId) {
        oldId = newId;
        spotifyData = { id: newId, song: spotify.song, artist: spotify.artist, start, end };

        progressBox.style.display = "flex";
        bar.max = 100;
        bar.value = 0;

        detailsDiv.textContent = spotify.song;
        stateDiv.textContent = spotify.artist;

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateLocalSpotifyTimer, 1000);
      }

      content += ` listening Spotify`;

    } else if (game) {
      // reset spotify
      spotifyData = null;
      oldId = null;

      const start = game.timestamps.start;
      const id = game.id;
      const newId = `${id}-${start}`;

      if (newId !== oldActivityId) {
        oldActivityId = newId;

        activityData = { id, start };

        progressBox.style.display = "flex";
        bar.removeAttribute("value");
        bar.removeAttribute("max");

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateLocalActivityTimer, 1000);
      }

      detailsDiv.textContent = game.details || "";
      stateDiv.textContent = game.state || "";

      content += ` playing ${game.name}`;

    } else {
      // niente spotify né gioco
      spotifyData = null;
      activityData = null;
      oldId = null;
      oldActivityId = null;

      detailsDiv.textContent = "";
      stateDiv.textContent = "";
      content += ` doing nothing 😴`;
      progressBox.style.display = "none";

      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    activityDiv.innerHTML = content;

    const str = d.kv.toplangs;
    const objs = str.match(/\{[^}]+\}/g).map(JSON.parse);
    const merged = Object.assign({}, ...objs);

    const languages = {
      "Python": {
        "path": "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z",
        "fill": "#3776AB"
      },
      "JavaScript": {
        "path": "M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z",
        "fill": "#F7DF1E"
      },
      "HTML": {
        "path": "M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z",
        "fill": "#E34F26"
      },
      "CSS": {
        "path": "M0 0v20.16A3.84 3.84 0 0 0 3.84 24h16.32A3.84 3.84 0 0 0 24 20.16V3.84A3.84 3.84 0 0 0 20.16 0Zm14.256 13.08c1.56 0 2.28 1.08 2.304 2.64h-1.608c.024-.288-.048-.6-.144-.84-.096-.192-.288-.264-.552-.264-.456 0-.696.264-.696.84-.024.576.288.888.768 1.08.72.288 1.608.744 1.92 1.296q.432.648.432 1.656c0 1.608-.912 2.592-2.496 2.592-1.656 0-2.4-1.032-2.424-2.688h1.68c0 .792.264 1.176.792 1.176.264 0 .456-.072.552-.24.192-.312.24-1.176-.048-1.512-.312-.408-.912-.6-1.32-.816q-.828-.396-1.224-.936c-.24-.36-.36-.888-.36-1.536 0-1.44.936-2.472 2.424-2.448m5.4 0c1.584 0 2.304 1.08 2.328 2.64h-1.608c0-.288-.048-.6-.168-.84-.096-.192-.264-.264-.528-.264-.48 0-.72.264-.72.84s.288.888.792 1.08c.696.288 1.608.744 1.92 1.296.264.432.408.984.408 1.656.024 1.608-.888 2.592-2.472 2.592-1.68 0-2.424-1.056-2.448-2.688h1.68c0 .744.264 1.176.792 1.176.264 0 .456-.072.552-.24.216-.312.264-1.176-.048-1.512-.288-.408-.888-.6-1.32-.816-.552-.264-.96-.576-1.2-.936s-.36-.888-.36-1.536c-.024-1.44.912-2.472 2.4-2.448m-11.031.018c.711-.006 1.419.198 1.839.63.432.432.672 1.128.648 1.992H9.336c.024-.456-.096-.792-.432-.96-.312-.144-.768-.048-.888.24-.12.264-.192.576-.168.864v3.504c0 .744.264 1.128.768 1.128a.65.65 0 0 0 .552-.264c.168-.24.192-.552.168-.84h1.776c.096 1.632-.984 2.712-2.568 2.688-1.536 0-2.496-.864-2.472-2.472v-4.032c0-.816.24-1.44.696-1.848.432-.408 1.146-.624 1.857-.63",
        "fill": "#663399"
      },
      "Others": {
        "path": "M9.825 17.527a.111.111 0 0 1-.107-.142l3.05-10.837a.111.111 0 0 1 .108-.081H14.2c.074 0 .127.07.107.141l-3.063 10.838a.111.111 0 0 1-.107.08H9.825Zm-2.146-2.732a.11.11 0 0 1-.079-.033l-2.667-2.704a.111.111 0 0 1 0-.156L7.6 9.211a.111.111 0 0 1 .08-.033h1.702c.1 0 .149.12.079.19l-2.534 2.534a.111.111 0 0 0 0 .157l2.535 2.546c.07.07.02.19-.079.19H7.68Zm6.954 0a.111.111 0 0 1-.079-.19l2.525-2.546a.111.111 0 0 0 0-.157l-2.524-2.535a.111.111 0 0 1 .079-.19h1.692c.03 0 .058.013.078.034l2.68 2.69a.111.111 0 0 1 0 .157l-2.68 2.704a.111.111 0 0 1-.078.033h-1.693ZM12 24C5.383 24 0 18.617 0 12S5.383 0 12 0s12 5.383 12 12-5.383 12-12 12Zm0-22.667C6.118 1.333 1.333 6.118 1.333 12S6.118 22.667 12 22.667 22.667 17.882 22.667 12 17.882 1.333 12 1.333Z",
        "fill": "#7480ff"
      }
    };

    const bars = [
      document.getElementById("lang1bar"),
      document.getElementById("lang2bar"),
      document.getElementById("lang3bar"),
      document.getElementById("lang4bar"),
      document.getElementById("lang5bar")
    ];

    const texts = [
      document.getElementById("lang1txt"),
      document.getElementById("lang2txt"),
      document.getElementById("lang3txt"),
      document.getElementById("lang4txt"),
      document.getElementById("lang5txt")
    ];

    const icons = [
      document.getElementById("lang1icon"),
      document.getElementById("lang2icon"),
      document.getElementById("lang3icon"),
      document.getElementById("lang4icon"),
      document.getElementById("lang5icon")
    ];

    const tooltips = [
      document.getElementById("lang1tip"),
      document.getElementById("lang2tip"),
      document.getElementById("lang3tip"),
      document.getElementById("lang4tip"),
      document.getElementById("lang5tip")
    ];

    const keys = Object.keys(merged);

    for (let i = 0; i < 5; i++) {
      bars[i].value = merged[keys[i]];
      texts[i].textContent = merged[keys[i]] + "%";
      tooltips[i].setAttribute("data-tip", keys[i]);

      const langName = keys[i];
      const svg = icons[i];
      if (!svg) continue;

      const langData = languages[langName] || languages["Others"];

      const pathEl = svg.querySelector("path");
      if (!pathEl) continue;

      pathEl.setAttribute("d", langData.path);
      svg.style.fill = langData.fill;
    }

    const dailystreak = document.getElementById("dailystreak");
    dailystreak.textContent = d.kv.streak || "--";

    const codingtime = document.getElementById("codingtime");
    codingtime.textContent = d.kv.codingtime || "--";

    const projects = document.getElementById("projects");
    projects.textContent = d.kv.projects || "--";

  } catch (err) {
    console.error("errore Lanyard:", err);
  }
}

setInterval(updateStatus, 3000);
updateStatus();

// const ageInt = document.getElementById("age-int")
// const ageDec = document.getElementById("age-decimal")

// function updateAge() {
//   const now = new Date();
//   const ageInMilliseconds = now - birthDate;
//   const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24* 365.2425);

//   const [intPart, decimalPart] = ageInYears.toFixed(7).split(".");
//   ageInt.textContent = intPart;
//   ageDec.textContent = "." + decimalPart;
// }

window.addEventListener('load', () => {

  // setInterval(updateAge, 50);

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

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h} hrs ${m} mins`;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  fetch("https://wakatime.com/share/embeddable/kl9ije/6724bb9c-0e91-4ab7-bbaf-99a27d1dd741.json")
    .then(res => res.json())
    .then(data => {
      const days = data.days;
      const container = document.getElementById("activity-graph");

      const max = Math.max(...days.map(d => d.total || 0));

      days.forEach(day => {
        const level = Math.floor((day.total / max) * 4);
        const tip = `${formatDate(day.date)} – ${formatTime(day.total)}`;

        const div = document.createElement("div");
        div.className = "graph-day tooltip";
        div.dataset.level = level;
        div.dataset.tip = tip;

        container.appendChild(div);
      });
    });

  fetch("https://github-contributions-api.jogruber.de/v4/kl9ije?y=last")
  .then(res => res.json())
  .then(data => {
    const contribs = document.getElementById("contribs");
    contribs.textContent = data.total.lastYear;
  });

  fetch(`https://api.lanyard.rest/v1/users/${userId}`)
  .then(res => res.json())
  .then(data => {
    const str2 = data.data.kv.projectlist;
    const objs2 = str2.match(/\{[^}]+\}/g).map(JSON.parse);
    const merged2 = Object.assign({}, ...objs2);
    const container = document.getElementById("projectlist");

    for (const [name, value] of Object.entries(merged2)) {
      const item = document.createElement("div");
      item.className = "item";

      const nameElem = document.createElement("p");
      nameElem.textContent = name;

      const valueElem = document.createElement("span");
      valueElem.textContent = value;

      item.appendChild(nameElem);
      item.appendChild(valueElem);
      container.appendChild(item);
    }

    const sharemanTime = document.getElementById("project1stats");
    sharemanTime.textContent = data.data.kv.shareman;

    const modmyutubeTime = document.getElementById("project2stats");
    modmyutubeTime.textContent = data.data.kv.modmyutube;
  })
});

window.addEventListener("load", () => {
  const elements = document.querySelectorAll(".animate-ttb, .animate-btt");

  elements.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("show");
    }, i * 100);
  });
});

function revealOnScroll() {
  const scrollElements = document.querySelectorAll(
    ".animate-scroll-ttb, .animate-scroll-btt, .animate-scroll-ltr, .animate-scroll-rtl"
  );

  scrollElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const offset = 150;

    if (rect.top < window.innerHeight - offset && !el.classList.contains("show")) {
      setTimeout(() => {
        el.classList.add("show");
      }, 300);
    }
  });
}

function revealOnScrollList() {
  const scrollElements = Array.from(document.querySelectorAll(".animate-scroll-list")).filter(
    el => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight - 250 && !el.classList.contains("show");
    }
  );

  scrollElements.forEach((listEl, listIndex) => {
    setTimeout(() => {
      listEl.classList.add("show");
      const children = Array.from(listEl.children);
      children.forEach((child, i) => {
        setTimeout(() => {
          child.classList.add("show");
        }, i * 200);
      });
    }, listIndex * 500);
  });
}

window.addEventListener("scroll", revealOnScrollList);
window.addEventListener("load", revealOnScrollList);

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

window.addEventListener("load", () => {
  const p = document.querySelector("p");
  const fullText = p.textContent.replace("|", "").trim();
  p.textContent = "";

  const caret = document.createElement("span");
  caret.id = "typewriter-caret";
  caret.textContent = "|";
  p.appendChild(caret);

  setTimeout(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        p.textContent = fullText.substring(0, i + 1);
        p.appendChild(caret);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15);
  }, 250);
});

window.addEventListener("load", () => {
  const wave = document.querySelector(".wave");
  if (!wave) return;

  function animateWave() {
    wave.style.animation = "waveAnim 1s ease-in-out";
    wave.addEventListener("animationend", () => {
      wave.style.animation = "";
    }, { once: true });
  }

  setTimeout(() => {
    animateWave();
  }, 250);
});

const buttons = document.querySelectorAll('.navbar-center button');
const sections = Array.from(buttons).map(btn => document.querySelector(btn.dataset.target));

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.6 // quando 60% della sezione è visibile
};

function fadeOutIn(element, callback) {
  element.style.transition = 'opacity 0.3s';
  element.style.opacity = '0';

  setTimeout(() => {
    callback(); // cambia classi
    element.style.opacity = '1';
  }, 300);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const targetID = `#${entry.target.id}`;
    buttons.forEach(btn => {
      if (btn.dataset.target === targetID) {
        if (entry.isIntersecting) {
          btn.classList.remove('btn-ghost');
          btn.classList.add('btn-outline', 'btn-primary');
          btn.style.transition = 'opacity 0.3s';
          btn.style.opacity = '0.6';
          setTimeout(() => btn.style.opacity = '1', 10);
        } else {
          btn.classList.remove('btn-outline', 'btn-primary');
          btn.classList.add('btn-ghost');
        }
      }
    });
  });
}, {
  root: null,
  threshold: 0.6
});

sections.forEach(section => {
  if (section) observer.observe(section);
});

// 🤓 click = scroll smooth
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.target);
    if (target) {
      const offset = -112; // tipo -3rem (3 * 16px)
      const y = target.getBoundingClientRect().top + window.scrollY + offset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});