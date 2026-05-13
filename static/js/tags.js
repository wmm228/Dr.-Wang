// Use IIFE to avoid global scope pollution
(function() {
    const FALLBACK_COVER = './static/img/new_home/my_bg.jpg';
    let allPosts = [];
    let tagsPageInitialized = false;

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

    window.initTagsPage = async function() {
        if (tagsPageInitialized) return;
        tagsPageInitialized = true;

        const tagsCloudContainer = document.querySelector('.tags-header');
        const blogCardsContainer = document.querySelector('.blog-cards-container');

        try {
            const response = await fetch('./static/data/posts.json?v=' + new Date().getTime());
            if (!response.ok) throw new Error('Failed to load posts');
            const rawPosts = await response.json();
            allPosts = rawPosts.filter(post => post.category === 'tag_post');
        } catch (error) {
            console.error(error);
            if (blogCardsContainer) {
                blogCardsContainer.innerHTML = '<div style="text-align: center; width: 100%;">加载失败，请检查 posts.json</div>';
            }
            return;
        }

        const tagCounts = {};
        allPosts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        renderTagsCloud(tagCounts, tagsCloudContainer);

        const urlParams = new URLSearchParams(window.location.search);
        const initialTag = urlParams.get('tag');

        if (initialTag && tagCounts[initialTag]) {
            setActiveTag(initialTag);
            renderPosts(initialTag, blogCardsContainer);
        } else {
            setActiveTag('全部');
            renderPosts('all', blogCardsContainer);
        }
    };

    function renderTagsCloud(tagCounts, container) {
        if (!container) return;

        let html = '<span class="tag-pill" data-tag="all"># 全部</span>';
        const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

        sortedTags.forEach(tag => {
            html += `<span class="tag-pill" data-tag="${tag}"># ${tag} ${tagCounts[tag]}</span>`;
        });

        container.innerHTML = html;

        container.querySelectorAll('.tag-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const tag = pill.dataset.tag;
                const displayTag = tag === 'all' ? '全部' : tag;

                setActiveTag(displayTag);
                renderPosts(tag, document.querySelector('.blog-cards-container'));

                const newUrl = tag === 'all' ? 'tags.html' : `tags.html?tag=${encodeURIComponent(tag)}`;
                window.history.pushState({ path: newUrl }, '', newUrl);
            });
        });
    }

    function setActiveTag(tagName) {
        document.querySelectorAll('.tag-pill').forEach(pill => {
            const pillTag = pill.dataset.tag === 'all' ? '全部' : pill.dataset.tag;
            pill.classList.toggle('active', pillTag === tagName);
        });
    }

    function renderPosts(tag, container) {
        if (!container) return;
        container.innerHTML = '';

        const filtered = tag === 'all'
            ? allPosts
            : allPosts.filter(post => post.tags && post.tags.includes(tag));

        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999; width: 100%;">该标签下暂无文章</div>';
            return;
        }

        filtered.forEach(post => {
            const card = document.createElement('a');
            card.href = `./article.html?id=${post.id}`;
            card.className = 'card blog-card';

            const displayTag = tag !== 'all'
                ? tag
                : (post.tags && post.tags[0] ? post.tags[0] : '未分类');

            card.innerHTML = `
                <div class="blog-cover"></div>
                <div class="blog-info">
                    <span class="blog-tag"># ${displayTag}</span>
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-date">${post.date}</p>
                </div>
            `;

            applyCoverBackground(card.querySelector('.blog-cover'), post.cover);
            container.appendChild(card);
        });
    }

    function autoInitTagsPage() {
        if (window.location.pathname.includes('tags.html')) {
            window.initTagsPage();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitTagsPage, { once: true });
    } else {
        autoInitTagsPage();
    }
})();
