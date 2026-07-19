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
