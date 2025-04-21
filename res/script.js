const titolo = document.getElementById("titolo");
const ora = new Date().getHours();

if (ora >= 5 && ora < 12) {
    titolo.innerHTML = `Buongiorno, sono <span class="gradient-text">gocciola</span>.`;
} else if (ora >= 12 && ora < 18) {
    titolo.innerHTML = `Buon pomeriggio, sono <span class="gradient-text">gocciola</span>.`;
} else {
    titolo.innerHTML = `Buonasera, sono <span class="gradient-text">gocciola</span>.`;
}


const descrizione = document.getElementById("descrizione");

const frasi = [
    "e sono /simpatico/",
    "e sono un /content creator/",
    "e sono un /developer/",
    "e ho creato /Galaxyde/"
];

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

scrivi();
