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
    console.log('🎬 Initialisation du site CinemaStar...');
    
    // Charger les films au démarrage
    await loadAllMovies();
    
    if (filmsDatabase.length > 0) {
        console.log(`✅ ${filmsDatabase.length} films chargés`);
        initializeHero();
        renderAllCarousels();
        setupEventListeners();
    } else {
        console.error('❌ Aucun film n\'a pu être chargé');
    }
});

// ========================================
// CHARGEMENT DES FILMS
// ========================================

async function loadAllMovies() {
    filmsDatabase = [];
    
    const categories = [
        { id: 'populaires', name: 'Populaires', type: 'popular' },
        { id: 'action', name: 'Action', type: 'genre', genreId: 28 },
        { id: 'comedie', name: 'Comédie', type: 'genre', genreId: 35 },
        { id: 'drame', name: 'Drame', type: 'genre', genreId: 18 },
        { id: 'scifi', name: 'Science-Fiction', type: 'genre', genreId: 878 }
    ];

    // Charger les films pour chaque catégorie
    for (const category of categories) {
        try {
            let url;
            
            if (category.type === 'popular') {
                url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=1`;
            } else {
                url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${category.genreId}&language=fr-FR&sort_by=popularity.desc&page=1`;
            }

            console.log(`📥 Chargement ${category.name}...`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.results || data.results.length === 0) {
                console.warn(`⚠️ Aucun film trouvé pour ${category.name}`);
                continue;
            }

            // Limiter à 8 films par catégorie
            const movies = data.results.slice(0, 8);

            for (const movie of movies) {
                if (!movie.poster_path || !movie.title) continue;

                filmsDatabase.push({
                    id: movie.id,
                    titre: movie.title,
                    genre: category.name,
                    categorie: category.id,
                    description: movie.overview || 'Aucune description disponible',
                    affiche: `${TMDB_IMAGE_URL}${movie.poster_path}`,
                    note: (movie.vote_average || 0).toFixed(1),
                    duree: '120 min',
                    dateRelease: movie.release_date || 'N/A'
                });
            }

            console.log(`✅ ${movies.length} films chargés pour ${category.name}`);
            
            // Attendre un peu avant la prochaine requête pour éviter les limites d'API
            await delay(500);
            
        } catch (error) {
            console.error(`❌ Erreur pour ${category.name}:`, error.message);
        }
    }

    // Si aucun film n'a pu être chargé, utiliser les données locales
    if (filmsDatabase.length === 0) {
        console.warn('⚠️ TMDB n\'a pas renvoyé de résultats. Chargement des données locales...');
        loadLocalMovies();
    }

    filmsAffichés = [...filmsDatabase];
}

// ========================================
// DÉLAI
// ========================================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            genre: "Populaires",
            categorie: "populaires",
            description: "Un groupe de pilotes de vaisseau spatial traversent un trou de ver pour surpasser les limites des voyages spatiaux et sauver l'humanité.",
            affiche: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
            note: 8.6,
            duree: "169 min"
        },
        {
            id: 2,
            titre: "Inception",
            genre: "Populaires",
            categorie: "populaires",
            description: "Un voleur qui vole les secrets des entreprises pendant que les gens rêvent se voit offrir l'occasion d'avoir son dossier criminel effacé.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 8.8,
            duree: "148 min"
        },
        {
            id: 3,
            titre: "Parasite",
            genre: "Populaires",
            categorie: "populaires",
            description: "Tous les membres d'une famille sans emploi s'infiltrent dans une riche maison et prétendent être des travailleurs sans lien les uns avec les autres.",
            affiche: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=750&fit=crop",
            note: 8.5,
            duree: "132 min"
        },
        {
            id: 4,
            titre: "Oppenheimer",
            genre: "Populaires",
            categorie: "populaires",
            description: "La vie du physicien J. Robert Oppenheimer et son rôle dans le développement de la bombe atomique pendant la Seconde Guerre mondiale.",
            affiche: "https://images.unsplash.com/photo-1594738957602-e9a80b5e4ec8?w=500&h=750&fit=crop",
            note: 8.3,
            duree: "180 min"
        },
        {
            id: 5,
            titre: "Avatar",
            genre: "Populaires",
            categorie: "populaires",
            description: "Un paraplégique devient un guerrier et tente d'arrêter une exploitation militaire d'une lune extraterrestre.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 7.8,
            duree: "162 min"
        },
        {
            id: 6,
            titre: "The Matrix",
            genre: "Populaires",
            categorie: "populaires",
            description: "Un hacker découvre la vraie nature de sa réalité et son rôle dans le conflit qui l'entoure.",
            affiche: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop",
            note: 8.7,
            duree: "136 min"
        },
        {
            id: 7,
            titre: "Dune",
            genre: "Populaires",
            categorie: "populaires",
            description: "Le fils d'une famille noble cherche à venger la mort de son père et à sauver l'amour de sa vie en affrontant l'univers à ses risques.",
            affiche: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=750&fit=crop",
            note: 8.0,
            duree: "166 min"
        },
        {
            id: 8,
            titre: "Shawshank Redemption",
            genre: "Populaires",
            categorie: "populaires",
            description: "Deux hommes emprisonnés construisent une amitié au fil des années, trouvant une rédemption par un acte de riche imagination.",
            affiche: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop",
            note: 9.3,
            duree: "142 min"
        },

        // Action
        {
            id: 9,
            titre: "Mad Max Fury Road",
            genre: "Action",
            categorie: "action",
            description: "Dans un futur post-apocalyptique, un tireur solitaire défend une reine dans une voiture-forteresse alors qu'un tyran les poursuit.",
            affiche: "https://images.unsplash.com/photo-1533382119786-5f9ca72f5bf7?w=500&h=750&fit=crop",
            note: 8.1,
            duree: "120 min"
        },
        {
            id: 10,
            titre: "John Wick",
            genre: "Action",
            categorie: "action",
            description: "Un ancien assassin sort de sa retraite et explore le monde souterrain des mercenaires suite à un malheur personnel.",
            affiche: "https://images.unsplash.com/photo-1556742222-e1347e8b78d4?w=500&h=750&fit=crop",
            note: 7.4,
            duree: "101 min"
        },
        {
            id: 11,
            titre: "The Dark Knight",
            genre: "Action",
            categorie: "action",
            description: "Quand la menace connue sous le nom de Joker cause du chaos et des dégâts à Gotham, Batman doit accepter l'un des tests psychologiques.",
            affiche: "https://images.unsplash.com/photo-1594387072682-8e0e826bcdde?w=500&h=750&fit=crop",
            note: 9.0,
            duree: "152 min"
        },
        {
            id: 12,
            titre: "Mission Impossible",
            genre: "Action",
            categorie: "action",
            description: "Un agent secret des services secrets américains se voit implicitement blâmé pour une bombe tout en se battant pour s'innocenter.",
            affiche: "https://images.unsplash.com/photo-1485095329183-d0daf6407e07?w=500&h=750&fit=crop",
            note: 7.1,
            duree: "110 min"
        },
        {
            id: 13,
            titre: "Fast & Furious",
            genre: "Action",
            categorie: "action",
            description: "Un officier de police infiltré dans un groupe de braqueurs de voitures se retrouve pris entre la loyauté envers son département et son équipage.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 6.8,
            duree: "106 min"
        },
        {
            id: 14,
            titre: "Deadpool",
            genre: "Action",
            categorie: "action",
            description: "Un mercenaire impulsif avec des cicatrices faciales graves accumule une dette envers un puissant criminel et cherche la vengeance.",
            affiche: "https://images.unsplash.com/photo-1533382119786-5f9ca72f5bf7?w=500&h=750&fit=crop",
            note: 7.6,
            duree: "108 min"
        },
        {
            id: 15,
            titre: "Top Gun Maverick",
            genre: "Action",
            categorie: "action",
            description: "Maverick affronte son passé en tant que pilote de chasse et entraîne une équipe de jeunes pilotes pour une mission dangereuse.",
            affiche: "https://images.unsplash.com/photo-1485095329183-d0daf6407e07?w=500&h=750&fit=crop",
            note: 8.3,
            duree: "131 min"
        },
        {
            id: 16,
            titre: "Aquaman",
            genre: "Action",
            categorie: "action",
            description: "Un demi-dieu découvre son héritage et devient roi de l'océan pour arrêter une invasion d'Atlantide.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 7.0,
            duree: "123 min"
        },

        // Comédie
        {
            id: 17,
            titre: "Superbad",
            genre: "Comédie",
            categorie: "comedie",
            description: "Deux amis mal assortis cherchent à perdre leur virginité lors du dernier week-end avant l'université.",
            affiche: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=750&fit=crop",
            note: 7.6,
            duree: "113 min"
        },
        {
            id: 18,
            titre: "The Grand Budapest Hotel",
            genre: "Comédie",
            categorie: "comedie",
            description: "Un concierge légendaire et son protégé développent une amitié durable après un vol de diamant à l'hôtel.",
            affiche: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=750&fit=crop",
            note: 8.1,
            duree: "99 min"
        },
        {
            id: 19,
            titre: "Knives Out",
            genre: "Comédie",
            categorie: "comedie",
            description: "Un détective privé enquête sur la mort soudaine d'un écrivain de romans policiers parmi sa famille dysfonctionnelle.",
            affiche: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=750&fit=crop",
            note: 8.3,
            duree: "130 min"
        },
        {
            id: 20,
            titre: "Tropic Thunder",
            genre: "Comédie",
            categorie: "comedie",
            description: "Un groupe d'acteurs faisant la promotion d'une guerre du Vietnam se retrouve transformé en véritables soldats.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 7.0,
            duree: "107 min"
        },
        {
            id: 21,
            titre: "Le Monde de Nemo",
            genre: "Comédie",
            categorie: "comedie",
            description: "Un père poisson entreprend une quête épique pour retrouver son fils et se découvre lui-même en chemin.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 8.1,
            duree: "100 min"
        },
        {
            id: 22,
            titre: "Toy Story",
            genre: "Comédie",
            categorie: "comedie",
            description: "Quand un nouveau jouet spacieux arrive, un cowboy jaloux et lui forment une amitié improbable.",
            affiche: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=750&fit=crop",
            note: 8.3,
            duree: "81 min"
        },
        {
            id: 23,
            titre: "Zoolande",
            genre: "Comédie",
            categorie: "comedie",
            description: "Un mannequin idiot se retrouve au cœur d'un complot de meurtre en tant qu'agent secret involontaire.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 7.2,
            duree: "90 min"
        },
        {
            id: 24,
            titre: "Bridesmaids",
            genre: "Comédie",
            categorie: "comedie",
            description: "Une demoiselle d'honneur vie un cauchemar en essayant de rester unie avec ses amies avant le mariage.",
            affiche: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=750&fit=crop",
            note: 7.8,
            duree: "125 min"
        },

        // Drame
        {
            id: 25,
            titre: "Forrest Gump",
            genre: "Drame",
            categorie: "drame",
            description: "Un homme extraordinaire aux capacités mentales limitées mais à l'esprit courageux change le cours de plusieurs décennies d'histoire américaine.",
            affiche: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&h=750&fit=crop",
            note: 8.8,
            duree: "142 min"
        },
        {
            id: 26,
            titre: "Pulp Fiction",
            genre: "Drame",
            categorie: "drame",
            description: "Les destins de plusieurs criminels se croisent après que chacun ait commis un acte de violence.",
            affiche: "https://images.unsplash.com/photo-1498940336405-08c16d1d3e6f?w=500&h=750&fit=crop",
            note: 8.9,
            duree: "154 min"
        },
        {
            id: 27,
            titre: "The Pianist",
            genre: "Drame",
            categorie: "drame",
            description: "L'histoire vraie d'un pianiste polonais qui survit à la Shoah et à la résistance contre les Nazis.",
            affiche: "https://images.unsplash.com/photo-1506721318290-ce58e88f8280?w=500&h=750&fit=crop",
            note: 8.5,
            duree: "150 min"
        },
        {
            id: 28,
            titre: "La Vie est Belle",
            genre: "Drame",
            categorie: "drame",
            description: "Un père utilise l'imagination et l'humour pour protéger son fils des horreurs d'un camp de concentration.",
            affiche: "https://images.unsplash.com/photo-1506721318290-ce58e88f8280?w=500&h=750&fit=crop",
            note: 8.6,
            duree: "116 min"
        },
        {
            id: 29,
            titre: "Gladiator",
            genre: "Drame",
            categorie: "drame",
            description: "Un ancien général devient gladiateur et cherche vengeance contre l'empereur qui a détruit sa famille.",
            affiche: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop",
            note: 8.5,
            duree: "155 min"
        },
        {
            id: 30,
            titre: "Le Silence des Agneaux",
            genre: "Drame",
            categorie: "drame",
            description: "Une jeune agent du FBI sollicite l'aide d'un cannibale emprisonné et d'un assassin en série pour attraper un autre tueur.",
            affiche: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&h=750&fit=crop",
            note: 8.6,
            duree: "118 min"
        },
        {
            id: 31,
            titre: "Titanic",
            genre: "Drame",
            categorie: "drame",
            description: "Une histoire d'amour entre un pauvre artiste et une riche jeune fille sur le Titanic avant son naufrage tragique.",
            affiche: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop",
            note: 7.8,
            duree: "194 min"
        },
        {
            id: 32,
            titre: "La Liste de Schindler",
            genre: "Drame",
            categorie: "drame",
            description: "Un industriel allemand sauve ses travailleurs juifs de l'Holocauste en utilisant son argent et son influence.",
            affiche: "https://images.unsplash.com/photo-1506721318290-ce58e88f8280?w=500&h=750&fit=crop",
            note: 9.0,
            duree: "195 min"
        },

        // Science-Fiction
        {
            id: 33,
            titre: "Blade Runner 2049",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un officier de police nouveau modèle enquête sur un secret qui pourrait faire basculer la société.",
            affiche: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
            note: 8.0,
            duree: "164 min"
        },
        {
            id: 34,
            titre: "Retour vers le Futur",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un adolescent voyage accidentellement 30 ans dans le passé dans une voiture de temps et change son avenir.",
            affiche: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
            note: 8.5,
            duree: "116 min"
        },
        {
            id: 35,
            titre: "E.T. l'Extra-Terrestre",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un enfant se lie d'amitié avec une créature extraterrestre échouée et l'aide à rentrer chez elle.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 7.9,
            duree: "115 min"
        },
        {
            id: 36,
            titre: "Total Recall",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un homme se questionne sur sa réalité et son identité après des traitements de vacances mentales étranges.",
            affiche: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
            note: 7.4,
            duree: "113 min"
        },
        {
            id: 37,
            titre: "Minority Report",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un flic d'une unité précrime devient suspect d'un crime qu'il n'a pas encore commis.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 7.6,
            duree: "145 min"
        },
        {
            id: 38,
            titre: "Terminator 2",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un cyborg du futur revient pour protéger un enfant contre un autre cyborg plus avancé.",
            affiche: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
            note: 8.5,
            duree: "154 min"
        },
        {
            id: 39,
            titre: "Prédateur",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "Un groupe de soldats de commando est traqué par une créature extraterrestre dans la jungle.",
            affiche: "https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop",
            note: 7.8,
            duree: "107 min"
        },
        {
            id: 40,
            titre: "Alien",
            genre: "Science-Fiction",
            categorie: "scifi",
            description: "L'équipage d'un vaisseau spatial lutte pour sa survie contre une créature extraterrestre parfaite.",
            affiche: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop",
            note: 8.4,
            duree: "117 min"
        }
    ];

    filmsDatabase = localFilms;
    filmsAffichés = [...filmsDatabase];
    console.log('📦 Données locales chargées');
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
    const description = film.description.length > 150 
        ? film.description.substring(0, 150) + '...' 
        : film.description;
    document.getElementById('heroDescription').textContent = description;
    
    filmActuel = film;
    console.log('🎬 Héro initialisé:', film.titre);
}

function setupEventListeners() {
    // Recherche
    searchInput.addEventListener('input', handleSearch);
    
    // Modales
    closeModal.addEventListener('click', () => videoModal.classList.remove('active'));
    closeFilmModal.addEventListener('click', () => filmModal.classList.remove('active'));
    
    // Boutons de lecture
    playBtn.addEventListener('click', () => {
        if (filmActuel) openVideoModal(filmActuel);
    });
    playFilmBtn.addEventListener('click', () => {
        if (filmActuel) openVideoModal(filmActuel);
    });
    
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

    console.log('✅ Écouteurs d\'événements configurés');
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
    
    console.log(`🔍 Recherche: "${searchTerm}" - ${filmsAffichés.length} résultats`);
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
    if (!carousel) {
        console.warn(`⚠️ Carousel non trouvé: ${elementId}`);
        return;
    }

    const films = filmsAffichés.filter(film => film.categorie === categorie);
    
    carousel.innerHTML = '';
    
    if (films.length === 0) {
        carousel.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 2rem;">Aucun film trouvé</p>';
        console.log(`📭 Aucun film pour: ${categorie}`);
        return;
    }
    
    films.forEach(film => {
        const filmCard = createFilmCard(film);
        carousel.appendChild(filmCard);
    });

    console.log(`📺 Rendu de ${films.length} films pour ${categorie}`);
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
    if (!film) {
        console.warn('⚠️ Aucun film sélectionné');
        return;
    }

    filmActuel = film;
    
    const videoPlayer = document.getElementById('videoPlayer');
    
    // Utiliser une vidéo de démonstration
    videoPlayer.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
    videoPlayer.load();
    
    document.getElementById('modalTitle').textContent = film.titre;
    document.getElementById('modalGenre').textContent = `Genre: ${film.genre}`;
    document.getElementById('modalDescription').textContent = film.description;
    
    videoModal.classList.add('active');
    console.log('🎥 Modal vidéo ouvert:', film.titre);
}

function openFilmModal(film) {
    if (!film) {
        console.warn('⚠️ Aucun film sélectionné');
        return;
    }

    filmActuel = film;
    
    const posterImg = document.getElementById('filmPosterImg');
    posterImg.src = film.affiche;
    posterImg.onerror = function() {
        this.src = 'https://images.unsplash.com/photo-1489599849228-ed7a58d1e2d1?w=500&h=750&fit=crop';
    };
    
    document.getElementById('filmTitle').textContent = film.titre;
    document.getElementById('filmGenre').textContent = film.genre;
    document.getElementById('filmFullDescription').textContent = film.description;
    
    filmModal.classList.add('active');
    console.log('📖 Modal film ouvert:', film.titre);
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

console.log('✨ Script CinemaStar chargé avec succès');
