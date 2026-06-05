document.addEventListener('DOMContentLoaded', () => {
    
    // i18n Initialization
    const languageSelect = document.getElementById('language-select');
    let currentLang = localStorage.getItem('siteLang') || 'it';
    languageSelect.value = currentLang;

    function applyLanguage(lang) {
        localStorage.setItem('siteLang', lang);
        currentLang = lang;

        const allTranslations = window.translations || {};

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (allTranslations[lang] && allTranslations[lang][key]) {
                if (element.tagName === 'INPUT') {
                    element.placeholder = allTranslations[lang][key];
                } else {
                    element.innerHTML = allTranslations[lang][key];
                }
            }
        });

        // Form placeholders fallback
        const userInput = document.getElementById('username');
        const passInput = document.getElementById('password');
        if (userInput && passInput && allTranslations[lang]) {
            userInput.placeholder = allTranslations[lang]['auth_placeholder_user'] || '';
            passInput.placeholder = allTranslations[lang]['auth_placeholder_pass'] || '';
        }

        checkAuth();
    }

    languageSelect.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
    });


    // Routing & History Management
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-view');
    const appContent = document.getElementById('app-content');

    if (!history.state) {
        history.replaceState({ target: 'home' }, "", '#home');
    }

    function switchPage(targetPageId, pushToHistory = true) {
        const targetPage = document.getElementById(`page-${targetPageId}`);
        if (!targetPage) return;

        appContent.style.opacity = '0';
        appContent.style.transform = 'scale(0.96) rotate(-1deg)';

        setTimeout(() => {
            pages.forEach(page => page.classList.remove('active'));
            targetPage.classList.add('active');

            if (targetPageId === 'home') {
                initScrollAnimation();
            }

            navLinks.forEach(link => {
                if (link.getAttribute('data-target') === targetPageId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            appContent.style.opacity = '1';
            appContent.style.transform = 'scale(1) rotate(0deg)';

            if (pushToHistory) {
                history.pushState({ target: targetPageId }, "", `#${targetPageId}`);
            }
        }, 250);
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (!link) return;

        e.preventDefault();
        const target = link.getAttribute('data-target');
        if (target) {
            switchPage(target, true);
        }
    });

    // Handle browser navigation (Back/Forward)
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.target) {
            switchPage(e.state.target, false);
        } else if (window.location.hash) {
            const hash = window.location.hash.replace('#', '');
            switchPage(hash, false);
        } else {
            switchPage('home', false);
        }
    });

    // Handle direct URL parsing on load
    if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        switchPage(hash, false);
    }


    // Auth State & LocalStorage DB
    const authForm = document.getElementById('auth-form');
    const authMessage = document.getElementById('auth-message');
    const menuAuth = document.getElementById('menu-auth');
    const menuUser = document.getElementById('menu-user');
    const userDisplay = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');

    function checkAuth() {
        const currentUser = localStorage.getItem('currentUser');
        const allTranslations = window.translations || {};
        
        if (currentUser) {
            if(menuAuth) menuAuth.style.display = 'none'; 
            if(menuUser) menuUser.style.display = 'flex';
            
            const welcomePrefix = (allTranslations[currentLang] && allTranslations[currentLang]['nav_welcome']) || "Ciao, ";
            if(userDisplay) userDisplay.textContent = `${welcomePrefix}${currentUser}!`;
        } else {
            if(menuAuth) menuAuth.style.display = 'block';
            if(menuUser) menuUser.style.display = 'none';
        }
    }

    if (!localStorage.getItem('usersDB')) {
        localStorage.setItem('usersDB', JSON.stringify({}));
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const allTranslations = window.translations || {};
            
            let usersDB = JSON.parse(localStorage.getItem('usersDB'));

            if (usersDB[username]) {
                if (usersDB[username] === password) {
                    localStorage.setItem('currentUser', username);
                    showSuccess(allTranslations[currentLang]['auth_success_login'] + username + "!");
                } else {
                    showError(allTranslations[currentLang]['auth_error_pass']);
                }
            } else {
                usersDB[username] = password;
                localStorage.setItem('usersDB', JSON.stringify(usersDB));
                localStorage.setItem('currentUser', username);
                showSuccess(allTranslations[currentLang]['auth_success_reg'] + username + ".");
            }
        });
    }

    function showSuccess(msg) {
        authMessage.style.color = 'green';
        authMessage.textContent = msg;
        authForm.reset();
        setTimeout(() => {
            checkAuth();
            switchPage('home');
            window.location.hash = 'home';
            authMessage.textContent = '';
        }, 1500);
    }

    function showError(msg) {
        authMessage.style.color = 'red';
        authMessage.textContent = msg;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            checkAuth();
            switchPage('home');
            window.location.hash = 'home';
        });
    }

    applyLanguage(currentLang);
});

// Scroll Animation (Intersection Observer)
function initScrollAnimation() {
    const cards = document.querySelectorAll('.feature-card');
    if (!cards.length) return;

    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const cardsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        card.classList.remove('visible');
        cardsObserver.observe(card);
    });
}

// Trigger scroll animation on landing fallback
if (window.location.hash === '#home' || !window.location.hash) {
    setTimeout(initScrollAnimation, 300);
}