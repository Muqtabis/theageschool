document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const adminFab = document.getElementById('admin-fab');
    const modal = document.getElementById('upload-modal');
    
    let isAdmin = false;

    // --- State & Routing ---
    const AppState = {
        currentPage: 'albums',
        currentAlbumId: null,
    };

    const navigateTo = (page, albumId = null) => {
        AppState.currentPage = page;
        AppState.currentAlbumId = albumId;
        window.location.hash = page === 'photos' ? `/album/${albumId}` : '/';
        render();
    };

    // --- API Calls ---
    const api = {
        getSession: () => fetch('/api/session').then(res => res.json()),
        getAlbums: () => fetch('/api/albums').then(res => res.json()),
        getAlbum: (id) => fetch(`/api/albums/${id}`).then(res => res.json()),
        createAlbum: (data) => fetch('/api/albums', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
        uploadPhotos: (albumId, formData) => fetch(`/api/albums/${albumId}/photos`, {
            method: 'POST',
            body: formData
        }),
        deletePhoto: (photoId) => fetch(`/api/photos/${photoId}`, { method: 'DELETE' })
    };

    // --- Render Functions ---
    const render = async () => {
        app.innerHTML = '<h2>Loading...</h2>';
        if (AppState.currentPage === 'albums') {
            const albums = await api.getAlbums();
            renderAlbumGrid(albums);
        } else if (AppState.currentPage === 'photos') {
            const album = await api.getAlbum(AppState.currentAlbumId);
            renderPhotoGrid(album);
        }
    };

    const renderAlbumGrid = (albums) => {
        app.innerHTML = `
            <div class="album-grid">
                ${albums.map(album => `
                    <div class="album-card" data-id="${album.id}">
                        <img src="${album.coverImage}" alt="${album.name}" class="album-cover">
                        <div class="album-info">
                            <h3>${album.name}</h3>
                            <p>${new Date(album.eventDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        document.querySelectorAll('.album-card').forEach(card => {
            card.addEventListener('click', () => navigateTo('photos', card.dataset.id));
        });
    };

    const renderPhotoGrid = (album) => {
        app.innerHTML = `
            <div>
                <a class="breadcrumb" id="back-to-albums">&larr; Back to Albums</a>
                <h2>${album.name}</h2>
                <p>${album.description}</p>
                <div class="photo-grid">
                    ${album.photos.map(photo => `
                        <div class="photo-item">
                            <img src="${photo.src}" alt="${photo.caption}" data-id="${photo.id}">
                            ${isAdmin ? `<button class="photo-delete-btn" data-id="${photo.id}">🗑️</button>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.getElementById('back-to-albums').addEventListener('click', () => navigateTo('albums'));
        document.querySelectorAll('.photo-grid img').forEach(img => {
            img.addEventListener('click', () => openLightbox(img.src));
        });
        if (isAdmin) {
            document.querySelectorAll('.photo-delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this photo?')) {
                        await api.deletePhoto(btn.dataset.id);
                        render();
                    }
                });
            });
        }
    };

    // --- Modal Logic ---
    const initModal = () => {
        const closeBtn = modal.querySelector('.close-modal-btn');
        const modalStatus = document.getElementById('modal-status');
        
        const tabs = modal.querySelectorAll('.tab-link');
        const tabContents = modal.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                tabContents.forEach(c => c.style.display = 'none');
                modal.querySelector(`.tab-content[data-tab="${tab.dataset.tab}"]`).style.display = 'block';
            });
        });

        const createAlbumForm = document.getElementById('create-album-form');
        createAlbumForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            modalStatus.textContent = "Creating...";
            const res = await api.createAlbum({
                name: document.getElementById('album-name').value,
                eventDate: document.getElementById('album-date').value,
                description: document.getElementById('album-description').value,
            });
            if (res.ok) {
                modalStatus.textContent = "Album created successfully!";
                createAlbumForm.reset();
                if(AppState.currentPage === 'albums') render();
            } else {
                modalStatus.textContent = "Error creating album.";
            }
        });
        
        const uploadPhotosForm = document.getElementById('upload-photos-form');
        const dropZone = document.getElementById('drop-zone');
        const photosInput = document.getElementById('photos-input');
        const fileList = document.getElementById('file-list');
        let selectedFiles = [];

        dropZone.addEventListener('click', () => photosInput.click());
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
        photosInput.addEventListener('change', () => handleFiles(photosInput.files));
        
        const handleFiles = (files) => {
            selectedFiles = [...files];
            fileList.innerHTML = `${selectedFiles.length} files selected.`;
        };

        uploadPhotosForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const albumId = document.getElementById('album-select').value;
            if (!albumId || selectedFiles.length === 0) {
                modalStatus.textContent = 'Please select an album and choose files.';
                return;
            }
            const formData = new FormData();
            selectedFiles.forEach(file => formData.append('photos', file));

            modalStatus.textContent = 'Uploading...';
            const res = await api.uploadPhotos(albumId, formData);
            if (res.ok) {
                modalStatus.textContent = 'Upload complete!';
                uploadPhotosForm.reset();
                fileList.innerHTML = '';
                selectedFiles = [];
                if (AppState.currentAlbumId == albumId) render();
            } else {
                 modalStatus.textContent = 'Upload failed.';
            }
        });

        adminFab.addEventListener('click', async () => {
            const albums = await api.getAlbums();
            const albumSelect = document.getElementById('album-select');
            albumSelect.innerHTML = albums.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
            modal.style.display = 'flex';
        });
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
    };
    
    // --- Lightbox Logic ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close-btn');
    const openLightbox = (src) => { lightbox.style.display = 'flex'; lightboxImg.src = src; };
    const closeLightbox = () => { lightbox.style.display = 'none'; };
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });

    // --- Initializer ---
    const init = async () => {
        const session = await api.getSession();
        isAdmin = session.isAdmin;
        
        if (isAdmin) {
            adminFab.style.display = 'block';
            initModal();
        }

        const hash = window.location.hash;
        const match = hash.match(/#\/album\/(\d+)/);
        if (match) {
            navigateTo('photos', match[1]);
        } else {
            navigateTo('albums');
        }

        window.onpopstate = () => {
             const hash = window.location.hash;
             const match = hash.match(/#\/album\/(\d+)/);
             if(match) {
                AppState.currentPage = 'photos';
                AppState.currentAlbumId = match[1];
             } else {
                AppState.currentPage = 'albums';
                AppState.currentAlbumId = null;
             }
             render();
        };
    };

    init();
});