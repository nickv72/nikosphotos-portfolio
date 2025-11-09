// ========================================
// NAVIGATION TOGGLE (Mobile)
// ========================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = navMenu.classList.contains('active') 
            ? 'rotate(45deg) translate(5px, 5px)' 
            : 'none';
        spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
        spans[2].style.transform = navMenu.classList.contains('active') 
            ? 'rotate(-45deg) translate(7px, -6px)' 
            : 'none';
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = navToggle?.querySelectorAll('span');
        if (spans) {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// ========================================
// GALLERY LIGHTBOX
// ========================================
let lightboxInitialized = false;

function initializeLightbox() {
    // Prevent multiple initializations
    if (lightboxInitialized) return;
    lightboxInitialized = true;

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightboxBtn = document.querySelector('.close-lightbox');
    
    if (!lightbox || !lightboxImg) return;

    let currentIndex = 0;
    let allImages = [];

    function updateImageList() {
        const galleryImages = document.querySelectorAll('.gallery-item img, .masonry-item img');
        allImages = [];
        
        galleryImages.forEach((img, index) => {
            allImages.push(img.src);
            
            // Remove old listeners by cloning
            const newImg = img.cloneNode(true);
            img.parentNode.replaceChild(newImg, img);
            
            // Add click event
            newImg.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                currentIndex = index;
                openLightbox(allImages[currentIndex]);
            });
            
            newImg.style.cursor = 'pointer';
        });
    }

    function openLightbox(imageSrc) {
        lightboxImg.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Close button
    if (closeLightboxBtn) {
        closeLightboxBtn.addEventListener('click', closeLightbox);
    }

    // Click outside to close
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
            openLightbox(allImages[currentIndex]);
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % allImages.length;
            openLightbox(allImages[currentIndex]);
        }
    });

    // Navigation buttons
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
            openLightbox(allImages[currentIndex]);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % allImages.length;
            openLightbox(allImages[currentIndex]);
        });
    }

    // Initial setup
    updateImageList();

    // Return update function for external use
    window.updateLightboxImages = updateImageList;
}

// ========================================
// FILTER FUNCTIONALITY (Projects Page)
// ========================================
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const masonryGrid = document.querySelector('.masonry-grid');
    
    if (filterButtons.length === 0 || !masonryGrid) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            const masonryItems = document.querySelectorAll('.masonry-item');
            
            let visibleCount = 0;
            
            masonryItems.forEach(item => {
                // Add transition for smooth effect
                item.style.transition = 'all 0.3s ease';
                
                if (filterValue === 'all') {
                    item.style.display = 'flex';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                    visibleCount++;
                } else {
                    if (item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'flex';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 10);
                        visibleCount++;
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                }
            });

            // Show message if no photos in category
            setTimeout(() => {
                let emptyMessage = document.getElementById('empty-category-message');
                
                if (visibleCount === 0) {
                    if (!emptyMessage) {
                        emptyMessage = document.createElement('div');
                        emptyMessage.id = 'empty-category-message';
                        emptyMessage.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d; font-size: 1.1rem;';
                        masonryGrid.appendChild(emptyMessage);
                    }
                    emptyMessage.innerHTML = `Δεν υπάρχουν φωτογραφίες σε αυτή την κατηγορία.<br><a href="admin.html" style="color: #3498db; margin-top: 10px; display: inline-block;">Ανέβασε φωτογραφίες από το Admin Panel</a>`;
                    emptyMessage.style.display = 'block';
                } else {
                    if (emptyMessage) {
                        emptyMessage.style.display = 'none';
                    }
                }
            }, 350);

            // Update lightbox after filter
            if (window.updateLightboxImages) {
                setTimeout(() => {
                    window.updateLightboxImages();
                }, 350);
            }
        });
    });
}

// ========================================
// STATS COUNTER ANIMATION
// ========================================
const statNumbers = document.querySelectorAll('.stat-number');

const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
};

// Intersection Observer for stats
if (statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// ========================================
// CONTACT FORM HANDLING
// ========================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission (replace with actual backend call)
        setTimeout(() => {
            formMessage.textContent = 'Το μήνυμά σας εστάλη επιτυχώς! Θα επικοινωνήσω μαζί σας σύντομα.';
            formMessage.className = 'form-message success';
            contactForm.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }, 1000);
    });
}

// ========================================
// SMOOTH SCROLLING
// ========================================
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

// ========================================
// SCROLL TO TOP ON PAGE LOAD
// ========================================
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

// ========================================
// ADD SCROLL CLASS TO NAVBAR
// ========================================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    }
});

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lightbox
    initializeLightbox();
    
    // Initialize filters (if on projects page)
    initializeFilters();
});
