// Use IIFE to avoid global scope pollution
(function() {
    // Scoped global for this module
    let allPosts = [];

    // Expose globally
    window.initTagsPage = async function() {
        const tagsCloudContainer = document.querySelector('.tags-header');
        const blogCardsContainer = document.querySelector('.blog-cards-container');

        // 1. Fetch Data
        try {
            const response = await fetch('./static/data/posts.json?v=' + new Date().getTime());
            if (!response.ok) throw new Error('Failed to load posts');
            const rawPosts = await response.json();
            
            // Filter ONLY tag posts (from tags/ directory)
            allPosts = rawPosts.filter(post => post.category === 'tag_post');
            
        } catch (error) {
            console.error(error);
            if (blogCardsContainer) blogCardsContainer.innerHTML = '<div style="text-align: center; width: 100%;">加载失败，请检查 posts.json 格式</div>';
            return;
        }

        // 2. Process Tags
        const tagCounts = {};
        allPosts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        // 3. Render Tags Cloud
        renderTagsCloud(tagCounts, tagsCloudContainer);

        // 4. Check URL Params for initial tag
        const urlParams = new URLSearchParams(window.location.search);
        const initialTag = urlParams.get('tag'); // No default 'all' here, or handle logic below

        if (initialTag && tagCounts[initialTag]) {
            // If a tag is specified, highlight it and show filtered posts
            setActiveTag(initialTag);
            renderPosts(initialTag, blogCardsContainer);
        } else {
            // Default: Show 'All' active, and show all posts
            setActiveTag('全部');
            renderPosts('all', blogCardsContainer);
        }
    }

    function renderTagsCloud(tagCounts, container) {
        if (!container) return;
        // 'All' tag
        let html = `<span class="tag-pill" data-tag="all"># 全部</span>`;

        // Sort tags by count descending
        const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

        sortedTags.forEach(tag => {
            html += `<span class="tag-pill" data-tag="${tag}"># ${tag} ${tagCounts[tag]}</span>`;
        });

        container.innerHTML = html;

        // Add Event Listeners
        container.querySelectorAll('.tag-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const tag = pill.dataset.tag;
                const displayTag = tag === 'all' ? '全部' : tag;
                
                setActiveTag(displayTag);
                renderPosts(tag, document.querySelector('.blog-cards-container'));

                // Optional: Update URL
                const newUrl = tag === 'all' ? 'tags.html' : `tags.html?tag=${encodeURIComponent(tag)}`;
                window.history.pushState({path: newUrl}, '', newUrl);
            });
        });
    }

    function setActiveTag(tagName) {
        document.querySelectorAll('.tag-pill').forEach(pill => {
            const pillTag = pill.dataset.tag === 'all' ? '全部' : pill.dataset.tag;
            if (pillTag === tagName) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }

    function renderPosts(tag, container) {
        if (!container) return;
        container.innerHTML = '';

        const filtered = tag === 'all' 
            ? allPosts 
            : allPosts.filter(p => p.tags && p.tags.includes(tag));

        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999; width: 100%;">该标签下暂无文章</div>';
            return;
        }

        filtered.forEach(post => {
            const card = document.createElement('a');
            card.href = `./article.html?id=${post.id}`;
            card.className = 'card blog-card'; // Reusing blog-card styles but with card wrapper
            
            // Ensure we have a valid cover
            const coverImg = post.cover || './static/img/new_home/bg-placeholder.jpg';
            
            // Find the tag to display (if filtering by tag, show that tag; else show first)
            const displayTag = tag !== 'all' ? tag : (post.tags && post.tags[0] ? post.tags[0] : '未分类');

            card.innerHTML = `
                <div class="blog-cover" style="background-image: url('${coverImg}');"></div>
                <div class="blog-info">
                    <span class="blog-tag"># ${displayTag}</span>
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-date">${post.date}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // if (!window.pjaxActive) {
    //     document.addEventListener('DOMContentLoaded', () => {
    //         window.initTagsPage();
    //     });
    // }
})();
