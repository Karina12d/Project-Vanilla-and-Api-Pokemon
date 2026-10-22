package backend.proyect1.model;

import jakarta.persistence.Entity;

import java.util.List;


public class Pokemon {

    private String pokemonName;
    private String spriteUrl;
    private String moveName;
    private String typeName;

    public Pokemon() {
    }

    public Pokemon(String pokemonName, String spriteUrl, String moveName, String typeName) {
        this.pokemonName = pokemonName;
        this.spriteUrl = spriteUrl;
        this.moveName = moveName;
        this.typeName = typeName;
    }

    public String getPokemonName() {
        return pokemonName;
    }

    public void setPokemonName(String pokemonName) {
        this.pokemonName = pokemonName;
    }

    public String getSpriteUrl() {
        return spriteUrl;
    }

    public void setSpriteUrl(String spriteUrl) {
        this.spriteUrl = spriteUrl;
    }

    public String getMoveName() {
        return moveName;
    }

    public void setMoveName(String moveName) {
        this.moveName = moveName;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }
}