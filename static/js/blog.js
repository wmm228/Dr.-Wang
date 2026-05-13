// Use IIFE to avoid global scope pollution and re-declaration errors
(function() {
    const FALLBACK_COVER = './static/img/new_home/my_bg.jpg';

    // Global posts data cache (scoped to this closure)
    let allPosts = [];
    let blogListInitialized = false;
    let articleReaderInitialized = false;

    function getCoverUrl(cover) {
        return cover || FALLBACK_COVER;
    }

    function applyCoverBackground(element, cover) {
        if (!element) return;

        const targetCover = getCoverUrl(cover);
        const preloadImage = new Image();

        preloadImage.onload = () => {
            element.style.backgroundImage = `url('${targetCover}')`;
        };

        preloadImage.onerror = () => {
            element.style.backgroundImage = `url('${FALLBACK_COVER}')`;
        };

        preloadImage.src = targetCover;
    }

    /**
     * Initialize Blog List Page
     */
    window.initBlogList = async function() {
        if (blogListInitialized) return;
        blogListInitialized = true;

        console.log('initBlogList called');
        const grid = document.getElementById('blog-grid');
        const buttons = document.querySelectorAll('.season-btn');
        
        // 1. Fetch Data
        try {
            console.log('Fetching posts...');
            const response = await fetch('./static/data/posts.json?v=' + new Date().getTime());
            if (!response.ok) throw new Error('Failed to load posts');
            const rawPosts = await response.json();
            console.log('Posts loaded:', rawPosts.length);

            // Filter ONLY seasonal blog posts (from posts/ directory)
            allPosts = rawPosts.filter(p => ['spring', 'summer', 'autumn', 'winter'].includes(p.category));

        } catch (error) {
            console.error('Fetch error:', error);
            if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">加载失败，请检查 posts.json 格式</div>';
            return;
        }

        // 2. Check URL Params for initial category
        const urlParams = new URLSearchParams(window.location.search);
        const initialCategory = urlParams.get('category') || 'all';
        
        // 3. Set Active Button
        setActiveButton(initialCategory);

        // 4. Render Initial
        renderPosts(initialCategory);

        // 5. Add Event Listeners
        buttons.forEach(btn => {
            // Remove old listeners to prevent duplication if not handled by framework
            // Here we just add new ones, relying on DOM replacement by PJAX to clear old elements
            btn.addEventListener('click', () => {
                const category = btn.dataset.season;
                setActiveButton(category);
                renderPosts(category);
                // Optional: update URL without reload
                const newUrl = category === 'all' ? 'blogs.html' : `blogs.html?category=${category}`;
                window.history.pushState({path: newUrl}, '', newUrl);
            });
        });
    }

    function setActiveButton(category) {
        document.querySelectorAll('.season-btn').forEach(btn => {
            if (btn.dataset.season === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function renderPosts(category) {
        const grid = document.getElementById('blog-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const filtered = category === 'all' 
            ? allPosts 
            : allPosts.filter(p => p.category === category);

        if (filtered.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #999;">暂无该分类的文章</div>';
            return;
        }

        filtered.forEach(post => {
            const card = document.createElement('a');
            card.href = `./article.html?id=${post.id}`;
            card.className = 'blog-card';
            const coverImg = getCoverUrl(post.cover);
            
            // Format Tags
            const tagsHtml = post.tags ? post.tags.map(tag => `<span class="card-tag">#${tag}</span>`).join('') : '';

            card.innerHTML = `
                <img src="${coverImg}" alt="${post.title}" class="card-cover">
                <div class="card-content">
                    <div class="card-tags">${tagsHtml}</div>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-desc">${post.description}</p>
                    <div class="card-meta">
                        <span>${post.date}</span>
                        <span style="text-transform: capitalize;">${post.category}</span>
                    </div>
                </div>
            `;

            const coverEl = card.querySelector('.card-cover');
            if (coverEl) {
                coverEl.onerror = () => {
                    coverEl.onerror = null;
                    coverEl.src = FALLBACK_COVER;
                };
            }

            grid.appendChild(card);
        });
    }

    /**
     * Initialize Article Reader Page
     */
    window.initArticleReader = async function() {
        if (articleReaderInitialized) return;
        articleReaderInitialized = true;

        console.log('initArticleReader called');
        const titleEl = document.getElementById('article-title');
        const dateEl = document.getElementById('article-date');
        const catEl = document.getElementById('article-category');
        const contentEl = document.getElementById('markdown-content');

        // 1. Get ID
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        console.log('Article ID:', id);

        if (!id) {
            if (contentEl) contentEl.innerHTML = '<p style="text-align:center">未找到文章ID</p>';
            return;
        }

        // 2. Fetch Index to find metadata
        let post = null;
        try {
            console.log('Fetching posts index...');
            const response = await fetch('./static/data/posts.json?v=' + new Date().getTime());
            const posts = await response.json();
            post = posts.find(p => p.id === id);
            console.log('Post metadata found:', post);
        } catch (e) {
            console.error('Metadata fetch error:', e);
        }

        if (!post) {
            if (titleEl) titleEl.innerText = '文章不存在';
            if (contentEl) contentEl.innerHTML = '';
            return;
        }

        // 3. Render Metadata
        if (titleEl) titleEl.innerText = post.title;
        if (dateEl) dateEl.innerText = post.date;
        if (catEl) catEl.innerText = (post.subCategory || post.category).toUpperCase();
        document.title = `${post.title} - Wmumu's Blog`;

        // 3.1 Update Header Background Image
        const headerBg = document.getElementById('header-bg');
        if (headerBg) {
            applyCoverBackground(headerBg, post.cover);
        }

        // 4. Fetch Markdown Content
        try {
            const mdResponse = await fetch(post.file);
            if (!mdResponse.ok) throw new Error('Failed to load markdown file');
            const mdText = await mdResponse.text();

            // 5. Render Markdown
            // Ensure libraries are loaded
            try {
                await Promise.all([
                    loadDependency('https://cdn.bootcdn.net/ajax/libs/marked/12.0.0/marked.min.js', 'marked'),
                    loadDependency('https://cdn.bootcdn.net/ajax/libs/highlight.js/11.9.0/highlight.min.js', 'hljs')
                ]);
                
                // Extra check for window.marked just in case
                if (window.marked) {
                    renderContentBody(mdText, contentEl);
                } else {
                     throw new Error('Marked library failed to initialize');
                }
            } catch (depError) {
                console.error('Dependency load failed:', depError);
                if (contentEl) {
                    contentEl.innerHTML = `
                        <div style="text-align:center; padding: 2rem;">
                            <p style="color:red; margin-bottom: 1rem;">加载依赖库失败: ${depError.message || '网络错误'}</p>
                            <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ccc; background: #fff; border-radius: 4px;">刷新重试</button>
                        </div>
                    `;
                }
            }

        } catch (error) {
            console.error('Article load error:', error);
            if (contentEl) contentEl.innerHTML = '<p style="text-align:center">文章加载失败</p>';
        }
    }

    // Helper to load external scripts dynamically
    function loadDependency(src, globalCheck) {
        return new Promise((resolve, reject) => {
            if (window[globalCheck] || (globalCheck === 'hljs' && window.highlight)) {
                resolve();
                return;
            }
            
            // Check if script tag already exists
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                // If loaded, resolve
                if (existing.dataset.loaded === 'true') {
                    resolve();
                    return;
                }
                // If loading, hook into onload
                const originalOnLoad = existing.onload;
                existing.onload = () => {
                    if (originalOnLoad) originalOnLoad();
                    resolve();
                };
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.dataset.loaded = 'false';
            script.onload = () => {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    function renderContentBody(mdText, contentEl) {
         // Configure marked
         marked.setOptions({
            highlight: function(code, lang) {
                if (window.highlight) {
                    const language = highlight.getLanguage(lang) ? lang : 'plaintext';
                    return highlight.highlight(code, { language }).value;
                }
                return code;
            },
            langPrefix: 'hljs language-'
        });

        // Strip Front Matter if exists (starts with ---)
        let content = mdText;
        if (content.startsWith('---')) {
            const endIdx = content.indexOf('---', 3);
            if (endIdx !== -1) {
                content = content.substring(endIdx + 3).trim();
            }
        }

        if (contentEl) contentEl.innerHTML = marked.parse(content);
        
        // 6. Render MathJax
        if (window.MathJax) {
            // Check if typesetPromise exists (MathJax 3)
            if (typeof window.MathJax.typesetPromise === 'function') {
                window.MathJax.typesetPromise([contentEl]).catch(err => console.error('MathJax typesetting failed:', err));
            } else if (window.MathJax.Hub) {
                // Fallback for MathJax 2 (just in case)
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, contentEl]);
            }
        }

        // 7. Generate TOC
        generateTOC(contentEl, 'toc-list');
    }

    /**
     * Generate Table of Contents from content headers
     */
    function generateTOC(contentEl, tocListId) {
        const tocList = document.getElementById(tocListId);
        if (!tocList || !contentEl) return;

        // Clear existing items
        tocList.innerHTML = '';

        // Find all headers (h1-h3)
        const headers = contentEl.querySelectorAll('h1, h2, h3');
        
        if (headers.length === 0) {
            tocList.innerHTML = '<li style="text-align:center; color:#ccc; font-size:0.9rem;">本文无目录</li>';
            return;
        }

        headers.forEach((header, index) => {
            // 1. Ensure header has an ID
            if (!header.id) {
                // Generate ID from text content or index
                const idText = header.textContent.trim().replace(/\s+/g, '-').toLowerCase();
                header.id = idText || `heading-${index}`;
            }

            // 2. Create TOC item
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = `#${header.id}`;
            a.textContent = header.textContent;
            a.className = 'toc-link';
            
            // Add specific class for indentation based on tag name
            const tagName = header.tagName.toLowerCase();
            if (tagName === 'h3') {
                a.classList.add('h3');
            } else if (tagName === 'h1') {
                // Treat h1 same as h2 or specific if needed, currently CSS only handles base and h3
            }

            // Smooth scroll behavior
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(header.id);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 100, // Offset for top padding/nav
                        behavior: 'smooth'
                    });
                    
                    // Update active state
                    document.querySelectorAll('.toc-link').forEach(link => link.classList.remove('active'));
                    a.classList.add('active');
                }
            });

            li.appendChild(a);
            tocList.appendChild(li);
        });

        // Add Scroll Spy (Intersection Observer)
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -60% 0px', // Trigger when header is near top
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    // Remove active from all
                    document.querySelectorAll('.toc-link').forEach(link => link.classList.remove('active'));
                    // Add active to current
                    const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, observerOptions);

        headers.forEach(header => observer.observe(header));
    }

    function autoInitCurrentPage() {
        const path = window.location.pathname;

        if (path.includes('blogs.html')) {
            window.initBlogList();
        } else if (path.includes('article.html') && typeof window.initArticleReader === 'function') {
            window.initArticleReader();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitCurrentPage, { once: true });
    } else {
        autoInitCurrentPage();
    }
})();
