const API_URL = '/api/artists';

let allArtists = [];

const artistGrid = document.getElementById('artist-grid');
const searchInput = document.getElementById('search-input');

const artistModal = document.getElementById('artist-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const artistForm = document.getElementById('artist-form');
const artistIdInput = document.getElementById('artist-id');
const nameInput = document.getElementById('name');
const modalTitle = document.getElementById('modal-title');
const submitBtn = document.getElementById('submit-btn');

const actionModal = document.getElementById('action-modal');
const closeActionModalBtn = document.getElementById('close-action-modal-btn');
const actionArtistName = document.getElementById('action-artist-name');
const modalEditBtn = document.getElementById('modal-edit-btn');
const modalDeleteBtn = document.getElementById('modal-delete-btn');

let selectedArtist = null;

document.addEventListener('DOMContentLoaded', fetchArtists);

async function fetchArtists() {
    try {
        const response = await fetch(API_URL);
        allArtists = await response.json();
        renderCards(allArtists);
    } catch (error) {
        console.error('Error fetching artists:', error);
    }
}

function renderCards(artists) {
    artistGrid.innerHTML = '';
    if (!artists || artists.length === 0) {
        artistGrid.innerHTML = '<div class="col-12 text-center text-muted py-4 fst-italic">No artists found.</div>';
        return;
    }

    artists.forEach(artist => {
        const artistId = artist.id !== undefined ? artist.id : artist.artistId;
        const artistName = artist.name !== undefined ? artist.name : artist.artistName;

        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4';

        col.innerHTML = `
            <div class="artist-card h-100 p-4 rounded-4 shadow-sm d-flex align-items-center justify-content-center text-center">
                <h3 class="m-0 fs-5 fw-semibold text-secondary">${artistName}</h3>
            </div>
        `;

        const card = col.querySelector('.artist-card');
        card.addEventListener('click', () => {
            selectedArtist = { id: artistId, name: artistName };
            actionArtistName.innerText = artistName;
            actionModal.style.display = 'block';
        });

        artistGrid.appendChild(col);
    });
}

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredArtists = allArtists.filter(artist => {
        const name = artist.name !== undefined ? artist.name : artist.artistName;
        return name.toLowerCase().includes(searchTerm);
    });
    renderCards(filteredArtists);
});

openModalBtn.addEventListener('click', () => {
    resetForm();
    modalTitle.innerText = 'Add New Artist';
    submitBtn.innerText = 'Save Artist';
    artistModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => artistModal.style.display = 'none');
cancelBtn.addEventListener('click', () => artistModal.style.display = 'none');
closeActionModalBtn.addEventListener('click', () => actionModal.style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === artistModal) artistModal.style.display = 'none';
    if (e.target === actionModal) actionModal.style.display = 'none';
});

modalEditBtn.addEventListener('click', () => {
    actionModal.style.display = 'none';
    openEditModal(selectedArtist.id, selectedArtist.name);
});

modalDeleteBtn.addEventListener('click', async () => {
    actionModal.style.display = 'none';
    await deleteArtist(selectedArtist.id);
});

function openEditModal(id, name) {
    artistIdInput.value = id;
    nameInput.value = name;
    modalTitle.innerText = 'Edit Artist';
    submitBtn.innerText = 'Update Artist';
    artistModal.style.display = 'block';
}

artistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = artistIdInput.value;
    const artistData = { name: nameInput.value };

    if (id) {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artistData)
        });
    } else {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artistData)
        });
    }

    artistModal.style.display = 'none';
    await fetchArtists();
});

async function deleteArtist(id) {
    if (confirm('Are you sure you want to delete this artist?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await fetchArtists();
            }
        } catch (error) {
            console.error('Error deleting artist:', error);
        }
    }
}

function resetForm() {
    artistIdInput.value = '';
    nameInput.value = '';
}