package backend.proyect1.controller;

import backend.proyect1.model.Artist;
import backend.proyect1.service.ArtistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @GetMapping
    public List<Artist> getAllArtists() {
        return artistService.getAllArtists();
    }


    @GetMapping("/{id}")
    public ResponseEntity<Artist> getArtistById(@PathVariable(value = "id") Integer id) {
        try {
            Artist artist = artistService.getArtistById(id);
            if (artist != null) {
                return ResponseEntity.ok(artist);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Artist> saveArtist(@RequestBody Artist artist) {
        Artist savedArtist = artistService.saveArtist(artist);
        return new ResponseEntity<>(savedArtist, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Artist> updateArtist(@PathVariable(value = "id") Integer id, @RequestBody Artist artistDetails) {
        try {
            Artist existingArtist = artistService.getArtistById(id);
            if (existingArtist != null) {
                // Actualiza los campos según los atributos que tenga tu entidad Artist
                existingArtist.setName(artistDetails.getName());
                // existingArtist.setGenre(artistDetails.getGenre()); // Ejemplo de otro campo si lo tienes

                Artist updatedArtist = artistService.saveArtist(existingArtist);
                return ResponseEntity.ok(updatedArtist);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtist(@PathVariable(value = "id") Integer id) {
        try {
            Artist existingArtist = artistService.getArtistById(id);
            if (existingArtist != null) {
                artistService.deleteArtistById(id);
                return ResponseEntity.noContent().build(); // 204 No Content
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}