/**
 * Night Watcher Forum - Dragon Raja Fan Community
 * JavaScript for enhanced user experience and DOM manipulation
 * 
 * Author: Steven Huo
 * Date: December 5, 2025
 * Course: APAN 5490 AI User Interface UI/UX Design - HW4
 * 
 * Description:
 * This script handles interactive features for the Dragon Raja fan community website:
 * - Form validation and submission (questionnaire, contact forms)
 * - Dynamic navigation with sticky header and scroll spy
 * - Interactive content toggles and animations
 * - Social media integration and newsletter subscription
 * - Footer dynamic year display
 * - Scroll-triggered animations and effects
 * - Mobile-responsive menu controls
 * - Accessibility features (keyboard navigation, ARIA support)
 * - API integration for dynamic content loading from MongoDB (HW4 update)
 */

// ===== API CONFIGURATION (HW4 Update) =====
const API_BASE_URL = window.location.origin + '/api';

// ===== API UTILITY FUNCTIONS =====

/**
 * Generic fetch wrapper for API calls
 * Handles errors and returns JSON data
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { 
                'Content-Type': 'application/json',
                ...options.headers 
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Failed to load data from server', 'error');
        return null;
    }
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Format timestamp to human-readable format
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== LOAD HOMEPAGE CONTENT FROM DATABASE (HW4 Update) =====
    if (document.querySelector('.grid-3')) {
        loadHomepageContent();
    }
    
    // ===== DYNAMIC FOOTER YEAR =====
    // Automatically update copyright year to current year
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }
    
    // ===== FORM HANDLING =====
    
    // Handle questionnaire form submission (HW4: Submit to database)
    const lineageForm = document.getElementById('lineageForm');
    if (lineageForm) {
        lineageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Collect form data
            const formData = new FormData(this);
            const answers = {};
            for (let [key, value] of formData.entries()) {
                if (key !== 'email') {
                    answers[key] = value;
                }
            }
            
            const email = formData.get('email');
            
            // Submit to API
            const result = await fetchAPI('/questionnaire/submit', {
                method: 'POST',
                body: JSON.stringify({ email, answers })
            });
            
            if (result) {
                // Success - redirect to success page
                setTimeout(() => {
                    window.location.href = 'success.html';
                }, 500);
            } else {
                // Error - restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Handle contact form submission (HW4: Submit to database)
    // Note: Exclude #loginForm to prevent conflict with auth.js login handler
    const contactForm = document.querySelector('.contact-form:not(#loginForm)');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Collect form data
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                topic: formData.get('topic'),
                message: formData.get('message'),
                subscribeNewsletter: formData.get('newsletter') === 'on'
            };
            
            console.log('📤 Submitting contact form:', data);
            
            // Submit to API
            const result = await fetchAPI('/contact/submit', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            if (result) {
                // Success
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.backgroundColor = '#28a745';
                
                if (data.subscribeNewsletter) {
                    setTimeout(() => {
                        showNotification('Thanks for subscribing to our newsletter!', 'success');
                    }, 500);
                }
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    this.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                // Error - restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // ===== SOCIAL MEDIA BUTTON FEEDBACK =====
    // Show notification for social media links (demo purpose)
    const socialButtons = document.querySelectorAll('a.btn[href="#"]');
    socialButtons.forEach(button => {
        const buttonText = button.textContent.trim();
        // Check if it's a social media button (has emoji icons)
        if (buttonText.includes('📷') || buttonText.includes('📺') || buttonText.includes('📱')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('No real link attached for now, demo purpose', 'info');
            });
        }
    });
    
    // ===== TOGGLE INTRO PARAGRAPH =====
    // Show/Hide introductory paragraph in hero section
    const introToggleBtn = document.getElementById('toggle-intro-btn');
    const introParagraph = document.getElementById('intro-paragraph');
    
    if (introToggleBtn && introParagraph) {
        introToggleBtn.addEventListener('click', function() {
            if (introParagraph.style.display === 'none') {
                // Show the paragraph
                introParagraph.style.display = 'block';
                this.textContent = 'Hide Intro';
            } else {
                // Hide the paragraph
                introParagraph.style.display = 'none';
                this.textContent = 'Show Intro';
            }
        });
    }
    
    // ===== LEARN MORE BUTTONS =====
    // Toggle additional details for article cards and gallery items
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Try to find parent (either thread-item or gallery-content)
            const article = this.closest('.thread-item') || this.closest('.gallery-content');
            const details = article ? article.querySelector('.article-details') : null;
            
            if (details) {
                if (details.style.display === 'none') {
                    // Show details
                    details.style.display = 'block';
                    this.textContent = 'Show Less';
                } else {
                    // Hide details
                    details.style.display = 'none';
                    this.textContent = 'Learn More';
                }
            }
        });
    });
    
    // ===== DEPARTMENT JOIN BUTTONS (FORUM PAGE) =====
    // Handle department join button clicks with login simulation
    const departmentButtons = document.querySelectorAll('.department-item button');
    let userLoggedIn = false; // Simulate login state (false = not logged in)
    let userDepartment = null; // Track which department user joined
    
    // Simulate login when user clicks Login button (for testing)
    const loginButtons = document.querySelectorAll('a[href="#"]');
    loginButtons.forEach(btn => {
        if (btn.textContent.trim() === 'Login') {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (!userLoggedIn) {
                    userLoggedIn = true;
                    showNotification('Successfully logged in! You can now join a department.', 'success');
                    this.textContent = 'Logout';
                } else {
                    userLoggedIn = false;
                    userDepartment = null;
                    showNotification('Logged out successfully.', 'info');
                    this.textContent = 'Login';
                    // Re-enable all department buttons
                    departmentButtons.forEach(btn => {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        if (btn.textContent === 'Pending...') {
                            const originalText = btn.closest('.department-item').querySelector('.department-name').textContent;
                            btn.textContent = originalText.includes('Council') ? 'Join Council' :
                                             originalText.includes('Society') ? 'Join Society' :
                                             originalText.includes('Execution') ? 'Join Execution' :
                                             originalText.includes('News') ? 'Join News' :
                                             originalText.includes('Equipment') ? 'Join Equipment' : 'Join All';
                        }
                    });
                }
            });
        }
    });
    
    departmentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const departmentItem = this.closest('.department-item');
            const departmentName = departmentItem.querySelector('.department-name').textContent.trim();
            const buttonText = this.textContent.trim();
            
            // Check if this is "Join All" button
            if (buttonText === 'Join All' || departmentName === 'All Departments') {
                showNotification('Access Denied: Students are not allowed to join all departments.', 'error');
                return;
            }
            
            // Check if user is logged in
            if (!userLoggedIn) {
                showNotification('Please login with your School ID account to join a department.', 'info');
                // In a real app, this would redirect to login page
                return;
            }
            
            // Check if user already joined a department
            if (userDepartment && userDepartment !== departmentName) {
                showNotification(`You are already a member of ${userDepartment}. Each student can only join one department.`, 'error');
                return;
            }
            
            // If user hasn't joined this department yet
            if (!userDepartment) {
                userDepartment = departmentName;
                showNotification(`Interview request sent! An invitation email has been sent to your School email for ${departmentName}.`, 'success');
                this.textContent = 'Pending...';
                this.disabled = true;
                this.style.opacity = '0.6';
            }
        });
    });
    
    // ===== NAVIGATION ENHANCEMENTS =====
    
    // Dynamic sticky header class on scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add sticky class after scrolling 100px
            if (scrollTop > 100) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        }, 100));
    }
    
    // Scroll Spy - Highlight nav link for section currently in view
    const sections = document.querySelectorAll('section[id]');
    const navLinksForSpy = document.querySelectorAll('.nav a');
    
    if (sections.length > 0 && navLinksForSpy.length > 0) {
        window.addEventListener('scroll', throttle(() => {
            let currentSection = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                // Check if section is in viewport (with 200px offset for better UX)
                if (window.pageYOffset >= (sectionTop - 200)) {
                    currentSection = section.getAttribute('id');
                }
            });
            
            // Highlight corresponding nav link based on section in view
            navLinksForSpy.forEach(link => {
                const href = link.getAttribute('href');
                
                // Remove scroll-spy active class (keep page-level active)
                link.classList.remove('scroll-active');
                
                // Add scroll-active class if link matches current section
                if (currentSection && href.includes(`#${currentSection}`)) {
                    link.classList.add('scroll-active');
                }
            });
        }, 100));
    }
    
    // Active navigation highlighting (page-level)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just a placeholder "#"
            if (href === '#') {
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Enhanced keyboard navigation - Tab through nav links with visual highlighting
    const navLinksArray = Array.from(document.querySelectorAll('.nav a'));
    navLinksArray.forEach((link, index) => {
        link.addEventListener('keydown', function(e) {
            // Arrow key navigation
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextLink = navLinksArray[index + 1] || navLinksArray[0];
                nextLink.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevLink = navLinksArray[index - 1] || navLinksArray[navLinksArray.length - 1];
                prevLink.focus();
            }
        });
        
        // Enhanced visual feedback on focus
        link.addEventListener('focus', function() {
            this.style.outline = '3px solid var(--gold)';
            this.style.outlineOffset = '4px';
        });
        
        link.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // ===== SEARCH FUNCTIONALITY =====
    
    // Handle search bar functionality
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        // Search on button click
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                // Redirect to forum with search query
                window.location.href = `forum.html?search=${encodeURIComponent(query)}`;
            }
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    window.location.href = `forum.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
    
    // ===== FILTER FUNCTIONALITY =====
    
    // Handle filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all filter buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Here you would typically filter the content
            // For demo purposes, we'll just show a message
            console.log(`Filtering by: ${this.textContent}`);
        });
    });
    
    // ===== MOBILE MENU TOGGLE =====
    
    // Create mobile menu toggle if needed
    // Note: header is already declared at line 219, reusing that reference
    const navElement = document.querySelector('nav');
    const navList = document.querySelector('.nav');
    
    if (window.innerWidth <= 768 && navElement && navList) {
        // Create mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.style.cssText = `
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--parchment);
            cursor: pointer;
        `;
        
        // Insert mobile menu button
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            headerContent.insertBefore(mobileMenuBtn, navElement);
        }
        
        // Toggle mobile menu
        mobileMenuBtn.addEventListener('click', function() {
            navList.classList.toggle('mobile-open');
        });
        
        // Show/hide mobile menu button based on screen size
        function toggleMobileMenu() {
            if (window.innerWidth <= 768) {
                mobileMenuBtn.style.display = 'block';
                navList.style.display = navList.classList.contains('mobile-open') ? 'flex' : 'none';
            } else {
                mobileMenuBtn.style.display = 'none';
                navList.style.display = 'flex';
            }
        }
        
        window.addEventListener('resize', toggleMobileMenu);
        toggleMobileMenu();
    }
    
    // ===== ANIMATION ENHANCEMENTS =====
    
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe cards for animation
    document.querySelectorAll('.card, .gallery-item, .thread-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ===== INTERACTIVE ELEMENTS =====
    
    // Add hover effects to gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .mobile-open {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--emerald);
            padding: 1rem;
            box-shadow: 0 4px 8px var(--shadow);
        }
    `;
    document.head.appendChild(style);
    
    // ===== UTILITY FUNCTIONS =====
    
    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // ===== SCROLL TO TOP BUTTON =====
    
    // Create scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--gold);
        color: var(--emerald);
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px var(--shadow);
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide scroll to top button
    const handleScroll = throttle(() => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ===== LOADING STATES =====
    
    // Add loading states to buttons
    const addLoadingState = (button, text = 'Loading...') => {
        const originalText = button.textContent;
        button.textContent = text;
        button.disabled = true;
        button.style.opacity = '0.7';
        
        return () => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.opacity = '1';
        };
    };
    
    // ===== ACCESSIBILITY ENHANCEMENTS =====
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // Escape key to close mobile menu
        if (e.key === 'Escape') {
            const mobileMenu = document.querySelector('.nav.mobile-open');
            if (mobileMenu) {
                mobileMenu.classList.remove('mobile-open');
            }
        }
    });
    
    // Note: Focus indicators for navigation links are handled in Step 2 (lines 314-322)
    // No need for generic focus handlers here - CSS handles form input focus styling
    
    // ===== PERFORMANCE OPTIMIZATIONS =====
    
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    console.log('🐉 Night Watcher Forum - JavaScript loaded successfully!');
});

// ===== GLOBAL FUNCTIONS =====

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyle);

// ===== HOMEPAGE DYNAMIC CONTENT LOADING (HW4 Update) =====

/**
 * Load homepage content from database
 * Fetches articles and renders them dynamically
 */
async function loadHomepageContent() {
    try {
        console.log('🔄 Loading homepage content from database...');
        
        // Fetch articles from API
        const articlesData = await fetchAPI('/articles');
        
        if (!articlesData) {
            console.warn('⚠️  Failed to load articles, using static content');
            return; // Graceful degradation: static HTML remains
        }
        
        const articles = articlesData.data;
        console.log(`✅ Loaded ${articles.length} articles from database`);
        
        // Separate articles by category
        const latestArticles = articles.filter(a => a.category === 'latest').slice(0, 5);
        const hotTopics = articles.filter(a => a.category === 'hot').slice(0, 5);
        
        // Fetch actual fan works for third column
        const fanworksData = await fetchAPI('/fanworks?sort=liked&limit=5');
        
        // Render each section
        if (latestArticles.length > 0) renderLatestArticles(latestArticles);
        if (hotTopics.length > 0) renderHotTopics(hotTopics);
        if (fanworksData && fanworksData.data.length > 0) {
            renderFeaturedFanWorks(fanworksData.data);
        }
        
        console.log('✅ Homepage content loaded successfully');
    } catch (error) {
        console.error('❌ Error loading homepage content:', error);
    }
}

/**
 * Render featured fan works section (third column)
 */
function renderFeaturedFanWorks(fanworks) {
    const container = document.querySelector('.grid-3 .card:nth-child(3) .card-content');
    if (!container) return;
    
    container.innerHTML = '';
    
    fanworks.forEach(work => {
        const workHTML = `
            <article class="thread-item">
                <h3 class="thread-title">${escapeHTML(work.title)}</h3>
                <div class="thread-meta">
                    <span>By: ${escapeHTML(work.artist)}</span>
                    <span>${formatTimestamp(work.uploadDate)}</span>
                    <span>❤️ ${work.likes} likes</span>
                </div>
                <p>${escapeHTML(work.description || 'Creative fan work from our community.')}</p>
                <a href="fanworks.html" class="btn btn-small btn-outline" style="margin-top: 0.5rem;">
                    View Gallery
                </a>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', workHTML);
    });
}

/**
 * Render latest articles section
 */
function renderLatestArticles(articles) {
    const container = document.querySelector('.grid-3 .card:nth-child(1) .card-content');
    if (!container) return;
    
    container.innerHTML = ''; // Clear static content
    
    articles.forEach(article => {
        const articleHTML = `
            <article class="thread-item" data-article-id="${article._id}">
                <h3 class="thread-title">${escapeHTML(article.title)}</h3>
                <div class="thread-meta">
                    <span>By: ${escapeHTML(article.author)}</span>
                    <span>${formatTimestamp(article.timestamp)}</span>
                    <span>💬 ${article.comments} comments</span>
                </div>
                <p>${escapeHTML(article.content)}</p>
                <div class="article-details" style="display: none;">
                    <p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                        ${escapeHTML(article.fullContent || article.content)}
                    </p>
                </div>
                <button class="btn btn-small btn-outline learn-more-btn" style="margin-top: 0.5rem;">
                    Learn More
                </button>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', articleHTML);
    });
    
    // Re-attach event listeners for "Learn More" buttons
    attachLearnMoreListeners();
}

/**
 * Render hot topics section
 */
function renderHotTopics(articles) {
    const container = document.querySelector('.grid-3 .card:nth-child(2) .card-content');
    if (!container) return;
    
    container.innerHTML = '';
    
    articles.forEach(article => {
        const articleHTML = `
            <article class="thread-item" data-article-id="${article._id}">
                <h3 class="thread-title">${escapeHTML(article.title)}</h3>
                <div class="thread-meta">
                    <span>By: ${escapeHTML(article.author)}</span>
                    <span>${formatTimestamp(article.timestamp)}</span>
                    <span>👁️ ${article.views || 0} views</span>
                </div>
                <p>${escapeHTML(article.content)}</p>
                <div class="article-details" style="display: none;">
                    <p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                        ${escapeHTML(article.fullContent || article.content)}
                    </p>
                </div>
                <button class="btn btn-small btn-outline learn-more-btn" style="margin-top: 0.5rem;">
                    Learn More
                </button>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', articleHTML);
    });
    
    attachLearnMoreListeners();
}

/**
 * Render featured works section
 */
function renderFeaturedWorks(articles) {
    const container = document.querySelector('.grid-3 .card:nth-child(3) .card-content');
    if (!container) return;
    
    container.innerHTML = '';
    
    articles.forEach(article => {
        const articleHTML = `
            <article class="thread-item" data-article-id="${article._id}">
                <h3 class="thread-title">${escapeHTML(article.title)}</h3>
                <div class="thread-meta">
                    <span>By: ${escapeHTML(article.author)}</span>
                    <span>${formatTimestamp(article.timestamp)}</span>
                    <span>❤️ ${article.likes || 0} likes</span>
                </div>
                <p>${escapeHTML(article.content)}</p>
                <div class="article-details" style="display: none;">
                    <p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                        ${escapeHTML(article.fullContent || article.content)}
                    </p>
                </div>
                <button class="btn btn-small btn-outline learn-more-btn" style="margin-top: 0.5rem;">
                    Learn More
                </button>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', articleHTML);
    });
    
    attachLearnMoreListeners();
}

/**
 * Attach event listeners to "Learn More" buttons
 * Re-used after dynamic content rendering
 */
function attachLearnMoreListeners() {
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    learnMoreButtons.forEach(btn => {
        // Remove existing listener to avoid duplicates
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Attach new listeners
    document.querySelectorAll('.learn-more-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const details = this.previousElementSibling;
            if (details && details.classList.contains('article-details')) {
                const isHidden = details.style.display === 'none';
                details.style.display = isHidden ? 'block' : 'none';
                this.textContent = isHidden ? 'Show Less' : 'Learn More';
            }
        });
    });
}
