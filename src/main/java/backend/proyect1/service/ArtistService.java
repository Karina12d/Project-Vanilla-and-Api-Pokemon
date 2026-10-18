package backend.proyect1.service;

import java.util.List;
import java.util.Optional;

import backend.proyect1.model.Artist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import backend.proyect1.repository.ArtistRepository;

@Service
public class ArtistService {

    @Autowired
    private ArtistRepository artistRepository;

    public Artist saveArtist(Artist artist) {
        if (artist.getArtistId() == null) {
            // Finds the current maximum ID in the database and adds 1
            Integer maxId = artistRepository.findAll().stream()
                    .mapToInt(Artist::getArtistId)
                    .max().orElse(0);
            artist.setArtistId(maxId + 1);
        }
        return artistRepository.save(artist);
    }

    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    public Artist getArtistById(Integer artistId) {
        Optional<Artist> optional = artistRepository.findById(artistId);
        Artist artist = null;
        if (optional.isPresent()) {
            artist = optional.get();
        } else {
            throw new RuntimeException("Artist not found with ID: " + artistId);
        }
        return artist;
    }

    public void deleteArtistById(Integer artistId) {
        this.artistRepository.deleteById(artistId);
    }
}