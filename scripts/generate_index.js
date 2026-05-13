const fs = require('fs');
const path = require('path');

// Configuration
const POSTS_DIR = path.join(__dirname, '../posts');
const RESUME_DIR = path.join(__dirname, '../resume');
const TAGS_DIR = path.join(__dirname, '../tags');
const OUTPUT_FILE = path.join(__dirname, '../static/data/posts.json');
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

// Helper to parse Front Matter (YAML-like)
function parseFrontMatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;

    const frontMatter = match[1];
    const metadata = {};
    
    frontMatter.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // Handle arrays like [a, b] or simple strings
            let value = parts.slice(1).join(':').trim();
            
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // Parse array
            if (value.startsWith('[') && value.endsWith(']')) {
                metadata[key] = value.slice(1, -1).split(',').map(s => s.trim());
            } else {
                metadata[key] = value;
            }
        }
    });

    return metadata;
}

function generateIndex() {
    const posts = [];
    let idCounter = 1;

    SEASONS.forEach(season => {
        const seasonDir = path.join(POSTS_DIR, season);
        
        if (!fs.existsSync(seasonDir)) {
            console.log(`Skipping missing directory: ${season}`);
            return;
        }

        const files = fs.readdirSync(seasonDir);

        files.forEach(file => {
            if (!file.endsWith('.md')) return;

            const filePath = path.join(seasonDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const metadata = parseFrontMatter(content);

            if (metadata) {
                // Use filename as ID if not provided, or a counter
                const id = metadata.id || `auto-${season}-${idCounter++}`;
                
                // Construct the file path relative to the web root
                // We need "./posts/spring/filename.md"
                const webPath = `./posts/${season}/${file}`;

                posts.push({
                    id: id,
                    title: metadata.title || file.replace('.md', ''),
                    date: metadata.date || 'Unknown Date',
                    category: season, // Enforce folder name as category
                    description: metadata.description || 'No description provided.',
                    cover: metadata.cover || './static/img/new_home/bg-placeholder.jpg',
                    file: webPath,
                    tags: metadata.tags || []
                });
                console.log(`Found post: [${season}] ${metadata.title} (${file})`);
            } else {
                console.warn(`Warning: No Front Matter found in ${file}, skipping.`);
            }
        });
    });

    // Process Resume Files
    if (fs.existsSync(RESUME_DIR)) {
        const resumeFiles = fs.readdirSync(RESUME_DIR);
        resumeFiles.forEach(file => {
            if (!file.endsWith('.md')) return;
            
            const filePath = path.join(RESUME_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const metadata = parseFrontMatter(content);

            if (metadata) {
                // Use filename without extension as ID for resume items
                // e.g., 'research', 'competition'
                const id = file.replace('.md', '');
                const webPath = `./resume/${file}`;

                posts.push({
                    id: id,
                    title: metadata.title || id,
                    date: metadata.date || 'Unknown Date',
                    category: 'resume', // Special category for resume items
                    subCategory: metadata.category || 'general', // Sub-category from frontmatter
                    description: metadata.description || 'Resume item',
                    cover: metadata.cover || './static/img/new_home/bg-placeholder.jpg',
                    file: webPath,
                    tags: metadata.tags || ['Resume']
                });
                console.log(`Found resume: ${metadata.title} (${file})`);
            }
        });
    }

    // Process Tags Directory
    if (fs.existsSync(TAGS_DIR)) {
        const tagDirs = fs.readdirSync(TAGS_DIR);
        tagDirs.forEach(tagDir => {
            const fullTagDirPath = path.join(TAGS_DIR, tagDir);
            if (!fs.statSync(fullTagDirPath).isDirectory()) return;

            const files = fs.readdirSync(fullTagDirPath);
            files.forEach(file => {
                if (!file.endsWith('.md')) return;

                const filePath = path.join(fullTagDirPath, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const metadata = parseFrontMatter(content);

                if (metadata) {
                    const id = metadata.id || `auto-tag-${tagDir}-${idCounter++}`;
                    const webPath = `./tags/${tagDir}/${file}`;
                    
                    // Ensure the directory name is added to tags
                    const tags = metadata.tags || [];
                    if (!tags.includes(tagDir)) {
                        tags.push(tagDir);
                    }

                    posts.push({
                        id: id,
                        title: metadata.title || file.replace('.md', ''),
                        date: metadata.date || 'Unknown Date',
                        category: 'tag_post', // Category for tag-based posts
                        subCategory: tagDir,
                        description: metadata.description || 'No description provided.',
                        cover: metadata.cover || './static/img/new_home/bg-placeholder.jpg',
                        file: webPath,
                        tags: tags
                    });
                    console.log(`Found tag post: [${tagDir}] ${metadata.title} (${file})`);
                }
            });
        });
    }

    // Sort posts by date (descending)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 4), 'utf-8');
    console.log(`\nSuccess! Generated index with ${posts.length} posts.`);
    console.log(`Saved to: ${OUTPUT_FILE}`);
}

generateIndex();
