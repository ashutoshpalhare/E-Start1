document.addEventListener('DOMContentLoaded', () => {

    // --- Optional Vanta background enhancement ---
    const backgroundElement = document.getElementById('vanta-bg');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let vantaEffect = null;

    if (!prefersReducedMotion && backgroundElement && window.VANTA?.WAVES) {
        try {
            vantaEffect = window.VANTA.WAVES({
                el: backgroundElement,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200,
                minWidth: 200,
                scale: 1,
                scaleMobile: 1,
                color: 0x15182e,
                shininess: 40,
                waveHeight: 15,
                waveSpeed: 0.8,
                zoom: 0.8
            });
        } catch (error) {
            console.warn('Animated background could not be initialized; using static background.', error);
        }
    }

    window.addEventListener('pagehide', () => {
        if (vantaEffect && typeof vantaEffect.destroy === 'function') {
            vantaEffect.destroy();
            vantaEffect = null;
        }
    }, { once: true });

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
        
        if (greetingElement) greetingElement.textContent = `${greeting}, Mr. Ashutosh.`;
        
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
        document.querySelectorAll('.engine-option').forEach((option) => {
            option.setAttribute('aria-pressed', String(option.getAttribute('data-value') === val));
        });
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
        engineOptionsBox.addEventListener('keydown', (event) => {
            const options = Array.from(engineOptionsBox.querySelectorAll('.engine-option'));
            if (!options.length) return;

            const currentIndex = options.indexOf(document.activeElement);
            let nextIndex = currentIndex;
            if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % options.length;
            else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + options.length) % options.length;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = options.length - 1;
            else if (event.key === 'Escape') {
                engineOptionsBox.classList.remove('active');
                engineToggle?.setAttribute('aria-expanded', 'false');
                engineToggle?.focus();
                return;
            } else {
                return;
            }

            event.preventDefault();
            options[nextIndex].focus();
        });
    }

    // --- Accessible Modals Logic ---
    const modals = document.querySelectorAll('.spatial-modal');
    let previouslyFocusedElement = null;

    function closeModals(restoreFocus = true) {
        modals.forEach((modal) => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        });
        if (restoreFocus && previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
        if (restoreFocus) previouslyFocusedElement = null;
    }

    document.querySelectorAll('.sheet-close').forEach((button) => {
        button.addEventListener('click', closeModals);
    });

    modals.forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModals();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.querySelector('.spatial-modal.active')) {
            closeModals();
        }
    });

    function openModal(id) {
        const target = document.getElementById(id);
        if (!target) return;
        const trigger = document.activeElement;
        closeModals(false);
        previouslyFocusedElement = trigger;
        target.classList.add('active');
        target.setAttribute('aria-hidden', 'false');
        const closeButton = target.querySelector('.sheet-close');
        (closeButton || target).focus();
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
            if (!speedDials.length) {
                const emptyState = document.createElement('li');
                emptyState.className = 'text-muted';
                emptyState.textContent = 'No shortcuts yet. Add one above to populate your dock.';
                settingsDialList.append(emptyState);
            }

            speedDials.forEach((dial, index) => {
                const safeUrl = parseWebUrl(dial.url);
                const item = document.createElement('li');
                item.className = 'dial-config-item';

                const details = document.createElement('div');
                details.style.cssText = 'display:flex; gap:10px; align-items:center; min-width:0;';
                if (safeUrl) details.append(createFavicon(safeUrl.href, ''));
                const name = document.createElement('span');
                name.style.fontWeight = '500';
                name.textContent = dial.name;
                name.title = dial.name;
                details.append(name);

                const actions = document.createElement('div');
                actions.style.cssText = 'display:flex; gap:6px; align-items:center;';

                if (safeUrl) {
                    const openLink = document.createElement('a');
                    openLink.href = safeUrl.href;
                    openLink.target = '_blank';
                    openLink.rel = 'noopener noreferrer';
                    openLink.className = 'spatial-btn';
                    openLink.style.cssText = 'padding:5px 10px; background:transparent;';
                    openLink.setAttribute('aria-label', `Open ${dial.name} in a new tab`);
                    const openIcon = document.createElement('i');
                    openIcon.className = 'bi bi-box-arrow-up-right';
                    openIcon.setAttribute('aria-hidden', 'true');
                    openLink.append(openIcon);
                    actions.append(openLink);
                }

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'spatial-btn';
                removeButton.style.cssText = 'padding:5px 10px; background:transparent;';
                removeButton.setAttribute('aria-label', `Remove ${dial.name}`);
                const icon = document.createElement('i');
                icon.className = 'bi bi-trash';
                icon.style.color = '#ff5e5e';
                icon.setAttribute('aria-hidden', 'true');
                removeButton.append(icon);
                removeButton.addEventListener('click', () => {
                    const [removedDial] = speedDials.splice(index, 1);
                    if (!saveDials()) {
                        speedDials.splice(index, 0, removedDial);
                        showDialFeedback('Could not save this change. Your shortcut was kept.', true);
                    } else {
                        showDialFeedback(`Removed ${removedDial.name} from your dock.`);
                    }
                    renderDials();
                });

                actions.append(removeButton);
                item.append(details, actions);
                settingsDialList.append(item);
            });
        }
    }

    const addDialBtn = document.getElementById('add-dial-btn');
    const dialNameInput = document.getElementById('dial-name');
    const dialUrlInput = document.getElementById('dial-url');
    const dialFeedback = document.getElementById('dial-feedback');

    function showDialFeedback(message, isError = false) {
        if (!dialFeedback) return;
        dialFeedback.textContent = message;
        dialFeedback.dataset.state = isError ? 'error' : 'success';
    }

    function addSpeedDial() {
        const name = dialNameInput?.value.trim() || '';
        const rawUrl = dialUrlInput?.value.trim() || '';
        const safeUrl = parseWebUrl(rawUrl);

        if (!name || !rawUrl) {
            showDialFeedback('Enter both a shortcut name and URL.', true);
            return;
        }
        if (name.length > 40) {
            showDialFeedback('Shortcut names must be 40 characters or fewer.', true);
            return;
        }
        if (!safeUrl) {
            showDialFeedback('Enter a valid HTTP or HTTPS URL.', true);
            return;
        }
        if (speedDials.length >= 30) {
            showDialFeedback('You have reached the 30-shortcut limit.', true);
            return;
        }
        const duplicate = speedDials.some((dial) => {
            const existingUrl = parseWebUrl(dial.url);
            return existingUrl && existingUrl.href.toLowerCase() === safeUrl.href.toLowerCase();
        });
        if (duplicate) {
            showDialFeedback('That URL is already in your shortcuts.', true);
            return;
        }

        const newDial = { name, url: safeUrl.href };
        speedDials.push(newDial);
        if (!saveDials()) {
            speedDials.pop();
            showDialFeedback('Could not save this shortcut. Check your browser storage settings.', true);
            return;
        }

        if (dialNameInput) dialNameInput.value = '';
        if (dialUrlInput) dialUrlInput.value = '';
        showDialFeedback('Shortcut added to your dock.');
        renderDials();
        dialNameInput?.focus();
    }

    addDialBtn?.addEventListener('click', addSpeedDial);
    [dialNameInput, dialUrlInput].forEach((input) => {
        input?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addSpeedDial();
            }
        });
        input?.addEventListener('input', () => showDialFeedback(''));
    });

    renderDials();

});
