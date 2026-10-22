// pokemon.js

let searchTimeout = null;

const searchInput = document.getElementById('search-input');
const loadingSpinner = document.getElementById('loading-spinner');
const resultContainer = document.getElementById('result-container');
const errorContainer = document.getElementById('error-container');

const pokeName = document.getElementById('poke-name');
const pokeSprite = document.getElementById('poke-sprite');
const pokeMove = document.getElementById('poke-move');
const pokeType = document.getElementById('poke-type');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    clearTimeout(searchTimeout);

    if (!query) {
        loadingSpinner.classList.add('d-none');
        resultContainer.classList.add('d-none');
        errorContainer.classList.add('d-none');
        return;
    }

    loadingSpinner.classList.remove('d-none');
    resultContainer.classList.add('d-none');
    errorContainer.classList.add('d-none');

    searchTimeout = setTimeout(() => {
        fetchPokemonData(query);
    }, 4000);
});

async function fetchPokemonData(query) {
    try {
        const response = await fetch(`http://localhost:8080/api/pokemon/${query}`);

        loadingSpinner.classList.add('d-none');

        if (!response.ok) {
            throw new Error("Pokémon not found");
        }

        const data = await response.json();

        pokeName.textContent = data.pokemonName;
        pokeSprite.src = data.spriteUrl;
        pokeMove.textContent = data.moveName;
        pokeType.textContent = data.typeName;

        resultContainer.classList.remove('d-none');
        errorContainer.classList.add('d-none');

    } catch (error) {
        loadingSpinner.classList.add('d-none');
        resultContainer.classList.add('d-none');
        errorContainer.classList.remove('d-none');
    }
}