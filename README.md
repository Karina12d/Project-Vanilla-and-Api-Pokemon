# Project1 – Artist & Pokémon

A web application built with **Spring Boot** that contains two independent modules:

1. **Artist**: a full CRUD over the `artist` table of the **Chinook** database (PostgreSQL).
2. **Pokémon**: consumption of the **PokéAPI** through a custom endpoint that chains three calls (Pokémon → Move → Type).

The frontend is static (HTML + JavaScript + Bootstrap 5) and is served by the same backend.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Java 21 |
| Framework | Spring Boot 4.1.1 (Web MVC, Data JPA, Thymeleaf) |
| Database | PostgreSQL (`chinook` database) |
| Build | Maven (Maven Wrapper included) |
| Frontend | HTML, CSS, JavaScript (fetch API), Bootstrap 5.3.3 (CDN) |
| External API | [PokéAPI](https://pokeapi.co/) |

---

## Project Structure

```
project1/
├── pom.xml
├── src/main/java/backend/proyect1/
│   ├── Proyect1Application.java
│   ├── controller/
│   │   ├── ArtistController.java
│   │   └── PokemonController.java
│   ├── model/
│   │   ├── Artist.java            (JPA entity)
│   │   └── Pokemon.java           (DTO, not stored in the DB)
│   ├── repository/
│   │   └── ArtistRepository.java
│   └── service/
│       ├── ArtistService.java
│       └── PokemonService.java
└── src/main/resources/
    ├── application.properties
    └── static/
        ├── index.html             (Artist module)
        ├── pokemon.html           (Pokémon module)
        ├── css/styles.css
        └── js/
            ├── app.js             (Artist logic)
            └── pokemon.js         (Pokémon logic)
```

---

## Prerequisites

- **JDK 21** or higher
- **PostgreSQL** running, with the **`chinook`** database created and loaded (it must include the `artist` table)
- Internet connection (for Bootstrap via CDN and for the PokéAPI)

---

## Configuration

Edit `src/main/resources/application.properties` with your local credentials:

```properties
spring.application.name=project1

spring.datasource.url=jdbc:postgresql://localhost:5432/chinook
spring.datasource.username=<your_username>
spring.datasource.password=<your_password>
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

> ⚠️ **Do not commit your real password to the repository.** Consider using environment variables
> (for example `spring.datasource.password=${DB_PASSWORD}`) or an `application-local.properties` file added to `.gitignore`.

---

## How to Run

```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

The application will be available at **http://localhost:8080**

| Page | URL |
|------|-----|
| Artist Directory | http://localhost:8080/ |
| Pokémon Directory | http://localhost:8080/pokemon.html |

---

# Part 1 – Artist

A full CRUD over the Chinook `artist` table, with a frontend to list, search, create, edit and delete artists.

## Model

`Artist` entity mapped to the `artist` table:

| Java field | Column | Type | Description |
|-----------|--------|------|-------------|
| `artistId` | `artist_id` | `Integer` (PK) | Artist identifier |
| `name` | `name` | `String` | Artist name |

## Architecture

```
ArtistController  →  ArtistService  →  ArtistRepository (JpaRepository)  →  PostgreSQL
```

- **`ArtistController`**: exposes the REST API at `/api/artists` and returns the appropriate HTTP status codes. CORS is enabled.
- **`ArtistService`**: contains the business logic. When creating an artist without an ID, it computes the next ID as `current maximum + 1`.
- **`ArtistRepository`**: a `JpaRepository<Artist, Integer>` interface.

## Endpoints

Base URL: `/api/artists`

| Method | Path | Description | Body | Response |
|--------|------|-------------|------|----------|
| `GET` | `/api/artists` | List all artists | – | `200 OK` + JSON list |
| `GET` | `/api/artists/{id}` | Get an artist by ID | – | `200 OK` / `404 Not Found` |
| `POST` | `/api/artists` | Create an artist | `{ "name": "..." }` | `201 Created` + created artist |
| `PUT` | `/api/artists/{id}` | Update an artist's name | `{ "name": "..." }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/artists/{id}` | Delete an artist | – | `204 No Content` / `404 Not Found` |

### Examples

```bash
# List
curl http://localhost:8080/api/artists

# Get by ID
curl http://localhost:8080/api/artists/1

# Create
curl -X POST http://localhost:8080/api/artists \
  -H "Content-Type: application/json" \
  -d '{"name": "New Artist"}'

# Update
curl -X PUT http://localhost:8080/api/artists/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Edited Name"}'

# Delete
curl -X DELETE http://localhost:8080/api/artists/1
```

## Frontend (`index.html` + `app.js`)

- **Card listing**: loads all artists when the page opens.
- **Real-time search**: filters by name as you type (client-side filtering).
- **Create**: the *+ Add New Artist* button opens a modal with the form.
- **Edit / Delete**: clicking a card opens a modal with the *Edit Artist* and *Delete Artist* actions (deletion asks for confirmation).
- **API Pokemon** button to navigate to the second module.

---

# Part 2 – Pokémon

A module that consumes the **PokéAPI** and demonstrates chaining several external endpoints from the backend. This data is **not stored** in the database; `Pokemon` is just a DTO.

## General Flow

```
┌────────────┐   1) list (limit=151)     ┌──────────┐
│  Browser   │ ────────────────────────► │ PokéAPI  │
│ pokemon.js │                           └──────────┘
│            │   2) click on a Pokémon
│            │ ───► GET /api/pokemon/{name}
└────────────┘            │
                          ▼
                 ┌──────────────────┐   Endpoint 1: /pokemon/{name}   ┌──────────┐
                 │  PokemonService  │ ──────────────────────────────► │ PokéAPI  │
                 │                  │   Endpoint 2: 1st move URL      │          │
                 │                  │ ──────────────────────────────► │          │
                 │                  │   Endpoint 3: 1st type URL      │          │
                 └──────────────────┘ ──────────────────────────────► └──────────┘
```

## Backend Endpoint

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/pokemon/{name}` | Returns the combined information of a Pokémon |

### How the response is built (`PokemonService`)

1. **Endpoint 1** – `https://pokeapi.co/api/v2/pokemon/{name}`: gets the name and the sprite (`front_default`). From the same response it takes the URL of the **first move** and the URL of the **first type**.
2. **Endpoint 2** – move URL: gets the move name.
3. **Endpoint 3** – type URL: gets the type name.

### Example

```bash
curl http://localhost:8080/api/pokemon/pikachu
```

Response (the `moveName` and `typeName` values come from the PokéAPI and may vary):

```json
{
  "pokemonName": "pikachu",
  "spriteUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  "moveName": "mega-punch",
  "typeName": "electric"
}
```

### `Pokemon` Model

| Field | Description |
|-------|-------------|
| `pokemonName` | Pokémon name |
| `spriteUrl` | Front sprite image URL |
| `moveName` | Name of the first move (Endpoint 2) |
| `typeName` | Name of the first type (Endpoint 3) |

## Frontend (`pokemon.html` + `pokemon.js`)

- Loads the list of the **first 151 Pokémon** directly from `https://pokeapi.co/api/v2/pokemon?limit=151` and shows them as cards with their sprite.
- **Delayed search (4-second debounce)**: the filter is applied 4 seconds after the last keystroke. If nothing matches, a message is shown.
- **Details**: clicking a card calls the backend (`/api/pokemon/{name}`) and opens a modal with the sprite, the move and the type.
- **Artist Directory** button to go back to the first module.

---

## Notes

- The project uses `spring.jpa.hibernate.ddl-auto=update`, so Hibernate may modify the database schema at startup. Use it with care on important data.
- `pokemon.js` calls the backend with the hard-coded URL `http://localhost:8080`; if you change the port or deploy to another host, update that URL (or use a relative path such as `/api/pokemon/...`).
- The controllers have CORS wide open (`origins = "*"`), intended for development.