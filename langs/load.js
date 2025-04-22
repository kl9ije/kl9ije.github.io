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
    let currentLang = getCookie('language') || 'en';
    let browserLang = navigator.language.split('-')[0];
    
    const supportedLangAlert = document.getElementById('supportedLang').querySelector('.alert');
    
    try {
        const response = await fetch(`/langs/${currentLang}.json`);
        if (!response.ok) {
            throw new Error('Current language file not found');
        }
        const langData = await response.json();
        window.langData = langData;

        if (browserLang !== currentLang) {
            try {
                const testResponse = await fetch(`/langs/${browserLang}.json`);
                if (testResponse.ok) {
                    const browserLangData = await testResponse.json();
                    if (browserLangData.detected) {
                        supportedLangAlert.querySelector('h3').textContent = browserLangData.detected.title;
                        supportedLangAlert.querySelector('.text-xs').textContent = browserLangData.detected.desc;
                        supportedLangAlert.querySelector('.btn-neutral').textContent = browserLangData.detected.no;
                        const changeBtn = supportedLangAlert.querySelector('.btn-primary');
                        changeBtn.textContent = browserLangData.detected.yes;
                        changeBtn.onclick = () => changeLanguage(browserLang);
                        supportedLangAlert.style.display = 'flex';
                    }
                }
            } catch (error) {
                console.error('Error checking browser language:', error);
                supportedLangAlert.style.display = 'none';
            }
        } else {
            supportedLangAlert.style.display = 'none';
        }

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

        if (typeof updateTitleAndPhrases === 'function') {
            await updateTitleAndPhrases();
        }

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