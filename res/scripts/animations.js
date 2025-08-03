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
const intr = document.querySelectorAll('.introduction button');
const sections = Array.from(buttons).map(btn => document.querySelector(btn.dataset.target));

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.6
};

function fadeOutIn(element, callback) {
  element.style.transition = 'opacity 0.3s';
  element.style.opacity = '0';

  setTimeout(() => {
    callback();
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

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.target);
    if (target) {
      const offset = -112;
      const y = target.getBoundingClientRect().top + window.scrollY + offset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

intr.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.target);
    if (target) {
      const offset = -112;
      const y = target.getBoundingClientRect().top + window.scrollY + offset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});