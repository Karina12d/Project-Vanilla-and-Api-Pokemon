package backend.proyect1.service;

import backend.proyect1.model.Pokemon;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

@Service
public class PokemonService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Pokemon getNestedPokemonInfo(String pokemonName) {
        // 1. Endpoint 1: Pokemon
        String urlPokemon = "https://pokeapi.co/api/v2/pokemon/" + pokemonName.toLowerCase();
        Map pokemonData = restTemplate.getForObject(urlPokemon, Map.class);

        String name = (String) pokemonData.get("name");

        Map sprites = (Map) pokemonData.get("sprites");
        String spriteUrl = sprites != null ? (String) sprites.get("front_default") : "";

        // Endpoint 2
        List<Map> movesList = (List<Map>) pokemonData.get("moves");
        String urlMove = (String) ((Map) movesList.get(0).get("move")).get("url");

        // Endpoint 3
        List<Map> typesList = (List<Map>) pokemonData.get("types");
        String urlType = (String) ((Map) typesList.get(0).get("type")).get("url");

        // 2. Endpoint 2: Move
        Map moveData = restTemplate.getForObject(urlMove, Map.class);
        String moveName = (String) moveData.get("name");

        // 3. Endpoint 3: Type
        Map typeData = restTemplate.getForObject(urlType, Map.class);
        String typeName = (String) typeData.get("name");

        Pokemon pokemon = new Pokemon();
        pokemon.setPokemonName(name);
        pokemon.setSpriteUrl(spriteUrl);
        pokemon.setMoveName(moveName);
        pokemon.setTypeName(typeName);

        return pokemon;
    }
}