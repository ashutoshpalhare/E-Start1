document.addEventListener('DOMContentLoaded', () => {

    // --- Vanta JS 3D Waves Background Init ---
    if (typeof VANTA !== 'undefined' && VANTA.WAVES) {
        VANTA.WAVES({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x15182e,
            shininess: 40.00,
            waveHeight: 15.00,
            waveSpeed: 0.80,
            zoom: 0.8
        });
    }

    // --- Clock, Date and Greeting Logic ---
    const clockElement = document.getElementById('live-clock');
    const ampmElement = document.getElementById('live-ampm');
    const greetingElement = document.getElementById('greeting-text');

    function updateTime() {
        const now = new Date();
        let hours24 = now.getHours();
        let minutes = now.getMinutes();
        let ampm = hours24 >= 12 ? 'PM' : 'AM';
        let hours12 = hours24 % 12;
        hours12 = hours12 ? hours12 : 12; 
        
        let greeting = 'Welcome';
        if (hours24 >= 5 && hours24 < 12) greeting = 'Good Morning';
        else if (hours24 >= 12 && hours24 < 17) greeting = 'Good Afternoon';
        else if (hours24 >= 17 && hours24 < 22) greeting = 'Good Evening';
        else greeting = 'Good Night';
        
        if (greetingElement) greetingElement.innerHTML = `${greeting}, Mr. Ashutosh.`;
        
        hours12 = hours12 < 10 ? '0' + hours12 : hours12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        if (clockElement) clockElement.textContent = `${hours12}:${minutes}`;
        if (ampmElement) ampmElement.textContent = ampm;
    }

    setInterval(updateTime, 1000);
    updateTime();

    // --- Tracker URL helper for Favicons ---
    function getFaviconUrl(url) {
        return `https://s2.googleusercontent.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=128`;
    }

    // --- Search Engine Custom Dropdown Logic ---
    const engineToggle = document.getElementById('engine-dropdown-toggle');
    const engineOptionsBox = document.getElementById('engine-options-box');
    const currentEngineIcon = document.getElementById('current-engine-icon');
    const allowedEngines = ['google', 'bing', 'duckduckgo', 'yahoo'];
    let currentEngine = 'google';
    try {
        const storedEngine = localStorage.getItem('spatial_engine');
        if (allowedEngines.includes(storedEngine)) currentEngine = storedEngine;
    } catch (error) {
        console.warn('Search preference storage is unavailable.', error);
    }

    function setEngine(val) {
        if (!allowedEngines.includes(val)) return;
        currentEngine = val;
        try { localStorage.setItem('spatial_engine', val); } catch (error) {
            console.warn('Could not save search preference.', error);
        }
        const domains = { google: 'google.com', bing: 'bing.com', duckduckgo: 'duckduckgo.com', yahoo: 'yahoo.com' };
        if (currentEngineIcon) currentEngineIcon.src = getFaviconUrl(`https://${domains[val]}`);
    }

    setEngine(currentEngine);

    if (engineToggle) {
        engineToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!engineOptionsBox) return;
            const isOpen = engineOptionsBox.classList.toggle('active');
            engineToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    document.querySelectorAll('.engine-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setEngine(e.currentTarget.getAttribute('data-value'));
            engineOptionsBox?.classList.remove('active');
            engineToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', () => {
        if (engineOptionsBox?.classList.contains('active')) {
            engineOptionsBox.classList.remove('active');
            engineToggle?.setAttribute('aria-expanded', 'false');
        }
    });

    // --- Main Search Execution Logic ---
    const searchInput = document.getElementById('main-search');
    const searchUrls = {
        google: 'https://www.google.com/search?q=',
        bing: 'https://www.bing.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        yahoo: 'https://search.yahoo.com/search?p='
    };

    function submitSearch() {
        const query = searchInput?.value.trim();
        if (!query) {
            searchInput?.focus();
            return;
        }
        const baseUrl = searchUrls[currentEngine] || searchUrls.google;
        window.location.assign(`${baseUrl}${encodeURIComponent(query)}`);
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitSearch();
            }
        });
    }

    if (engineOptionsBox) {
        engineOptionsBox.addEventListener('click', (event) => event.stopPropagation());
    }

    // --- Modals Logic ---
    const modals = document.querySelectorAll('.spatial-modal');
    document.querySelectorAll('.sheet-close').forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(m => m.classList.remove('active'));
        });
    });

    function openModal(id) {
        modals.forEach(m => m.classList.remove('active'));
        const target = document.getElementById(id);
        if (target) target.classList.add('active');
    }

    const histBtn = document.getElementById('history-btn');
    const bookBtn = document.getElementById('bookmarks-btn');
    const setBtn = document.getElementById('settings-btn');
    const appsBtn = document.getElementById('apps-btn');
    
    if(histBtn) histBtn.addEventListener('click', () => { openModal('modal-history'); loadHistory(); });
    if(bookBtn) bookBtn.addEventListener('click', () => { openModal('modal-bookmarks'); loadBookmarks(); });
    if(setBtn) setBtn.addEventListener('click', () => { openModal('modal-settings'); renderDials(); });
    if(appsBtn) appsBtn.addEventListener('click', () => { openModal('modal-apps'); });

    // --- Safe rendering helpers ---
    function parseWebUrl(value) {
        try {
            const url = new URL(value);
            return ['http:', 'https:'].includes(url.protocol) ? url : null;
        } catch {
            return null;
        }
    }

    function createFavicon(url, alt = '') {
        const image = document.createElement('img');
        image.src = getFaviconUrl(url);
        image.alt = alt;
        image.width = 20;
        image.height = 20;
        image.loading = 'lazy';
        image.referrerPolicy = 'no-referrer';
        image.style.borderRadius = '50%';
        return image;
    }

    function createDataListItem({ title, url, time }) {
        const item = document.createElement('li');
        const safeUrl = parseWebUrl(url);

        if (safeUrl) {
            const link = document.createElement('a');
            link.href = safeUrl.href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.append(createFavicon(safeUrl.href));
            const label = document.createElement('span');
            label.textContent = title || safeUrl.hostname;
            link.append(label);
            item.append(link);
        } else {
            item.textContent = title || 'Unavailable item';
        }

        if (time) {
            const timestamp = document.createElement('small');
            timestamp.className = 'text-muted';
            timestamp.textContent = time;
            item.append(timestamp);
        }
        return item;
    }

    // --- Chrome Extension API Logic ---
    function loadHistory() {
        const list = document.getElementById('history-list');
        if (!list) return;
        list.replaceChildren();

        if (window.chrome?.history?.search) {
            chrome.history.search({ text: '', maxResults: 15 }, (results = []) => {
                if (chrome.runtime?.lastError) {
                    list.textContent = 'Could not load browsing history.';
                    return;
                }
                if (!results.length) {
                    list.textContent = 'No history entries found.';
                    return;
                }
                results.forEach((page) => {
                    const time = page.lastVisitTime
                        ? new Date(page.lastVisitTime).toLocaleTimeString()
                        : '';
                    list.append(createDataListItem({
                        title: page.title,
                        url: page.url,
                        time
                    }));
                });
            });
        } else {
            list.textContent = 'Browsing history is available when E-Start runs as a compatible browser extension.';
        }
    }

    function loadBookmarks() {
        const list = document.getElementById('bookmarks-list');
        if (!list) return;
        list.replaceChildren();

        if (window.chrome?.bookmarks?.getRecent) {
            chrome.bookmarks.getRecent(15, (results = []) => {
                if (chrome.runtime?.lastError) {
                    list.textContent = 'Could not load bookmarks.';
                    return;
                }
                if (!results.length) {
                    list.textContent = 'No bookmarks found.';
                    return;
                }
                results.forEach((mark) => {
                    list.append(createDataListItem({
                        title: mark.title,
                        url: mark.url
                    }));
                });
            });
        } else {
            list.textContent = 'Bookmarks are available when E-Start runs as a compatible browser extension.';
        }
    }

    // --- Safe browser storage helpers ---
    function readStoredValue(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (error) {
            console.warn(`Storage read failed for "${key}".`, error);
            return fallback;
        }
    }

    function writeStoredValue(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.warn(`Storage write failed for "${key}".`, error);
            return false;
        }
    }

    function parseStoredJSON(key, fallback) {
        const rawValue = readStoredValue(key);
        if (!rawValue) return fallback;
        try {
            return JSON.parse(rawValue);
        } catch (error) {
            console.warn(`Stored data for "${key}" is invalid; using defaults.`, error);
            return fallback;
        }
    }

    // --- Speed Dial Dock Config ---
    const dockContainer = document.getElementById('speed-dial-dock');
    const settingsDialList = document.getElementById('settings-dial-list');

    const defaultDials = [
        { name: "Google", url: "https://google.com" },
        { name: "YouTube", url: "https://youtube.com" },
        { name: "Gmail", url: "https://mail.google.com" },
        { name: "WhatsApp", url: "https://web.whatsapp.com" },
        { name: "GitHub", url: "https://github.com" },
        { name: "Netflix", url: "https://netflix.com" }
    ];

    const storedDials = parseStoredJSON('spatial_dials', defaultDials);
    let speedDials = Array.isArray(storedDials)
        ? storedDials.filter((dial) =>
            dial && typeof dial.name === 'string' &&
            typeof dial.url === 'string' && dial.name.trim() && dial.url.trim()
        ).slice(0, 30)
        : defaultDials;

    function saveDials() {
        return writeStoredValue('spatial_dials', JSON.stringify(speedDials));
    }

    function renderDials() {
        if (dockContainer) {
            dockContainer.replaceChildren();
            speedDials.forEach((dial) => {
                const safeUrl = parseWebUrl(dial.url);
                if (!safeUrl) return;

                const link = document.createElement('a');
                link.href = safeUrl.href;
                link.className = 'dock-icon';
                link.title = dial.name;
                link.setAttribute('aria-label', dial.name);
                link.append(createFavicon(safeUrl.href, dial.name));
                dockContainer.append(link);
            });
        }

        if (settingsDialList) {
            settingsDialList.replaceChildren();
            speedDials.forEach((dial, index) => {
                const safeUrl = parseWebUrl(dial.url);
                const item = document.createElement('li');
                item.className = 'dial-config-item';

                const details = document.createElement('div');
                details.style.cssText = 'display:flex; gap:10px; align-items:center;';
                if (safeUrl) details.append(createFavicon(safeUrl.href, ''));
                const name = document.createElement('span');
                name.style.fontWeight = '500';
                name.textContent = dial.name;
                details.append(name);

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'spatial-btn';
                removeButton.dataset.index = String(index);
                removeButton.style.cssText = 'padding:5px 10px; background:transparent;';
                removeButton.setAttribute('aria-label', `Remove ${dial.name}`);
                const icon = document.createElement('i');
                icon.className = 'bi bi-trash';
                icon.style.color = '#ff5e5e';
                removeButton.append(icon);
                removeButton.addEventListener('click', () => {
                    speedDials.splice(index, 1);
                    saveDials();
                    renderDials();
                });

                item.append(details, removeButton);
                settingsDialList.append(item);
            });
        }
    }

    const addDialBtn = document.getElementById('add-dial-btn');
    if (addDialBtn) {
        addDialBtn.addEventListener('click', () => {
            const name = document.getElementById('dial-name').value.trim();
            const url = document.getElementById('dial-url').value.trim();
            if (name && url) {
                speedDials.push({ name: name, url: url });
                document.getElementById('dial-name').value = '';
                document.getElementById('dial-url').value = '';
                saveDials();
                renderDials();
            }
        });
    }

    renderDials();

});
