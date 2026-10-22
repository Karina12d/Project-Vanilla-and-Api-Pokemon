package backend.proyect1.controller;

import backend.proyect1.model.Pokemon;
import backend.proyect1.service.PokemonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pokemon")
@CrossOrigin(origins = "*")
public class PokemonController {

    @Autowired
    private PokemonService pokemonService;

    @GetMapping("/{name}")
    public Pokemon getPokemonDetails(@PathVariable String name) {
        return pokemonService.getNestedPokemonInfo(name);
    }
}