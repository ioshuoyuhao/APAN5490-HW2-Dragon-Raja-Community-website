/**
 * Authentication Module
 * Handles user login, logout, profile management, and department affiliation
 * 
 * Author: Steven Huo
 * Course: APAN 5490 - Assignment 4
 * Date: December 5, 2025
 */

// ===== API CONFIGURATION =====
// API_BASE_URL is defined in script.js which loads first
// No need to redeclare here - just use the global variable

// ===== LOCAL STORAGE KEY =====
const USER_STORAGE_KEY = 'cassell_user';

// ===== AUTH UTILITY FUNCTIONS =====

/**
 * Get current logged-in user from localStorage
 * @returns {Object|null} User object or null
 */
function getCurrentUser() {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Save user to localStorage
 * @param {Object} user - User object
 */
function saveUser(user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Remove user from localStorage (logout)
 */
function clearUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Check if user is logged in
 * @returns {Boolean}
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// ===== AUTH PAGE HANDLERS =====

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    console.log('🔐 Login attempt started');
    
    const email = document.getElementById('email').value.trim();
    console.log('📧 Email entered:', email);
    
    if (!email) {
        console.error('❌ No email provided');
        if (typeof showNotification === 'function') {
            showNotification('Please enter your email', 'error');
        } else {
            alert('Please enter your email');
        }
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    console.log(`🚀 Sending login request to: ${API_BASE_URL}/auth/login`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (data.success) {
            console.log('✅ Login successful!', data.data.user);
            
            // Save user to localStorage
            saveUser(data.data.user);
            console.log('💾 User saved to localStorage');
            
            if (typeof showNotification === 'function') {
                showNotification(`Welcome back, Agent ${data.data.user.name}!`, 'success');
            } else {
                alert(`Welcome back, Agent ${data.data.user.name}!`);
            }
            
            // Redirect to profile
            setTimeout(() => {
                console.log('🔄 Redirecting to profile...');
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            console.error('❌ Login failed:', data.error);
            if (typeof showNotification === 'function') {
                showNotification(data.error || 'Login failed', 'error');
            } else {
                alert(data.error || 'Login failed');
            }
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('💥 Login error (catch block):', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        if (typeof showNotification === 'function') {
            showNotification(`Login failed: ${error.message}`, 'error');
        } else {
            alert(`Login failed: ${error.message}`);
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Handle questionnaire form submission with signup
 */
async function handleQuestionnaireSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Extract name and email
    const name = formData.get('name');
    const email = formData.get('email');
    
    // Extract all answers
    const answers = {};
    for (let [key, value] of formData.entries()) {
        if (key !== 'name' && key !== 'email') {
            answers[key] = value;
        }
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing Admission...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, answers })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Save user to localStorage
            saveUser(data.data.user);
            
            // Show rank announcement
            const rank = data.data.user.bloodRank;
            const rankInfo = data.data.rankInfo;
            
            showNotification(
                `Agent ${name}, your blood rank is ${rank}-Rank ${rankInfo.badge}!\\n\\n${rankInfo.description}`,
                'success',
                8000
            );
            
            // Redirect to profile page
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 8000);
        } else {
            showNotification(data.error || 'Submission failed', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Submission failed. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Load and display user profile
 */
async function loadUserProfile() {
    const user = getCurrentUser();
    
    if (!user) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
        return;
    }
    
    // Fetch fresh user data from server
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile/${user.id}`);
        const data = await response.json();
        
        if (data.success) {
            const userData = data.data.user;
            const rankInfo = data.data.rankInfo;
            
            // Update profile elements
            document.getElementById('profileName').textContent = `Agent ${userData.name}`;
            document.getElementById('rankDisplay').innerHTML = `${userData.bloodRank}-Rank ${rankInfo.badge}`;
            document.getElementById('rankDescription').textContent = rankInfo.description;
            
            // Set blood rank badge color
            const badge = document.getElementById('bloodRankBadge');
            badge.style.borderColor = rankInfo.color;
            document.getElementById('rankDisplay').style.color = rankInfo.color;
            
            // Personal Information
            document.getElementById('displayName').textContent = userData.name;
            document.getElementById('displayEmail').textContent = userData.email;
            document.getElementById('displayRank').textContent = `${userData.bloodRank}-Rank`;
            document.getElementById('displayScore').textContent = `${userData.bloodRankScore}/100`;
            
            // Department Affiliation
            const deptSection = document.getElementById('departmentSection');
            if (userData.affiliatedDepartment) {
                document.getElementById('affiliatedDept').innerHTML = `
                    <p style="color: #1C3D35; font-weight: 600; margin-bottom: 0.5rem;">
                        ${userData.affiliatedDepartment}
                    </p>
                    <p style="color: #666;">You are a valued member of this department.</p>
                `;
                document.getElementById('joinDeptSection').style.display = 'none';
            } else {
                document.getElementById('affiliatedDept').style.display = 'none';
                document.getElementById('joinDeptSection').style.display = 'block';
            }
            
            // Performance Breakdown
            if (userData.bloodRankBreakdown) {
                const breakdown = userData.bloodRankBreakdown;
                document.getElementById('mcScore').textContent = `${breakdown.mcScore || 0}/60`;
                document.getElementById('textScore').textContent = `${breakdown.textScore || 0}/40`;
                document.getElementById('avgWords').textContent = `${breakdown.avgWordCount || 0} words`;
                document.getElementById('totalWords').textContent = `${breakdown.totalWords || 0} words`;
            }
            
            // Timeline
            document.getElementById('createdAt').textContent = new Date(userData.createdAt).toLocaleDateString();
            document.getElementById('lastLogin').textContent = new Date(userData.lastLogin).toLocaleDateString();
            
        } else {
            showNotification('Failed to load profile', 'error');
        }
    } catch (error) {
        console.error('Profile load error:', error);
        showNotification('Failed to load profile', 'error');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    clearUser();
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/**
 * Load departments and handle join functionality
 */
async function loadDepartments() {
    try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        const data = await response.json();
        
        if (data.success) {
            const departments = data.data;
            
            // Update member counts
            departments.forEach(dept => {
                const deptElement = document.querySelector(`[data-department="${dept.name}"] .member-count`);
                if (deptElement) {
                    deptElement.textContent = dept.memberCount;
                }
            });
            
            // Check if user is logged in and show affiliation status
            const user = getCurrentUser();
            if (user && user.affiliatedDepartment) {
                const statusDiv = document.getElementById('userAffiliationStatus');
                if (statusDiv) {
                    statusDiv.style.display = 'block';
                    document.getElementById('affiliationText').textContent = 
                        `You are a member of ${user.affiliatedDepartment}`;
                    
                    // Disable all join buttons and highlight current department
                    document.querySelectorAll('.join-dept-btn').forEach(btn => {
                        const deptName = btn.getAttribute('data-dept');
                        if (deptName === user.affiliatedDepartment) {
                            btn.textContent = 'Current Department';
                            btn.style.background = '#D4AF37';
                            btn.style.borderColor = '#D4AF37';
                            btn.style.color = '#1C3D35';
                            btn.disabled = true;
                        } else {
                            btn.style.opacity = '0.5';
                            btn.disabled = true;
                            btn.textContent = 'Already Affiliated';
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

/**
 * Handle department join
 */
async function joinDepartment(departmentName) {
    const user = getCurrentUser();
    
    if (!user) {
        showNotification('Please log in to join a department', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    if (user.affiliatedDepartment) {
        showNotification(`You are already a member of ${user.affiliatedDepartment}. You can only join one department.`, 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/department`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                departmentName: departmentName
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update user in localStorage
            user.affiliatedDepartment = departmentName;
            saveUser(user);
            
            showNotification(`Successfully joined ${departmentName}!`, 'success');
            
            // Reload page to update UI
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showNotification(data.error || 'Failed to join department', 'error');
        }
    } catch (error) {
        console.error('Join department error:', error);
        showNotification('Failed to join department', 'error');
    }
}

/**
 * Update header with dynamic login/profile buttons
 */
function updateHeaderAuth() {
    const headerActions = document.getElementById('headerActions') || document.querySelector('.header-actions');
    if (!headerActions) return;
    
    const user = getCurrentUser();
    
    if (user) {
        // User is logged in - show profile and logout
        headerActions.innerHTML = `
            <span class="notification-icon" aria-label="Notifications">🔔</span>
            <span style="color: #D4AF37; margin-right: 1rem; font-weight: 600;">Agent ${user.name.split(' ').pop()}</span>
            <a href="profile.html" class="btn btn-outline">My Profile</a>
            <button id="headerLogoutBtn" class="btn btn-primary" style="background: #8B0000; border-color: #8B0000;">Logout</button>
        `;
        
        // Attach logout handler
        const logoutBtn = document.getElementById('headerLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        // User is not logged in - show login and sign up
        headerActions.innerHTML = `
            <span class="notification-icon" aria-label="Notifications">🔔</span>
            <a href="login.html" class="btn btn-outline">Login</a>
            <a href="questionnaire.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

// ===== PAGE-SPECIFIC INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    // Update header on all pages
    updateHeaderAuth();
    
    // Login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Questionnaire page
    const lineageForm = document.getElementById('lineageForm');
    if (lineageForm && window.location.pathname.includes('questionnaire')) {
        lineageForm.removeEventListener('submit', handleQuestionnaireSubmit); // Remove any existing
        lineageForm.addEventListener('submit', handleQuestionnaireSubmit);
    }
    
    // Profile page
    if (window.location.pathname.includes('profile.html')) {
        loadUserProfile();
        loadUserBookmarks();
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
    
    // Forum page
    if (window.location.pathname.includes('forum.html')) {
        loadDepartments();
        loadForumPosts('recent'); // Load with default sort
        
        // Attach sort button handlers
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const sortType = this.getAttribute('data-sort');
                loadForumPosts(sortType);
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Attach join button handlers
        document.querySelectorAll('.join-dept-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const deptName = this.getAttribute('data-dept');
                joinDepartment(deptName);
            });
        });
    }
    
    // Fan Works page
    if (window.location.pathname.includes('fanworks.html')) {
        loadFanWorks('liked'); // Default to most liked
        
        // Attach sort button handlers
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const sortText = this.textContent.trim();
                let sortType = 'liked';
                
                if (sortText === 'Most Popular') sortType = 'popular';
                if (sortText === 'Most Liked') sortType = 'liked';
                
                loadFanWorks(sortType);
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Share/Upload button handlers
        const shareBtn = document.querySelector('.btn-primary');
        const uploadBtn = document.querySelector('.btn-outline');
        
        if (shareBtn && shareBtn.textContent.includes('Share')) {
            shareBtn.addEventListener('click', () => {
                showNotification('Share work feature not implemented yet', 'info');
            });
        }
        
        if (uploadBtn && uploadBtn.textContent.includes('Upload')) {
            uploadBtn.addEventListener('click', () => {
                showNotification('Upload feature not implemented yet', 'info');
            });
        }
    }
});

/**
 * Load forum posts with sorting
 */
async function loadForumPosts(sortType = 'recent', page = 1) {
    try {
        console.log(`📚 Loading forum posts (sort: ${sortType}, page: ${page})...`);
        
        const response = await fetch(`${API_BASE_URL}/forum/posts?sort=${sortType}&page=${page}&limit=10`);
        const data = await response.json();
        
        console.log('📦 Forum posts data:', data);
        
        if (data.success) {
            console.log(`✅ Loaded ${data.data.length} forum posts`);
            renderForumPosts(data.data, data.pagination);
        } else {
            console.error('❌ Failed to load forum posts:', data.error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to load forum posts', 'error');
            }
        }
    } catch (error) {
        console.error('💥 Error loading forum posts:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to load forum posts', 'error');
        }
    }
}

/**
 * Render forum posts in DOM with pagination
 */
function renderForumPosts(posts, pagination) {
    const container = document.getElementById('forumPostsContainer');
    if (!container) {
        console.error('❌ Forum posts container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No posts found.</p>';
        return;
    }
    
    console.log(`📝 Rendering ${posts.length} posts...`);
    
    posts.forEach(post => {
        const postHTML = `
            <article class="thread-item" data-post-id="${post._id}">
                <h3 class="thread-title">${escapeHTML(post.title)}</h3>
                <div class="thread-meta">
                    <span>By: ${escapeHTML(post.author)}</span>
                    <span>Department: ${escapeHTML(post.department)}</span>
                    <span>💬 ${post.replies} replies</span>
                    <span>${formatTimestamp(post.createdAt)}</span>
                </div>
                <p>${escapeHTML(post.content)}</p>
                <div class="flex-row" style="margin-top: 1rem; gap: 0.5rem;">
                    <button class="btn btn-outline btn-small reply-btn" data-post-id="${post._id}">Reply</button>
                    <button class="btn btn-outline btn-small bookmark-btn" data-post-id="${post._id}">Bookmark</button>
                    <button class="btn btn-outline btn-small share-btn">Share</button>
                </div>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', postHTML);
    });
    
    // Attach event listeners
    attachForumEventListeners();
    
    // Render pagination if provided
    if (pagination) {
        renderPagination(pagination);
    }
}

/**
 * Render pagination controls
 */
function renderPagination(pagination) {
    // Find or create pagination container
    let paginationContainer = document.getElementById('paginationControls');
    
    if (!paginationContainer) {
        const forumContainer = document.getElementById('forumPostsContainer');
        if (!forumContainer) return;
        
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationControls';
        paginationContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 2rem; flex-wrap: wrap;';
        forumContainer.parentElement.appendChild(paginationContainer);
    }
    
    paginationContainer.innerHTML = '';
    
    const { currentPage, totalPages, hasPrev, hasNext } = pagination;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.className = 'btn btn-outline btn-small';
    prevBtn.disabled = !hasPrev;
    prevBtn.style.opacity = hasPrev ? '1' : '0.5';
    prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'btn btn-primary btn-small' : 'btn btn-outline btn-small';
        pageBtn.addEventListener('click', () => changePage(i));
        paginationContainer.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.className = 'btn btn-outline btn-small';
    nextBtn.disabled = !hasNext;
    nextBtn.style.opacity = hasNext ? '1' : '0.5';
    nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    paginationContainer.appendChild(nextBtn);
}

/**
 * Change forum page
 */
function changePage(page) {
    const activeSort = document.querySelector('.filter-btn.active')?.getAttribute('data-sort') || 'recent';
    loadForumPosts(activeSort, page);
}

/**
 * Attach event listeners to forum post buttons
 */
function attachForumEventListeners() {
    // Reply buttons - Show "not implemented" message
    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (typeof showNotification === 'function') {
                showNotification('Reply feature will be implemented in future version', 'info');
            } else {
                alert('Reply feature will be implemented in future version');
            }
        });
    });
    
    // Bookmark buttons
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            toggleBookmark(postId, this);
        });
    });
    
    // Share buttons - Show "not implemented" message
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof showNotification === 'function') {
                showNotification('Share feature will be implemented in future version', 'info');
            } else {
                alert('Share feature will be implemented in future version');
            }
        });
    });
}

/**
 * Submit reply to forum post
 */
async function submitReply(postId) {
    const user = getCurrentUser();
    
    if (!user) {
        showNotification('Please log in to reply', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    const replyForm = document.getElementById(`reply-form-${postId}`);
    const textarea = replyForm.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (!content) {
        showNotification('Please enter your reply', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/forum/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, userId: user.id, content })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Reply posted successfully!', 'success');
            textarea.value = '';
            replyForm.style.display = 'none';
            
            // Reload posts to show updated reply count
            const activeSort = document.querySelector('.filter-btn.active').getAttribute('data-sort');
            loadForumPosts(activeSort);
        } else {
            showNotification(data.error || 'Failed to post reply', 'error');
        }
    } catch (error) {
        console.error('Reply error:', error);
        showNotification('Failed to post reply', 'error');
    }
}

/**
 * Toggle bookmark for a forum post
 */
async function toggleBookmark(postId, buttonElement) {
    const user = getCurrentUser();
    
    if (!user) {
        if (typeof showNotification === 'function') {
            showNotification('Please log in to bookmark posts', 'error');
        }
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    console.log('🔖 Toggling bookmark for post:', postId);
    
    try {
        const response = await fetch(`${API_BASE_URL}/forum/bookmark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, userId: user.id })
        });
        
        const data = await response.json();
        console.log('📦 Bookmark response:', data);
        
        if (data.success) {
            console.log('✅ Post bookmarked successfully');
            
            // Update button appearance - change to yellow/gold
            buttonElement.textContent = '✓ Bookmarked';
            buttonElement.style.background = '#D4AF37';
            buttonElement.style.borderColor = '#D4AF37';
            buttonElement.style.color = '#1C3D35';
            buttonElement.style.fontWeight = '600';
            buttonElement.disabled = true;
            
            if (typeof showNotification === 'function') {
                showNotification('Post bookmarked!', 'success');
            }
        } else {
            if (data.error && data.error.includes('already bookmarked')) {
                console.log('ℹ️ Post already bookmarked');
                
                // Update button to show it's bookmarked
                buttonElement.textContent = '✓ Bookmarked';
                buttonElement.style.background = '#D4AF37';
                buttonElement.style.borderColor = '#D4AF37';
                buttonElement.style.color = '#1C3D35';
                buttonElement.disabled = true;
                
                if (typeof showNotification === 'function') {
                    showNotification('Post already bookmarked', 'info');
                }
            } else {
                console.error('❌ Bookmark failed:', data.error);
                if (typeof showNotification === 'function') {
                    showNotification(data.error || 'Failed to bookmark', 'error');
                }
            }
        }
    } catch (error) {
        console.error('💥 Bookmark error:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to bookmark post', 'error');
        }
    }
}

/**
 * Load user's bookmarked posts
 */
async function loadUserBookmarks() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/forum/bookmarks/${user.id}`);
        const data = await response.json();
        
        if (data.success) {
            renderBookmarkedPosts(data.data);
        }
    } catch (error) {
        console.error('Error loading bookmarks:', error);
    }
}

/**
 * Render bookmarked posts in profile
 */
function renderBookmarkedPosts(posts) {
    const container = document.getElementById('bookmarkedPostsContainer');
    if (!container) return;
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">You haven\'t bookmarked any posts yet. Visit the <a href="forum.html">Forum</a> to bookmark posts!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postHTML = `
            <div class="thread-item" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h4 style="color: #1C3D35; margin-bottom: 0.5rem;">${escapeHTML(post.title)}</h4>
                <div class="thread-meta" style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">
                    <span>By: ${escapeHTML(post.author)}</span>
                    <span>•</span>
                    <span>${escapeHTML(post.department)}</span>
                    <span>•</span>
                    <span>Bookmarked: ${formatTimestamp(post.bookmarkedAt)}</span>
                </div>
                <p style="color: #666; font-size: 0.95rem;">${escapeHTML(post.content.substring(0, 150))}...</p>
                <a href="forum.html" class="btn btn-outline btn-small" style="margin-top: 0.5rem;">View in Forum</a>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', postHTML);
    });
}

/**
 * Load fan works with sorting
 */
async function loadFanWorks(sortType = 'liked') {
    try {
        const response = await fetch(`${API_BASE_URL}/fanworks?sort=${sortType}&limit=12`);
        const data = await response.json();
        
        if (data.success) {
            renderFanWorks(data.data);
        } else {
            showNotification('Failed to load fan works', 'error');
        }
    } catch (error) {
        console.error('Error loading fan works:', error);
        showNotification('Failed to load fan works', 'error');
    }
}

/**
 * Render fan works gallery
 */
function renderFanWorks(fanworks) {
    const container = document.querySelector('.gallery-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    fanworks.forEach(work => {
        const workHTML = `
            <div class="gallery-item">
                <img src="${work.imageUrl || 'https://via.placeholder.com/300x200/1C3D35/D4AF37?text=' + encodeURIComponent(work.title)}" 
                     alt="${escapeHTML(work.title)} fan art" 
                     class="gallery-image">
                <div class="gallery-content">
                    <h3 class="gallery-title">${escapeHTML(work.title)}</h3>
                    <p class="gallery-author">By: ${escapeHTML(work.artist)}</p>
                    <div class="gallery-stats">
                        <span>❤️ ${work.likes}</span>
                        <span>💬 ${work.comments}</span>
                        <span>⭐ ${work.rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', workHTML);
    });
}
