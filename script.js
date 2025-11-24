// Meme data structure - will be populated from GitHub Issues
let memesData = [
    {
        id: 1,
        contributor: "octocat",
        date: "Oct 2025",
        title: "It suggested deleting production database",
        category: "breaking",
        image: "assets/memes/sample-meme.png",
        reactions: {
            laugh: 1200,
            skull: 856,
            fire: 432
        }
    }
    // Additional meme objects should follow the same structure as above.
    // Each meme is an object with: id, contributor, date, title, category, image, reactions.
    // In production, memesData should be populated from the GitHub Issues API:
    // See https://docs.github.com/en/rest/issues/issues for details.
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedMemes();
    loadGalleryMemes();
    setupFilters();
    setupSmoothScroll();
});

// Load featured memes
function loadFeaturedMemes() {
    const featuredContainer = document.getElementById('featured-memes');
    if (!featuredContainer) return;

    // Get top 3 most recent memes
    const featuredMemes = memesData.slice(0, 3);
    
    featuredContainer.innerHTML = featuredMemes.map(meme => createMemeCard(meme)).join('');
}

// Load all gallery memes
function loadGalleryMemes(filter = 'all') {
    const galleryContainer = document.getElementById('meme-gallery');
    if (!galleryContainer) return;

    let filteredMemes = memesData;
    
    if (filter !== 'all') {
        filteredMemes = memesData.filter(meme => meme.category === filter);
    }

    if (filteredMemes.length === 0) {
        galleryContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No memes found in this category yet. Be the first to submit!</p>';
        return;
    }

    galleryContainer.innerHTML = filteredMemes.map(meme => createMemeCard(meme)).join('');
}

// Create meme card HTML
function createMemeCard(meme) {
    return `
        <div class="meme-card" data-category="${meme.category}">
            <div class="meme-header">
                <span class="contributor">@${meme.contributor}</span>
                <span class="date">${meme.date}</span>
            </div>
            <div class="meme-content">
                <img src="${meme.image}" alt="${meme.title}" loading="lazy">
            </div>
            <div class="meme-footer">
                <p class="meme-title">"${meme.title}"</p>
                <div class="meme-reactions">
                    <button class="reaction" onclick="reactToMeme(${meme.id}, 'laugh')">😂 ${formatNumber(meme.reactions.laugh)}</button>
                    <button class="reaction" onclick="reactToMeme(${meme.id}, 'skull')">💀 ${formatNumber(meme.reactions.skull)}</button>
                    <button class="reaction" onclick="reactToMeme(${meme.id}, 'fire')">🔥 ${formatNumber(meme.reactions.fire)}</button>
                </div>
            </div>
        </div>
    `;
}

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value and load memes
            const filter = this.getAttribute('data-filter');
            loadGalleryMemes(filter);
        });
    });
}

// React to meme (will integrate with backend later)
function reactToMeme(memeId, reactionType) {
    const meme = memesData.find(m => m.id === memeId);
    if (!meme) return;
    
    // Increment reaction count (in real app, this would call an API)
    if (reactionType === 'laugh') meme.reactions.laugh++;
    if (reactionType === 'skull') meme.reactions.skull++;
    if (reactionType === 'fire') meme.reactions.fire++;
    
    // Reload the gallery to show updated counts
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    loadGalleryMemes(activeFilter);
    
    // Add animation feedback
    showReactionFeedback(reactionType);
}

// Show reaction feedback animation
function showReactionFeedback(reactionType) {
    const emojis = {
        laugh: '😂',
        skull: '💀',
        fire: '🔥'
    };
    
    const feedback = document.createElement('div');
    feedback.textContent = emojis[reactionType];
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.fontSize = '5rem';
    feedback.style.zIndex = '10000';
    feedback.style.animation = 'reactionPop 1s ease forwards';
    feedback.style.pointerEvents = 'none';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 1000);
}

// Add reaction animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes reactionPop {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Format numbers (1200 -> 1.2k)
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num;
}

// Smooth scroll for navigation
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Function to load memes from GitHub Issues (will be implemented later)
async function loadMemesFromGitHub() {
    try {
        // This will fetch issues from GitHub API
        const response = await fetch('https://api.github.com/repos/fAIempire/GitHub-CoPilot-Memes/issues?labels=meme-submission');
        
        // Check for rate limiting
        if (response.status === 403) {
            const rateLimitReset = response.headers.get('X-RateLimit-Reset');
            if (rateLimitReset) {
                const resetTime = new Date(rateLimitReset * 1000).toLocaleTimeString();
                throw new Error(`GitHub API rate limit exceeded. Try again at ${resetTime}`);
            }
            throw new Error(`GitHub API access forbidden. This may be due to authentication or repository access issues.`);
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const issues = await response.json();
        
        // Convert issues to meme format
        memesData = issues.map((issue, index) => ({
            id: issue.number,
            contributor: issue.user.login,
            date: new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            title: issue.title,
            category: getCategoryFromLabels(issue.labels),
            image: extractImageFromIssue(issue.body),
            reactions: {
                laugh: issue.reactions.laugh || 0,
                skull: issue.reactions.confused || 0,
                fire: issue.reactions.hooray || 0
            }
        }));
        
        loadFeaturedMemes();
        loadGalleryMemes();
    } catch (error) {
        console.error('Error loading memes from GitHub:', error);
    }
}

// Helper function to get category from issue labels
function getCategoryFromLabels(labels) {
    const categoryMap = {
        'breaking-changes': 'breaking',
        'logic-fail': 'logic',
        'security-oops': 'security',
        'naming-disaster': 'naming'
    };
    
    for (let label of labels) {
        if (categoryMap[label.name]) {
            return categoryMap[label.name];
        }
    }
    
    return 'all';
}

// Helper function to extract image URL from issue body
function extractImageFromIssue(body) {
    // Extract markdown image URL
    if (!body) return 'assets/memes/placeholder.png';
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = body.match(imageRegex);
    return match ? match[1] : 'assets/memes/placeholder.png';
}

// Update stats dynamically
function updateStats() {
    document.querySelector('.stat-number').textContent = memesData.length + '+';
    // Other stats can be calculated from memesData
}
