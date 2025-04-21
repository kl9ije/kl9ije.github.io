function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

async function loadLanguageStrings() {
    let currentLang = getCookie('language') || 'it';
    
    if (!getCookie('language')) {
        setCookie('language', 'it', 365);
    }

    try {
        const response = await fetch(`/langs/${currentLang}.json`);
        const langData = await response.json();

        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            const keyParts = key.split('.');
            let value = langData;
          
            for (const part of keyParts) {
                if (value && value[part]) {
                    value = value[part];
                } else {
                    value = null;
                    break;
                }
            }
          
            if (value) {
                if (element.tagName === "INPUT" && element.type === "radio") {
                    element.setAttribute("aria-label", value);
                    element.value = value;
                } else {
                    element.textContent = value;
                }
            }
        });

        const radioButtons = document.querySelectorAll('input[name="radio-10"]');
        radioButtons.forEach(radio => {
            const onclick = radio.getAttribute('onclick');
            if (onclick) {
                const langCode = onclick.split("'")[1];
                radio.checked = langCode === currentLang;
            }
        });

    } catch (error) {
        console.error('Error loading language strings:', error);
        if (currentLang !== 'it') {
            console.log('Falling back to Italian...');
            currentLang = 'it';
            loadLanguageStrings();
        }
    }
}

function changeLanguage(lang) {
    setCookie('language', lang, 365);
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', loadLanguageStrings);
window.addEventListener('load', loadLanguageStrings);