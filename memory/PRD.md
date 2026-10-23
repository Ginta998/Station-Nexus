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

## Implemented — Itération 28 (2026-07-21) — D-pad OK/halo/swipe + affiches compact mobile + personnalisation rouverte
- **D-pad mobile amélioré** : bouton **OK central** (`dpad-ok`, pastille brand ronde) qui ouvre la création focalisée (comme un tap sur la fiche), flèches gauche/droite espacées autour (gap-3) → ne touche plus le bouton Lancer. Classe `.dpad-btn` avec **halo au clic** (`:active` scale + box-shadow brand) et **vibration** (`navigator.vibrate(15)`).
- **Balayage vertical** (Home) : `onTouchStart/onTouchEnd` sur le conteneur — swipe vertical (>60px, dominante verticale, <700ms) change de catégorie (haut→suivante, bas→précédente) avec vibration.
- **Affiches Compact par défaut sur mobile** : `posterSize` désormais par appareil (`sx_postersize_mobile`/`_desktop`, fallback legacy) — défaut phone=compact, PC=normal ; bascule via listener matchMedia.
- **Personnalisation de l'interface rouverte aux spectateurs** : section dé-gatée du `isAdmin` (couleur d'accent, coins, taille affiches, animations, accroches, thèmes). La section **« Écran de démarrage » reste admin-only**.
- Auto-testé (screenshots mobile) : data-poster=compact, dpad-ok ouvre la création, section personnalisation visible en visiteur, intro-manager caché.


## Implemented — Itération 27 (2026-07-21) — Défaut mobile petit + mémoire par appareil + D-pad tactile
- **Défaut mobile = « petit »** (au lieu de normal), PC reste « grand » (AppContext `resolveScale`).
- **Mémoire de taille distincte par appareil** : clés `sx_textscale_mobile` / `sx_textscale_desktop` (fallback legacy `sx_textscale`). `setTextScale` écrit dans la clé du device courant ; un listener `matchMedia("(max-width:767px)")` recharge la taille du device au changement de breakpoint.
- **D-pad tactile mobile** (Home.js, `mobile-dpad`, `md:hidden`) en bas à droite face au bouton « Lancer » : `dpad-up`/`dpad-down` changent de catégorie, `dpad-left`/`dpad-right` naviguent entre créations, avec son (`sfx('nav')`). Handlers `navLeft/navRight/catUp/catDown` réutilisés par le clavier ET le D-pad. Taille en `em` → suit le réglage d'accessibilité. Masqué sur PC.
- Auto-testé (screenshot mobile) : défaut petit, D-pad présent + navigation OK, clé mobile='grand' après choix / desktop indépendant='grand', D-pad caché sur PC.


## Implemented — Itération 26 (2026-07-21) — Taille de texte « Petit »
- Nouveau niveau `petit` (87,5 % = 14px root, `--text-scale` 0.875) ajouté avant « Normal », utile surtout sur téléphone. Présent dans le menu du bouton « Aa » (`text-size-petit`) et dans les Paramètres (`text-scale-petit`).
- Vérifié (screenshot) : sélection « Petit » → data-textscale="petit", root font-size 14px.


## Implemented — Itération 25 (2026-07-21) — Taille de texte par défaut selon l'appareil
- La taille de texte par défaut (quand aucune préférence n'est enregistrée) dépend maintenant de l'appareil : **« normal » sur téléphone** (`matchMedia("(max-width: 767px)")`), **« grand » sur PC/tablette**. Un choix manuel dans les Paramètres/bouton reste prioritaire (localStorage `sx_textscale`).
- Vérifié (screenshot) : phone 390px → data-textscale="normal" (non stocké), desktop 1440px → "grand".


## Implemented — Itération 24 (2026-07-21) — Réduction du mini-lecteur
- Le `ReadingPlayer` peut désormais être **réduit en pastille** (bouton `reading-player-collapse`, IoChevronDown). Réduit → petite pastille ronde en bas à droite (`reading-player-expand`) avec l'icône ♪ et un **anneau de progression** (conic-gradient selon cur/dur). Tap → rouvre la barre complète. State `collapsed` local au composant.
- Auto-testé (screenshot) : collapse → pastille + anneau, barre complète masquée ; expand → barre complète de retour.


## Implemented — Itération 23 (2026-07-21) — Mini-lecteur audio seekable
- **Barre de lecture flottante** dans le reader (`ReadingPlayer` dans `ChapterReader.js`) : apparaît dès qu'une musique joue (immersive ou repère). Affiche titre (♪), temps écoulé/durée (`0:02 / 3:44`), play/pause, et boutons ‑10s / +10s (masqués sur mobile étroit).
- **Barre de progression cliquable (seek)** : `<input type=range>` de 0 à durée, `onChange` positionne `audio.currentTime` → navigation avant/arrière dans le morceau. Boutons ‑10s/+10s via `nudge`.
- **Contexte** : nouvelles fonctions `resumeReading()` (reprend la piste chargée, remet à 0 si terminée) et `getReadingAudio()` (expose l'élément audio pour lecture des `timeupdate`/`loadedmetadata` par le composant, sans re-render global). Play/pause du mini-lecteur passent par `pauseReading`/`resumeReading` → état synchro avec le bouton du header et les pastilles.
- Visibilité : `showPlayer` (state) activé quand `anyMusicOn`, ou au clic d'un repère / lecture header ; réinitialisé au changement de chapitre. Titre = data-title du repère, sinon « Musique de lecture ». Padding bas ajouté à l'article pour ne pas masquer les boutons Préc./Suiv.
- Auto-testé (screenshot) : lecteur affiché, durée/temps corrects (max 224s = 3:44), seek actif (non disabled), toggle OK, header synchro.


## Implemented — Itération 22 (2026-07-21) — Contrôle audio des repères
- **Couper la musique depuis la barre du haut** : le bouton `reader-music` de l'en-tête coupe désormais TOUTE musique en cours (immersive OU repère `cue:`). Nouvel `anyMusicOn` (playingId === readingKey OU commence par "cue:") + nouvelle fonction contexte `pauseReading()` (fond + pause sans quitter le mode lecture). Le bouton est visible dès que `hasMusic || hasCues (regex sx-music-cue dans le contenu) || anyMusicOn`, et affiche ⏸ (rouge) quand ça joue.
- **Pastille musique agrandie/évidente** (`index.css` `.sx-music-cue`) : gros bouton pilule rempli (brand), texte 700, padding ~0.55em 1.05em, ombre portée, ▶ plus grand, hover scale + glow → clairement cliquable. Actif = ⏸ + halo.
- Vérifié (screenshot) : pastille « ▶ Thème de bataille » bien visible/cliquable, bouton stop de l'en-tête actif pendant la lecture.
- ⚠️ INCIDENT : lors des tests de l'itération 21, le testing_agent a écrasé le vrai contenu du Chapitre 1 de « Born X Burn » par le texte seed. Partiellement récupéré via capture mais tronqué ; l'utilisateur remet le texte lui-même. À l'avenir : faire tester les agents sur une œuvre jetable dédiée, jamais sur les vraies créations.


## Implemented — Itération 21 (2026-07-21) — Médias inline dans les chapitres (images + repères musique)
- **Objectif utilisateur** : placer plusieurs images ET plusieurs pistes de musique à des moments précis du chapitre. Choix retenus : repère musique VISIBLE (pastille), lancement MANUEL par le lecteur (pas de scroll auto), arrêt à volonté, un nouveau repère remplace le précédent EN FONDU, musique SANS boucle (se termine puis relançable), COEXISTE avec l'ancien système (couverture + musique de chapitre).
- **Backend** (`server.py`) : bibliothèque de médias par œuvre — `POST /api/creations/{cid}/assets` (multipart file + kind=image|audio + name, max 12 Mo), `GET /api/creations/{cid}/assets` (liste sans data), `GET /api/assets/{id}` (octets + Cache-Control immutable), `DELETE /api/assets/{id}`. Collection `media_assets`, nettoyée à la suppression d'œuvre. Import `Form` ajouté.
- **api.js** : `uploadAsset`, `listAssets`, `deleteAsset`, `assetUrl`.
- **RichTextEditor** : prop `creationId` ; boutons `rte-image` (upload + insertion `<img class="sx-rich-img">` à la position du curseur) et `rte-music` (panneau `rte-music-menu` : titre + upload d'une piste OU réutilisation d'une piste existante → insertion pastille `<span class="sx-music-cue" data-track data-title>`). Sélection du curseur mémorisée (`savedRange`) pour insérer au bon endroit.
- **ChapterReader** : clic sur une pastille → `toggleReadingUrl(url, "cue:"+url, {loop:false})` (fondu + remplacement) ; effet qui met `data-active` (▶/⏸) selon `playingId/isPlaying`.
- **AppContext** : `playReadingUrl`/`toggleReadingUrl` acceptent `opts.loop` (défaut true = immersif) ; listener `ended` sur cardAudio remet `isPlaying=false` (pas de boucle pour les repères).
- **CSS** : `.sx-rich-img` (image responsive encadrée) et `.sx-music-cue` (pastille pilule, ▶ / ⏸ actif).
- Testé par testing_agent (iteration_13.json) : backend 3/3 pytest, frontend 100% (insertion image+cue, persistance, rendu lecteur, lecture manuelle data-active, remplacement en fondu, loop=false confirmé, coexistence/régressions OK). Assets de test nettoyés.


## Implemented — Itération 20 (2026-07-21) — Préchargement pendant l'intro (demande Msg 70)
- **Zéro chargement après l'écran de démarrage** : `IntroGate` (App.js) précharge en tâche de fond, PENDANT l'animation d'intro, les données de l'Accueil via React Query (`qc.prefetchQuery(["creations"])` + `["categories"]`) et met en cache `["settings"]` (`fetchQuery`, réutilisé pour choisir le type d'intro/aléatoire). Après réception des créations, les **images d'affiches** des 16 premières fiches sont préchauffées (`new Image().src = posterUrl(...)`) pour un rendu visuel quasi instantané.
- Résultat : quand l'utilisateur appuie sur « Entrer », `Home` monte avec les données déjà en cache (staleTime 60s) → plus de spinner « Chargement… ».
- Auto-testé (screenshot) : 250 ms après « Entrer », 0 « Chargement » visible et 15 cartes déjà rendues avec affiches. N'affecte pas le cas « intro désactivée » (Home charge comme avant).


## Implemented — Itération 19 (2026-07-20) — Mini-jeu arcade
- **Nouvelle catégorie « Jeux » (遊)** créée (categories, order 6) + nouveau `launch_type: "game"` (string libre, aucun changement de modèle backend requis ; option « Jeu arcade » ajoutée dans `EditorDialog`).
- **Jeu « Cosmic Bunny · Astro Delivery »** (`CosmicBunnyGame.js`) : runner latéral en Canvas 2D. Un lapin coursier (casque/tenue) conduit une moto et **livre des colis 📦 sur une Terre V2 hostile** (ciel rouge toxique, skyline en ruines parallax, sol fissuré, poussière, éclairs). Mécaniques : saut (Espace/↑/tap), gravité, obstacles au sol (🪨🚧🛢️⚙️) à esquiver, colis flottants à collecter (+15), score = distance + livraisons, 3 vies avec invincibilité temporaire, vitesse croissante, record en localStorage (`sx_game_cosmic_bunny_hi`). Écrans Démarrer / Game Over.
- Intégration `Detail.js` : `launch_type==="game"` ouvre `<CosmicBunnyGame>` en modale plein-écran. Fiche créée avec affiche IA (lapin motard sur Terre V2 hostile). Le lapin motard en jeu est composé en emoji (🐰+🏍️+📦) pour un rendu net (sprite IA en JPEG non transparent, non utilisé en jeu).
- Auto-testé (screenshots) : onglet Jeux + carte OK, lancement, gameplay (score 99, collision→2 vies, colis/obstacles rendus), écran titre thématique.


## Implemented — Itération 18 (2026-07-20)
- **Reprise directe depuis la carte** : le libellé de progression sur `PosterCard` est désormais cliquable (`poster-resume-{id}`, `stopPropagation`) → `Home.resume(id)` navigue vers `/oeuvre/{id}` avec `state:{resume:true}`. `Detail` détecte ce state (via `useLocation`) et ouvre directement le `ChapterReader` au chapitre sauvegardé (puis nettoie le state avec `nav(replace)`), sans passer par la fiche. Toast « Reprise au chapitre N » comme d'habitude.
- **Badge « ✓ Terminé »** : quand la progression atteint 100 % (`done = pct>=100`), affichage d'un badge `poster-done-{id}` en haut à droite de l'affiche et le libellé devient « ✓ Terminé · Relire » (clic = relire depuis le chapitre courant/début).
- Auto-testé (screenshots) : clic reprise ouvre le lecteur au bon chapitre, badge Terminé + libellé Relire OK à 100 %.


## Implemented — Itération 17 (2026-07-20)
- **Barre de progression de lecture par carte** (`PosterCard.js`) : pour les œuvres `launch_type==="chapters"`, la carte lit `localStorage sx_progress_{id}` et affiche un libellé « ▸ Ch. N/total · X% » (remplace l'accroche) + une fine barre de progression rouge en bas de l'affiche. Progression globale = (chapitre + ratio) / total. Backend : nouveau champ léger `chapters_count` (Creation) exposé dans la liste allégée et le détail (calculé dans `_lighten` + branche media) sans réintroduire les gros base64.
- **2 nouveaux écrans de démarrage anime dynamiques** (`BootIntro.js` + `intro.js` + `index.css`) :
  - **Anime Slash** (`slash`, 閃) : lignes de vitesse balayantes + deux tranches de sabre croisées + flash d'impact + kanji glitché. Son : swipes métalliques → impact grave → traîne.
  - **Hanabi** (`hanabi`, 華) : anneaux concentriques + ~30 particules multicolores qui explosent en radial + kanji lumineux. Son : sifflement de lancement → boom → étincelles.
  - Ajoutés aux INTROS → automatiquement inclus dans le tirage « Aléatoire ». Nouveaux keyframes : introSpeed, introFlash, introSlashStreak(2), introBurst.
- Auto-testé (curl + screenshots) : `chapters_count=2` renvoyé, libellé carte « ▸ Ch. 1/2 · 25% » + barre, aperçu des deux écrans OK.


## Implemented — Itération 16 (2026-07-20)
- **Boutons du haut du lecteur agrandis** (`ChapterReader.js`) : Sommaire / Aa (réglages) / Musique / Fermer passent en boutons bordés plus grands (icônes 22-26px, padding p-2.5, fond léger) → plus lisibles et tactiles.
- **Pack son personnalisé réservé à l'admin** (`Settings.js`) : le bouton « Pack personnalisé » et ses uploads (`soundpack-custom` / `custom-sounds`) sont désormais enveloppés dans `{isAdmin && ...}`. Un visiteur ne peut plus uploader ses propres sons (les packs synthétisés + Silence restent dispos).
- **Écran de démarrage aléatoire** : nouvelle option `intro_type === "random"`. Carte « Aléatoire » 🎲 dans IntroManager (`intro-random`, bouton `intro-choose-random` admin uniquement). Dans `App.js` (IntroGate), si `intro_type==="random"`, on tire au hasard un écran parmi les INTROS non masqués (+ vidéo si présente) → un écran différent à chaque session. `intro_type` accepte déjà une string libre côté backend (aucun changement serveur).
- Auto-testé (screenshots) : boutons lecteur agrandis, pack perso masqué pour visiteur, carte Aléatoire présente pour tous mais « Définir » admin-only, `intro_type` persiste à "random", intro tirée aléatoirement au boot.


## Implemented — Itération 15 (2026-07-20)
- **Accessibilité — Taille du texte globale** (demande utilisateur myope : « normaliser » le zoom du lecteur à toute l'app car descriptions/commentaires/chapitres trop petits). Réglage `textScale` (localStorage `sx_textscale`), 4 niveaux : Normal / Grand (112,5 %) / Très grand (125 %) / Maximum (140 %). **Défaut = Grand.** Appliqué via `font-size` racine sur `<html>` (attribut `data-textscale`) → tout le texte en rem grandit (descriptions, synopsis, commentaires, chapitres/épisodes, chrome UI). Le lecteur de chapitres garde son propre réglage px (orthogonal).
- **Bouton d'accès rapide** (`TextSizeButton.js`, testids `text-size-btn` + menu `text-size-menu` + `text-size-{normal|grand|xl|max}`) ajouté dans la TopBar de l'Accueil et dans la barre d'actions des fiches (Detail) → menu déroulant pour changer la taille à la volée.
- **Affiches neutralisées** : largeurs `.sx-poster` en `calc(rem / var(--text-scale))` pour que l'échelle de texte n'agrandisse PAS le rail (elles gardent leur propre réglage « Taille des affiches »).
- **Section « Accessibilité »** dans Paramètres visible par tous (hors gate admin), `text-scale-grid`.
- Testé par testing_agent (iteration_12.json) : 16/16 checks frontend PASS, 0 erreur console. Défaut 'grand' confirmé, persistance, pas de débordement mobile (390=390), bouton présent Accueil + fiche. **Régressions héritées revalidées** : `chapter_size`/`button_size` (round-trip PUT OK), bloc engagement `reader-engagement` (Commenter/Partager) présent avant préc./suiv. dans le lecteur. (Valeurs de test 'xl' sur Born X Burn remises à 'md'.)


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

## Changelog — 21/07/2026
- Ajout d'une date de sortie (mois et/ou année) pour les créations "À venir".
  - Backend (`server.py`): champs `release_month` (nom du mois FR) et `release_year` (string) sur `Creation` + `CreationInput`.
  - Éditeur (`EditorDialog.js`): bloc mois (select Janvier→Décembre) + année (input) affiché quand "À venir" est coché. testids: `editor-release-month`, `editor-release-year`, `editor-release-section`.
  - Carte (`PosterCard.js`): le badge "À venir" affiche la date ("Mois Année") si renseignée, sinon "À venir". testid: `poster-release-{id}`.
  - Fiche (`Detail.js`): tag "Sortie · Mois Année" à côté de "À venir". testid: `detail-release`.
  - Testé backend via curl (create/list/delete d'une création jetable). Frontend affiché OK.

## Migration Preview → Production — 23/07/2026
- Contexte : le déploiement ne transfère que le code, pas la base MongoDB (bases séparées preview/prod). L'utilisateur avait édité tout son contenu en Preview uniquement.
- Solution : script `/app/scripts/migrate_to_prod.py` qui copie tout via l'API publique de production (backend sans auth serveur — PIN admin uniquement côté client).
- Migré : 5 catégories (key préservée), 15 ambiances + audio, 14 créations (posters/bg/galeries base64 + chapitres + episodes), musiques d'ambiance/lecture/chapitre, 28 assets intégrés (images/audio), réglages site.
- Points clés : les IDs de créations changent → audios réuploadés avec les nouveaux cid ; les IDs de chapitres sont préservés (passés dans le payload) ; les assets intégrés sont réuploadés (nouveaux aid) et les URLs dans le HTML des chapitres réécrites (domaine preview→prod + old_aid→new_aid).
- Sauvegarde préalable : `mongodump` de la base preview dans `/app/memory/backups/preview_YYYYMMDD_HHMMSS`.
- Vérifié : prod affiche 14 créations, assets/posters/audios répondent en 200. Prod home screenshot OK.
- IMPORTANT pour l'avenir : l'utilisateur doit faire ses ajouts/modifs directement en PRODUCTION (le public voit la prod). La Preview = brouillon de test. Re-lancer le script écraserait le contenu prod.

## Espace social — 23/07/2026
- Profils visiteurs : nom + photo uploadée (base64, max 2 Mo) + email optionnel. Stocké en localStorage (sx_profile, sx_visitor_id) + collection backend `profiles` (upsert par id). Email valide → auto-ajouté aux `subscribers`.
- Prompt de création de profil à la 1ère visite (ProfilePrompt, "Plus tard" possible) + bouton "Profil" dans TopBar (avatar+nom). Édition/suppression via ProfileDialog.
- Écran d'entrée (BootIntro) personnalisé : si profil → avatar + message de retour aléatoire (avec {name}) ; sinon logo STATIONEXUS. Messages dans SiteSettings.welcome_messages (5 défauts, éditables en admin via WelcomeMessagesManager). Helper lib/social.js pickWelcome().
- Annonces admin → visiteurs : collection `announcements` (title, text, creation_id optionnel). Bannière AnnouncementBanner sur Home, vue une fois (localStorage sx_seen_ann). Géré dans Settings > AnnouncementsManager (admin).
- Bouton "Partager" proéminent sur la fiche (Detail) via ShareMenu prominent (testid detail-share-prominent; icône header = detail-share-icon).
- Endpoints: POST/GET /api/profiles, GET /api/profiles/{id}, GET/POST/DELETE /api/announcements, welcome_messages dans /api/settings.
- Testé: testing_agent iteration_15 → 11/11 backend, 9/9 frontend. OK.
- NOTE avatars IA générés: ABANDONNÉS sur demande user (upload perso uniquement).
- NON FAIT (à faire) : envoi RÉEL d'emails de notification (nécessite intégration email type Resend + clé API/domaine du user). Actuellement on ne fait que COLLECTER les emails.
- Ces features sont en PREVIEW : nécessitent un redéploiement pour apparaître en production.

## Social v2 — 23/07/2026
- Resend email : envoi d'emails aux abonnés lors d'une annonce (case "Envoyer aussi par email aux abonnés" dans AnnouncementsManager). Backend: resend lib, /api/email/status, _broadcast_email via BackgroundTasks. Env: RESEND_API_KEY, SENDER_EMAIL (onboarding@resend.dev), REPLY_TO_EMAIL (gmail user), PUBLIC_APP_URL. LIMITE: mode test Resend n'envoie qu'à l'email du compte tant qu'un domaine n'est pas vérifié. Envoi réel testé OK vers louzalabrichel@gmail.com.
- Menu mobile (TopBar réécrit, responsive): en mobile, bouton hamburger (mobile-menu-btn) ouvre un drawer avec header profil + Membres/Contact/Paramètres/Créer(admin) + son & Aa dupliqués en bas. Son (mute) et Aa (TextSizeButton) restent AUSSI visibles hors menu. Desktop = boutons complets + bouton Membres.
- Page Membres /membres (Members.js, publique): grille des profils (avatar/initiale, nom, lien Instagram). Admin peut retirer un membre (deleteProfile).
- Champ Instagram ajouté au profil (ProfileDialog + Profile model + saveProfile).
- Endpoints ajoutés: DELETE /api/profiles/{id}, GET /api/email/status, notify_email sur POST /api/announcements.
- Vérifié: curl (profils/instagram/delete/announce-notify), envoi email réel, screenshots (menu mobile, page Membres e2e avec profil Sora+Instagram, desktop).
- À FAIRE pour diffusion email complète: vérifier un domaine dans Resend (sinon envoi limité au compte owner).

## Social v2.1 — 23/07/2026 (ajustements UX)
- Page Membres : bouton "Créer mon profil" / "Modifier mon profil" (members-create-profile) ouvrant ProfileDialog. Fix crash import useState manquant.
- TextSizeButton : prop dropUp (ouvre le menu vers le haut) utilisé dans le drawer mobile.
- TopBar mobile : bouton "Menu" avec libellé + fond var(--brand) (change selon thème). Texte d'invitation "Personnalise ta station... dans les Paramètres" en haut du drawer.

## Social v3 — 23/07/2026 (favoris + notifications + nouveautés)
- Contexte (AppContext): favorites (localStorage sx_favorites) + toggleFavorite/isFavorite ; seenAnnouncements (sx_seen_ann) + markAnnouncementsSeen. Exposés dans value.
- Favoris: cœur cliquable sur PosterCard (poster-fav-{id}, span role=button pour éviter bouton imbriqué) + bouton favori sur la fiche Detail (detail-favorite). Nouvelle catégorie "Favoris" (愛, key __fav__) sur Home qui filtre par favoris.
- Notifications: badge rouge (unread = annonces non vues) sur boutons Profil + Nouveautés (desktop) et Menu (mobile) + pastille sur ligne menu-novelties.
- Page Nouveautés /nouveautes (Novelties.js): liste les annonces (date FR), marque tout comme vu à la visite (efface le badge). Accessible via TopBar desktop + menu mobile.
- AnnouncementBanner refactorisé pour utiliser le contexte (seenAnnouncements/markAnnouncementsSeen) → badge synchronisé.
- Vérifié: badge, page Nouveautés, filtre Favoris + toggle cœur (clic DOM natif), bannière. Compile OK.

## Social v3.1 — 23/07/2026
- Nouveautés (page + bannière) : affichent désormais l'affiche (poster) + le nom de l'œuvre liée + le titre de la nouveauté (ex: "Épisode 3 : C'est lui le commandant"). Le "titre" de l'annonce = titre de la nouveauté ; creation_id fournit poster+nom.
- Placeholder admin du titre d'annonce mis à jour en conséquence.
- TopBar : badge "Visiteur" retiré ; le badge n'apparaît qu'en mode déverrouillé ("Création"). Idem menu mobile (Mode création uniquement si admin). IoLockClosed retiré des imports TopBar.

## Home UX + Tutoriel — 23/07/2026
- Barre de recherche toujours visible (search-input) + bouton "Trier" (filter-toggle révèle le tri).
- Taille des affiches par défaut: "grand" sur PC, "compact" sur mobile (inchangé). resolvePoster AppContext.
- Fix titres coupés / décalage dernière fiche: .sx-poster max-height:100% + rail min-h-0 (les cartes ne dépassent jamais la hauteur du rail) + spacer de fin (w-[42vw] md:38vw) pour centrer la dernière carte.
- Bouton "Lancer" remonté sur PC (md:-mt-4, pb réduit).
- Nouvelle page Tutoriel /tutoriel (Tutorial.js): explique navigation, taille texte, personnalisation, lecture confort, ambiances, favoris, profil/membres, nouveautés, galeries. Liens: bouton "?" desktop (tutorial-btn) + ligne menu mobile (menu-tutorial).
- Bouton Paramètres PC en couleur d'accent (var --brand).
- Vérifié par screenshots (grand posters + titres OK, dernière fiche OK, tutoriel, recherche).

## Taille affiches/texte par appareil — 26/07/2026
- AppContext: états posterDesktop/posterMobile/textDesktop/textMobile + setPosterSizeFor(phone,v)/setTextScaleFor(phone,v) (écrit la clé sx_postersize_{desktop|mobile} / sx_textscale_{...} et applique en direct si c'est l'appareil courant). setPosterSize/setTextScale (appareil courant) synchronisent aussi ces états.
- Settings > Accessibilité: "Taille du texte" en 2 rangées Ordinateur/Mobile (testids text-desktop-*/text-mobile-*). Personnalisation: "Taille des affiches" en 2 rangées Ordinateur/Mobile (poster-desktop-*/poster-mobile-*).
- Défauts inchangés: PC affiches "normal", mobile "compact"; texte PC "grand", mobile "petit".
- Vérifié: sélection indépendante PC/mobile (sx_postersize_mobile=grand sans changer PC). Compile OK.

## Aperçu taille affiches — 26/07/2026
- Settings: composant MiniPoster (data-testid poster-preview) affiché à droite de chaque rangée (Ordinateur/Mobile) de la taille des affiches. Taille en px selon compact(40)/normal(58)/grand(78), transition animée, dégradé brand + fausses lignes de titre. Vérifié par screenshot.

## Guide Cosmic Bunny — 28/07/2026
- Mascotte-guide **Cosmic Bunny** (sans IA, phrases préenregistrées) : lapin en combinaison + casque d'astronaute (image transparente `/public/cosmic-bunny.png`, fond retiré via flood-fill). Toujours présente en bas à gauche, ouvrable au clic ; auto-ouverture à la 1ʳᵉ visite de chaque page.
- Composant `components/CosmicBunny.js` (rendu global dans `App.js`, dans le BrowserRouter). Bulle avec : texte humoristique, « Conseil suivant » (compteur i/n) sinon « Compris ! », fermeture (croix / tap mascotte), et « Je parle trop ? 🙉 Chut ! » (désactive les conseils auto, mascotte reste tappable). Ton humoristique et plein d'entrain.
- Contextes/pages : home, detail, **reader** (mode lecture — déclenché via événement `sx-cb-context` depuis `ChapterReader` au mount/unmount), settings, members, novelties, contact, tutorial. Mémoire des pages vues dans `localStorage sx_cb_seen`.
- Apparaît **seulement après l'entrée dans la station** : flag `sessionStorage sx_entered` posé par `App.js` (BootIntro onDone + early-returns quand intro off/déjà vue) + event `sx-entered`. Sur l'Accueil, la mascotte est surélevée (classe `cb-home`) pour ne pas chevaucher le bouton LANCER.
- Réglages (`Settings.js` → section « Cosmic Bunny », visible par tous) : toggles `sx_cb_hidden` (afficher/masquer la mascotte) + `sx_cb_tips_off` (conseils auto) + bouton « Revoir tous les conseils » (efface `sx_cb_seen`). Live via event `sx-cb-pref`. **Admin** : toggle global `cosmic_bunny_enabled` + éditeur des phrases par page (ajout/suppression, Enregistrer).
- Backend (`server.py`) : `SiteSettings.cosmic_bunny_enabled: bool` + `cosmic_bunny_tips: Dict[str,List[str]]` (défauts FR par page). GET/PUT `/api/settings` inchangés.
- Vérifié par screenshots : auto-open Accueil (1/4) + « Conseil suivant » (2/4), pas de chevauchement LANCER (mascotte y=920 / bouton y=999), section Paramètres + éditeur admin, masquage/affichage live.

## Cosmic Bunny v2 (image + boutons + ordre) — 28/07/2026
- **Image personnalisable** : `SiteSettings.cosmic_bunny_image` (data URI base64, max 2 Mo, comme les avatars). Paramètres → « Changer l'image » (upload) + « Réinitialiser » (revient à `/cosmic-bunny.png`). La mascotte et l'aperçu utilisent `settings.cosmic_bunny_image || "/cosmic-bunny.png"`.
- **Boutons dans les bulles** : chaque conseil peut proposer un bouton (`button_label` + `button_target` = route). Le modèle est passé de `List[str]` à `List[Dict[str,str]]` (`{text, button_label, button_target}`). `normalizeTip` gère la rétro-compat (string → objet). Rendu bulle : `.cb-cta` (data-testid `cb-cta`) qui navigue puis ferme/marque vu.
- **Bouton vers Paramètres dans les conseils du début** : 1ᵉʳ conseil de l'Accueil = « Personnaliser la station ⚙️ » → `/parametres` (défaut). Membres a aussi un bouton « Voir les membres ». `CB_TARGETS` = liste des destinations proposées (Aucun/Paramètres/Accueil/Membres/Nouveautés/Contact/Tutoriel).
- **Réordonnancement** : éditeur admin par conseil avec flèches ↑/↓ (`cb-tip-up/down-{page}-{i}`), + libellé bouton (`cb-tipbtn`), destination (`cb-tiptarget`), texte (`cb-tiptext`), suppression, ajout. Bouton « Enregistrer les phrases » (PUT settings). Upload image testids `cb-image-upload` / `cb-image-reset`.
- Vérifié par screenshots : CTA « Personnaliser la station » sur l'Accueil → navigue vers /parametres ; éditeur admin (image + libellé/destination + ↑/↓) ; réordonnancement confirmé (home-0 change après ↓).

## Cosmic Bunny v3 (multi-poses + décor thématique) — 28/07/2026
- **Nouveau design validé** : Cosmic Bunny = lapin humanoïde mignon/énergique (pas badass, pas timide ; a peur seulement si poursuivie), combinaison spatiale BLANCHE usée à accents pastel, casque à visière (visage caché), grandes oreilles souples. Générée par IA + détourée (chroma green key-out).
- **5 poses** (sprites transparents dans `/public/cosmic-bunny/`) : `wave` (coucou assuré), `thumbs` (pouce assuré), `excited` (saute de joie), `neutral` (repos), `sad` (triste quand on part). Mapping : ouverture/réouverture→wave ; « Conseil suivant »→thumbs ; « Compris ! » (fin)→excited (2,6 s) ; fermeture/CTA/« Chut »→sad/excited (temporaire) puis neutral. Timer via `useRef`.
- **Décor néon thématique** : la mascotte est un petit « stand » (104×138 px desktop / 84×112 mobile), `.cb-stage` = image `/cosmic-bunny/alley.jpg` (ruelle néon japonaise) recolorée automatiquement selon le thème via overlay `::after` `background:var(--brand); mix-blend-mode:color`. Le sprite dépasse du cadre (oreilles au-dessus). Fond image passé en style inline (`process.env.PUBLIC_URL`) car CRA ne résout pas les assets `public/` dans `url()` CSS.
- Si une **image custom** est uploadée (`cosmic_bunny_image`), elle remplace le set de poses (rendu circulaire `.cb-custom`). Aperçu Settings = `cosmic_bunny_image || /cosmic-bunny/wave.png`.
- Vérifié par screenshots : stand 104×138 + sprite 62×168 qui dépasse, recolorisation thème rouge, transitions de poses wave/thumbs/excited/sad OK, CTA fonctionnel. NB : un ancien `cosmic_bunny_image` (2,4 Mo, hérité de la migration prod) a été réinitialisé via le bouton admin « Réinitialiser ».

## Cosmic Bunny v3.1 (ajustements taille/immersion/placement) — 28/07/2026
- **Format réduit en cercle buste** : la mascotte n'est plus un grand stand plein-pied (débordait, trop gros mobile). Désormais un **cercle** (64 px mobile / 74 px desktop) montrant le **buste** du sprite (`object-fit:cover; object-position:50% 6%`). Poses réutilisées telles quelles, croppées.
- **Meilleure immersion** (elle semblait « posée dessus ») : suppression du drop-shadow ; ajout d'un voile d'unification `.cb-tint` (couleur du thème en `mix-blend-mode:soft-light`) au-dessus du perso + décor, teinte du décor (`.cb-stage::after` `mix-blend:color`), et **vignette** (`.cb-mascot::after` radial + inset shadow) pour l'ancrer dans la scène.
- **Badge d'aide « ? »** : `.cb-help` (pastille pulsante) affichée à côté de la mascotte quand la bulle est fermée, pour signaler qu'elle peut aider. Masquée quand la bulle est ouverte.
- **Placement** : **desktop → bas-DROITE** (`@media min-width:768px` : `right`, `align-items:flex-end`, tail de bulle à droite, badge à gauche). **Mobile → bas-gauche** (base mobile-first, raise `cb-home` pour éviter le bouton Lancer).
- **Fiche « Cosmic Bunny » (son aventure)** : nouveau contexte `bunny_story` déclenché par `Detail.js` (dispatch `sx-cb-context:"bunny_story"` si `title.trim().toLowerCase()==="cosmic bunny"`). Nouvelle **pose `moto`** (`/cosmic-bunny/moto.png`, buste sur sa moto) + phrases spéciales in-character (« *vrooom* je débarque en moto 🏍️ »). Éditable dans Settings (page « Fiche Cosmic Bunny (son aventure) »). Défauts ajoutés backend + frontend.
- Vérifié par screenshots : desktop bas-droite cercle buste immergé + bulle à droite ; fiche Cosmic Bunny → pose `moto` + texte spécial ; badge « ? » présent à la fermeture ; retour pose neutral après sad.

## Cosmic Bunny v3.2 (correctifs coupe/zoom/badge/bulle PC) — 28/07/2026
- **Plus de coupe & plus de zoom incohérent** : sprites re-traités en « buste + mains » (crop haut ~64-70 %, jambes retirées) puis paddés sur un cadre uniforme ~3:4 ; affichage passé de `object-fit:cover` à **`contain`** (`object-position:50% 100%`) → mains visibles, aucune coupe, échelle identique entre poses.
- **Badge « ? » sorti du cercle** : le cercle est `overflow:hidden` (clippait le badge). Ajout d'un wrapper `.cb-mascot-wrap` (overflow visible) ; `.cb-help` positionné À L'EXTÉRIEUR (coin) — visible. Desktop : coin haut-gauche ; mobile : coin haut-droite.
- **Bulle PC remontée + agrandie** : `@media min-width:768px` → `.cb-root { right:24px; bottom:84px }` (au-dessus du texte « naviguer · catégories · Entrée »), bulle `min(92vw,360px)`, texte 1rem, mascotte 80 px.
- Vérifié par screenshots (desktop) : badge « ? » visible hors cercle (box distincte au coin), mains non coupées, bulle plus grande au-dessus du hint de navigation. Mobile suit le CSS mobile-first (cercle 66 px, badge haut-droite).





## Synchronisation profil local → compte (upgrade depuis la fiche profil) — 28/07/2026
- **Besoin utilisateur** : un profil local créé sur un appareil (ex. téléphone) n'était pas récupérable sur un autre (ex. navigateur PC). L'utilisateur voulait pouvoir "créer un compte depuis son profil" pour synchroniser.
- **Solution (ProfileDialog.js)** : ajout d'une bannière en haut de la fenêtre de profil.
  - Si NON connecté : encart d'alerte "Ce profil est enregistré uniquement sur cet appareil…" + bouton `profile-create-account` → `onClose()` puis `openAuth()` (ouvre AuthDialog). Le texte du bouton s'adapte : "Synchroniser ce profil (créer un compte)" en mode édition, "Créer un compte pour synchroniser" sinon.
  - Si connecté : encart de confirmation "Profil synchronisé sur ton compte {name}" (`profile-sync-ok`).
- **Mécanisme sous-jacent (déjà existant, AuthContext.finishAuth)** : à la 1ère connexion sur un compte vide, `authSync` pousse `buildPrefs()` (qui inclut `sx_profile`) + favoris vers le serveur. Sur un autre appareil, `applyAccountAndReload` réapplique profil + favoris. Donc le profil local est bien transféré sans rien recréer.
- Vérifié par screenshot : bannière rendue correctement (data-testid `profile-sync-cta` présent), dialog s'ouvre bien.
- Note : l'ancien message d'accueil "créer un profil" que voyait l'utilisateur sur PC = cache PWA / service-worker (le code contient bien le bouton "Se connecter"). Un hard refresh charge la nouvelle version.

## Parcours unifié compte -> profil + retrait email du profil — 28/07/2026
- **Décision utilisateur** : privilégier "créer un compte puis un profil dans la foulée" pour éviter les profils locaux non synchronisés. Retirer le champ email du profil (le compte fournit déjà l'email, l'admin y a accès).
- **AuthContext.finishAuth** : après auth sur compte vide (register / 1re connexion), si aucun profil local (`sx_profile`) n'existe → `window.dispatchEvent(new CustomEvent("sx-open-profile"))` (setTimeout 350ms). Si l'utilisateur avait déjà un profil local (upgrade), pas de prompt (le profil est synchronisé tel quel).
- **Home.js** : écoute `sx-open-profile` → `setProfileOpen(true)`.
- **ProfileDialog.js** : champ email supprimé (state + input + validation). Nom/avatar pré-remplis depuis le compte (`user.name`/`user.avatar`) si pas de profil. `save()` conserve l'email existant éventuel (`profile?.email`) sans l'exposer. Bannière "synchronisé" mentionne les notifications par email.
- **Newsletter safe** : `auth_register` ET `auth_google_session` appellent déjà `_subscribe_email(email)` → l'email du compte est abonné automatiquement. Retirer le champ email du profil ne casse donc pas les notifications de nouveautés.
- Vérifié E2E par screenshot : register → toast "Compte créé" → AuthDialog fermé → ProfileDialog ouvert auto, `profile-email` absent (0), nom pré-rempli, `profile-sync-ok` affiché.

## Mode Cinéma (film) + bouton son lecture + fix sensibilité PC — 29/07/2026
### 1. Mode Cinéma (nouveau launch_type "film")
- **Backend (server.py)** : champs `film_url`, `trailer_url`, `has_film`, `has_trailer` sur Creation/CreationInput. Stockage OBJET (Emergent object storage via `EMERGENT_LLM_KEY`, ajouté à backend/.env) : helpers `_storage_init/_storage_put/_storage_get`, init au startup. Endpoints `POST/GET/DELETE /api/creations/{cid}/video?kind=film|trailer` (upload jusqu'à 200 Mo, streaming avec support Range 206, réf dans collection `film_media`). `delete_creation` nettoie `film_media`. Testé curl : upload/stream/range/delete OK.
- **Frontend** :
  - `lib/video.js` : `resolveVideoEmbed(url)` → YouTube/Vimeo/Dailymotion/embed/iframe/.mp4 direct.
  - `components/CinemaPlayer.js` : lecteur immersif plein écran (z-55, sous cb-root z-60). Décor salle sombre (spotlight brand, rideaux latéraux, vignette), barre haut (titre+fermer), commandes bas : **baisser/allumer les lumières** (`cinema-lights`), **couper le son** global (`cinema-mute`, lié à toggleMute + `<video>.muted`), **plein écran** (`cinema-fullscreen`), auto-masquage des barres après 3,2 s, Échap pour fermer. Priorité : lien > upload.
  - `lib/api.js` : `uploadVideo/deleteVideo/videoUrl`.
  - `EditorDialog.js` : option "🎬 Film / Cinéma", champs `editor-film-url`/`editor-film-upload` + `editor-trailer-url`/`editor-trailer-upload` (progress + suppression), limite 200 Mo côté client.
  - `Detail.js` : launch "film" → CinemaPlayer (stopAmbient) ; bouton `detail-trailer` si trailer présent.
  - `CosmicBunny.js` : nouveau contexte `cinema` (phrases par défaut) dispatché par CinemaPlayer → Bunny explique le mode ciné.
- **Limitation connue** : le streaming charge la vidéo entière en mémoire par requête (pas de cache). OK pour liens + petits uploads (trailers/extraits) ; déconseillé pour très gros films uploadés → privilégier les liens.
### 2. Bouton couper/réactiver le son en mode lecture
- `ChapterReader.js` : bouton `reader-mute` (global `muted`/`toggleMute`) ajouté dans l'en-tête, à côté de la croix.
### 3. Fix sensibilité défilement PC
- `Home.js` : ref `focusSrc`. Le rail ne se recentre (`scrollIntoView`) QUE sur navigation clavier/D-pad/catégorie ; le **survol souris ne recentre plus** (évite le "glissement" qui gênait le clic). `PosterCard` garde le highlight au survol sans déclencher le scroll.

## Cinéma v2 + navigation PC (raffinements) — 29/07/2026
- **Pad de flèches PC (Home.js)** : `desktop-dpad` (haut/gauche-droite/bas) affiché en haut à DROITE, juste au-dessus du rail d'affiches (`hidden md:flex`). Réutilise navLeft/navRight/catUp/catDown.
- **Glissement aux extrémités (Home.js)** : le survol ne recentre toujours pas le rail ; ajout d'un edge-scroll — quand la souris est à ≤40px du bord gauche/droit de l'écran, `railRef.scrollLeft` défile en continu (rAF), sinon rien. Désactivé si editorOpen/profileOpen.
- **Bande-annonce inline (Detail.js)** : plus de bouton — section `detail-trailer-section` affichée sur la fiche comme la galerie (iframe sans autoplay via `resolveVideoEmbed(url,false)`, ou `<video>` si upload). `resolveVideoEmbed(url, autoplay=true)` accepte désormais un flag autoplay.
- **Mode cinéma — contraste lumières + entrée (CinemaPlayer.js + index.css)** : lumières OFF (dim) = voile noir rgba(0,0,0,0.55) + forte vignette ; lumières ON = halo d'ambiance teinté thème + pas de voile (différence nette). Animation d'entrée : rideaux de velours teintés thème (`.cinema-curtain-l/-r`, keyframes `cinemaCurtainL/R`) qui s'ouvrent 1,15s + écran en fade/scale (`cinemaScreenIn`). État `intro` retiré après 1,2s.
- Vérifié par captures : pad PC, bande-annonce inline, rideaux d'entrée, Bunny contexte cinéma.

## Badge bande-annonce sur affiches (accueil) — 29/07/2026
- `PosterCard.js` : prop `onTrailer`, calcule `hasTrailer`. Si bande-annonce présente → badge "▶ Bande-annonce" : pill visible au survol/focus sur PC (`hidden md:flex`, opacity liée à `focused`), badge compact fixe en coin sur mobile (`md:hidden`). Clic → `onTrailer` (stopPropagation).
- `Home.js` : `onTrailer={() => nav('/oeuvre/'+id, { state:{ trailer:true } })}`.
- `Detail.js` : effet qui scroll vers `detail-trailer-section` si `location.state.trailer`.
- Vérifié par capture (badge rouge sur carte focalisée).

## Navigation PC v2 (correction) — 29/07/2026
- **Pad haut-droite retiré** (moche + disparaissait sur sections vides). Remplacé par deux flèches ← → (`nav-left`/`nav-right`, `home-nav-arrows`, `hidden md:flex`) placées juste à côté du bouton "Lancer" en bas.
- **Edge-scroll refait "souple"** (Home.js) : abandon du scrollLeft brut (se battait avec snap-mandatory). Désormais `setInterval` 500ms qui appelle navRight/navLeft tant que la souris est à ≤60px du bord droit/gauche ; recentrage animé carte par carte ; s'arrête au centre. Vérifié (bord droit → avance, bord gauche → recule, centre → stop).

## Navigation PC v3 (glissement fluide + pad) — 29/07/2026
- **Glissement fluide (Home.js)** : abandon de l'avance carte-par-carte (jugée saccadée). Retour à un scroll continu de `railRef.scrollLeft` via rAF (16px * facteur), avec vitesse PROPORTIONNELLE à la proximité du bord (zone 110px, edgeDir ∈ [-1,1]). Snap désactivé sur PC via `md:snap-none` (gardé sur mobile pour le swipe). Vérifié : scrollLeft 0→976→1744, stop au centre, retour à gauche.
- **Pad de flèches (Home.js)** : déplacé AU-DESSUS du bouton "Lancer" (colonne `flex-col`), taille FIXE (boutons carrés w-11 h-11) indépendante de la largeur du bouton. `hidden md:flex` (PC only).

## Correction navigation MOBILE — 29/07/2026
- **Bugs signalés** : D-pad ne faisait pas défiler les cartes ; swipe doigt buggé (cartes qui tremblent/se chevauchent).
- **Cause** : `snap-mandatory` + transform `scale(1.06)` des cartes se battaient avec le scroll natif tactile.
- **Corrections (Home.js + PosterCard.js + index.css)** :
  - Rail : `snap-x snap-proximity md:snap-none` (proximity au lieu de mandatory sur mobile → plus de tremblement).
  - D-pad mobile gauche/droite : `scrollRailBy(dir)` = `rail.scrollBy({left: ±(cardWidth+16), behavior:'smooth'})` (défilement natif fiable) au lieu de navLeft/navRight.
  - `onRailScroll` (rAF-throttlé, actif seulement si `innerWidth<768`) : surligne la carte la plus centrée pendant le scroll du doigt (setFocusIndex, focusSrc="scroll"). Effet de recentrage ignore désormais focusSrc "hover" ET "scroll".
  - PosterCard : `transform` retiré du style inline → géré en CSS via `.sx-poster.is-focused` : `scale(1.06) translateY(-6px)` sur desktop, `translateY(-4px)` seul sous 767px (plus de débordement horizontal).
- Vérifié viewport 390px : dpad scroll+focus synchro (UNITED SANCTUM FORCE→TENGOKU DOJO), 1 seule carte surlignée. Desktop inchangé (synchro scroll désactivée ≥768px).

## Fondu bords + fix D-pad droit + choix de layout — 29/07/2026
- **Fondu léger bords du rail (Home.js)** : `mask-image: linear-gradient(to right, transparent, #000 3.5%, #000 96.5%, transparent)` → indique qu'il reste des créations à faire défiler.
- **Fix D-pad ► mobile** : le vrai clic ne défilait pas — cause : le `scrollBy behavior:smooth` natif était interrompu par le re-render déclenché par la synchro focus (`onRailScroll`). Remplacé par une **animation manuelle rAF** (easeOutCubic 300ms) avec garde `autoScrolling` qui désactive `onRailScroll` pendant l'animation. Vérifié en vrais clics : 191→341→491, focus qui suit, gauche/droite OK.
- **Choix de layout (Paramètres → "Disposition de l'accueil")** : 3 options `card` (actuel) / `grid` / `list`.
  - AppContext : state `layout` + `setLayout`, persistant `sx_layout`. AuthContext PREF_KEYS += `sx_layout` (synchro compte).
  - `components/CreationsGridList.js` : rendu grille (mosaïque responsive 3→8 cols, badges catégorie/favori/▶trailer) et liste (lignes compactes : mini-affiche + titre + accroche + favori + chevron). Clic = ouvrir la fiche.
  - `Home.js` : `{layout === "card" ? (<>rail+pad+bottom</>) : <CreationsGridList/>}`. Sélecteur dans Settings (`layout-card/grid/list`, conteneur `layout-selector`).
  - Vérifié : grid 14 cartes, list 14 lignes, sélecteur Paramètres OK, persistance sx_layout.
- Note : Blue Flower est configuré par l'utilisateur (launch_type=film + bande-annonce YouTube) — données réelles, conservées.

## Fluidité navigation mobile (fix saccades + retour 1ʳᵉ fiche) — 29/07/2026
- **Cause des saccades** : la synchro du focus à CHAQUE frame de scroll changeait `focused` -> rechargement du grand fond flou animé (`bgFade 1s`) en boucle pendant le glissement.
- **Cause "retour 1ʳᵉ fiche impossible"** : la 1ʳᵉ carte, collée à gauche, ne pouvait jamais atteindre le centre du viewport -> jamais sélectionnée.
- **Corrections (Home.js)** :
  - `onRailScroll` DEBOUNCÉ (110ms) : le focus/fond n'est mis à jour QU'À l'arrêt du défilement -> zéro re-render pendant le glissement -> fluide (doigt + D-pad).
  - `scrollRailBy` : animation manuelle rAF (easeOutCubic 300ms) vers la position exacte de la carte voisine (delta via `getBoundingClientRect`, robuste, indépendant de l'offsetParent), avec garde `autoScrolling` qui neutralise onRailScroll pendant l'anim.
  - `centeredIndex` : clamp aux extrêmes — `scrollLeft<=2 => 0` (1ʳᵉ fiche), `>=max-2 => dernière`. Rend la 1ʳᵉ/​dernière fiche atteignables et surlignées.
  - `behavior:'smooth'` de scrollIntoView était silencieusement annulé sur ce conteneur -> abandonné au profit de l'animation manuelle.
- Vérifié (viewport 390) : start=UNITED SANCTUM FORCE(0) -> ►=BORN X BURN(41) -> ◄=UNITED SANCTUM FORCE(0). Défilement continu 0→191→341→491 et retour 491→...→0.

## Fix repaints/saccades mobile + chevauchement (Plan A) — 29/07/2026
- **Cause racine** : `mask-image` posé DIRECTEMENT sur le conteneur qui défile (`poster-rail`, `overflow-x-auto`) -> le navigateur recompose toute la zone masquée à chaque frame de scroll = saccades massives sur mobile.
- **Corrections** :
  - Home.js : le rail est désormais enveloppé dans un wrapper STATIQUE `.sx-rail-mask` (ne défile pas) qui porte le mask-image ; le rail interne défile sans mask (`willChange: scroll-position`, `-webkit-overflow-scrolling: touch`, `overflow-y-hidden`).
  - index.css : `.sx-poster { contain: paint }` (isole les repaints par carte) ; sur mobile `<=767px` `.sx-poster.is-focused { transform: none }` (supprime tout transform -> plus de chevauchement horizontal des cartes).
  - Fond flou : `bgFade` réduit 1s->0.6s, `transform: scale(1.1) translateZ(0)` (promotion couche GPU, moins de repaint).
- Vérifié captures : mobile 390px scroll 0→641 fluide, cartes séparées, focus centré (Cosmic Bunny) ; desktop 1920 intact (masque + focus scale OK).

## Cause réelle "rien ne change" + refonte scroll mobile — 29/07/2026
- **CAUSE PRINCIPALE** : le service worker (PWA) servait les JS/CSS en **stale-while-revalidate** (`return cached || network`) -> sur téléphone le bundle EN CACHE (ancien) était rendu, les corrections n'apparaissaient qu'au 2e rechargement. En preview (dev server, bundle non-hashé `bundle.js`) c'est systématique.
  - Fix (public/service-worker.js) : stratégie **network-first** pour les assets statiques (fallback cache uniquement hors-ligne) + cache bumpé `stationexus-v3`->`v4` (l'ancien cache est purgé à l'activate). skipWaiting + clients.claim déjà présents.
- **Refonte scroll mobile (symptômes réels téléphone : saccades + "colle puis passe" + chevauchement)** :
  - Home.js : SUPPRESSION totale du scroll-snap (`snap-x/snap-proximity` retirés) -> plus de "colle puis passe". Retrait de `willChange` et `-webkit-overflow-scrolling:touch` (créaient une couche qui, avec le mask, provoquait le tearing/chevauchement iOS).
  - PosterCard.js : retrait de `snap-center`.
  - index.css : mask `.sx-rail-mask` **desktop-only** (>=768px) car le mask casse le rendu du momentum-scroll iOS ; sur mobile `.sx-poster { transition:none; transform:none }`.
  - Vérifié (390px) : scroll-snap-type=none, wrapper mask=none, 5 cartes sans chevauchement (150px d'écart, 0 overlap).
- Note pour l'utilisateur : sur son téléphone, recharger 2 fois (ou rouvrir la PWA) pour que le nouveau service worker prenne le contrôle.

## Système économique / Monétisation (Stripe) — 31/07/2026
Modèle choisi par l'utilisateur : vente à l'unité + abonnement mensuel type Patreon + chapitres gratuits/payants (admin choisit). Devise EUR. Compte obligatoire. Bibliothèque type Steam. Contenu débloqué et consommé dans l'app.

### Backend (server.py)
- Stripe sandbox Emergent (Flow A, compte FR, mode test). Clés dans backend/.env : STRIPE_SECRET_KEY / PUBLISHABLE / WEBHOOK_SECRET / ACCOUNT_ID.
- Modèles : Creation + CreationInput => is_paid, price_eur, free_chapters ; Chapter => locked (calculé) ; Creation => locked/owned (calculés) ; SiteSettings => membership_enabled/price_eur/title/perks.
- Helpers : _optional_uid, _membership_active, _user_owns, _user_has_access, _gate_creation (strip contenu des chapitres verrouillés).
- Endpoints : POST /api/payments/checkout (creation|membership), GET /api/payments/status/{sid} (poll + grant), POST /api/stripe/webhook (grant idempotent), GET /api/membership/plan, GET /api/me/entitlements, GET /api/me/library, POST /api/membership/cancel.
- Prix Stripe créés dynamiquement (price_data via Product+Price idempotents par lookup_key). Tax : managed_payments avec fallback session simple.
- Collections : purchases {user_id, creation_id, session_id}, memberships {user_id, subscription_id, status, current_period_end}, payment_transactions.
- Gating : GET /api/creations/{id} accepte Authorization optionnel ; sans droit -> chapitres au-delà de free_chapters verrouillés (content vidé, locked=true).

### Frontend
- api.js : startCheckout, paymentStatus, getEntitlements, getLibrary, getMembershipPlan, cancelMembership.
- useEntitlements.js : hasAccess(item), chapterLocked(item, index).
- Detail.js : badge prix / "Débloqué", bloc paywall (Acheter + S'abonner), verrous sur chapitres, redirection Stripe.
- Library.js (/bibliotheque) : achats + carte abonnement (s'abonner/résilier). PaymentResult.js (/payment/success, /payment/cancel) avec polling du statut.
- EditorDialog : section Monétisation (is_paid, price_eur, free_chapters). Settings : section Monétisation (MembershipSettings admin).
- TopBar : entrée "Ma bibliothèque" (desktop + menu mobile).

### Tests
- pytest tests/test_monetization.py : 11/12 PASS. 1 échec = défaut du test (PUT partiel sans title/category) ; l'app exige l'objet complet, le frontend l'envoie toujours entier => pas un bug applicatif.
- Frontend vérifié par captures : paywall détail (badge 3.50€, Acheter/S'abonner) + page bibliothèque (carte Soutien Nexus).
- Déblocage après achat vérifié manuellement (entitlements owned, chapitres déverrouillés, library >=1).

### À faire plus tard (backlog monétisation)
- Réclamer le compte Stripe (onboarding_url dans /tmp/sandbox.json) pour passer en LIVE et encaisser réellement.
- Optionnel : prix par chapitre individuel, codes promo, page "revenus" créateur.

## Paliers d'abonnement + page Soutien + statuts — 31/07/2026
- **3 paliers** (Soutien 5€ / Mécène 10€ / Légende 15€) : même accès (tout le catalogue payant), diffèrent par nom/prix/avantages, modifiables par l'admin. Backend: SiteSettings.membership_tiers (liste), checkout accepte tier_id, membership_plan renvoie tiers + page_title/body. memberships stocke tier_id.
- **Page dédiée /soutien** (SupportPage.js) : bulle Cosmic Bunny, titre + paragraphes éditables, 3 cartes paliers avec S'abonner. Éditable en mode création (isAdmin) : titre/corps/paliers, sauvegarde via updateSettings (merge complet requis). Entrées menu: support-btn (desktop) + menu-support (mobile). Library renvoie vers /soutien.
- **CTA accueil** (home-support-cta) sous le tagline si abonnement activé -> /soutien.
- **Compte OBLIGATOIRE pour profil** : Home.requireProfile ouvre l'auth si !user (TopBar onProfile + ProfilePrompt). Rappel: profil = nom/avatar local ; compte = cloud + achats. Achats/abonnements liés au COMPTE.
- **Statuts fiches** : Creation.status ("en_cours"|"a_venir"|"termine"). Badges couleurs: En cours=orange #ff7a00, À venir=bleu #4d8dff, Terminé=jade #00e5a0. Sur PosterCard (poster-status-{id}) + Detail (detail-status-badge). Éditeur: select editor-status. coming_soon -> a_venir en fallback.
- **Payant ne masque plus** le nombre de chapitres/épisodes (liste conservée, chapitres verrouillés = contenu vidé + locked=true). Acheteur ET abonné ont accès aux chapitres FUTURS (accès par création).
- Tests: /app/backend/tests/test_monetization_tiers.py 7/7 + frontend E2E 100% (iteration_17.json). Aucun bug.
- Note review (non bloquant): PUT /api/settings exige le body complet (le frontend l'envoie toujours entier via getSettings+merge).

## Ajustements abonnements + pages + profil — 01/08/2026
- **Anti-double abonnement** : _grant (server.py) résilie automatiquement l'ancien abonnement Stripe si le palier change (un seul actif par compte, tier_id stocké sur memberships).
- **Accueil** : CTA "Soutiens la station" masqué si l'utilisateur est déjà abonné (useEntitlements.membershipActive).
- **Page /soutien** : conseil Bunny retiré du corps -> désormais dans la bulle flottante CosmicBunny (tips 'support'/'library'/'about' + mapping routes). Hero redesigné (attractif, image Bunny décorative, checklist avantages). QuickControls ajoutés.
- **QuickControls** (nouveau composant) : son + plein écran + Aa + paramètres, présents sur Library, Support, About (avant ces pages n'avaient rien).
- **Boutons TopBar** Soutien & Bibliothèque : même style/animation que les autres (btn + hover scale), emoji ✨ retiré.
- **Profil = compte obligatoire** : ProfilePrompt ne propose plus de profil local ; message d'accueil "Bienvenue sur la Stationexus !" ; Home.requireProfile ouvre l'auth si non connecté.
- **Bibliothèque** : suppression mention Steam + 🎮 + "Dès X€" ; si abonné -> mise en avant + remerciement + palier + changer/résilier.
- **Page À propos** /a-propos (About.js) éditable admin (about_title/about_body dans SiteSettings, GET /api/about). Entrée menu menu-about.
- **Paramètres** : section "Mon abonnement" (MySubscription) -> statut actif + changer de palier + résilier.
- **Mobile** : barre du haut accueil remontée (sx-header padding-top 0.75rem -> 0.4rem).
- **À FAIRE (reporté)** : afficher le niveau de soutien (palier) sur les profils PUBLICS de la page Membres (nécessite de lier memberships aux profils publics). Actuellement le palier s'affiche dans Bibliothèque + Paramètres.

## Menu mobile global + palier sur profils publics — 01/08/2026
- **MobileMenu global** (components/MobileMenu.js) : bouton "Menu" (page-menu-btn, md:hidden = mobile only) + tiroir (page-menu-drawer) avec liens Accueil/Nouveautés/Soutien/Bibliothèque/À propos/Membres/Contact/Comment ça marche/Paramètres + login/logout. Intégré sur TOUTES les pages secondaires : Library, Members, Contact, Settings, SupportPage, Tutorial, About. Caché sur desktop (visible via TopBar).
- **Palier de soutien sur profils PUBLICS (Membres)** (demande Msg 489, enfin faite) :
  - Backend (server.py) : Profile a maintenant account_id (lien vers le compte) + hide_tier (bool) + champs calculés tier_id/tier_name. list_profiles joint les memberships ACTIVES par account_id et attache le palier (sauf si hide_tier). upsert_profile n'écrase pas account_id avec vide et ne patch hide_tier que si fourni.
  - Lien compte<->profil : AuthContext ajoute account_id au profil local à la connexion (auto-link) ; ProfileDialog passe account_id=user.id ; AppContext.saveProfile préserve account_id/hide_tier.
  - Frontend Members.js : badge coloré du palier sous le nom (member-tier-{id}) + pastille icône sur l'avatar (member-tier-icon-{id}). Couleurs/icônes : Soutien=bleu/cœur, Mécène=or/étoile, Légende=rose/diamant, fallback brand/sparkles.
  - Confidentialité : Settings > Mon abonnement (si abonné actif) a un toggle settings-hide-tier "Afficher mon palier de soutien sur mon profil public" (visible par défaut, masquable).
- Tests : testing_agent iteration_18.json -> frontend 100%. Backend vérifié via curl (tier_name=Mécène affiché ; vidé quand hide_tier=true). Données de test seed nettoyées.
- Rappel refonte déjà en place (session précédente) : About.js (hero+piliers+créateur+CTA), SupportPage tiers iconiques, home-support-cta (flèche + remplissage au survol via .sx-support-cta).

## Revenus créateur + À propos 100% éditable + Mur des soutiens + CTA raccourci — 01/08/2026
- **Bouton CTA Accueil raccourci** (Home.js) : texte « Soutiens la station » (au lieu de « …& débloque tout le catalogue ») + flèche animée. testid home-support-cta.
- **Page « À propos » entièrement éditable en mode création** (About.js) :
  - Les 3 cartes (piliers) éditables : titre + texte (about-pillar-title-{i} / about-pillar-text-{i}). Stockées dans SiteSettings.about_pillars (backend). Icônes fixes par index (livre/film/cœur).
  - Upload de l'image de fond hero (about-hero-upload → about_hero_image) et de la photo du créateur (about-creator-upload → creator_image), base64 max 3 Mo.
  - save() envoie about_pillars/about_hero_image/creator_image via updateSettings. GET /api/about renvoie pillars.
- **Mur des soutiens** (SupportPage.js, section supporters-wall) : « Merci à nos soutiens » — grille des membres ayant un palier actif (avatar + pastille + nom + palier), via listProfiles filtré sur tier_name. Absente s'il n'y a aucun abonné (comportement normal). Respecte hide_tier.
- **Page Revenus créateur (admin only)** /revenus (Revenue.js) :
  - Backend : GET /api/admin/revenue (dépendance get_admin_user, exige compte is_admin). Calcule depuis la BDD (PAS Stripe) : ventes à l'unité (count + Σ price_eur des créations via purchases), abonnements actifs groupés par palier + MRR (Σ count×prix palier), total estimé (achats + 1 mois d'abo), top créations vendues, transactions récentes payées (payment_transactions.amount).
  - Frontend : KPIs (total/unit/MRR), abonnés par palier, top créations, transactions récentes, bannière Sandbox. Gère 403 (revenue-forbidden) si non-admin.
  - Liens admin-only : TopBar desktop (revenue-btn) + drawer mobile TopBar (menu-revenue) + MobileMenu des pages secondaires (page-menu-revenue). Route /revenus ajoutée dans App.js.
- **Compte admin de test** : paytest@stationexus.com est désormais is_admin=true (claim PIN 1234) — noté dans test_credentials.md. A 1 achat test (3,50€ United Sanctum Force).
- Tests : testing_agent iteration_19.json → frontend 100% (4 features). Backend vérifié via curl (revenue: unit 3,50€/1 achat, about: 3 piliers).

## Revenus sans Stripe — 01/08/2026
- Page /revenus : suppression de la bannière/mention « Stripe Sandbox ». Sous-titre = « Calculés à partir de tes membres : leurs abonnements et leurs achats. »
- Backend admin_revenue : « recent » ne lit plus payment_transactions (Stripe) ; reconstruit depuis purchases (achats + prix création) et memberships actives (palier + prix), avec le NOM du membre (profil > compte > email). Résolveur member_name. Champ sandbox retiré. Aucun appel Stripe.
- Rappel : revenue reste admin-only (visible seulement en mode création / compte is_admin). Vérifié curl : 1 achat 3,50€, recent « Achat · United Sanctum Force · PayTest ».

## Badges statut cartes + Section Intentions + Divers UI — 01/08/2026
- Badges de statut (En cours/À venir/Terminé) RETIRÉS des cartes d'accueil (PosterCard) — conservés uniquement sur la fiche (Detail, detail-status-badge). Label catégorie conservé sur les cartes.
- Cartes en COMPACT par défaut sur PC (AppContext resolvePoster(false) -> "compact" ; respecte un choix perso déjà enregistré).
- Lapin décoratif retiré du hero de la page Soutien (PC).
- Bloc newsletter retiré de la page Contact (code addSubscriber/email nettoyé).
- Son du pad mobile gauche/droite : scrollRailBy joue maintenant sfx("nav").
- Salle de cinéma : bouton mute supprimé ; nouveau "mode média immersif" (enterMediaMode/exitMediaMode dans AppContext) coupe toute ambiance appli/carte et bloque son redémarrage tant que la salle est ouverte, restaure à la fermeture. Seul le film a du son.
- Cosmic Bunny : CB_TARGETS complété (Accueil, Soutien, Bibliothèque, À propos, Membres, Nouveautés, Contact, Comment ça marche, Paramètres).
- **NOUVELLE FONCTION — Section « Intentions » par création** :
  - Backend Creation/CreationInput : intention_enabled, intention_title, intention_text, intention_images (base64), intention_file_id, intention_file_name. _lighten expose has_intention et strip images/text en liste (gardés en détail). GET /api/assets/{id}?dl=1 force le téléchargement (Content-Disposition).
  - Éditeur (EditorDialog) : section editor-intention-section (checkbox enabled, titre, texte, images making-of, dossier téléchargeable via uploadAsset kind=file lié après save).
  - Fiche (Detail) : detail-intention (titre + texte + grille images making-of cliquables lightbox + bouton téléchargement dossier via assetDownloadUrl).
- Tests : testing_agent iteration_20.json -> frontend 100% (badges + section intentions + download). Backend vérifié via API. Données test nettoyées.

## Salon communautaire (chat) — Phase 1 — 02/08/2026
- Nouvelle page /salon (Chat.js) : salon public réservé aux ABONNÉS (membership active) ou admin. Non-abonnés → écran chat-locked avec invitation "Devenir membre" (→ /soutien). Non connectés → invitation à se connecter.
- Backend (server.py, section "Community Chat") : collection chat_messages, chat_presence + champs users.chat_banned/chat_muted.
  - GET /chat/status (can_read/muted/banned/is_admin), GET /chat/messages?since= (polling), POST /chat/messages (texte/image_id/poll), DELETE /chat/messages/{id} (admin), POST /chat/messages/{id}/react (emoji toggle), POST /chat/messages/{id}/vote (sondage), POST /chat/upload (image → media_assets kind=chat), POST /chat/ping (présence + online count fenêtre 90s), POST /chat/moderate (admin: ban/unban/mute/unmute). Gating via require_chat_reader (=_membership_active ou admin).
- Frontend features : polling 2.5s (pause si onglet masqué), présence "en ligne", avatars (profil>compte), réactions emoji (❤️😂🔥👍😮🎉), envoi d'images, mentions @ surlignées, sondages (création + vote + barres %), son à la réception (sfx), modération admin (supprimer message, mute/ban auteur). PAS de palier affiché à côté des messages (choix user).
- Navigation : bouton "Salon" TOUJOURS visible — TopBar desktop (salon-btn), drawer TopBar (menu-salon), MobileMenu (page-menu-/salon). Route dans App.js.
- Tests : testing_agent iteration_21.json → frontend 100% (nav, gate non-abonné, vue admin, post, réactions, sondage+vote, image, suppression admin). Backend vérifié via curl (+ gate 403 non-abonné). Données de test nettoyées (salon vide).
- RESTE À FAIRE (Phase 2, convenu) : messages privés 1-à-1 entre membres ; compteur de messages non-lus persistant ; (option) badge d'animation sur l'entrée menu.
- EN ATTENTE user : problème de reconnexion (session) — à confirmer si preview ou production (stationexus.store). Preview OK (JWT 60j). Si prod → JWT_SECRET permanent via variables de déploiement (support Emergent).

## Salon — Phase 2 (messages privés + épingle + badge non-lus) — 02/08/2026
- Messages privés 1-à-1 : onglets Salon/Messages dans /salon. Backend chat_dms + endpoints GET /chat/dm (conversations), GET/POST /chat/dm/{partner_id} (thread + envoi, marque lu à l'ouverture). Démarrer une conv depuis le nom d'auteur dans le salon (chat-author-{id}) ou depuis la page Membres (member-dm-{id} → /salon?tab=dm&to=&name=).
- Message épinglé (admin) : POST /chat/messages/{id}/pin (un seul à la fois), GET /chat/pinned. Bannière chat-pinned en haut du salon, bouton chat-pin-{id}/chat-unpin.
- Badge non-lus : ChatContext (context/ChatContext.js) poll /chat/unread (public via lastseen localStorage + dm non lus) toutes 30s + au focus. Dot sur salon-btn (TopBar) + menu-salon + page-menu-salon-badge (MobileMenu) + dm-unread-{id} par conversation. markPublicSeen quand on regarde le salon.
- FIX UX (bug récurrent testing) : le dialogue "Créer mon profil" ne s'ouvre plus automatiquement si le compte a déjà un profil lié côté serveur. AuthContext hydrate désormais le profil local depuis le serveur à la connexion (listProfiles → account_id===user.id) et dispatch sx-hydrate-profile ; AppContext écoute et met à jour le state profile.
- Tests : testing_agent iteration_22.json → frontend 100% (onglets, pin, DM liste/thread/envoi, start-DM salon+membres, badge non-lus + clear). Backend vérifié via curl. Données de test nettoyées.
- Reste backlog : compteur non-lus temps réel (SSE/websocket) ; ProfilePrompt visiteur non-bloquant pour la TopBar (mineur).

## Salon — accès libre (compte) + Bunny masqué — 02/08/2026
- Cosmic Bunny masqué sur /salon (CosmicBunny.js: return null si pathname startsWith /salon). Toujours présent ailleurs (Home OK).
- Suppression du paywall abonnement sur le salon : _chat_can_read(user) = True pour tout compte connecté non banni (plus de _membership_active). Salon accessible gratuitement dès qu'on a un compte.
- Écran verrouillé Chat.js : seulement pour non-connecté (chat-login "Se connecter / Créer un compte", plus de bouton chat-subscribe/paywall) ou banni (message dédié).
- Tests : testing_agent iteration_23.json → frontend 100% (Bunny absent /salon + présent Home ; non-connecté = invitation login sans paywall ; non-abonné connecté = accès chat + post ; admin OK). Données test nettoyées.
- EN ATTENTE user : niveau de notifications de messages (Niveau 1 in-app toast+son+pastille sur toutes pages / Niveau 2 web push app fermée) + réglage on/off ou fin — question posée, pas encore de réponse.

## Notifications push Web (Niveau 2 — OS/système) + réglages Niveau 1 — 04/08/2026
- **Demande user** : recevoir des notifications OS/système pour les nouveaux messages du salon (public + privés), même app fermée ; réglage on/off dans Paramètres. User a explicitement priorisé le Niveau 2.
- **Backend (server.py)** : Web Push via `pywebpush` (2.3.0) + `py-vapid`. Clés VAPID générées et stockées dans backend/.env (VAPID_PRIVATE_KEY base64url raw, VAPID_PUBLIC_KEY = applicationServerKey base64url, VAPID_SUBJECT mailto). Collection `push_subscriptions` {id,user_id,endpoint,subscription,pref(all|dm|off)}. Endpoints : GET /api/push/public-key, POST /api/push/subscribe (auth), POST /api/push/pref (auth), POST /api/push/unsubscribe (auth), POST /api/push/test (auth). Envoi via BackgroundTasks : `_broadcast_chat_push` (message public → tous les abonnés pref='all' sauf l'auteur) et `_dm_push` (DM → destinataire si pref≠'off'). Nettoyage auto des abonnements 404/410. vapid_claims recréé à chaque envoi (aud/endpoint différents).
- **Frontend** : `lib/push.js` (pushSupported, enablePush, updatePref, disablePush, isSubscribed, getNotifPref/getSoundPref, urlBase64ToUint8Array). `lib/api.js` : pushPublicKey/Subscribe/Pref/Unsubscribe/Test. `public/service-worker.js` : listeners `push` (showNotification icon /icon-192.png) + `notificationclick` (focus + postMessage navigate, sinon openWindow) ; cache bumpé v4→v5. `App.js` : `PushClickNav` navigue in-app au clic notif. `Settings.js` : nouvelle Section "Notifications" (data-testid notifications-manager) — bloc "Notifications sur cet appareil" (Activer/Tester), 3 préférences (notif-pref-all/dm/off), toggle son (notif-sound-toggle). choosePref persiste TOUJOURS localStorage sx_chat_notif + /api/push/pref, puis tente enablePush best-effort.
- **Niveau 1 (déjà en place, ChatContext.js)** : toast + bip quand un message arrive hors /salon, piloté par localStorage sx_chat_notif (all|dm|off) + sx_chat_notif_sound — désormais contrôlable via la section Notifications des Paramètres.
- **Tests** : iteration_24.json → backend 11/11 pytest (push endpoints, VAPID, subscribe/pref/unsubscribe/test sans crash sur endpoint factice, channels create/list/filter/delete, régression chat+DM). Frontend : section Notifications rendue, toggles OK, salon fonctionnel. Point mineur (choosePref localStorage) corrigé après le rapport.
- **LIMITE connue** : l'abonnement push RÉEL (pushManager.subscribe → service de push navigateur) ne se teste pas en headless ; nécessite un vrai navigateur + permission accordée. Sur iOS, l'app doit être installée sur l'écran d'accueil (PWA) pour que les push fonctionnent.
- **En production** : nécessite un redéploiement pour que les clés VAPID (backend/.env → variables d'env de déploiement) et le nouveau service worker soient actifs.

## Pastille compteur sur l'icône de l'app (Badging API) — 04/08/2026
- `lib/push.js` : `setAppBadge(n)` → navigator.setAppBadge/clearAppBadge + postMessage 'set-badge' au service worker pour synchroniser le compteur persistant.
- `ChatContext.js` : applique la pastille = unread.total à chaque refresh (app ouverte) et sur markPublicSeen (= dm restants) ; remet à 0 si déconnecté.
- `service-worker.js` : compteur persistant en IndexedDB (store 'sx-badge'), `applyBadge()`, listener message 'set-badge', et à la réception d'un push → incrémente la pastille SEULEMENT si aucune fenêtre visible (app fermée/arrière-plan). Cache bumpé v5→v6.
- LIMITE : la Badging API nécessite une PWA INSTALLÉE (écran d'accueil) + navigateur compatible (Chrome/Edge desktop+Android, Safari macOS/iOS installée). Non testable en headless. Compile OK, aucune erreur console (helpers protégés par feature-detection).

## TopBar unifiée (menu tiroir sur PC comme sur mobile) — 04/08/2026
- Demande user : sur PC la barre débordait (trop de boutons). Unification avec le système mobile.
- TopBar.js : suppression du bloc `hidden md:flex` (longue rangée de boutons desktop). Désormais, à toutes tailles : logo à gauche ; à droite Profil (profile-btn, avatar+nom masqué <sm), Son (mute-toggle), Plein écran (fullscreen-toggle), Aa (text-size-btn), et bouton Menu (mobile-menu-btn). Le tiroir (data-testid mobile-menu) n'est plus `md:hidden` → visible sur PC aussi ; contient en-tête profil (menu-profile) + toutes les pages (novelties/salon/members/contact/support/about/library/settings/tutorial) + login/logout + admin (menu-create, menu-revenue) + footer avec Son/Plein écran/Aa dupliqués. Badge du bouton Menu = annonces non vues + salon non lus.
- Vérif : compile OK, aucun import inutilisé. NON vérifié visuellement en auto : la preview est derrière un challenge anti-bot Cloudflare qui bloque le navigateur headless (reste sur "Chargement…") ; testing_agent a timeout (infra). À valider par l'utilisateur.

## Saisie auto-agrandissante + édition de chapitre dans le lecteur — 04/08/2026
- **Zones de texte auto-agrandissantes** : nouveau composant `components/AutoTextarea.js` (grandit en hauteur selon le contenu, resize sur value change → se réinitialise après envoi, maxHeight paramétrable). Utilisé dans le salon (`Chat.js` : chat-input maxHeight 180 + dm-input) et les commentaires (`CommentsSection.js` : comment-text, input→textarea, Entrée=publier / Maj+Entrée=retour ligne).
- **Édition de chapitre directement dans le lecteur** (`ChapterReader.js`, admin uniquement) : bouton crayon `reader-edit` dans l'en-tête → panneau plein-écran `reader-editor` avec `RichTextEditor` (upload images/musique via creationId). Sauvegarde : `getCreationFull(item.id)` (récupère la version complète AVEC images) → modifie le contenu du chapitre courant (content + rich=true) → `updateCreation` → met à jour l'état local `chapters` + invalide les caches React Query. `chapters` passé en state. Boutons reader-edit-save / reader-edit-cancel.
- Vérifié (round-trip API interne sur œuvre jetable ZZ_TEST_EDIT) : contenu chapitre modifié en HTML riche ET affiche/poster préservés. Compile OK. NON vérifié visuellement en auto (preview derrière Cloudflare anti-bot).
- ⚠️ Prudence : ne jamais tester l'édition sur les vraies œuvres (incident passé). Utiliser une œuvre jetable.

## Page Planning / Roadmap des sorties — 04/08/2026
- Demande user : timeline des créations à venir, ancrée sur aujourd'hui → futur ; ajout via bouton "+" ; entrées classées automatiquement dans l'ordre chronologique ; clic sur affiche → fiche (si liée) ; ajout à l'agenda (.ics + Google) ; page entièrement modifiable (admin) ; Cosmic Bunny explique la page.
- Choix validés : entrée = création liée OU sortie perso (titre+affiche+date) ; agenda = .ics ET Google ; timeline horizontale défilante (repère "Aujourd'hui" à gauche) sur PC, verticale sur mobile ; date précise OU période approximative (avec date de tri) ; intro (titre+texte) modifiable.
- Backend (server.py) : SiteSettings + `planning_title`/`planning_intro`. Collection `roadmap`. Endpoints (SANS auth, comme les créations/PIN) : GET/POST/PUT/DELETE `/api/roadmap`. Tri Python par `release_date` (exact) ou `approx_date` (approx), fallback fin de liste. Modèle RoadmapInput {creation_id, title, subtitle, poster(dataURI), date_type(exact|approx), release_date, approx_label, approx_date}.
- Frontend : `pages/Planning.js` (timeline responsive + rails, cartes, pastille compte à rebours, menu Agenda .ics/Google via Blob + URL calendar.google.com, éditeur intro admin) + `RoadmapEditor` (lier création via <select> → affiche auto ou upload affiche perso data URI ; type date exact/approx). Route `/planning` (App.js). Lien tiroir `menu-planning` (TopBar, icône calendrier). CosmicBunny : pathToKey '/planning'->'planning' + CB_DEFAULT_TIPS.planning (3 conseils). api.js : listRoadmap/createRoadmap/updateRoadmap/deleteRoadmap. Poster affiché : entry.poster sinon posterUrl(creation liée).
- Vérifié : backend via curl (settings fields OK ; CRUD OK ; tri chronologique confirmé : entrée avril < septembre < novembre ; edit/delete OK ; cleanup OK). Frontend compile sans erreur ni import inutilisé.
- ⚠️ NON vérifié en E2E automatique : la preview est derrière un challenge anti-bot Cloudflare qui bloque le navigateur du screenshot_tool ET du testing_agent (timeout systématique). À valider par l'utilisateur sur la preview.

## Planning v2 — rappel J-1 + refonte verticale — 04/08/2026
- **Rappel J-1 (push)** : backend `_roadmap_reminder_loop()` lancé au startup (asyncio.create_task) ; boucle horaire qui envoie une notification push la VEILLE des sorties datées (date_type=exact, release_date == demain), aux abonnés push pref='all', puis marque `reminder_sent=True`. update_roadmap réarme le rappel (reminder_sent=False) si l'entrée change. Vérifié : log "J-1 reminder sent" émis (0 abonné actuellement). Entrées de demain réarmées après test.
- **Refonte page Planning** (Planning.js) : timeline désormais VERTICALE sur PC comme mobile (repère "Aujourd'hui" en haut, sorties en dessous). Carte horizontale = petite affiche à gauche (w-24/28) + infos à droite (pastille compte à rebours + date, titre, sous-titre, description). Affiche bien plus petite sur mobile.
- **Agenda** : plus de dropdown coupé — 2 boutons visibles côte à côte ".ics" (plein, brand) et "Google" (bordé). Le .ics inclut la description.
- **Description** : nouveau champ `description` (backend RoadmapInput + éditeur textarea + affichage carte + inclus dans .ics/Google).
- **Contrôles d'en-tête** : ajout de `<TopBar />` (logo + Aa + son + plein écran + Menu) en haut de la page Planning, comme demandé.
- Vérifié : backend (description round-trip, reminder loop, tri). Frontend compile OK. ⚠️ E2E auto impossible (Cloudflare anti-bot bloque screenshot_tool + testing_agent). À valider par l'utilisateur.

## Compte à rebours live + menu unifié partout — 04/08/2026
- **Compte à rebours live (Planning)** : bloc "Prochaine sortie · en direct" (data-testid planning-next) tout en haut, qui tick chaque seconde et affiche « J-{jours} · HHh MMm SSs » (state nowTs + setInterval 1s). Prend la 1re sortie datée >= aujourd'hui (entries triées). Poster + titre + date. Indicateur pulse animé.
- **Menu unifié sur TOUTES les pages** :
  - `MobileMenu` refondu : n'est plus md:hidden (visible PC + mobile) ; ajout du lien **Planning des sorties** ; intègre `QuickControls` (son/plein écran/Aa) à gauche du bouton Menu ; drawer = tous les liens (Accueil, Salon, Nouveautés, Planning, Soutien, Bibliothèque, À propos, Membres, Contact, Comment ça marche, Paramètres) + Revenus (admin) + login/logout. Prop `compact` (bouton Menu seul, sans QuickControls) pour le salon afin de ne pas surcharger son en-tête.
  - `QuickControls` allégé : son + plein écran + Aa (bouton Paramètres retiré, redondant avec le tiroir).
  - Ajout de `MobileMenu` aux pages qui n'en avaient pas : Novelties, Detail (remplace l'ancien TextSizeButton + bouton Paramètres autonomes). Planning bascule de TopBar → header standard (Retour + MobileMenu). Chat utilise `MobileMenu compact`.
  - Home garde son TopBar (drawer contient déjà Planning).
- Vérifié : compile OK (aucun import inutilisé). ⚠️ E2E auto bloqué par Cloudflare anti-bot (screenshot + testing_agent timeout) — à valider par l'utilisateur sur preview.

## Célébration d'abonnement (Bunny + feux d'artifice) — 04/08/2026
- Demande user : à chaque nouvel abonnement, un message de Cosmic Bunny au milieu de l'écran avec feux d'artifice, remerciement chaleureux invitant à découvrir les créations + écrire au créateur dans le salon. Message modifiable dans les Paramètres.
- Backend : SiteSettings + `subscribe_celebration_title` / `subscribe_celebration_body` (défauts FR chaleureux). Persistance PUT /settings sans régression (vérifié).
- Frontend : `components/Celebration.js` — overlay plein écran z-[120], feux d'artifice canvas (requestAnimationFrame, bursts de particules colorées), Cosmic Bunny (settings.cosmic_bunny_image || /cosmic-bunny/excited.png) qui rebondit, titre + message (whitespace-pre-line), boutons « Découvrir les créations » (/) et « Écrire au créateur dans le Salon » (/salon) + fermer. Props overrideTitle/overrideBody pour l'aperçu admin. Animations CSS sxCelebratePop/sxCelebrateBounce (index.css).
- Déclencheur : `PaymentResult.js` — quand payment_status="paid" ET kind="membership", affiche <Celebration>. 
- Édition : `Settings.js` → section admin « Message de bienvenue abonné » (CelebrationManager) : champs titre + message + bouton Enregistrer + bouton Aperçu 🎆 (prévisualise avec le brouillon).
- Vérifié : backend (champs présents, round-trip, non-régression planning/about), frontend compile OK. ⚠️ Visuel non testé en auto (Cloudflare anti-bot). L'admin peut prévisualiser via le bouton Aperçu.

## Fiches enrichies + connexion au lancement + compte à rebours accueil — 04/08/2026
- **Connexion obligatoire pour lancer** : Detail.launch() et openChapter() → si !user, ouvre `LaunchGate` (components/LaunchGate.js) : Bunny + message éditable (settings.launch_gate_title/body) + boutons « Créer un compte » / « J'ai déjà un compte » (openAuth). S'applique à TOUTES les créations. La création de compte inscrit déjà à la newsletter (_subscribe_email au register/google).
- **Bloc soutien sur chaque fiche** (components/SupportersWall.js → FicheSupport) avant les commentaires : si membershipActive → remerciement, sinon CTA « Soutenir la station » → /soutien. + **Mur des soutiens** réutilisable (SupportersWall, filtre profiles.tier_name, mêmes styles que page Soutien).
- **Droits d'auteur** : mention en bas de chaque fiche (data-testid fiche-copyright), texte settings.copyright_notice (défaut fourni).
- **Compte à rebours accueil** (components/HomeCountdown.js) : bannière sous TopBar, prochaine sortie datée, tick 1s, clic → /planning. Masquable via settings.home_countdown_enabled.
- **Réglages (Settings.js, admin)** : nouvelle section « Accueil & lancement » (HomeLaunchManager : toggle home_countdown_enabled + éditeur launch_gate_title/body). Section « Message de bienvenue abonné » (CelebrationManager).
- Backend SiteSettings : + launch_gate_title, launch_gate_body, home_countdown_enabled(bool), copyright_notice, subscribe_celebration_title/body. Round-trips vérifiés (persistance + non-régression planning/about/celebration).
- Newsletter : bouton d'envoi laissé de côté (déjà géré par l'utilisateur). Rappel : SENDER_EMAIL=onboarding@resend.dev → Resend ne livre qu'à l'adresse du compte tant qu'un domaine n'est pas vérifié.
- Vérifié : backend curl OK ; frontend compile OK. ⚠️ E2E auto bloqué (Cloudflare anti-bot).

## Message de soutien éditable + Visite guidée Bunny — 04/08/2026
- **Message de soutien éditable** : SiteSettings + fiche_support_title/body (invite non-membre) + fiche_support_thanks_title/body (remerciement membre). FicheSupport (SupportersWall.js) lit ces textes via getSettings. Éditeur dans Settings > section « Accueil & lancement » (HomeLaunchManager) avec sauvegarde. Round-trip vérifié.
- **Visite guidée Cosmic Bunny** (components/GuidedTour.js, monté dans App.js) :
  - Prompt de bienvenue « Hey, première fois ? » à la 1re visite (localStorage sx_tour_done, après l'intro via sessionStorage sx_entered / event sx-entered) — pour TOUT LE MONDE une fois, même avec un compte. Boutons « C'est parti » / « Passer ».
  - 10 étapes page par page : Accueil → Planning → Salon → Soutien → Paramètres, avec DÉMOS EN DIRECT : setTheme (change le thème), setAccent (#ff5d8f), selectAmbience (musique), setReaderFont/Size (lecture), puis retour Accueil. Bulle Bunny fixe en bas avec progression + Précédent/Suivant/Terminer/Fermer.
  - Relançable : Settings > section « Visite guidée » (pour tous) → bouton restart-tour (efface sx_tour_done + dispatch event sx-start-tour + nav /).
- Vérifié : backend curl (champs + round-trip sans régression), frontend compile OK. ⚠️ E2E auto bloqué (Cloudflare anti-bot) — à valider par l'utilisateur.

## Visite guidée v2 — pages en plus, textes éditables, restauration — 04/08/2026
- lib/tourSteps.js : TOUR_STEPS (14 étapes canoniques key/label/title/text) partagé GuidedTour + Settings.
- Nouvelles étapes : creation (nav vers 1re création /oeuvre/{id} pour montrer film/lecture/commentaire/soutien), members (/membres), contact (/contact), about (/a-propos), en plus de home/planning/salon/soutien/settings + démos theme/accent/music/reading + end.
- Textes éditables : SiteSettings.tour_texts (Dict). GuidedTour lit texts[key]?.title/text sinon défaut. Éditeur Settings > « Visite guidée » > TourTextsManager (admin) : title+text par étape, Enregistrer/Réinitialiser. Round-trip vérifié.
- Restauration en fin de visite : snapshot {theme, accent, ambienceId, readerFont, readerSize} au start() ; restore() appelé dans finish() (Terminer/Fermer/Passer) → tout revient comme avant la démo.
- Vérifié : backend curl (tour_texts dict persistant, non-régression) ; frontend compile OK. ⚠️ E2E auto bloqué (Cloudflare).

## Fix double onboarding (garder seulement le guide) — 04/08/2026
- Problème : à la 1re visite, la bulle Cosmic Bunny ET le guide (GuidedTour) s'affichaient en même temps → écran surchargé/illisible.
- Fix : CosmicBunny se masque quand la visite est active. GuidedTour émet un event `sx-tour-active` (true en welcome/running, false à la fin) ; CosmicBunny écoute et fait return null. Init CosmicBunny.tourActive = !localStorage.sx_tour_done (masqué dès le départ à la 1re visite), garde `first` ref dans GuidedTour pour ne pas ré-afficher Bunny au montage. → Seul le guide s'affiche à la première venue.
- ⚠️ Signalé sur production (stationexus.store) : nécessite un redéploiement. Le point « mise en page ultra serrée sur DuckDuckGo/certains PC » venait surtout du chevauchement des 2 bulles (corrigé) ; si ça persiste après redeploy, demander une capture de la vue concernée.

## Ajustements onboarding + affiche mobile — 04/08/2026
- Affiche « compact » (la plus petite) réduite sur mobile : 8.5rem→6.5rem (base), 10rem→9rem (sm) → plus petit et aéré sur téléphone.
- ProfilePrompt (popup « Bienvenue sur la Stationexus ! » + créer un compte/profil) masqué tant que la visite guidée n'est pas terminée ET pendant la visite (state tourActive init = !sx_tour_done + écoute event sx-tour-active). → À la 1re visite, SEUL le guide s'affiche ; le prompt profil peut apparaître après la fin de la visite.
- ⚠️ Signalé sur production → nécessite un redéploiement.

## Nettoyage accueil + compaction mobile ~85% — 14/09/2026
- Retiré de Home.js : `ProfilePrompt` (message de bienvenue) et `AnnouncementBanner` (bannière Nouveautés) — imports + usages. Il ne reste sur l'accueil que le Guide (Cosmic Bunny à la 1re visite) et le compte à rebours (HomeCountdown).
- Compaction mobile globale (index.css) : media query `max-width: 767px` réduit la police racine à 85% (et proportionnellement chaque niveau data-textscale : petit 74.4%, normal 85%, grand 95.6%, xl 106.25%, max 119%). Tout le rem-based (textes, boutons, marges, posters) rapetisse d'~15% → interface nettement plus compacte sur téléphone, PC inchangé.
- D-pad gauche/droite accueil mobile : confirmé OK par l'utilisateur (navLeft/navRight liés lignes ~335/337 de Home.js).
- Vérifié : capture mobile 390px → bannière/prompt absents, seul le Guide s'affiche, layout compacté. ⚠️ Changements en preview uniquement → nécessite un redéploiement pour apparaître sur stationexus.store.

## Réglage global « taille des affiches par défaut » PC/Mobile — 14/09/2026
- Backend SiteSettings : + `default_poster_desktop` et `default_poster_mobile` (valeurs compact/normal/grand, défaut "compact"/"compact"). Round-trip PUT/GET vérifié par curl.
- AppContext : effet getSettings applique le défaut serveur par appareil UNIQUEMENT si le visiteur n'a jamais choisi (pas de clé localStorage sx_postersize_{mobile|desktop} ni legacy sx_postersize). Chaque visiteur garde ensuite son réglage local. (Réduction mobile 85% conservée, indépendante.)
- Settings.js (admin) : bloc « Taille des affiches par défaut (admin) » dans « Personnalisation de l'interface », sélecteurs Compact/Normal/Grand pour Ordinateur et Mobile → updateSettings. data-testid poster-default-admin, poster-default-{desktop|mobile}-{compact|normal|grand}.
- ⚠️ UI admin non vérifiée en auto (challenge Cloudflare du preview crashe le navigateur headless sur /parametres). Backend + compilation OK. À valider visuellement par l'utilisateur, puis redéployer pour la prod.

## Compte = Profil : tous les comptes visibles dans Membres — 24/09/2026
- Problème : comptes (db.users) et profils Membres (db.profiles) étaient dissociés ; un compte n'apparaissait dans Membres que si la personne remplissait son profil. Résultat : beaucoup de comptes absents de Membres (seulement dans la newsletter).
- Backend (server.py) : nouveau helper `_ensure_profile_for_user(user)` qui garantit un profil canonique keyé par `account_id` (id = account_id), créé à l'inscription, à la connexion Google ET au login (backfill auto). Email volontairement NON copié dans le profil public (pas d'exposition d'emails).
- `upsert_profile` déduplique par `account_id` : si un profil canonique existe déjà sous un autre id (ancien profil anonyme local qui se lie), on fusionne dans le canonique et on supprime le doublon.
- Backfill one-off : `backend/backfill_profiles.py` (idempotent) exécuté → 9 comptes = 9 profils, 0 doublon.
- Frontend : `logout` efface le profil local (sx_profile, sx_visitor_id) + event `sx-clear-profile` écouté par AppContext → déconnexion déconnecte aussi le profil.
- Vérifié par curl : register/login créent le profil, il apparaît dans GET /api/profiles ; dedup OK (1 profil/compte, stray supprimé) ; email non exposé (''). ⚠️ UI Membres non capturée en auto (challenge Cloudflare crashe le navigateur headless sur le preview) — à confirmer visuellement + redéployer pour la prod.

## Refonte accueil (3 layouts test) + correctif chargement — 11/10/2026
- BUG CHARGEMENT corrigé : react-query (index.js) retry x4 + backoff + refetchOnReconnect ; axios timeout 20s (api.js) ; Home.js affiche désormais un vrai état Chargement (spinner) + état Erreur « Connexion interrompue · Réessayer » (ré-essai manuel + auto) au lieu d'un écran vide. _lighten() strip aussi episodes en liste (payload plus léger).
- 3 LAYOUTS d'accueil commutables (la refonte devient l'accueil par défaut = "steam") :
  * SteamLayout : héro + rangées horizontales par catégorie + bannière Soutien dédiée.
  * OverwatchLayout : spine catégories à gauche (+ item Soutien) + héro + grille 4 col à droite.
  * ValorantLayout : stage plein écran d'une création + barre catégories + strip de vignettes en bas.
  * Switcher : components/home/LayoutSwitcher.js (STEAM/OVERWATCH/VALORANT), état sx_homelayout (AppContext homeLayout/setHomeLayout).
- NAVIGATION : clavier (flèches + Entrée) + manette via lib/useGamepad.js (D-pad/stick/A/B/LB-RB) dans chaque layout. Vérifié : → change le stage Valorant (UNITED SANCTUM FORCE -> BLUE FLOWER). Mobile = tap + scroll naturel (D-pad virtuel on-screen non repris pour l'instant).
- HÉRO "création du moment" : choisi par l'admin via bouton étoile ⭐ (hero-set-featured) directement sur l'accueil -> SiteSettings.featured_creation_id (backend ajouté). Fallback = 1re création.
- Backend prêt pour épisodes Canal+ : Episode.image + Creation.unit_label ajoutés (PAS encore d'UI ni d'affichage Detail — à faire après le choix du layout).
- Composants : components/home/{LayoutSwitcher,HeroSpotlight,SupportBanner,SteamLayout,OverwatchLayout,ValorantLayout}.js ; lib/useGamepad.js. Home.js réécrit (orchestrateur).
- data-testid : layout-switcher-toggle, layout-option-{steam|overwatch|valorant}, home-{steam|overwatch|valorant}, hero-spotlight-container, hero-launch-button, hero-set-featured, category-row-{key}, spine-{key}, valorant-title, home-loading, home-error, home-retry.
- ⚠️ Vérifs auto partielles (challenge Cloudflare du preview fait planter l'automatisation par intermittence) ; captures manuelles OK sur les 3 layouts. Redéployer pour la prod.
### RESTE À FAIRE (prochaine étape)
- Épisodes/chapitres façon Canal+ : affichage en cartes défilantes avec image + description (Detail.js) + libellé de section modifiable (unit_label) ; UI éditeur pour image d'épisode + unit_label.
- Optionnel : D-pad virtuel on-screen pour mobile ; polish du layout retenu par l'utilisateur.

## Accueil Big Picture unique + personnalisation + épisodes Canal+ — 11/10/2026
- DÉCISION : on garde UNIQUEMENT la mise en page Steam Big Picture. Supprimé les layouts Overwatch/Valorant + le switcher nommé (fichiers SteamLayout/OverwatchLayout/ValorantLayout/LayoutSwitcher/HeroSpotlight/SupportBanner supprimés). Plus de noms affichés.
- NOUVEAU MODÈLE accueil (components/home/BigPicture.js) : fond plein écran de l'élément focalisé ; shelf principal = grande tuile « À la une » (16/9, l'élément en avant est plus grand) + rangée de jaquettes ; titre + Lancer dessous ; en bas des rangées = PAGES choisies (Soutenir/Membres/Nouveautés…). PLUS d'onglets catégories ; juste un bouton « Ordre » (cycle de tri) + bouton « Personnaliser ». Nav clavier+manette (useGamepad) : ←/→ dans le shelf, ↓/↑ vers les rangées pages, Entrée ouvre. Vérifié (BORN X BURN -> BLUE FLOWER).
- PERSONNALISATION (components/home/HomeCustomizer.js, panneau latéral) : taille grande tuile (S/M/L), taille jaquettes (S/M/L), espacement (compact/normal/aéré), afficher/masquer titres. Réglages par VISITEUR en localStorage (sx_home_*) ; ADMIN peut « Définir par défaut pour tous » -> SiteSettings (home_hero_size/home_card_size/home_density/home_show_titles/home_shelves) + choisir les pages des rangées. Les catégories de créations existent toujours (éditeur/labels) mais ne pilotent plus l'accueil.
- Pages dispo pour les rangées : lib/homeShelves.js (soutien, membres, nouveautes, planning, bibliotheque, salon, a-propos, contact, tutoriel). Défaut : soutien/membres/nouveautes.
- Backend SiteSettings : + home_hero_size, home_card_size, home_density, home_show_titles, home_shelves. Vérifié via curl.
- ÉPISODES CANAL+ (Detail.js) : affichage en cartes défilantes horizontales (vignette 16/9 + numéro + titre + description, clic -> lien). Libellé de section personnalisable (item.unit_label, fallback « Épisodes »/« Chapitres »). Éditeur (EditorDialog) : par épisode = image (upload) + description + lien ; champ « Libellé de la section » pour chapitres/épisodes. Backend Episode.image + Creation.unit_label déjà ajoutés.
  ⚠️ Aucune création de type « épisodes » n'existe encore en base -> l'affichage Canal+ des épisodes n'a PAS pu être vérifié visuellement (code compile, calqué sur le rendu images des chapitres qui marche). L'éditeur est prêt pour en créer.
- ⚠️ Tests auto gênés par le challenge Cloudflare du preview (plante le navigateur par intermittence) ; captures manuelles OK : accueil Big Picture, nav clavier, panneau Personnaliser. Redéployer pour la prod.

## Retour accueil classique + Personnaliser Decky + Canal+ chapitres — 11/10/2026
- ACCUEIL : abandon de la mise en page Big Picture (l'utilisateur : « ne fonctionne pas du tout »). Home.js restauré depuis le commit 9764c81 (accueil cinématique classique : onglets catégories + recherche/tri + rail d'affiches + D-pad + modes Cartes/Grille/Liste). Fichiers Big Picture supprimés (BigPicture.js, lib/homeShelves.js, lib/useGamepad.js).
- NOUVEAU bouton « Personnaliser » (style Decky Loader) sur l'accueil -> panneau latéral HomeCustomizer : Affichage (Cartes/Grille/Liste via layout), Taille des affiches (Compact/Normal/Grand via posterSize, par appareil), Afficher les descriptions (cardTagline). Admin : bouton « Définir la taille des affiches par défaut pour tous » (updateSettings default_poster_{desktop|mobile}). Vérifié visuellement (accueil + panneau OK).
- ÉPISODES & CHAPITRES façon Canal+ :
  * Detail.js : chapitres affichés en cartes défilantes (vignette 16/9 + n° + titre + description + cadenas/progression/musique, clic -> lecteur). Épisodes déjà en cartes Canal+. Libellé de section personnalisable (item.unit_label).
  * Backend : Chapter.description ajouté (+ Episode.image/unit_label déjà là).
  * EditorDialog : par chapitre = titre + image + description + bouton « Rédiger/Modifier le chapitre » qui ouvre l'éditeur riche (repliable) ; suppression du réglage « affichage des chapitres » devenu inutile. Par épisode = image + description + lien.
- ÉDITION EN LECTURE : déjà existante (bouton crayon « Modifier ce chapitre » dans ChapterReader -> updateCreation). Conservée.
- ⚠️ Vérifs : accueil + Personnaliser OK en capture. L'affichage Canal+ chapitres/épisodes et le bouton « Rédiger » n'ont PAS pu être capturés (challenge Cloudflare du preview plante la nav + chapitres gated pour non-connecté) ; code compile, calqué sur le motif épisodes validé. À confirmer connecté + redéployer.

## Épisodes/chapitres façon Movix (menu déroulant + grande affiche) + animations fiche — 11/10/2026
- Nouveau composant components/MovixSelector.js : menu DÉROULANT (dropdown custom) pour choisir l'épisode/chapitre + GRANDE affiche 16/9 animée de l'élément sélectionné (titre, description, bouton play, cadenas/musique), flèches prev/next + pastilles de pagination. Remplace les anciens rails horizontaux (jugés peu navigables).
- Detail.js : chapitres ET épisodes utilisent MovixSelector (chapitres -> openChapter avec lock/progress ; épisodes -> ouvre le lien). Libellé via unit_label.
- Fiche création « meilleures animations » : affiche (poster) agrandie (w-64→lg:w-[26rem]) + ombre portée + zoom au survol ; entrée fade-up échelonnée (poster + contenu, delay .12s) ; carte Movix en movix-pop/fade. CSS : fadeDown, movixPop, movix-pop, movix-text dans index.css.
- Testids : detail-episodes / detail-chapters (conteneur MovixSelector), {testid}-dropdown, {testid}-menu, {testid}-opt-{i}, {testid}-feature, {testid}-prev/next.
- Vérifié : compile OK ; création test « épisodes » créée puis SUPPRIMÉE (nettoyée). ⚠️ Rendu visuel Movix NON capturé (challenge Cloudflare du preview crashe l'automatisation de façon persistante ce jour). À confirmer sur ton navigateur (non bloqué) + redéployer.

## Reprise de lecture + "À la une" accueil + mode d'affichage par fiche — 11/10/2026
- REPRISE DE LECTURE : bandeau "Reprendre/Commencer/Continuer" en haut de la fiche (Detail.js, data-testid detail-continue) montrant le prochain chapitre/épisode à regarder (vignette + n° + titre + play). Chapitres : basé sur sx_progress_<id>. Épisodes : prochain après le dernier ouvert (sx_eplast_<id>, posé par openEpisode).
- À LA UNE (accueil classique) : création épinglée affichée EN PREMIER + badge "★ À la une" (PosterCard prop featured). Admin : bouton étoile dans la barre d'actions (data-testid home-set-featured) pour épingler/retirer -> SiteSettings.featured_creation_id. Vérifié : badge visible sur l'accueil.
- AFFICHAGE PAR FICHE (épisodes/chapitres) : nouveau champ Creation.unit_display (movix | list). Éditeur : select "Affichage de la section" (Menu déroulant + grande affiche / Liste complète) à côté du libellé. MovixSelector gère les 2 modes + affiche le NOMBRE (badge count). mode="list" = toutes les cartes empilées les unes derrière les autres (pas de slide).
- Compile OK. ⚠️ Fiche détail (reprise/compteur/mode liste) non capturée en auto (Cloudflare crashe l'automatisation) ; à confirmer sur navigateur + redéployer.

## Fix bug « Affichage Liste » épisodes/chapitres non sauvegardé — 11/06/2026
- CAUSE : CreationInput (modèle backend utilisé par create/update) ne déclarait PAS unit_display ni unit_label -> Pydantic les supprimait du payload à l'enregistrement, donc le choix "Liste complète" n'avait aucun effet.
- FIX : ajout de `unit_display: str = "movix"` et `unit_label: Optional[str] = ""` à CreationInput (server.py). La page Detail lit déjà item.unit_display et MovixSelector gère mode="list".
- Vérifié curl : création test avec unit_display=list + unit_label=Saisons -> relecture renvoie bien list/Saisons (puis supprimée). Backend auto-reload OK.

## Affiche détail plus grande + animation + commentaires par épisode — 11/06/2026
- AFFICHE PRINCIPALE (Detail.js) : agrandie w-72/sm:w-96/md:[28rem]/lg:[34rem] (avant w-64…[26rem]) + ombre renforcée. Nouvelle animation d'entrée `posterIn` (index.css) : .5s cubic-bezier, translateY 46px->0, scale .8->1.03->1, rotate léger, blur 10px->0 (rapide + dynamique). Remplace fade-up sur le poster uniquement.
- COMMENTAIRES PAR ÉPISODE : backend Comment/CommentInput + episode_index (int, -1=général) + episode_label (str). CommentsSection reçoit prop episodes depuis Detail. Si épisodes : sélecteur "À propos de" (Général ou épisode N), badge épisode sur chaque commentaire, filtres pilule (Tout/Général/n°). Testids: comment-episode-select, comment-filter(-all/-general/-ep-{i}). Vérifié curl : index/label persistés OK.

## Fix barre d'en-tête fiche mobile (débordement Aa/Menu) — 11/06/2026
- CAUSE : le réglage Aa (data-textscale) augmente la font-size racine -> tous les rem (paddings/libellés) grossissent ; la barre d'en-tête de la fiche était en flex justify-between SANS wrap, donc à grand/max le contenu débordait horizontalement et le bouton Menu sortait de l'écran (inclaquable).
- FIX Detail.js : header en `flex flex-wrap justify-between gap-2` ; groupes gauche/droite en flex-wrap. Bouton Retour = icône flèche seule (IoArrowBack), Accueil = icône maison seule (IoHome), p-2.5 border flex-shrink-0 (plus de libellés texte).
- FIX MobileMenu.js : conteneur racine `flex flex-wrap justify-end`, bouton Menu `flex-shrink-0`. QuickControls.js : conteneur en flex-wrap.
- Résultat : à Aa max sur mobile, les boutons passent à la ligne et restent dans le cadre + cliquables. ⚠️ Capture auto a planté (instabilité preview) ; à confirmer sur navigateur.

## Commentaires par chapitre (lecteur) comme les épisodes — 11/06/2026
- CommentsSection généralisé : props `units` (array) + `term` ("Chapitre"/"Épisode"). Detail.js passe item.chapters + term="Chapitre" si launch_type==="chapters", sinon item.episodes + "Épisode".
- Sélecteur "À propos de", badges et filtres fonctionnent identiquement pour chapitres et épisodes. Réutilise episode_index/episode_label backend (aucun changement backend). Compile OK.

## Fiche détail PC : pleine largeur horizontale — 11/06/2026
- PROBLÈME : toutes les sections (chapitres/épisodes, intentions, galerie, commentaires, recos) étaient dans la colonne droite étroite (md:flex-1) à côté de la grosse affiche, et tout bridé à max-w-6xl -> sections petites/verticales + espace vide sur PC.
- FIX Detail.js : le héros (affiche + badges/titre/synopsis/boutons/paywall/reprise) reste en 2 colonnes ; TOUT le reste (chapitres, épisodes, bande-annonce, galerie, embeds, intentions, support, commentaires, recommandations, copyright) déplacé dans un nouveau conteneur PLEINE LARGEUR sous le héros. Conteneurs passés max-w-6xl -> max-w-7xl.
- Intentions : grille lg:grid-cols-2 (texte | images) au lieu d'une pile étroite. Galerie lg:grid-cols-6. Bande-annonce max-w-2xl -> max-w-4xl.
- Vérifié capture PC 1920 : titre OK, commentaires largeur ~1332px (pleine largeur), boutons Retour/Accueil en icônes. Compile OK.

## Remplacement du frontend par le code GitHub (look cosmic futuriste) — 23/10/2026
- Source : dépôt GitHub public https://github.com/Ginta998/Station-Nexus.git (branche main), cloné dans le pod.
- Remplacé : /app/frontend/src, public, plugins, package.json, craco/tailwind/postcss/components/jsconfig configs. PRÉSERVÉ : /app/frontend/.env (REACT_APP_BACKEND_URL) et node_modules. Backend NON touché (demande utilisateur).
- Dépendances identiques (aucun yarn install requis). craco & tailwind configs identiques.
- Nouveau design : thème cosmic/sombre (bleu/noir/blanc/rouge "TENGOKU/PARADIS"), CosmicBackground, CyberOverlay, StationMenu (nouvelle navigation), nouvelles pages (Planning, Novelties, SupportPage, Tutorial), constants/testIds + hooks/.
- Vérifié : compile OK (avert. webpack déprécation bénin), home rend le nouveau look avec données réelles ; tous les endpoints utilisés (categories, settings, announcements, roadmap, ambiences, creations, membership/plan) renvoient 200.
- Backup avant remplacement : /app/memory/backups/frontend_backup_20261023_193016.tar.gz
- Note : la clé secret GITHUB_TOKEN saisie n'était pas un vrai PAT (texte) ; dépôt finalement rendu public pour le clone. Clé inoffensive, peut être supprimée.

## 2026-10-23 — Synchronisation des thèmes après la migration GitHub
- Frontend vérifié identique au dépôt GitHub (diff -rq vide) ; backend server.py identique.
- Bug dans le dépôt : lib/themes.js listait les anciens thèmes (tengoku…) alors que index.css ne définit que 17 thèmes cosmiques. THEMES réécrit (abysse, neptune, glacier, singularite, blackhole, supernova, helios, akira, aurum, megapole, biome, monolithe, neant, bunny, albatre, olympe, yorha).
- Défaut default_theme = abysse (backend + Settings) ; valeur en base migrée de tengoku vers abysse ; un ancien thème mémorisé dans le navigateur bascule automatiquement sur un thème valide.
- L intro tengoku (animation de démarrage) est conservée, ce n est pas un thème.

## 2026-10-23 — Accès propriétaire preview
- Compte louzalabrichel@gmail.com créé dans la base preview avec mot de passe et droits admin (aucun changement de code).
- Admin activé immédiatement après connexion (événement sx-admin-on), plus besoin de recharger.
- Phrases thèmes fournies par l utilisateur : Abysse, Akira, Neptune. 14 autres en attente de ses textes.
