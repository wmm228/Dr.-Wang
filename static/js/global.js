/**
 * Global Application Logic
 * Handles PJAX navigation and Persistent Music Player
 */

// Global Fetch Interceptor for Cache Busting (Dev Mode)
(function() {
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string') {
            // Check if it's a local static file (starts with . or / or relative)
            // and not already versioned (to avoid double params if not needed, but safer to just add)
            if (!url.startsWith('http') || url.includes('localhost') || url.includes('127.0.0.1')) {
                const separator = url.includes('?') ? '&' : '?';
                // Add a unique timestamp to force browser to ignore cache
                url = url + separator + '_t=' + new Date().getTime();
            }
        }
        return originalFetch(url, options);
    };
})();

window.pjaxActive = false; // Disable unstable partial-page navigation

const GlobalApp = {
    init: function() {
        this.initAudio();
        if (window.pjaxActive) {
            this.initPjax();
        }
        this.handleInitialLoad();
    },

    // =========================================
    // Persistent Audio Player
    // =========================================
    player: {
        audio: null,
        playlist: [
            { 
                title: "将爱却晚秋", 
                artist: "灯叔", 
                src: "./static/music/love_late_autumn.mp3",
                cover: "./static/img/logo.png?v=20260204" 
            }
        ],
        currentIndex: 0,
        isPlaying: false,
        
        // UI Callbacks (for when UI is present)
        onUpdate: null, 
        
        init: function() {
            // Check if audio element exists, if not create it
            let audio = document.getElementById('global-audio') || document.getElementById('bg-music');
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = 'global-audio';
                document.body.appendChild(audio);
            } else if (audio.id !== 'global-audio') {
                audio.id = 'global-audio';
            }
            this.audio = audio;
            
            // Bind Events
            this.audio.addEventListener('timeupdate', () => {
                if (this.onUpdate) this.onUpdate('time', {
                    currentTime: this.audio.currentTime,
                    duration: this.audio.duration
                });
                this.saveState();
            });
            
            this.audio.addEventListener('ended', () => this.next());
            
            // Restore State
            this.restoreState();
        },

        load: function(index) {
            this.currentIndex = index;
            const song = this.playlist[this.currentIndex];
            this.audio.src = song.src;
            this.audio.currentTime = 0;
            if (this.onUpdate) this.onUpdate('meta', song);
            this.saveState();
        },

        play: function() {
            this.isPlaying = true;
            this.audio.play().then(() => {
                this.saveState();
            }).catch(e => {
                console.warn("Auto-play prevented:", e);
                this.isPlaying = false;
                if (this.onUpdate) this.onUpdate('state', 'paused');
                this.saveState();
            });
            if (this.onUpdate) this.onUpdate('state', 'playing');
        },

        pause: function() {
            this.isPlaying = false;
            this.audio.pause();
            if (this.onUpdate) this.onUpdate('state', 'paused');
            this.saveState();
        },

        toggle: function() {
            if (this.isPlaying) this.pause();
            else this.play();
        },

        next: function() {
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
            this.load(this.currentIndex);
            this.play();
        },

        prev: function() {
            this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            this.load(this.currentIndex);
            this.play();
        },

        seek: function(percent) {
            if (this.audio.duration) {
                this.audio.currentTime = (percent / 100) * this.audio.duration;
                this.saveState();
            }
        },

        saveState: function() {
            localStorage.setItem('music_state', JSON.stringify({
                index: this.currentIndex,
                currentTime: this.audio.currentTime,
                isPlaying: this.isPlaying
            }));
        },

        restoreState: function() {
            let state;
            try {
                state = JSON.parse(localStorage.getItem('music_state'));
            } catch (e) {
                console.warn('Invalid music state in localStorage, resetting.');
            }

            if (state) {
                this.currentIndex = state.index || 0;
                
                // Validate index against current playlist length
                if (this.currentIndex >= this.playlist.length || this.currentIndex < 0) {
                    console.warn('Saved music index out of bounds, resetting to 0.');
                    this.currentIndex = 0;
                }

                // Fix for legacy file path issue
                if (this.playlist[this.currentIndex] && this.playlist[this.currentIndex].src.includes('%E7%81%AF%E5%8F%94')) {
                     this.playlist[this.currentIndex].src = "./static/music/love_late_autumn.mp3";
                }
                
                this.load(this.currentIndex);
                this.audio.currentTime = state.currentTime || 0;
                // Auto-play if it was playing
                if (state.isPlaying) {
                    this.play();
                }
            } else {
                this.load(0);
            }
        },
        
        // Bind a UI controller (e.g., Home Page Card)
        bindUI: function(callbacks) {
            this.onUpdate = callbacks;
            // Immediate update
            const song = this.playlist[this.currentIndex];
            if (this.onUpdate) {
                this.onUpdate('meta', song);
                this.onUpdate('state', this.isPlaying ? 'playing' : 'paused');
                this.onUpdate('time', {
                    currentTime: this.audio.currentTime,
                    duration: this.audio.duration
                });
            }
        }
    },

    initAudio: function() {
        this.player.init();
    },

    // =========================================
    // PJAX Navigation
    // =========================================
    initPjax: function() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                const href = link.getAttribute('href');
                // Check if internal link
                if (href && (href.startsWith('./') || href.startsWith('/') || !href.includes('http')) && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    // Ignore download links, new tab, or explicitly non-pjax links
                    if (link.target === '_blank' || link.hasAttribute('download') || link.getAttribute('data-pjax') === 'false') return;

                    // Also ignore specific standalone pages (Resume, Lab, Gallery, Drive)
                    if (href.includes('resume/') || href.includes('resources.html') || href.includes('lab.html') || href.includes('gallery.html')) return;

                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });

        window.addEventListener('popstate', (e) => {
            // e.state is null on initial load, but popstate fires on back/forward
            // We should load the page associated with the current location
            this.loadPage(window.location.href);
        });
    },

    navigate: function(url) {
        window.location.href = url;
    },

    loadPage: async function(url, pushState = false) {
        const loading = document.getElementById('zyyo-loading');
        if (loading) loading.style.opacity = '1';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const html = await response.text();
            
            // Create a virtual DOM
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const newContainer = doc.getElementById('pjax-container');

            if (newContainer) {
                if (pushState) {
                    window.history.pushState(null, '', url);
                }

                // Replace Title
                document.title = doc.title;

                // Update Stylesheets (CSS)
                this.updateStyles(doc);

                // Update Scripts (JS) - Libraries only
                this.updateScripts(doc);

                // Handle Navigation Bar Visibility
                const newNav = doc.querySelector('nav') || doc.querySelector('.navbar');
                let currentNav = document.querySelector('nav') || document.querySelector('.navbar');
                
                // If new page has nav but current page doesn't (e.g. back from full-screen about page)
                if (newNav && !currentNav) {
                    // Clone and inject it
                    currentNav = document.createElement('nav');
                    currentNav.className = newNav.className;
                    currentNav.innerHTML = newNav.innerHTML;
                    
                    // Insert at the top of body (or check index.html structure)
                    // index.html: <body> <nav>... <div class="main-container">...
                    document.body.insertBefore(currentNav, document.body.firstChild);
                }
                
                // If current page has nav but new page doesn't (or hidden logic)
                if (currentNav) {
                    if (url.includes('about.html')) {
                        currentNav.style.display = 'none';
                    } else {
                        currentNav.style.display = '';
                    }
                }

                // Replace Content (Assuming #pjax-container exists)
                const currentContainer = document.getElementById('pjax-container');
                
                if (currentContainer) {
                    // Fade out effect (optional)
                    currentContainer.style.opacity = '0';
                    
                    setTimeout(() => {
                        currentContainer.innerHTML = newContainer.innerHTML;
                        currentContainer.className = newContainer.className; // Update classes (e.g. tags-page-container)
                        currentContainer.style.opacity = '1';
                        
                        // Re-run scripts
                        try {
                            this.handleScriptExecution(url);
                        } catch (e) {
                            console.error('Script execution failed:', e);
                        }
                        
                        // Scroll to top
                        window.scrollTo(0, 0);
                        if (loading) loading.style.opacity = '0';
                    }, 200);
                }
            } else {
                console.error('PJAX container not found. Fallback.');
                if (pushState) {
                    window.location.href = url;
                } else {
                    window.location.reload();
                }
            }

        } catch (error) {
            console.error('PJAX Error:', error);
            if (pushState) {
                window.location.href = url;
            } else {
                window.location.reload();
            }
        }
    },

    updateStyles: function(newDoc) {
        const currentLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const newLinks = Array.from(newDoc.querySelectorAll('link[rel="stylesheet"]'));

        const currentHrefs = currentLinks.map(link => link.getAttribute('href').split('?')[0]);
        const newHrefs = newLinks.map(link => link.getAttribute('href').split('?')[0]);

        // 1. Add new stylesheets
        newLinks.forEach(newLink => {
            const href = newLink.getAttribute('href');
            const baseHref = href.split('?')[0];
            
            if (!currentHrefs.includes(baseHref)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        });

        // 2. Remove unused stylesheets (Optional: careful with flash of unstyled content)
        // For about.html (style.css/root.css) vs others (home.css), we MUST remove to avoid conflicts
        currentLinks.forEach(link => {
            const href = link.getAttribute('href');
            const baseHref = href.split('?')[0];

            // If the current stylesheet is NOT in the new page, remove it
            // Exception: Font imports or external libs might be preserved if needed, 
            // but here we assume strict page-level CSS control.
            if (!newHrefs.includes(baseHref)) {
                // Check for critical common CSS? 
                // If new page has NO stylesheets (error case), don't remove.
                if (newHrefs.length > 0) {
                    link.remove();
                }
            }
        });
    },

    updateScripts: function(newDoc) {
        const newScripts = Array.from(newDoc.querySelectorAll('script'));
        const currentScripts = Array.from(document.querySelectorAll('script'));
        
        // Helper to normalize src
        const getBaseSrc = (url) => {
            if (!url) return '';
            try { return url.split('?')[0]; } catch(e) { return url; }
        };

        const currentSrcs = new Set(currentScripts.map(s => getBaseSrc(s.src)).filter(s => s));
        const scriptsToLoad = [];
        const inlineScripts = [];

        newScripts.forEach(newScript => {
            const srcAttr = newScript.getAttribute('src');
            if (srcAttr) {
                const baseSrc = getBaseSrc(newScript.src);
                // 1. Skip local app scripts (handled by handleScriptExecution)
                if (baseSrc.includes('/static/js/')) return;
                // 2. Skip if already loaded
                if (currentSrcs.has(baseSrc)) return;

                scriptsToLoad.push(newScript);
                currentSrcs.add(baseSrc);
            } else {
                inlineScripts.push(newScript);
            }
        });

        // Load external scripts sequentially first, then inline scripts
        const loadNextScript = (index) => {
            if (index >= scriptsToLoad.length) {
                // All external scripts loaded, run inline scripts
                runInlineScripts();
                return;
            }

            const newScript = scriptsToLoad[index];
            const script = document.createElement('script');
            Array.from(newScript.attributes).forEach(attr => {
                script.setAttribute(attr.name, attr.value);
            });
            script.src = newScript.src;
            
            script.onload = () => loadNextScript(index + 1);
            script.onerror = () => {
                console.warn('Failed to load script:', newScript.src);
                loadNextScript(index + 1); // Continue even if one fails
            };
            
            document.body.appendChild(script);
        };

        const runInlineScripts = () => {
            inlineScripts.forEach(newScript => {
                try {
                    const script = document.createElement('script');
                    script.textContent = newScript.textContent;
                    Array.from(newScript.attributes).forEach(attr => {
                        script.setAttribute(attr.name, attr.value);
                    });
                    document.body.appendChild(script);
                } catch (e) {
                    console.error('Error running inline script:', e);
                }
            });
        };

        // Start loading
        loadNextScript(0);
    },

    handleInitialLoad: function() {
        // Handle Navigation Bar Visibility for initial load
        const url = window.location.href;
        const nav = document.querySelector('nav') || document.querySelector('.navbar');
        if (nav) {
            if (url.includes('about.html')) {
                nav.style.display = 'none';
            } else {
                nav.style.display = '';
            }
        }

        // Wrap initial content in pjax-container if not already (handled in HTML updates)
        // Just run the script for current page
        this.handleScriptExecution(url);
    },

    handleScriptExecution: function(url) {
        // Reset Player UI Binding (it will be re-bound if on home)
        this.player.onUpdate = null;

        // Determine which init function to call based on URL
        if (url.includes('index.html') || url.endsWith('/')) {
            const runHomeInits = () => {
                if (typeof window.initMusicPlayer === 'function') {
                    try { window.initMusicPlayer(); } catch(e) { console.error('initMusicPlayer failed', e); }
                    try { window.initQuotes(); } catch(e) { console.error('initQuotes failed', e); }
                    try { window.initTimeAndLocation(); } catch(e) { console.error('initTimeAndLocation failed', e); }
                    try { window.initCounters(); } catch(e) { console.error('initCounters failed', e); }
                }
            };

            // Check if home.js is already loaded
            if (window.initHome) {
                runHomeInits();
            } else {
                this.ensureScriptLoaded('./static/js/home.js', runHomeInits);
            }
        } else if (url.includes('blogs.html')) {
            this.ensureScriptLoaded('./static/js/blog.js', 'initBlogList');
        } else if (url.includes('tags.html')) {
            this.ensureScriptLoaded('./static/js/tags.js', 'initTagsPage');
        } else if (url.includes('article.html')) {
            this.ensureScriptLoaded('./static/js/blog.js', 'initArticleReader'); 
        } else if (url.includes('about.html')) {
            // about.html already loads its own script on full page load.
            return;
        }
    },

    ensureScriptLoaded: function(src, initCallbackOrName) {
        console.log('ensureScriptLoaded:', src);
        
        // Check if script is already loaded (crudely via src check or window global check if possible)
        // Here we rely on the specific window flags set by scripts (like window.initHome)
        // If the caller calls this, it usually means they checked the flag and it was false,
        // OR they just want to ensure it runs.
        
        // However, for blog.js/tags.js, we don't have a "loaded" flag, we check the function.
        if (typeof initCallbackOrName === 'string') {
            if (window[initCallbackOrName]) {
                window[initCallbackOrName]();
                return;
            }
        }

        // Load script
        const script = document.createElement('script');
        script.src = src + '?v=' + new Date().getTime();
        script.onload = () => {
            console.log('Script loaded:', src);
            if (typeof initCallbackOrName === 'function') {
                initCallbackOrName();
            } else if (typeof initCallbackOrName === 'string' && window[initCallbackOrName]) {
                window[initCallbackOrName]();
            }
        };
        document.body.appendChild(script);
    },

    reloadScript: function(src) {
        const script = document.createElement('script');
        script.src = src + '?v=' + new Date().getTime();
        document.body.appendChild(script);
    }
};

window.GlobalApp = GlobalApp;

// Start App
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalApp.init());
} else {
    GlobalApp.init();
}
