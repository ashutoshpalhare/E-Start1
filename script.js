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
            engineOptionsBox.classList.toggle('active');
        });
    }

    document.querySelectorAll('.engine-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setEngine(e.currentTarget.getAttribute('data-value'));
            engineOptionsBox.classList.remove('active');
        });
    });

    document.addEventListener('click', () => {
        if (engineOptionsBox && engineOptionsBox.classList.contains('active')) {
            engineOptionsBox.classList.remove('active');
        }
    });

    // --- Main Search Execution Logic ---
    const searchInput = document.getElementById('main-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                const engine = currentEngine;
                if (query) {
                    let searchUrl = '';
                    if (engine === 'bing') searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                    else if (engine === 'duckduckgo') searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                    else if (engine === 'yahoo') searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
                    else searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    window.location.href = searchUrl;
                }
            }
        });
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

    // --- Chrome Extension API Logic ---
    function loadHistory() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        if (window.chrome && chrome.history && chrome.history.search) {
            chrome.history.search({text: '', maxResults: 15}, (results) => {
                results.forEach(page => {
                    let fav = getFaviconUrl(page.url);
                    list.innerHTML += `<li><a href="${page.url}" target="_blank"><img src="${fav}" style="width:20px;height:20px;border-radius:50%;"><span>${page.title || page.url}</span></a><small class="text-muted">${new Date(page.lastVisitTime).toLocaleTimeString()}</small></li>`;
                });
                if(results.length === 0) list.innerHTML = '<li>No history entries found.</li>';
            });
        } else {
            list.textContent = 'Browsing history is available when E-Start runs as a compatible browser extension.';
        }
    }

    function loadBookmarks() {
        const list = document.getElementById('bookmarks-list');
        list.innerHTML = '';
        if (window.chrome && chrome.bookmarks && chrome.bookmarks.getRecent) {
            chrome.bookmarks.getRecent(15, (results) => {
                results.forEach(mark => {
                    let fav = mark.url ? getFaviconUrl(mark.url) : '';
                    list.innerHTML += `<li><a href="${mark.url}" target="_blank">${fav ? `<img src="${fav}" style="width:20px;height:20px;border-radius:50%;">` : '<i class="bi bi-folder"></i>'}<span>${mark.title || mark.url}</span></a></li>`;
                });
                if(results.length === 0) list.innerHTML = '<li>No bookmarks found.</li>';
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
            dockContainer.innerHTML = '';
            speedDials.forEach(dial => {
                const fav = getFaviconUrl(dial.url);
                dockContainer.innerHTML += `
                    <a href="${dial.url}" class="dock-icon" title="${dial.name}">
                        <img src="${fav}" alt="${dial.name}">
                    </a>`;
            });
        }
        
        if (settingsDialList) {
            settingsDialList.innerHTML = '';
            speedDials.forEach((dial, index) => {
                const fav = getFaviconUrl(dial.url);
                settingsDialList.innerHTML += `
                    <li class="dial-config-item">
                        <div style="display:flex; gap:10px; align-items:center;">
                           <img src="${fav}" style="width:24px;height:24px;border-radius:50%;">
                           <span style="font-weight:500;">${dial.name}</span>
                        </div>
                        <button class="spatial-btn" data-index="${index}" style="padding: 5px 10px; background: transparent;"><i class="bi bi-trash" style="color:#ff5e5e;"></i></button>
                    </li>
                `;
            });
            
            settingsDialList.querySelectorAll('.spatial-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.currentTarget.getAttribute('data-index');
                    speedDials.splice(idx, 1);
                    saveDials();
                    renderDials();
                });
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
