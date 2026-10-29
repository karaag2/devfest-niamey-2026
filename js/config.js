/* ──────────────────────────────────────────────────────────────────────────
   DEVFEST NIAMEY 2026 — LE FICHIER À MODIFIER
   Tout le contenu de la page vient d'ici : dates, lieu, chiffres, parcours,
   programme, speakers, partenaires, FAQ, billetterie.
   Les données ci-dessous sont des PLACEHOLDERS : remplace-les à ta guise,
   la page se reconstruit toute seule. Aucun build, aucun framework.
   ────────────────────────────────────────────────────────────────────────── */
window.DEVFEST = {

  /* ── L'événement ─────────────────────────────────────────────────────── */
  event: {
    name: "DevFest Niamey 2026",
    organizer: "GDG Niamey",
    dateISO: "2026-12-12T09:00:00+01:00",   // début de la journée (heure de Niamey, UTC+1)
    endISO:  "2026-12-12T19:00:00+01:00",
    dateLong: "samedi 12 décembre 2026",
    dateShort: "12.12.2026",
    doors: "8 h 30",
    venue: "Palais des Congrès",
    city: "Niamey",
    country: "Niger",
    ticketUrl: "https://example.com/devfest-niamey-2026/billets",  // ← À REMPLACER
    email: "bonjour@gdgniamey.example",                            // ← À REMPLACER
    mapUrl: "https://www.openstreetmap.org/search?query=Palais%20des%20Congr%C3%A8s%20Niamey"
  },

  /* ── Les chiffres ────────────────────────────────────────────────────── */
  stats: [
    { value: 500, suffix: "+", label: "participants",  note: "étudiant·es, curieux·ses, pros" },
    { value: 20,  suffix: "",  label: "speakers",      note: "du Niger et d'ailleurs" },
    { value: 1,   suffix: "",  label: "journée",       note: "du thé à minuit… presque" }
  ],

  /* ── Les 5 parcours (tracks) ─────────────────────────────────────────── */
  tracks: [
    { id: "web",      name: "Web",                    color: "blue",   cutout: "brace",
      line: "Des pages qui chargent vite, même quand le réseau fait la sieste.",
      learn: ["HTML/CSS moderne", "Performance sur réseau lent", "Accessibilité"] },
    { id: "mobile",   name: "Mobile & Flutter",       color: "green",  image: "sprout",
      line: "Une appli, deux plateformes, zéro panique. Le téléphone est déjà dans ta poche.",
      learn: ["Flutter & Dart", "Apps hors-ligne", "Mobile money & UX locale"] },
    { id: "cloud",    name: "Cloud",                  color: "yellow", cutout: "plane",
      line: "Mettre en ligne, c'est lancer un avion en papier : il faut juste savoir plier.",
      learn: ["Déployer son 1er projet", "Serveurs sans stress", "Coûts maîtrisés"] },
    { id: "ia",       name: "IA & Gemini",            color: "red",    image: "calabash",
      line: "Des étoiles qui sortent d'une calebasse : l'IA, expliquée sans brouillard.",
      learn: ["Gemini pour de vrai", "Prototyper en une heure", "IA & langues du Niger"] },
    { id: "carriere", name: "Carrière & Communauté",  color: "blue",   cutout: "man",
      line: "Premier stage, premier salaire, premier projet : on avance mieux ensemble.",
      learn: ["CV & portfolios", "Freelance & remote", "Mentorat"] }
  ],

  /* ── Pour qui ? (filtre « parcours » du programme) ───────────────────── */
  audiences: [
    { id: "student", label: "Étudiant·e", pitch: "Tu apprends vite. Viens apprendre encore plus vite.",
      text: "Ateliers pour débutant·es, mentors à portée de main, et le genre de rencontres qui décrochent un premier stage." },
    { id: "curious", label: "Curieux·se", pitch: "Tu te demandes ce que c'est, tout ça ? Viens voir.",
      text: "Des talks sans jargon, des démos en direct et zéro prérequis. Tu repars en comprenant enfin ce que ton téléphone fait." },
    { id: "pro",     label: "Pro",        pitch: "Tu construis déjà. Viens aller plus loin.",
      text: "Retours d'expérience, architecture, IA en production et un réseau de gens qui recrutent — et qui aiment le thé." }
  ],

  /* ── Le programme : trois verres de thé ──────────────────────────────── */
  glasses: [
    { id: "g1", n: "1er verre", name: "Apprendre",  from: "08:30", to: "13:00",
      taste: "Fort, comme un premier commit." },
    { id: "g2", n: "2e verre",  name: "Construire", from: "14:30", to: "17:00",
      taste: "Doux, comme une review approuvée." },
    { id: "g3", n: "3e verre",  name: "Célébrer",   from: "17:00", to: "19:30",
      taste: "Suave, comme un déploiement un vendredi. (Ne le faites pas.)" }
  ],

  agenda: [
    { glass: "g1", time: "08:30", title: "Accueil, badges & thé de bienvenue", kind: "pause", track: "carriere", for: ["student","curious","pro"], room: "Hall" },
    { glass: "g1", time: "09:30", title: "Keynote d'ouverture : ouvre ta tête", kind: "keynote", track: "carriere", speaker: "s1", for: ["student","curious","pro"], room: "Grande salle",
      desc: "Pourquoi 2026 est le bon moment pour construire depuis Niamey — et par où commencer, concrètement." },
    { glass: "g1", time: "10:30", title: "Un site rapide sur un réseau lent", kind: "talk", track: "web", speaker: "s2", for: ["student","pro"], room: "Salle Aïr",
      desc: "Images, polices, cache : les gestes simples qui font gagner des secondes à ceux qui n'en ont pas." },
    { glass: "g1", time: "10:30", title: "Flutter : ta première app en 45 minutes", kind: "atelier", track: "mobile", speaker: "s3", for: ["student","curious"], room: "Salle Ténéré",
      desc: "Atelier guidé pour débutant·es. Viens avec ton ordinateur, repars avec une application sur ton téléphone." },
    { glass: "g1", time: "11:30", title: "Gemini pour tous : de la curiosité au prototype", kind: "talk", track: "ia", speaker: "s4", for: ["curious","student","pro"], room: "Grande salle",
      desc: "Démo en direct : on construit un assistant utile devant vous, sans magie et sans jargon." },
    { glass: "g1", time: "12:15", title: "Déployer son premier projet, pas à pas", kind: "atelier", track: "cloud", speaker: "s5", for: ["student","pro"], room: "Salle Aïr",
      desc: "Du code sur ton ordinateur à une adresse web que tu peux envoyer à ta mère." },
    { glass: "g1", time: "13:00", title: "Pause déjeuner & marché des projets", kind: "pause", track: "carriere", for: ["student","curious","pro"], room: "Esplanade" },

    { glass: "g2", time: "14:30", title: "Le cloud, sans le brouillard", kind: "talk", track: "cloud", speaker: "s6", for: ["pro","student"], room: "Grande salle",
      desc: "Architecture, coûts, pannes : ce qu'on a appris en faisant tourner de vrais services depuis le Sahel." },
    { glass: "g2", time: "15:15", title: "Accessibilité : coder pour tout le monde", kind: "talk", track: "web", speaker: "s7", for: ["student","curious","pro"], room: "Salle Aïr",
      desc: "Un bon site se lit au soleil, sur un vieux téléphone, avec un lecteur d'écran. Démonstrations." },
    { glass: "g2", time: "15:15", title: "Une IA qui parle haoussa, zarma et tamasheq", kind: "talk", track: "ia", speaker: "s8", for: ["curious","pro"], room: "Salle Ténéré",
      desc: "Où en est-on pour les langues du Niger ? Données, modèles, et comment tu peux contribuer." },
    { glass: "g2", time: "16:00", title: "Du premier stage au premier salaire", kind: "table ronde", track: "carriere", speaker: "s9", for: ["student","curious"], room: "Grande salle",
      desc: "Quatre parcours, quatre histoires vraies, et toutes les questions que tu n'osais pas poser." },

    { glass: "g3", time: "17:00", title: "Lightning talks : 5 minutes, 10 idées", kind: "talk", track: "carriere", speaker: "s10", for: ["student","curious","pro"], room: "Grande salle",
      desc: "Des membres de la communauté montrent ce qu'ils ont construit. Chrono en main, sablier en vue." },
    { glass: "g3", time: "17:45", title: "Rester, construire, recruter au Niger", kind: "table ronde", track: "carriere", speaker: "s11", for: ["pro","student"], room: "Grande salle",
      desc: "Fondateur·rices, tech leads et recruteurs : ce qui marche vraiment pour bâtir une carrière ici." },
    { glass: "g3", time: "18:30", title: "Tirage au sort, photo de famille & clôture", kind: "clôture", track: "carriere", for: ["student","curious","pro"], room: "Grande salle" },
    { glass: "g3", time: "19:00", title: "After : thé, musique & réseau", kind: "pause", track: "carriere", for: ["student","curious","pro"], room: "Esplanade" }
  ],

  /* ── Les voix (speakers) — placeholders ──────────────────────────────── */
  speakers: [
    { id: "s1",  name: "Aïssata Moussa",       role: "Ingénieure cloud",         org: "Tassili Cloud",     city: "Niamey", track: "carriere", headliner: true },
    { id: "s2",  name: "Ibrahim Garba",        role: "Développeur web",          org: "Sahel Pixel",       city: "Zinder", track: "web" },
    { id: "s3",  name: "Fatouma Adamou",       role: "Experte Flutter",          org: "Aïr Studio",        city: "Agadez", track: "mobile", headliner: true },
    { id: "s4",  name: "Harouna Issoufou",     role: "Chercheur en IA",          org: "Labo Harmattan",    city: "Niamey", track: "ia", headliner: true },
    { id: "s5",  name: "Rakia Boubacar",       role: "DevOps",                   org: "Fleuve Tech",       city: "Maradi", track: "cloud" },
    { id: "s6",  name: "Moussa Amadou",        role: "Architecte logiciel",      org: "Harmattan Labs",    city: "Niamey", track: "cloud", headliner: true },
    { id: "s7",  name: "Zeinabou Maïga",       role: "Designer d'interfaces",    org: "Zinder Digital",    city: "Zinder", track: "web" },
    { id: "s8",  name: "Abdoul Razak Sani",    role: "Data scientist",           org: "Labo Harmattan",    city: "Niamey", track: "ia" },
    { id: "s9",  name: "Mariama Oumarou",      role: "Fondatrice de start-up",   org: "Fleuve Tech",       city: "Niamey", track: "carriere", headliner: true },
    { id: "s10", name: "Salissou Hamidou",     role: "Organisateur communautaire", org: "GDG Niamey",      city: "Niamey", track: "carriere" },
    { id: "s11", name: "Hadiza Souleymane",    role: "Directrice technique",     org: "Sahel Pixel",       city: "Niamey", track: "carriere" },
    { id: "s12", name: "Idrissa Daouda",       role: "Développeur backend",      org: "Tassili Cloud",     city: "Tahoua", track: "cloud" }
  ],
  speakersMore: 8,   // « + 8 autres voix à annoncer »

  /* ── Partenaires — wordmarks fictifs ─────────────────────────────────── */
  partnersNote: "(placeholders)",   // petite mention à côté du titre ; mets "" pour la retirer
  partners: [
    { name: "Harmattan Labs", tier: "Or" },
    { name: "Tassili Cloud",  tier: "Or" },
    { name: "Sahel Pixel",    tier: "Argent" },
    { name: "Zinder Digital", tier: "Argent" },
    { name: "Fleuve Tech",    tier: "Argent" },
    { name: "Aïr Studio",     tier: "Communauté" },
    { name: "Ténéré Café",    tier: "Communauté" },
    { name: "Kandaji Radio",  tier: "Média" }
  ],

  /* ── FAQ ─────────────────────────────────────────────────────────────── */
  faq: [
    { q: "C'est pour qui, exactement ?",
      a: "Pour tout le monde. Étudiant·e, curieux·se, pro, débutant·e complet·e ou développeur·se chevronné·e : le programme a été pensé avec des parcours pour chacun·e. Aucun prérequis, juste l'envie de venir." },
    { q: "Il faut savoir coder pour venir ?",
      a: "Non. Une grande partie des talks se comprend sans écrire une ligne de code. Et si tu veux t'y mettre, les ateliers pour débutant·es sont faits pour ça." },
    { q: "Où et quand ?",
      a: "Samedi 12 décembre 2026 au Palais des Congrès de Niamey. Accueil dès 8 h 30, premier talk à 9 h 30, fin de journée vers 19 h." },
    { q: "Comment obtenir mon billet ?",
      a: "Via le bouton « Prendre mon billet » de cette page. Les places sont limitées : mieux vaut ne pas attendre le dernier moment." },
    { q: "Que dois-je apporter ?",
      a: "Ta curiosité, un chargeur, et ton ordinateur si tu veux participer aux ateliers (c'est facultatif). Le thé, on s'en occupe." },
    { q: "Je peux apporter ma théière ?",
      a: "Erreur 418 : I'm a teapot. Le serveur refuse de préparer le café, mais accueille volontiers toutes les théières. (Oui, vraiment.)" },
    { q: "Je veux proposer un talk ou devenir partenaire.",
      a: "Écris-nous à l'adresse en bas de page. On répond vite, surtout si le mail commence par « Bonjour » et contient une idée." },
    { q: "En quelle langue se passe la journée ?",
      a: "Principalement en français, avec des moments en haoussa, en zarma et en tamasheq. Les slides sont en français." }
  ],

  socials: [
    { name: "Facebook",  url: "https://example.com/gdgniamey" },
    { name: "LinkedIn",  url: "https://example.com/gdgniamey" },
    { name: "X",         url: "https://example.com/gdgniamey" },
    { name: "YouTube",   url: "https://example.com/gdgniamey" }
  ]
};
