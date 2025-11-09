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

    // Update lightbox after adding images
    if (window.updateLightboxImages) {
        setTimeout(() => window.updateLightboxImages(), 100);
    }
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

    // Update lightbox and filters after adding images
    if (window.updateLightboxImages) {
        setTimeout(() => window.updateLightboxImages(), 100);
    }
}

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Wait for script.js to initialize first
    setTimeout(() => {
        // Check which page we're on and load appropriate gallery
        if (document.querySelector('.featured-gallery')) {
            loadHomeGallery();
        }
        
        if (document.getElementById('masonryGrid')) {
            loadProjectsGallery();
        }
    }, 50);
});
