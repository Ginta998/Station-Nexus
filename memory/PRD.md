# Stationexus — PRD

## Problem Statement
Application web pure (PWA installable) inspirée de ES-DE : un launcher cinématique et mono-utilisateur pour lancer les créations personnelles (livres, films, séries, Tengoku Dojo, à venir). Chaque fiche possède un bouton « Lancer ». Pas de comptes ; un mode Admin (Création) protégé par un PIN 4-6 chiffres stocké dans localStorage. Musique d'ambiance au lancement. 12 thèmes interchangeables (défaut : Tengoku). Esthétique japonaise sombre, poster roi, fond dynamique suivant la carte focalisée.

## Stack / Architecture
- Frontend: React (CRA) + React Router v6 + Tailwind (CSS variables par thème via `data-theme`) + react-icons/io5 + html2canvas + Web Share.
- Backend: FastAPI + MongoDB (Motor). Routes préfixées `/api`. Images poster en base64 (data URI), audio uploadé en base64 (max 12 Mo) et streamé via endpoint dédié. Aucune auth serveur.
- PWA: manifest.json + service-worker.js + icônes 192/512.

## User Persona
Un créateur unique gérant sa bibliothèque personnelle depuis PC / tablette / téléphone.

## Core Requirements (static)
- Launcher ES-DE : catégories, rail de posters horizontal, navigation clavier/tactile, fond dynamique flouté.
- Fiche détail avec bouton LANCER (reader / lien / épisodes / info), musique d'ambiance, partage de carte.
- Mode visiteur lecture seule ; mode Création (PIN 1234 par défaut) pour ajouter/modifier/supprimer + upload poster & audio.
- 12 thèmes complets via variables CSS + polices dédiées ; persistance localStorage.

## Implemented (2026-07-19)
- Backend CRUD créations + filtre catégorie + audio upload/stream/delete (limite 12 Mo) + auto-seed 13 créations.
- Home launcher (tabs, rail, hero, fond dynamique, kanji watermark, nav clavier), TopBar, PosterCard fallback kanji.
- Detail (poster shareable, LANCER + reader modal, épisodes, ambiance, achat, partage html2canvas/Web Share).
- Settings (déverrouillage PIN + changement PIN, volume, grille 12 thèmes).
- PWA (manifest, service worker, icônes) ; admin persistant entre rechargements (localStorage `sx_admin`).
- Testé end-to-end : backend 100%, frontend 100% (iteration_1.json).

## Backlog
- P1: Upload/gestion multi-images (galeries), réordonnancement drag-and-drop des posters.
- P1: Contenu de lecture riche (chapitres multiples paginés) et lecteur vidéo intégré pour films.
- P2: Migrer FastAPI on_event → lifespan ; status_code 201 sur création.
- P2: Recherche/filtre texte, favoris, mode plein écran immersif.

## Implemented — Itération 3 (2026-07-19)
- Ambiance de l'app en autoplay (reprise après geste utilisateur, coupée par l'ambiance d'une fiche puis restaurée).
- Fond immersif personnalisable par fiche : image dédiée + curseurs flou & assombrissement (Home + Detail).
- 9 packs de sons UI synthétisés (zen, retro, neo, koto, arcade, glass, vapor, taiko, crystal) + perso + silence (12 tuiles).
- Sélecteur d'icônes (émojis) pour les ambiances de l'app.
- Galerie d'images par fiche (grille + lightbox) et intégrations réseaux (YouTube en iframe, Wattpad/autres en boutons).
- Bouton Contact agrandi et libellé dans la barre du haut.
- Tests : backend 9/9 (+ régressions), frontend 100%.

## Next Tasks
- Uploader vrais posters/fonds/musiques, écrire les chapitres, remplir la catégorie Séries.

## Implemented — Itération 14 (2026-07-20)
- **Police Tengoku → Anton** (sans-serif condensé impactant) : `--font-display` du thème Tengoku (et `:root`) passé de « Bodoni Moda » à « Anton » (déjà chargée dans index.html). Logo STATIONEXUS + titres en Anton.
- **Nouveau thème « Horizon »** (13e) : « la mer & la douceur » — bleu-vert `#1f8a8c`, blanc cassé `#f1efe7`, rouge pâle `#e08d8d`, coins arrondis (1rem), ombres douces, titre Cormorant Garamond italique. Ajouté dans index.css + swatch dans themes.js. Lisible (texte sur média blanc global).
- **Chapitres affichés « en série » sur la fiche** (plus besoin de passer par le sommaire) : pour `launch_type==="chapters"`, la liste des chapitres s'affiche sous le bouton principal (qui reste « Reprendre/Lire », inchangé). Deux modes d'affichage au choix via nouveau champ `chapter_display` ("button" | "image") réglable dans l'éditeur : boutons (liste numérotée) ou images (vignettes 16:9). Icône musique si le chapitre a sa piste, surbrillance du chapitre en cours. Clic → ouvre le lecteur directement à ce chapitre (`ChapterReader` reçoit `startChapter`), sans écraser la reprise.
- Vérifié : Anton + Horizon (screenshots), persistance `chapter_display` + préservation images (curl round-trip), modes boutons & images, ouverture au bon chapitre.

## Implemented — Itération 13 (2026-07-20)
- **Reprise de lecture** : progression (chapitre + ratio de défilement) mémorisée par œuvre dans `localStorage` (`sx_progress_{id}`), sauvegarde throttlée au scroll + au changement de chapitre. À la réouverture, le lecteur reprend au bon chapitre et à la bonne position (restauration par ratio, robuste aux images) + toast « Reprise au chapitre N ». Le bouton de la fiche affiche « Reprendre · ch. N » quand une progression existe.
- **Lettrine (dropcap) rétablie sur le contenu enrichi** : le CSS ciblait `p:first-of-type` alors que le contenu WYSIWYG produit des `<div>` → lettrine invisible. Corrigé pour cibler le premier `<p>` ou `<div>`, en couleur du thème (`var(--brand)`) + ombre.
- **Collage intelligent dans l'éditeur** (`onPaste`) : conserve gras/italique/souligné, titres/sous-titres, citations, listes, alignement (dialogues centrés) et couleurs, tout en nettoyant le HTML parasite de Word/Google Docs (polices, tailles, classes, styles mso). Repli en paragraphes si collage de texte brut.
- Vérifié via screenshots (reprise exacte au ratio 0.45, lettrine 76px couleur thème). Collage : logique additive, dégradation gracieuse.

## Fix — Itération 12b (2026-07-20)
- **Texte de chapitre enrichi invisible** : le conteneur `.reader-rich` (un seul grand bloc, ex. 11096px) portait l'animation reveal avec un `IntersectionObserver` à `threshold: 0.12` → 12% de la hauteur > hauteur écran, donc jamais déclenché → texte bloqué à `opacity:0`. Corrigé : `threshold: 0` + `rootMargin: 0px 0px -8% 0px` (s'affiche dès l'entrée à l'écran). Le texte brut fonctionnait déjà car découpé en petits paragraphes. Vérifié sur Born X Burn (chapitre riche).

## Implemented — Itération 12 (2026-07-20)
- **Musique par chapitre** : chaque chapitre peut avoir sa propre musique de lecture (endpoints `POST/GET/DELETE /api/creations/{cid}/chapters/{chid}/audio`, flag `has_music` par chapitre). Repli automatique sur la musique de lecture générale de l'œuvre si le chapitre n'en a pas ; transition en fondu au changement de chapitre + dédup (ne redémarre pas la même piste partagée). Nettoyage `chapter_media` à la suppression d'une création.
- **Éditeur visuel WYSIWYG** (`RichTextEditor.js`) pour le contenu des chapitres : gras, italique, souligné, titres/sous-titres (H2/H3), citations, séparateurs, alignement gauche/centre, couleurs de texte (palette). Contenu stocké en HTML (`chapter.rich=true`), assaini légèrement. Rétro-compat : les chapitres en texte brut existants restent lisibles et sont convertis en paragraphes éditables à l'ouverture.
- **Rendu riche dans le lecteur** (`.reader-rich`) + **réglages de lecture globaux** (panneau « Aa ») : police (Serif/Sans/Display/Mono), taille, interligne, largeur de colonne (Étroit/Normal/Large), lettrine on/off. Persistés en localStorage (`sx_reader_*`).
- Tests : backend 7/7, frontend 100%, 0 régression (iteration_11.json). Image-preservation à l'édition toujours OK.

## Backlog technique (non bloquant, noté par la revue)
- Durcir la sanitisation du HTML riche (DOMPurify) car rendu via `dangerouslySetInnerHTML` (contenu admin uniquement → risque faible).
- `RichTextEditor` utilise `document.execCommand` (déprécié mais fonctionnel) — migrer vers Tiptap/Lexical à terme.
- `server.py` ~660 lignes — envisager de découper les routers par ressource.

## Implemented — Itération 11 (2026-07-20)
- **FIX bug texte coupé sur mobile (page Detail)** — cause racine réelle : la colonne de contenu (`flex-1` dans un `flex-col items-center`) n'avait pas de largeur contrainte, donc le titre `<h1>` (police display, une ligne) s'étendait à sa largeur naturelle (~732px) et débordait de l'écran (390px), coupant titre/synopsis/boutons des deux côtés. Corrigé : colonne passée en `w-full md:flex-1 min-w-0` + `break-words` sur le titre. Vérifié : plus aucun débordement horizontal sur mobile, texte entièrement lisible ; desktop inchangé.
- **Personnalisation de l'interface réservée au mode création** : la section est désormais enveloppée dans `{isAdmin && ...}` (visiteurs ne la voient plus).
- **Bouton Paramètres sur chaque fiche** (`detail-settings`) à côté de Retour / Accueil / Partage.
- **Service worker durci** : stratégie network-first pour le document HTML (app shell) + cache renommé `stationexus-v3` (purge des anciens caches) → évite de servir une version périmée de l'app sur mobile (ancien index.html cache-first). Assets statiques en stale-while-revalidate ; `/api` jamais intercepté.
- **FIX P0 affichage mobile des fiches** : `GET /api/creations` renvoyait **38 Mo** (posters/fonds/galeries base64 intégrés) → sur mobile la page restait bloquée sur « Chargement… », d'où l'obligation d'actualiser. Refactor : la liste est allégée (**~14 Ko**, champs `has_poster`/`has_bg`, images vidées) et les images sont servies via endpoints dédiés `GET /api/creations/{id}/poster` et `/bg` (avec `Cache-Control`). Le détail garde galerie+chapitres ; `?media=1` renvoie l'item complet (base64) pour l'éditeur.
  - Frontend : `posterUrl`/`bgUrl`/`getCreationFull` (api.js) ; PosterCard/Home/Detail/recommandations utilisent les endpoints ; **EditorDialog récupère l'item complet à l'édition** pour ne pas écraser les images au save (testé bout-en-bout).
- **Préchargement écran de démarrage** : liste désormais quasi instantanée → plus de « Chargement » après l'intro.
- **Écran d'entrée** : bloc centré (`boot-ready`) avec le mot-symbole STATIONEXUS et le bouton **Entrer** plus gros directement en dessous, centré à l'écran.
- **Bouton Accueil** ajouté sur chaque fiche (`detail-home`) à côté de Retour.
- **Personnalisation de l'interface** (nouvelle section Paramètres, persistée en localStorage, appliquée sur `<html>`) : couleur d'accent (10 presets + picker), style des coins (Net/Arrondi/Doux/Pilule), taille des affiches (Compact/Normal/Grand), réduire les animations, afficher/masquer les accroches sur les cartes.
- Nettoyage : suppression d'items de test résiduels (`TEST_*`).
- Tests : backend 6/6, frontend 100%, 0 erreur console (iteration_10.json).

## Implemented — Itération 9 (2026-07-20)
- **FIX P0 crash page Detail** : `useMemo` (recommandations) était appelé APRÈS le `return` anticipé dans `Detail.js` → violation des règles des hooks React → toute la page Detail plantait (timeout Playwright sur `detail-share`). `useMemo` remonté avant le early return. Bouton Partager + section Recommandations désormais fonctionnels.
- **FIX P0 autoplay audio (solution A choisie par l'utilisateur)** : le BootIntro devient un écran d'entrée cinématique. Après l'animation, un bouton « Entrer » (`data-testid=boot-enter`) apparaît ; le clic amorce l'AudioContext + démarre l'ambiance (`primeAudio()` dans `AppContext`, `primeAudioCtx()` dans `sound.js`). Respecte la contrainte navigateur (geste utilisateur requis).
- **FIX P1 lisibilité thèmes** : ajout de variables CSS globales `--on-media` (#fff) et `--on-media-2` (rgba blanc 72%) dans `:root`. `TopBar` + navigation/onglets/aide de `Home` utilisent ces couleurs claires (avec text-shadow) car ce contenu est toujours posé sur le fond image sombre. Corrige Shiro & Washi (texte sombre auparavant invisible) ; Yugen & Kurogane étaient déjà OK.
- Tests : backend 9/9, frontend 100% (Detail/Partage/Reco/écran d'entrée/thèmes), 0 erreur console (iteration_9.json).
- Note mineure restante (optionnel) : logo « EXUS » en thème Washi utilise `--brand` (brun foncé) → contraste plus faible sur fond sombre, mais lisible.

## Implemented — Itération 2 (2026-07-19)
- Onglet virtuel « Toutes mes créations » en première page + badges de catégorie sur cartes et fiches.
- Catégories dynamiques (CRUD + réordonnancement) gérées dans Paramètres (admin).
- Filtres/recherche + tri (Ordre / A→Z / Z→A / Récent) sur l'accueil.
- Commentaires publics par fiche (nom + texte), suppression admin, cascade au delete.
- Packs de sons UI synthétisés (Zen / Rétro / Neo) + pack personnalisé (upload) + Silence ; coupure globale du son (mute-all).
- Ambiance sonore de l'app : admin upload (titre + émoji), visiteur la choisit comme un thème ; coupée automatiquement quand l'ambiance d'une fiche démarre.
- Page Contact éditable (bio, avatar, réseaux : mail/Instagram/YouTube) + collecte d'emails newsletter (liste + export CSV admin).
- Lecteur de chapitres immersif type webtoon (défilement vertical, révélations au scroll, sommaire, chapitre préc./suiv., musique d'immersion, images par chapitre) pour launch_type='chapters'.
- Backend : endpoints categories/comments/ambiences/subscribers/settings + migration idempotente des chapitres. Tests 26/26 backend + frontend 100%.
