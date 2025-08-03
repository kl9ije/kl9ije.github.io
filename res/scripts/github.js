function formatTimeCode(seconds) {
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

function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const daysLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthsContainer = document.getElementById("months");
const daysContainer = document.getElementById("days");
const graphContainer = document.getElementById("activity-graph");

// aggiungo label giorni verticali
daysLabels.forEach((d, i) => {
    const el = document.createElement("div");
    el.textContent = d;
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.height = "16px";
    el.style.fontWeight = "bold";
    el.style.fontSize = "0.9em";
    daysContainer.appendChild(el);
});

fetch("https://wakatime.com/share/embeddable/kl9ije/6724bb9c-0e91-4ab7-bbaf-99a27d1dd741.json")
    .then(res => res.json())
    .then(data => {
    const days = data.days;

    // primo lunedì prima del primo dato
    let firstDate = new Date(days[0].date);
    let dayOfWeek = firstDate.getDay(); // dom=0 lun=1
    let diffToMonday = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
    firstDate.setDate(firstDate.getDate() + diffToMonday);

    const weeks = 53;
    const daysInWeek = 7;

    // matrice righe = giorni (7), colonne = settimane (53)
    const matrixDates = [];
    for(let w=0; w < weeks; w++){
        for(let d=0; d < daysInWeek; d++){
        const date = new Date(firstDate);
        date.setDate(date.getDate() + w*7 + d);
        matrixDates.push(date);
        }
    }

    // mappa per dati
    const daysMap = new Map(days.map(d => [d.date, d]));

    graphContainer.innerHTML = "";

    const max = Math.max(...days.map(d => d.total || 0));

    // ciclo e creo div posizionati in grid (riga = giorno, colonna = settimana)
    matrixDates.forEach((date, i) => {
        const w = Math.floor(i / daysInWeek);
        const d = i % daysInWeek;

        const dateStr = date.toISOString().slice(0,10);
        const dayData = daysMap.get(dateStr);

        // Wakatime API: total è in secondi, non minuti!
        const total = dayData ? dayData.total : 0;
        let level = 0;
        if(max > 0) level = Math.min(4, Math.floor((total / max) * 4));

        // Correggi il tooltip: total in secondi, formatTime vuole minuti
        const tip = `${formatDate(dateStr)} – ${formatTimeCode(total)}`;

        const div = document.createElement("div");
        div.className = "graph-day tooltip";
        div.dataset.level = level;
        div.dataset.tip = tip;
        div.style.gridRow = (d+1);
        div.style.gridColumn = (w+1);

        graphContainer.appendChild(div);
    });

    // mesi sopra
    const monthLabels = [];
    let lastMonth = null;
    let lastIndex = 0;
    for(let w=0; w < weeks; w++){
        const date = matrixDates[w*7];
        const month = date.toLocaleString(undefined, { month: 'short' });
        if(month !== lastMonth){
        // Calcola la larghezza della label in settimane
        if (lastMonth !== null) {
            monthLabels[monthLabels.length-1].span = w - lastIndex;
        }
        monthLabels.push({ index: w, label: month, span: 1 });
        lastMonth = month;
        lastIndex = w;
        }
    }
    // Ultima label
    if (monthLabels.length > 0) {
        monthLabels[monthLabels.length-1].span = weeks - lastIndex;
    }

    monthsContainer.innerHTML = "";
    monthLabels.forEach((m, i) => {
        const el = document.createElement("div");
        el.textContent = m.label;
        el.style.gridColumn = `${m.index + 1} / span ${m.span}`;
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontWeight = "bold";
        el.style.fontSize = "0.9em";
        monthsContainer.appendChild(el);
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