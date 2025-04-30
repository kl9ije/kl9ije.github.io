document.addEventListener('DOMContentLoaded', function () {
    const loadingDiv = document.getElementById('loading');
    const tagsDiv = document.getElementById('tags');

    loadingDiv.style.display = 'block';
    tagsDiv.style.display = 'none';

    fetch('https://pastefy.app/WaTd2Voz/raw')
        .then(response => response.json())
        .then(data => {
            loadingDiv.remove(); // Remove instead of hide

            // Funzione per aggiornare il display in base alla larghezza dello schermo
            const updateDisplay = () => {
                if (window.innerWidth <= 480) {
                    tagsDiv.style.display = 'inline';
                } else {
                    tagsDiv.style.display = 'grid';
                }
            };

            // Inizializza il display e aggiungi l'event listener
            updateDisplay();
            window.addEventListener('resize', updateDisplay);

            // Creazione delle card
            for (const key in data) {
                const tagData = data[key];

                const card = document.createElement('div');
                card.className = 'card bg-base-100 w-96 shadow-xl';
                card.innerHTML = `
                    <div class="card-body">
                        <div class="discord-tag">
                            <img src="${tagData.icon}" alt="${tagData.tag} icon">${tagData.tag}
                        </div>
                        <h2 class="card-title" style="margin-left: 0; width: max-content; margin-top: 0.5rem;">
                            <div style="font-weight: normal; color: #404046;">#${key}</div>
                            ${tagData.name}
                        </h2>
                        <p style="margin-left: 0; width: 18rem;"></p>
                        <div class="card-actions justify-end">
                            <a href="${tagData.server}" class="btn btn-primary">Ottieni Tag</a>
                        </div>
                    </div>
                `;

                tagsDiv.appendChild(card);
            }
        })
        .catch(error => {
            console.error('Errore nel caricamento dei dati:', error);
            loadingDiv.style.display = 'none';
        });
});
