// ========================================
// CONFIGURATION DE L'API TMDB
// ========================================

const TMDB_API_KEY = '220520758ce13f812c262a20223feee9';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// ========================================
// VARIABLES GLOBALES
// ========================================

let filmsDatabase = [];
let filmActuel = null;
let filmsAffichés = [];
let isLoading = false;

// ========================================
// ÉLÉMENTS DOM
// ========================================

const searchInput = document.getElementById('searchInput');
const videoModal = document.getElementById('videoModal');
const filmModal = document.getElementById('filmModal');
const closeModal = document.getElementById('closeModal');
const closeFilmModal = document.getElementById('closeFilmModal');
const playBtn = document.getElementById('playBtn');
const playFilmBtn = document.getElementById('playFilmBtn');

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initialisation du site CinemaStar...');
    
    // Essayer de charger depuis TMDB, sinon utiliser les données locales
    try {
        await loadMoviesFromTMDB();
        console.log('Films chargés depuis TMDB');
    } catch (error) {
        console.warn('Erreur lors du chargement TMDB:', error.message);
        console.log('Utilisation des données locales...');
        loadLocalMovies();
    }
    
    if (filmsDatabase.length > 0) {
        initializeHero();
        renderAllCarousels();
        setupEventListeners();
    }
});

// ========================================
// CHARGEMENT DES FILMS DEPUIS TMDB
// ========================================

async function loadMoviesFromTMDB() {
    if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
        throw new Error('Clé API TMDB non configurée. Veuillez ajouter votre clé dans le code.');
    }

    const categories = {
        populaires: 'popular',
        action: 28,
        comedie: 35,
        drame: 18,
        scifi: 878
    };

    filmsDatabase = [];

    try {
        for (const [categorie, query] of Object.entries(categories)) {
            let url;
            
            if (typeof query === 'number') {
                // Recherche par genre
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${query}&language=fr-FR&sort_by=popularity.desc&page=1`;
            } else {
                // Recherche par popularité
                url = `${TMDB_BASE_URL}/movie/${query}?api_key=${TMDB_API_KEY}&language=fr-FR&page=1`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
            
            const data = await response.json();
            const movies = data.results.slice(0, 8); // Limiter à 8 films par catégorie

            movies.forEach(movie => {
                filmsDatabase.push({
                    id: movie.id,
                    titre: movie.title || movie.name,
                    genre: getCategoryName(categorie),
                    categorie: categorie,
                    description: movie.overview || 'Aucune description disponible',
                    affiche: movie.poster_path 
                        ? `${TMDB_IMAGE_URL}${movie.poster_path}`
                        : 'https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop',
                    video: `https://www.youtube.com/embed/${await getTrailerID(movie.id)}`,
                    note: movie.vote_average ? movie.vote_average.toFixed(1) : 7.0,
                    duree: `${Math.floor(Math.random() * 120) + 90} min`,
                    dateRelease: movie.release_date || 'N/A'
                });
            });
        }

        if (filmsDatabase.length === 0) {
            throw new Error('Aucun film trouvé');
        }

        filmsAffichés = [...filmsDatabase];
        console.log(`✅ ${filmsDatabase.length} films chargés depuis TMDB`);
        
    } catch (error) {
        console.error('Erreur TMDB:', error);
        throw error;
    }
}

// ========================================
// RÉCUPÉRER LA BANDE-ANNONCE
// ========================================

async function getTrailerID(movieId) {
    try {
        const url = `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=fr-FR`;
        const response = await fetch(url);
        const data = await response.json();
        
        const trailer = data.results.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        return trailer ? trailer.key : '';
    } catch (error) {
        console.warn(`Impossible de récupérer la bande-annonce pour le film ${movieId}`);
        return '';
    }
}

// ========================================
// DONNÉES LOCALES DE SECOURS
// ========================================

function loadLocalMovies() {
    const localFilms = [
        // Populaires
        {
            id: 1,
            titre: "Interstellar",
            genre: "Science-Fiction",
            categorie: "populaires",
            description: "Un groupe de pilotes de vaisseau spatial traversent un trou de ver pour surpasser les limites des voyages spatiaux et sauver l'humanité.",
            affiche: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.6,
            duree: "169 min"
        },
        {
            id: 2,
            titre: "Inception",
            genre: "Science-Fiction",
            categorie: "populaires",
            description: "Un voleur qui vole les secrets des entreprises pendant que les gens rêvent se voit offrir l'occasion d'avoir son dossier criminel effacé.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.8,
            duree: "148 min"
        },
        {
            id: 3,
            titre: "Parasite",
            genre: "Drame",
            categorie: "populaires",
            description: "Tous les membres d'une famille sans emploi s'infiltrent dans une riche maison et prétendent être des travailleurs sans lien les uns avec les autres.",
            affiche: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.5,
            duree: "132 min"
        },
        {
            id: 4,
            titre: "Oppenheimer",
            genre: "Drame",
            categorie: "populaires",
            description: "La vie du physicien J. Robert Oppenheimer et son rôle dans le développement de la bombe atomique pendant la Seconde Guerre mondiale.",
            affiche: "https://images.unsplash.com/photo-1594738957602-e9a80b5e4ec8?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.3,
            duree: "180 min"
        },

        // Action
        {
            id: 5,
            titre: "Mad Max Fury Road",
            genre: "Action",
            categorie: "action",
            description: "Dans un futur post-apocalyptique, un tireur solitaire défend une reine dans une voiture-forteresse alors qu'un tyran les poursuit.",
            affiche: "https://images.unsplash.com/photo-1533382119786-5f9ca72f5bf7?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.1,
            duree: "120 min"
        },
        {
            id: 6,
            titre: "John Wick",
            genre: "Action",
            categorie: "action",
            description: "Un ancien assassin sort de sa retraite et explore le monde souterrain des mercenaires suite à un malheur personnel.",
            affiche: "https://images.unsplash.com/photo-1556742222-e1347e8b78d4?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 7.4,
            duree: "101 min"
        },
        {
            id: 7,
            titre: "Mission: Impossible",
            genre: "Action",
            categorie: "action",
            description: "Un agent secret des services secrets américains se voit implicitement blâmé pour une bombe tout en se battant pour s'innocenter.",
            affiche: "https://images.unsplash.com/photo-1485095329183-d0daf6407e07?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 7.1,
            duree: "110 min"
        },
        {
            id: 8,
            titre: "The Dark Knight",
            genre: "Action",
            categorie: "action",
            description: "Quand la menace connue sous le nom de Joker cause du chaos et des dégâts à Gotham, Batman doit accepter l'un des tests psychologiques.",
            affiche: "https://images.unsplash.com/photo-1594387072682-8e0e826bcdde?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 9.0,
            duree: "152 min"
        },

        // Comédie
        {
            id: 9,
            titre: "Superbad",
            genre: "Comédie",
            categorie: "comedie",
            description: "Deux amis mal assortis cherchent à perdre leur virginité lors du dernier week-end avant l'université.",
            affiche: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 7.6,
            duree: "113 min"
        },
        {
            id: 10,
            titre: "The Grand Budapest Hotel",
            genre: "Comédie",
            categorie: "comedie",
            description: "Un concierge légendaire et son protégé développent une amitié durable après un vol de diamant à l'hôtel.",
            affiche: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.1,
            duree: "99 min"
        },
        {
            id: 11,
            titre: "Knives Out",
            genre: "Comédie",
            categorie: "comedie",
            description: "Un détective privé enquête sur la mort soudaine d'un écrivain de romans policiers parmi sa famille dysfonctionnelle.",
            affiche: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.3,
            duree: "130 min"
        },
        {
            id: 12,
            titre: "Tropic Thunder",
            genre: "Comédie",
            categorie: "comedie",
            description: "Un groupe d'acteurs faisant la promotion d'une guerre du Vietnam se retrouve transformé en véritables soldats.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 7.0,
            duree: "107 min"
        },

        // Drame
        {
            id: 13,
            titre: "Shawshank Redemption",
            genre: "Drame",
            categorie: "drame",
            description: "Deux hommes emprisonnés construisent une amitié au fil des années, trouvant une rédemption par un acte de riche imagination.",
            affiche: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 9.3,
            duree: "142 min"
        },
        {
            id: 14,
            titre: "Pulp Fiction",
            genre: "Drame",
            categorie: "drame",
            description: "Les destins de plusieurs criminels se croisent après que chacun ait comis un acte de violence.",
            affiche: "https://images.unsplash.com/photo-1498940336405-08c16d1d3e6f?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.9,
            duree: "154 min"
        },
        {
            id: 15,
            titre: "Forrest Gump",
            genre: "Drame",
            categorie: "drame",
            description: "La vie est comme une boîte de chocolats - à partir d'une chaise longue, un homme raconte sa vie extraordinaire.",
            affiche: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.8,
            duree: "142 min"
        },
        {
            id: 16,
            titre: "The Pianist",
            genre: "Drame",
            categorie: "drame",
            description: "L'histoire vraie d'un pianiste polonais qui survit à la Shoah et à la résistance contre les Nazis.",
            affiche: "https://images.unsplash.com/photo-1506721318290-ce58e88f8280?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.5,
            duree: "150 min"
        },

        // Science-Fiction
        {
            id: 17,
            titre: "Blade Runner 2049",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un officier de police nouveau modèle enquête sur un secret qui pourrait faire basculer la société.",
            affiche: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.0,
            duree: "164 min"
        },
        {
            id: 18,
            titre: "Avatar",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un paraplégique devient un guerrier et tente d'arrêter une exploitation militaire d'une lune extraterrestre.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 7.8,
            duree: "162 min"
        },
        {
            id: 19,
            titre: "The Matrix",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un hacker découvre la vraie nature de sa réalité et son rôle dans le conflit qui l'entoure.",
            affiche: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.7,
            duree: "136 min"
        },
        {
            id: 20,
            titre: "Dune",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Le fils d'une famille noble cherche à venger la mort de son père et à sauver l'amour de sa vie en affrontant l'univers à ses risques.",
            affiche: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=750&fit=crop",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            note: 8.0,
            duree: "166 min"
        }
    ];

    filmsDatabase = localFilms;
    filmsAffichés = [...filmsDatabase];
    console.log('📦 Données locales chargées');
}

// ========================================
// UTILITAIRES
// ========================================

function getCategoryName(categorie) {
    const categoryNames = {
        populaires: 'Populaires',
        action: 'Action',
        comedie: 'Comédie',
        drame: 'Drame',
        scifi: 'Science-Fiction'
    };
    return categoryNames[categorie] || 'Inconnu';
}

// ========================================
// INITIALISATION DU HÉRO
// ========================================

function initializeHero() {
    if (filmsDatabase.length === 0) return;

    const heroSection = document.getElementById('heroSection');
    const film = filmsDatabase[0];
    
    // Définir l'affiche comme arrière-plan
    const heroBackground = heroSection.querySelector('.hero-background');
    heroBackground.style.backgroundImage = `linear-gradient(rgba(15, 15, 15, 0.3), rgba(15, 15, 15, 0.7)), url('${film.affiche}')`;
    
    // Mettre à jour le texte
    document.getElementById('heroTitle').textContent = film.titre;
    document.getElementById('heroDescription').textContent = film.description.substring(0, 150) + '...';
    
    filmActuel = film;
}

function setupEventListeners() {
    // Recherche
    searchInput.addEventListener('input', handleSearch);
    
    // Modales
    closeModal.addEventListener('click', () => videoModal.classList.remove('active'));
    closeFilmModal.addEventListener('click', () => filmModal.classList.remove('active'));
    
    // Boutons de lecture
    playBtn.addEventListener('click', () => openVideoModal(filmActuel));
    playFilmBtn.addEventListener('click', () => openVideoModal(filmActuel));
    
    // Fermer les modales en cliquant à l'extérieur
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) videoModal.classList.remove('active');
    });
    
    filmModal.addEventListener('click', (e) => {
        if (e.target === filmModal) filmModal.classList.remove('active');
    });
    
    // Clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            videoModal.classList.remove('active');
            filmModal.classList.remove('active');
        }
    });
}

// ========================================
// FONCTION DE RECHERCHE
// ========================================

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filmsAffichés = [...filmsDatabase];
    } else {
        filmsAffichés = filmsDatabase.filter(film =>
            film.titre.toLowerCase().includes(searchTerm) ||
            film.genre.toLowerCase().includes(searchTerm) ||
            film.description.toLowerCase().includes(searchTerm)
        );
    }
    
    renderAllCarousels();
}

// ========================================
// RENDU DES CARROUSELS
// ========================================

function renderAllCarousels() {
    const categories = {
        'populaires': 'populairesCarousel',
        'action': 'actionCarousel',
        'comedie': 'comedieCarousel',
        'drame': 'drameCarousel',
        'scifi': 'scifiCarousel'
    };
    
    for (const [categorie, elementId] of Object.entries(categories)) {
        renderCarousel(categorie, elementId);
    }
}

function renderCarousel(categorie, elementId) {
    const carousel = document.getElementById(elementId);
    const films = filmsAffichés.filter(film => film.categorie === categorie);
    
    carousel.innerHTML = '';
    
    if (films.length === 0) {
        carousel.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 2rem;">Aucun film trouvé</p>';
        return;
    }
    
    films.forEach(film => {
        const filmCard = createFilmCard(film);
        carousel.appendChild(filmCard);
    });
}

// ========================================
// CRÉATION D'UNE CARTE DE FILM
// ========================================

function createFilmCard(film) {
    const card = document.createElement('div');
    card.className = 'film-card';
    card.innerHTML = `
        <div class="film-poster">
            <img src="${film.affiche}" alt="${film.titre}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop'">
            <div class="film-overlay">
                <h3 class="film-title">${film.titre}</h3>
                <p class="film-genre">${film.genre}</p>
                <div class="film-rating">
                    <span>⭐ ${film.note}/10</span>
                </div>
            </div>
            <button class="play-button" title="Regarder ${film.titre}">▶</button>
        </div>
    `;
    
    // Événements
    card.querySelector('.play-button').addEventListener('click', (e) => {
        e.stopPropagation();
        openVideoModal(film);
    });
    
    card.addEventListener('click', () => openFilmModal(film));
    
    return card;
}

// ========================================
// GESTION DES MODALES
// ========================================

function openVideoModal(film) {
    filmActuel = film;
    
    const videoPlayer = document.getElementById('videoPlayer');
    
    // Vérifier si c'est une URL YouTube
    if (film.video && film.video.includes('youtube')) {
        // Afficher une iframe YouTube
        const iframeHTML = `<iframe class="video-player" src="${film.video}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        videoPlayer.parentElement.innerHTML = iframeHTML;
    } else if (film.video) {
        // Vidéo MP4 classique
        videoPlayer.src = film.video;
        videoPlayer.load();
    }
    
    document.getElementById('modalTitle').textContent = film.titre;
    document.getElementById('modalGenre').textContent = `Genre: ${film.genre}`;
    document.getElementById('modalDescription').textContent = film.description;
    
    videoModal.classList.add('active');
}

function openFilmModal(film) {
    filmActuel = film;
    
    document.getElementById('filmPosterImg').src = film.affiche;
    document.getElementById('filmPosterImg').onerror = function() {
        this.src = 'https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop';
    };
    document.getElementById('filmTitle').textContent = film.titre;
    document.getElementById('filmGenre').textContent = film.genre;
    document.getElementById('filmFullDescription').textContent = film.description;
    
    filmModal.classList.add('active');
}

// ========================================
// ANIMATIONS AU SCROLL
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les sections
document.querySelectorAll('.content-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});
