/* Count-up Animation */
window.initCounters = function() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            
            // Lower increment for smoother animation on small numbers
            const inc = Math.ceil(target / speed);

            if (count < target) {
                counter.innerText = count + inc;
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// Mark home.js as loaded for global.js router
window.initHome = true;

// document.addEventListener('DOMContentLoaded', () => {
//     try { initMusicPlayer(); } catch(e) { console.error(e); }
//     try { initQuotes(); } catch(e) { console.error(e); }
//     try { initTimeAndLocation(); } catch(e) { console.error(e); }
//     try { initCounters(); } catch(e) { console.error(e); }
// });

/* Music Player Logic */
window.initMusicPlayer = function() {
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const musicCover = document.getElementById('music-cover');
    const progress = document.getElementById('progress');
    const progressContainer = document.getElementById('progress-container');
    if (!playBtn || !prevBtn || !nextBtn || !songTitle || !songArtist || !playIcon || !pauseIcon || !musicCover || !progress || !progressContainer) return;

    const player = window.GlobalApp && window.GlobalApp.player ? window.GlobalApp.player : null;
    if (!player || !player.audio) return;

    let isDragging = false;

    function updateMeta(song) {
        songTitle.textContent = song.title || '';
        songArtist.textContent = song.artist || '';
        if (song.cover) {
            musicCover.style.backgroundImage = `url('${song.cover}')`;
        }
    }

    function updateState(state) {
        const isPlaying = state === 'playing';
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            musicCover.style.animationPlayState = 'running';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            musicCover.style.animationPlayState = 'paused';
        }
    }

    function updateTime({ currentTime, duration }) {
        if (isDragging) return;
        if (!duration) {
            progress.style.width = '0%';
            return;
        }
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }

    function updateDrag(e) {
        const rect = progressContainer.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;
        const progressPercent = (offsetX / rect.width) * 100;
        progress.style.width = `${progressPercent}%`;
    }

    function finishDrag(e) {
        const rect = progressContainer.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;
        const progressPercent = (offsetX / rect.width) * 100;
        player.seek(progressPercent);
        progress.style.width = `${progressPercent}%`;
    }

    player.bindUI((type, payload) => {
        if (type === 'meta') updateMeta(payload);
        if (type === 'state') updateState(payload);
        if (type === 'time') updateTime(payload);
    });

    playBtn.addEventListener('click', () => player.toggle());
    prevBtn.addEventListener('click', () => player.prev());
    nextBtn.addEventListener('click', () => player.next());

    progressContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateDrag(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) updateDrag(e);
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        finishDrag(e);
    });

    const savedState = localStorage.getItem('music_state');
    if (!savedState) {
        player.play();
    }
}

/* Quotes & Gallery Logic */
window.initQuotes = function() {
    // Cleanup previous intervals if any
    if (window.homeIntervals) {
        window.homeIntervals.forEach(clearInterval);
        window.homeIntervals = [];
    } else {
        window.homeIntervals = [];
    }

    const assetVersion = '20260513';
    const defaultQuotes = [
        '青山不改，绿水长流。',
        '生活明朗，万物可爱。',
        '星光不问赶路人，时光不负有心人。',
        '热爱可抵岁月漫长。',
        '前程似锦，未来可期。',
        '山河远阔，人间烟火。',
        '满眼星辰，尽是温柔。',
        '初心不改，方得始终。'
    ];
    const quoteText = document.getElementById('quote-text');
    const img1 = document.getElementById('gallery-img-1');
    const img2 = document.getElementById('gallery-img-2');
    const refreshBtn = document.getElementById('quote-refresh-btn');
    const hasQuoteUI = Boolean(quoteText && refreshBtn);
    const hasGalleryUI = Boolean(img1 && img2);

    if (!hasQuoteUI && !hasGalleryUI) return;

    // Gallery Configuration
    const galleryImages = [];
    for (let i = 1; i <= 15; i++) {
        galleryImages.push(`./static/img/gallery/${i}.jpg?v=${assetVersion}`);
    }
    
    // Animation Configuration
    const animations = [
        'anim-left', 'anim-right', 'anim-top', 'anim-bottom', 
        'anim-zoom', 'anim-zoom-out', 'anim-rotate', 'anim-blur', 'anim-fade-move'
    ];
    
    // State Variables
    let quoteTimer = null;
    let galleryTimer = null;
    let quoteIndex = 0;
    let galleryIndex = 0;
    let animIndex = 0;
    
    // Active Buffer State (1 or 2)
    let activeBuffer = 1; 

    async function fetchQuotes() {
        try {
            const response = await fetch(`./static/quotes/quotes.txt?v=${assetVersion}`);
            if (!response.ok) {
                throw new Error(`Quote request failed: ${response.status}`);
            }
            const text = await response.text();
            const lines = text
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean);
            if (lines.length === 0) {
                return defaultQuotes;
            }
            return lines;
        } catch (error) {
            console.error('Error loading quotes:', error);
            return defaultQuotes;
        }
    }
    
    async function refreshQuote() {
        if (!quoteText) return;
        const quotes = await fetchQuotes();
        
        // Use sequential index
        const currentQuote = quotes[quoteIndex];
        quoteIndex = (quoteIndex + 1) % quotes.length;
        
        // Fade out
        quoteText.style.opacity = 0;
        
        setTimeout(() => {
            quoteText.textContent = currentQuote;
            quoteText.style.opacity = 1;
        }, 500); // Wait for fade out
    }
    
    function refreshGallery() {
        if (!img1 || !img2) return;
        if (galleryImages.length === 0) return;
        
        // Determine which is active and which is next
        const currentImgEl = activeBuffer === 1 ? img1 : img2;
        const nextImgEl = activeBuffer === 1 ? img2 : img1;
        
        // Get next content info
        const nextImgSrc = galleryImages[galleryIndex];
        galleryIndex = (galleryIndex + 1) % galleryImages.length;
        
        const nextAnim = animations[animIndex];
        animIndex = (animIndex + 1) % animations.length;
        
        // Preload next image
        const tempImg = new Image();
        tempImg.src = nextImgSrc;
        
        tempImg.onload = () => {
            // Set source to the inactive element
            nextImgEl.src = nextImgSrc;
            
            // Reset classes
            nextImgEl.className = 'gallery-image inactive-image';
            void nextImgEl.offsetWidth; // Force reflow
            
            // Apply animation and active state
            // We want nextImgEl to become active (visible, z-index 1)
            // and currentImgEl to become inactive (hidden, z-index 0)
            
            // Note: Our CSS defines .active-image { opacity: 1; z-index: 1 }
            // and .inactive-image { opacity: 0; z-index: 0 }
            
            // Add animation class to the entering image
            nextImgEl.classList.add(nextAnim);
            
            // Swap states
            nextImgEl.classList.remove('inactive-image');
            nextImgEl.classList.add('active-image');
            
            currentImgEl.classList.remove('active-image');
            currentImgEl.classList.add('inactive-image');
            
            // Remove animation class from old image after transition
            setTimeout(() => {
                currentImgEl.className = 'gallery-image inactive-image';
            }, 1500); // Wait for transition/animation duration
            
            // Toggle buffer state
            activeBuffer = activeBuffer === 1 ? 2 : 1;
        };
        
        // Handle error (skip if image fails)
        tempImg.onerror = () => {
            console.error('Failed to load image:', nextImgSrc);
            // Try next one immediately
            refreshGallery();
        };
    }

    // Manual refresh button (Refreshes quote immediately)
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            refreshQuote();
            clearInterval(quoteTimer);
            const idx = window.homeIntervals.indexOf(quoteTimer);
            if (idx > -1) window.homeIntervals.splice(idx, 1);

            quoteTimer = setInterval(refreshQuote, 5000);
            window.homeIntervals.push(quoteTimer);
        });
    }
    
    // Initial Load
    if (hasQuoteUI) {
        refreshQuote();
        quoteTimer = setInterval(refreshQuote, 5000);
        window.homeIntervals.push(quoteTimer);
    }

    if (hasGalleryUI && galleryImages.length > 0) {
        img1.src = galleryImages[0];
        img1.classList.add('active-image');
        galleryIndex = 1; // Start next refresh from index 1
    }

    if (hasGalleryUI) {
        galleryTimer = setInterval(refreshGallery, 4000);
        window.homeIntervals.push(galleryTimer);
    }
}

/* Time & Location & Weather Logic */
window.initTimeAndLocation = function() {
    const timeDisplay = document.getElementById('time-display');
    const locationDisplay = document.getElementById('location-display');
    const weatherIconContainer = document.getElementById('weather-icon');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherDesc = document.getElementById('weather-desc');

    if (!timeDisplay || !locationDisplay) return;

    // Update Time
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\//g, '-'); 
        
        timeDisplay.textContent = timeString;
    }
    const timeTimer = setInterval(updateTime, 1000);
    if (window.homeIntervals) window.homeIntervals.push(timeTimer);
    updateTime();

    // Get Location (using ip-api.com for free non-SSL IP geolocation)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 缩短超时时间到3秒

    // 默认坐标（上海）作为兜底
    const DEFAULT_LAT = 31.2304;
    const DEFAULT_LON = 121.4737;
    const DEFAULT_LOC_NAME = "上海 (默认)";

    fetch('http://ip-api.com/json/?lang=zh-CN', { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
            clearTimeout(timeoutId);
            if (data.status === 'success') {
                locationDisplay.textContent = `${data.country} · ${data.city}`;
                fetchWeather(data.lat, data.lon);
            } else {
                throw new Error("Location API status not success");
            }
        })
        .catch(err => {
            clearTimeout(timeoutId);
            console.warn("Location fetch failed, using default:", err);
            // 定位失败时，使用默认坐标
            locationDisplay.textContent = DEFAULT_LOC_NAME;
            fetchWeather(DEFAULT_LAT, DEFAULT_LON);
        });
        
    function fetchWeather(lat, lon) {
        if(!weatherTemp || !weatherDesc) return;
        
        // Open-Meteo API
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
        
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if(data.current_weather) {
                    const { temperature, weathercode } = data.current_weather;
                    weatherTemp.textContent = `${temperature}°C`;
                    
                    const weatherInfo = getWeatherInfo(weathercode);
                    weatherDesc.textContent = weatherInfo.desc;
                    if(weatherIconContainer) weatherIconContainer.innerHTML = weatherInfo.icon;
                } else {
                    throw new Error("No weather data");
                }
            })
            .catch(err => {
                console.error("Weather fetch failed:", err);
                weatherDesc.textContent = "暂无数据";
                // 即使失败，也显示一个默认图标防止太丑
                if(weatherIconContainer) weatherIconContainer.innerHTML = getWeatherInfo(0).icon;
            });
    }
    
    function getWeatherInfo(code) {
        // Icons (SVGs)
        const icons = {
            sunny: `<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ffeb3b;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
            cloudy: `<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #dfe6e9;"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
            rain: `<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #74b9ff;"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`,
            snow: `<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #fff;"><path d="M20 17.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>`,
            thunder: `<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #fdcb6e;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
            fog: `<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #b2bec3;"><line x1="4" y1="15" x2="20" y2="15"></line><line x1="4" y1="19" x2="20" y2="19"></line><line x1="4" y1="11" x2="20" y2="11"></line><line x1="4" y1="7" x2="20" y2="7"></line></svg>`
        };
        
        if (code === 0) return { desc: "晴", icon: icons.sunny };
        if (code >= 1 && code <= 3) return { desc: "多云", icon: icons.cloudy };
        if (code === 45 || code === 48) return { desc: "雾", icon: icons.fog };
        if (code >= 51 && code <= 67) return { desc: "雨", icon: icons.rain };
        if (code >= 71 && code <= 77) return { desc: "雪", icon: icons.snow };
        if (code >= 80 && code <= 82) return { desc: "阵雨", icon: icons.rain };
        if (code >= 85 && code <= 86) return { desc: "阵雪", icon: icons.snow };
        if (code >= 95 && code <= 99) return { desc: "雷雨", icon: icons.thunder };
        
        return { desc: "多云", icon: icons.cloudy };
    }
}
