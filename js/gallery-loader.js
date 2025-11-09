// ========================================
// GALLERY LOADER - Load photos from localStorage DB
// ========================================

function getPhotosDB() {
    const photos = localStorage.getItem('nikosphotos_db');
    return photos ? JSON.parse(photos) : {
        home: [],
        birds: [],
        insects: [],
        various: []
    };
}

function getCategoryLabel(category) {
    const labels = {
        birds: 'Πτηνά',
        insects: 'Έντομα',
        various: 'Διάφορες',
        home: 'Αρχική'
    };
    return labels[category] || category;
}

// ========================================
// LOAD HOME PAGE GALLERY
// ========================================
function loadHomeGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    const db = getPhotosDB();
    const homePhotos = db.home.slice(0, 3); // Get first 3 photos

    if (homePhotos.length === 0) {
        // If no photos in DB, keep the placeholder structure
        return;
    }

    galleryGrid.innerHTML = '';
    
    homePhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-category', 'featured');
        item.innerHTML = `
            <img src="${photo.secure_url}" alt="${photo.title}">
            <div class="gallery-overlay">
                <span class="gallery-title">${photo.title}</span>
            </div>
        `;
        galleryGrid.appendChild(item);
    });

    // Reinitialize lightbox for new images
    reinitializeLightbox();
}

// ========================================
// LOAD PROJECTS PAGE GALLERY
// ========================================
function loadProjectsGallery() {
    const masonryGrid = document.getElementById('masonryGrid');
    if (!masonryGrid) return;

    const db = getPhotosDB();
    masonryGrid.innerHTML = '';

    // Combine all categories
    const allPhotos = [];
    ['birds', 'insects', 'various'].forEach(category => {
        db[category].forEach(photo => {
            allPhotos.push({
                ...photo,
                category: category
            });
        });
    });

    if (allPhotos.length === 0) {
        masonryGrid.innerHTML = '<div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6c757d;">Δεν υπάρχουν φωτογραφίες ακόμα. Χρησιμοποιήστε το <a href="admin.html" style="color: #3498db;">Admin Panel</a> για να ανεβάσετε φωτογραφίες.</div>';
        return;
    }

    // Sort by date (newest first)
    allPhotos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    allPhotos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.setAttribute('data-category', photo.category);
        item.innerHTML = `
            <img src="${photo.secure_url}" alt="${photo.title}">
            <div class="gallery-overlay">
                <span class="gallery-title">${photo.title}</span>
                <span class="gallery-category">${getCategoryLabel(photo.category)}</span>
            </div>
        `;
        masonryGrid.appendChild(item);
    });

    // Reinitialize lightbox for new images
    reinitializeLightbox();
}

// ========================================
// REINITIALIZE LIGHTBOX
// ========================================
function reinitializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');
    const galleryItems = document.querySelectorAll('.gallery-item img, .masonry-item img');

    let currentImageIndex = 0;
    let images = [];

    // Clear previous event listeners by cloning
    galleryItems.forEach((item, index) => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        images.push(newItem.src);
        
        newItem.addEventListener('click', () => {
            currentImageIndex = index;
            showImage(currentImageIndex);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function showImage(index) {
        if (lightboxImg) {
            lightboxImg.src = images[index];
        }
    }

    function closeLightboxFunc() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    if (closeLightbox) {
        const newCloseLightbox = closeLightbox.cloneNode(true);
        closeLightbox.parentNode.replaceChild(newCloseLightbox, closeLightbox);
        newCloseLightbox.addEventListener('click', closeLightboxFunc);
    }

    if (lightbox) {
        const newLightbox = lightbox.cloneNode(true);
        lightbox.parentNode.replaceChild(newLightbox, lightbox);
        newLightbox.addEventListener('click', (e) => {
            if (e.target === newLightbox) {
                closeLightboxFunc();
            }
        });
    }

    // Navigation buttons
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        showImage(currentImageIndex);
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        showImage(currentImageIndex);
    }

    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        newPrevBtn.addEventListener('click', showPreviousImage);
    }

    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', showNextImage);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const currentLightbox = document.getElementById('lightbox');
        if (!currentLightbox || !currentLightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightboxFunc();
        if (e.key === 'ArrowLeft') showPreviousImage();
        if (e.key === 'ArrowRight') showNextImage();
    });
}

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and load appropriate gallery
    if (document.querySelector('.featured-gallery')) {
        loadHomeGallery();
    }
    
    if (document.getElementById('masonryGrid')) {
        loadProjectsGallery();
    }
});
