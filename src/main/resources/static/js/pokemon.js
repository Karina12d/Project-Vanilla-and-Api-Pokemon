const ENDPOINTS = {
    pokemon: 'https://pokeapi.co/api/v2/pokemon?limit=24',
    berry: 'https://pokeapi.co/api/v2/berry?limit=24',
    item: 'https://pokeapi.co/api/v2/item?limit=24'
};

let currentEndpointKey = 'pokemon';
let currentData = [];
let debounceTimer = null;

const pokemonGrid = document.getElementById('artist-grid');
const searchInput = document.getElementById('search-input');
const debounceStatus = document.getElementById('debounce-status');
const actionModal = document.getElementById('action-modal');
const closeActionModalBtn = document.getElementById('close-action-modal-btn');
const modalBodyContent = document.getElementById('modal-body-content');

document.addEventListener('DOMContentLoaded', () => {
    fetchData(currentEndpointKey);
});

// Switch between the 3 endpoints
async function switchEndpoint(key) {
    currentEndpointKey = key;
    searchInput.value = '';
    debounceStatus.innerText = '';

    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));

    let tabId = 'tab-pokemon';
    if (key === 'berry') tabId = 'tab-berries';
    if (key === 'item') tabId = 'tab-items';
    document.getElementById(tabId).classList.add('active');

    await fetchData(key);
}

async function fetchData(key) {
    pokemonGrid.innerHTML = '<div class="col-12 text-center text-muted py-4">Loading data from API...</div>';
    try {
        const response = await fetch(ENDPOINTS[key]);
        const data = await response.json();

        currentData = await Promise.all(
            data.results.map(async (item) => {
                const res = await fetch(item.url);
                return await res.json();
            })
        );

        renderCards(currentData, key);
    } catch (error) {
        console.error('Error fetching API:', error);
        pokemonGrid.innerHTML = '<div class="col-12 text-center text-danger py-4">Error loading data.</div>';
    }
}

function renderCards(items, type) {
    pokemonGrid.innerHTML = '';
    if (!items || items.length === 0) {
        pokemonGrid.innerHTML = '<div class="col-12 text-center text-muted py-4 fst-italic">No results found.</div>';
        return;
    }

    items.forEach((item) => {
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4';

        let title = '';
        let subtitle = '';
        let imageUrl = '';

        if (type === 'pokemon') {
            title = item.name.charAt(0).toUpperCase() + item.name.slice(1);
            subtitle = `ID: #${item.id}`;
            imageUrl = item.sprites.front_default || 'https://via.placeholder.com/96';
        } else if (type === 'berry') {
            title = item.name.charAt(0).toUpperCase() + item.name.slice(1) + ' Berry';
            subtitle = `Firmness: ${item.firmness.name}`;
            // Use item.item.name from API response to fetch official sprite correctly
            const berryItemName = item.item ? item.item.name : `${item.name}-berry`;
            imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${berryItemName}.png`;
        } else if (type === 'item') {
            title = item.name.replace(/-/g, ' ').toUpperCase();
            subtitle = `Cost: ${item.cost || 0} Pokédollars`;
            imageUrl = item.sprites && item.sprites.default ? item.sprites.default : 'https://via.placeholder.com/96';
        }

        col.innerHTML = `
            <div class="artist-card h-100 p-3 rounded-4 shadow-sm d-flex flex-column align-items-center justify-content-center text-center">
                <img src="${imageUrl}" width="80" height="80" class="mb-2 object-fit-contain" onerror="this.src='https://via.placeholder.com/80'">
                <h3 class="m-0 fs-5 fw-semibold text-secondary">${title}</h3>
                <span class="badge bg-light text-dark mt-2 border">${subtitle}</span>
            </div>
        `;

        const card = col.querySelector('.artist-card');
        card.addEventListener('click', () => {
            showModal(item, type, imageUrl);
        });

        pokemonGrid.appendChild(col);
    });
}

// Search with 4-second debounce delay
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    clearTimeout(debounceTimer);
    debounceStatus.innerText = 'Waiting 4 seconds (Debounce) to query the API...';

    debounceTimer = setTimeout(() => {
        debounceStatus.innerText = `Search applied for: "${searchTerm}"`;

        const filtered = currentData.filter(item => {
            return item.name.toLowerCase().includes(searchTerm) || (item.id && item.id.toString() === searchTerm);
        });

        renderCards(filtered, currentEndpointKey);
    }, 4000);
});


function showModal(item, type, imageUrl) {
    let content = '';

    if (type === 'pokemon') {
        const pokeName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        const pokeImage = item.sprites.other['official-artwork'].front_default || imageUrl;
        const types = item.types.map(t => `<span class="badge bg-secondary me-1">${t.type.name}</span>`).join('');

        content = `
            <img src="${pokeImage}" class="mb-3 img-fluid object-fit-contain" style="max-height: 160px;">
            <h2 class="h4 fw-bold mb-1">${pokeName}</h2>
            <p class="text-muted small mb-2"><strong>ID:</strong> #${item.id}</p>
            <div class="mb-3">${types}</div>
            <div class="text-start bg-light p-3 rounded-3 small">
                <p class="mb-1"><strong>Height:</strong> ${item.height / 10} m</p>
                <p class="mb-1"><strong>Weight:</strong> ${item.weight / 10} kg</p>
            </div>
        `;
    } else if (type === 'berry') {
        content = `
            <img src="${imageUrl}" class="mb-3 img-fluid object-fit-contain" style="max-height: 120px;">
            <h2 class="h4 fw-bold mb-3 text-uppercase">${item.name} BERRY</h2>
            <div class="text-start bg-light p-3 rounded-3 small">
                <p class="mb-1"><strong>Growth Time:</strong> ${item.growth_time} hours</p>
                <p class="mb-1"><strong>Max Harvest:</strong> ${item.max_harvest}</p>
                <p class="mb-0"><strong>Smoothness:</strong> ${item.smoothness}</p>
            </div>
        `;
    } else if (type === 'item') {
        content = `
            <img src="${imageUrl}" class="mb-3 img-fluid object-fit-contain" style="max-height: 120px;">
            <h2 class="h4 fw-bold mb-3 text-uppercase">${item.name.replace(/-/g, ' ')}</h2>
            <div class="text-start bg-light p-3 rounded-3 small">
                <p class="mb-1"><strong>Cost:</strong> ${item.cost} Pokédollars</p>
                <p class="mb-0"><strong>Category:</strong> ${item.category ? item.category.name : 'N/A'}</p>
            </div>
        `;
    }

    modalBodyContent.innerHTML = content;
    actionModal.style.display = 'block';
}

closeActionModalBtn.addEventListener('click', () => actionModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === actionModal) actionModal.style.display = 'none';
});