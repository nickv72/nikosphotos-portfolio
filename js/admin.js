// ========================================
// CLOUDINARY CONFIGURATION
// ========================================
const CLOUDINARY_CONFIG = {
    cloudName: 'dd56fxpg5',
    uploadPreset: 'nikosphotos_unsigned',
    folder: 'nikosphotos'
};

// ========================================
// DOM ELEMENTS
// ========================================
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const uploadBtn = document.getElementById('uploadBtn');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const message = document.getElementById('message');
const categorySelect = document.getElementById('categorySelect');
const photoTitle = document.getElementById('photoTitle');
const galleryGrid = document.getElementById('galleryGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

let selectedFile = null;
let currentFilter = 'all';

// ========================================
// PHOTO DATABASE (localStorage)
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

function savePhotosDB(db) {
    localStorage.setItem('nikosphotos_db', JSON.stringify(db));
}

function addPhotoToDB(category, photo) {
    const db = getPhotosDB();
    db[category].push(photo);
    savePhotosDB(db);
}

function removePhotoFromDB(category, publicId) {
    const db = getPhotosDB();
    db[category] = db[category].filter(p => p.public_id !== publicId);
    savePhotosDB(db);
}

// ========================================
// FILE UPLOAD HANDLING
// ========================================
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        showMessage('Παρακαλώ επιλέξτε μια εικόνα!', 'error');
        return;
    }

    selectedFile = file;
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
        uploadBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// ========================================
// UPLOAD TO CLOUDINARY
// ========================================
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        showMessage('Παρακαλώ επιλέξτε μια φωτογραφία!', 'error');
        return;
    }

    const category = categorySelect.value;
    const title = photoTitle.value.trim() || 'Untitled';

    uploadBtn.disabled = true;
    uploadProgress.style.display = 'block';
    message.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('folder', `${CLOUDINARY_CONFIG.folder}/${category}`);
        formData.append('context', `title=${title}|category=${category}`);

        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressFill.style.width = percent + '%';
                progressFill.textContent = percent + '%';
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                
                // Save to DB
                addPhotoToDB(category, {
                    public_id: response.public_id,
                    secure_url: response.secure_url,
                    title: title,
                    category: category,
                    created_at: response.created_at
                });

                showMessage('Η φωτογραφία ανέβηκε επιτυχώς! 🎉', 'success');
                resetUploadForm();
                loadGallery(currentFilter);
            } else {
                throw new Error('Upload failed');
            }
        });

        xhr.addEventListener('error', () => {
            throw new Error('Network error');
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
        xhr.send(formData);

    } catch (error) {
        console.error('Upload error:', error);
        showMessage('Σφάλμα κατά το ανέβασμα. Δοκιμάστε ξανά.', 'error');
        uploadBtn.disabled = false;
    }
});

function resetUploadForm() {
    selectedFile = null;
    fileInput.value = '';
    previewContainer.style.display = 'none';
    uploadProgress.style.display = 'none';
    progressFill.style.width = '0%';
    progressFill.textContent = '0%';
    uploadBtn.disabled = true;
    photoTitle.value = '';
}

// ========================================
// GALLERY MANAGEMENT
// ========================================
function loadGallery(filter = 'all') {
    currentFilter = filter;
    const db = getPhotosDB();
    galleryGrid.innerHTML = '';

    let photos = [];
    
    if (filter === 'all') {
        // Combine all categories
        Object.keys(db).forEach(category => {
            photos = photos.concat(db[category].map(p => ({...p, category})));
        });
    } else {
        photos = db[filter].map(p => ({...p, category: filter}));
    }

    if (photos.length === 0) {
        galleryGrid.innerHTML = '<div class="loading">Δεν υπάρχουν φωτογραφίες σε αυτή την κατηγορία.</div>';
        return;
    }

    // Sort by date (newest first)
    photos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    photos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <div class="gallery-item-image">
                <img src="${photo.secure_url}" alt="${photo.title}">
            </div>
            <div class="gallery-item-info">
                <div class="gallery-item-category">${getCategoryLabel(photo.category)}</div>
                <div class="gallery-item-name">${photo.title}</div>
                <button class="btn-delete" data-public-id="${photo.public_id}" data-category="${photo.category}">
                    Διαγραφή
                </button>
            </div>
        `;
        galleryGrid.appendChild(item);
    });

    // Add delete listeners
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
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

async function handleDelete(e) {
    const publicId = e.target.getAttribute('data-public-id');
    const category = e.target.getAttribute('data-category');
    
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη φωτογραφία;')) {
        return;
    }

    try {
        // Note: Cloudinary free tier doesn't support deletion via frontend
        // We'll just remove from our local DB
        // For production, you'd need a backend endpoint to handle deletion
        
        removePhotoFromDB(category, publicId);
        showMessage('Η φωτογραφία διαγράφηκε από την τοπική βάση δεδομένων.', 'success');
        loadGallery(currentFilter);
        
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('Σφάλμα κατά τη διαγραφή.', 'error');
    }
}

// ========================================
// FILTER BUTTONS
// ========================================
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        loadGallery(filter);
    });
});

// ========================================
// UTILITY FUNCTIONS
// ========================================
function showMessage(text, type) {
    message.textContent = text;
    message.className = 'message ' + type;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 5000);
}

// ========================================
// INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadGallery('all');
});
