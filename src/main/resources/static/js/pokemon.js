let searchTimeout = null;
let allPokemons = [];

const searchInput = document.getElementById('search-input');
const pokemonGrid = document.getElementById('pokemon-grid');
const actionModal = document.getElementById('action-modal');
const closeActionModalBtn = document.getElementById('close-action-modal-btn');

document.addEventListener('DOMContentLoaded', () => {
    fetchAllPokemons();
});


async function fetchAllPokemons() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        allPokemons = data.results;
        renderPokemonGrid(allPokemons);
    } catch (error) {
        console.error("Error loading Pokémon list:", error);
    }
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        if (!query) {
            renderPokemonGrid(allPokemons);
            return;
        }

        const filtered = allPokemons.filter(pokemon => pokemon.name.includes(query));

        if (filtered.length === 0) {
            pokemonGrid.innerHTML = `<div class="col-12 text-center text-muted py-4">No Pokémon found matching "${query}".</div>`;
        } else {
            renderPokemonGrid(filtered);
        }
    }, 4000);
});

function renderPokemonGrid(pokemons) {
    pokemonGrid.innerHTML = '';

    pokemons.forEach((pokemon) => {
        const id = pokemon.url.split('/').filter(Boolean).pop();
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

        const col = document.createElement('div');
        col.className = 'col-12 col-md-4'; // Diseño de columnas responsivas de Bootstrap

        col.innerHTML = `
            <div class="artist-card p-3 rounded-4 shadow-sm text-center bg-white d-flex align-items-center gap-3" onclick="fetchNestedDetails('${pokemon.name}')">
                <img src="${spriteUrl}" alt="${pokemon.name}" class="bg-white rounded-circle p-1 border shadow-sm" style="width: 60px; height: 60px; object-fit: contain;">
                <h5 class="fw-bold text-dark m-0 text-capitalize fs-6">${pokemon.name}</h5>
            </div>
        `;
        pokemonGrid.appendChild(col);
    });
}

async function fetchNestedDetails(pokemonName) {
    try {
        const response = await fetch(`http://localhost:8080/api/pokemon/${pokemonName}`);
        if (!response.ok) throw new Error("Could not fetch nested data");

        const data = await response.json();

        document.getElementById('action-pokemon-name').textContent = data.pokemonName;
        document.getElementById('modal-poke-sprite').src = data.spriteUrl;
        document.getElementById('modal-poke-move').textContent = data.moveName;
        document.getElementById('modal-poke-type').textContent = data.typeName;

        actionModal.style.display = 'block';
    } catch (error) {
        alert("Error loading nested details from backend.");
    }
}

closeActionModalBtn.addEventListener('click', () => {
    actionModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === actionModal) {
        actionModal.style.display = 'none';
    }
});