const book = {
  id: "disco-elysium", title: "Disco Elysium", sub: "Revachol et le Pâle", room: "lore", type: "recit", format: "vhs", cote: "LO-020", color: 160, emblem: "灰",
  about: "Un flic se réveille sans mémoire dans une chambre d'hôtel dévastée, avec une cravate accrochée au ventilateur. Dehors, un pendu, une grève, une ville qui a perdu sa révolution, et au bord du monde, un néant gris qui avance. Le jeu de rôle où l'on se bat surtout contre soi-même.",
  links: [
    { label: "Disco Elysium (ZA/UM, 2019), The Final Cut (2021)", note: "Écrit par Robert Kurvitz et son équipe. La Final Cut ajoute un doublage complet et de nouvelles quêtes politiques." },
    { label: "Robert Kurvitz, Püha ja õudne lõhn (2013)", note: "Le roman estonien, situé dans le même monde, qui a précédé le jeu." },
    { label: "Aleksander Rostov, peintures du jeu", note: "Tout le jeu est peint à l'huile, dans un style proche de l'expressionnisme." },
    { label: "British Sea Power, bande originale", note: "Le groupe anglais (devenu Sea Power) a écrit toute la musique. Instrument of Surrender, Whirling-in-Rags." },
    { label: "Raymond Chandler, Le Grand Sommeil", note: "Pour le détective cabossé et la ville corrompue." },
  ],
  text: String.raw`
# Avant de commencer

Disco Elysium est un jeu de rôle sans combat. Ou presque : il y a un seul affrontement armé dans tout le jeu, et il peut très mal finir. Tout le reste, ce sont des dialogues. Des centaines de milliers de mots, écrits avec un talent littéraire rarement vu dans le jeu vidéo.

Il a été fait par un collectif estonien, au départ un groupe d'écrivains, de peintres et de musiciens qui avaient inventé un monde pendant des années, dans des cahiers, des jeux de rôle sur table, un roman. Le jeu est leur manière de le montrer.

Je vais te raconter le monde, l'enquête, et surtout l'homme que tu incarnes, parce que c'est lui, le vrai mystère.

@yt zBGWeYEGSXU | Disco Elysium The Final Cut, la bande-annonce de sortie (2021).


# Ceux qui l'ont fait

Disco Elysium est développé par ZA/UM, un studio estonien né d'un collectif d'artistes. Le concepteur principal et l'auteur de l'univers est Robert Kurvitz, romancier et musicien. La direction artistique et les peintures sont d'Aleksander Rostov. L'écriture est signée par une petite équipe, dont Helen Hindpere et Argo Tuulik.

La musique est du groupe britannique British Sea Power. La voix du narrateur et de toutes les compétences, dans la Final Cut, est celle de Lenval Brown.

# Le réveil

Tu te réveilles par terre, en sous-vêtements, dans une chambre d'auberge saccagée. Une cravate est accrochée aux pales du ventilateur. Une fenêtre est cassée. Tu ne sais pas qui tu es. Tu ne sais pas où tu es. Tu ne sais même plus ce qu'est l'argent.

@art 1 | Le réveil.

Avant même que tu ouvres les yeux, des voix te parlent. Ton cerveau reptilien, qui te dit de rester dans le noir. Ton système limbique, qui te rappelle qu'il y a eu une femme, et que ça fait mal.

Tu descends. On t'apprend que tu es policier. Que tu es venu, il y a quelques jours, enquêter sur un pendu, et que depuis tu as bu, chanté, cassé des choses, crié dans la rue que tu allais en finir avec le monde.

En bas, un homme t'attend, calme, en veste orange, avec des lunettes : le lieutenant Kim Kitsuragi, d'un autre commissariat, envoyé pour t'aider. Il ne te juge pas. Ou très peu.

# Martinaise

Tu es à Martinaise, un quartier pauvre au bord de l'eau, dans la ville de Revachol. Revachol a été autrefois la capitale du monde. Aujourd'hui, c'est une ville occupée, en ruine, à moitié reconstruite.

Il y a cinquante ans, une révolution communiste a pris Revachol. Les révolutionnaires suivaient les idées d'un penseur, Kras Mazov. Ils ont tenu la ville quelque temps. Puis une coalition des grandes puissances, qu'on appelle la Coalition, est venue les écraser. Les obus de la Coalition ont laissé des cratères qu'on voit encore. Les révolutionnaires ont été tués. La ville est devenue une zone sous administration étrangère, gouvernée par une institution internationale, la Moralintern, au nom de la morale et du marché.

Depuis, Revachol vit dans ce compromis. Les riches sont restés riches. Les pauvres sont restés pauvres. La police, la Milice des citoyens de Revachol, est une sorte de garde municipale bricolée par des volontaires, sans vrai pouvoir.

Et tout le monde, dans ce quartier, porte en lui la défaite d'une révolution que personne n'a vraiment oubliée.

# Le pendu

L'affaire est simple, en apparence. Derrière l'auberge, un homme a été pendu à un arbre. C'est un mercenaire, Lely, qui commandait une troupe envoyée par une grande compagnie, la Wild Pines, pour briser la grève des dockers.

Le syndicat des dockers, dirigé par un homme énorme et rusé, Evrart Claire, est le suspect évident. Les jeunes ouvriers de son entourage disent avoir pendu le mercenaire eux-mêmes, en représailles. Ils mentent.

Il te faut décrocher le corps, qui pend depuis une semaine. L'examiner. Interroger les gens. Écouter les voix dans ta tête. Faire des erreurs. Et peu à peu, comprendre.

# Les voix

C'est ici que Disco Elysium devient unique. Tu n'as pas de statistiques de combat. Tu as vingt-quatre compétences, et chacune est une voix dans ta tête, avec sa personnalité.

@art g 1 | Les voix.

L'Encyclopédie connaît tout sur tout, et te récite l'histoire du monde au pire moment. L'Électrochimie veut de l'alcool, de la drogue, du sexe, toujours plus. L'Empire intérieur, ton intuition étrange, fait parler les objets, et parfois ta cravate. Le Frisson te fait sentir la ville entière, le vent, la mer. La Demi-lumière te souffle que tout le monde te veut du mal. La Volonté essaie de te garder debout. L'Esprit de corps te montre ce que font tes collègues à l'autre bout de la ville, comme dans un film.

Ces voix te parlent, se disputent entre elles, te donnent de bons et de très mauvais conseils. Le jeu se joue autant contre ton propre esprit que contre le monde.

Et il y a l'armoire à pensées : une pièce de ton cerveau où tu peux laisser mûrir des idées. Être un flic communiste. Devenir l'apôtre de la mode. Croire que tu es un Dieu-policier. Chaque idée te change.

# Harry

Ton nom, tu finis par l'apprendre, est Harrier Du Bois. On l'appelle Harry. Tu es lieutenant, d'un commissariat lointain. Tu étais, dit-on, un excellent enquêteur.

Et tu as tout détruit. Ta femme, ou ta fiancée, Dora, t'a quitté il y a des années. Tu ne t'en es jamais remis. Tu as bu pour oublier, et cette fois, tu as tellement bu que tu as effacé ta propre personne. L'amnésie n'est pas un accident. C'est ce que tu cherchais.

Le jeu te laisse choisir qui tu redeviens. Un flic rigoureux. Un épave. Un comédien. Un fasciste ridicule. Un communiste illuminé. Un ultralibéral qui vend tout. Un homme triste qui s'excuse auprès de tout le monde. Chaque choix politique est une caricature, et chacune est écrite avec respect et cruauté à la fois.

!! CE QUE LE JEU FAIT :: Disco Elysium te demande qui tu es, mais il ne te laisse jamais être un héros. Même tes plus beaux succès sont mêlés de honte. C'est un des rares jeux qui parlent de l'échec, de l'alcool et du deuil sans en faire un décor.

# Le Pâle

Le monde de Disco Elysium n'est pas une planète ronde. C'est un ensemble de continents, qu'on appelle des isolats, séparés par le Pâle.

Le Pâle est un néant gris, une brume où la matière, la mémoire et le temps se défont. On peut le traverser, avec des radios et des véhicules spéciaux, mais ceux qui y restent trop longtemps en reviennent changés, ou n'en reviennent pas. Et le Pâle grandit. Lentement. Certains scientifiques pensent qu'un jour, il engloutira tout.

Ce n'est presque jamais le sujet du jeu. Et pourtant, c'est là, en fond, tout le temps : un monde qui s'efface, comme ta mémoire s'est effacée. Tu as fait, en buvant, la même chose que le Pâle fait au monde.

# L'Innocence

L'histoire de ce monde est rythmée par des figures qu'on appelle les Innocences : des êtres exceptionnels qui apparaissent de temps en temps et changent le cours de l'histoire, comme des saints laïcs. La plus célèbre, Dolores Dei, une femme presque divine, a laissé un héritage dont se réclame encore l'ordre moral qui gouverne le monde.

Harry, à moitié fou, va s'identifier à elle, ou à d'autres. Le jeu te laisse rêver d'être une Innocence. Et il te rappelle que tu es un flic qui a perdu ses chaussures.

# La vérité

L'enquête avance. Tu découvres que Lely n'a pas été pendu vivant. Il a été tué d'une balle, et pendu ensuite pour faire croire à un lynchage. La mise en scène vient d'une femme qui logeait à l'auberge, Klaasje, une ancienne espionne d'entreprise en fuite, qui était l'amante du mercenaire. Les jeunes du syndicat l'ont aidée à maquiller le crime, pour la protéger.

@art 2 | La vérité.

Mais qui a tiré ? Une balle venue de loin. De la mer.

Avant de le trouver, il y a le Tribunal. Les camarades de Lely, des mercenaires lourdement armés, viennent réclamer vengeance. Une négociation dans une cour, au milieu d'une foule. Elle tourne mal. Des gens meurent, selon tes choix et selon les dés. Toi aussi, tu peux être blessé.

Puis tu prends un bateau. Sur un îlot, dans les ruines d'un ancien fort de la révolution, vit un vieillard : Iosef Lilianovich Dros. Un ancien soldat communiste, qui n'est jamais redescendu, qui vit seul dans le fort depuis cinquante ans. C'est lui. Il a tiré sur le mercenaire, à une distance immense, par haine de ce qu'il représentait, par jalousie, par désespoir. Il est l'image vivante de la révolution trahie, devenue aigreur.

# Le phasme

Au même endroit, sur l'îlot, il se passe autre chose. Tout au long du jeu, deux personnages ont cherché un insecte légendaire, que personne n'a jamais vu, une sorte de phasme géant venu d'un autre continent.

Là, dans les roseaux, au moment où tout est fini, il apparaît. Un insecte immense, fait de branches. Il te parle, dans ta tête. Il te dit que tu n'es pas seul à avoir peur. Que le monde est fragile, et que c'est pour cela qu'il est beau. Puis il disparaît.

C'est peut-être une hallucination. C'est le moment le plus doux de tout le jeu.

# La fin

Tes collègues de commissariat arrivent en bateau. Ils te regardent. Ils savent ce que tu as fait ces derniers jours. Ils jugent ton enquête, ton comportement, ce que tu es devenu. Et Kim, celui qui t'a suivi sans rien dire, peut te dire, s'il t'a vu changer, qu'il serait honoré de travailler à nouveau avec toi.

# Après le jeu

Disco Elysium a remporté presque tous les prix de son année. Puis le studio s'est déchiré. À partir de 2021, plusieurs de ses principaux créateurs, dont Robert Kurvitz, ont quitté ZA/UM au milieu d'un conflit sur la propriété du studio, avec des procédures judiciaires. Plusieurs ont depuis lancé d'autres projets. Une suite telle qu'ils l'imaginaient ne verra sans doute jamais le jour.

@art 3 | Après le jeu.

Il y a une amertume particulière dans ce destin : un jeu sur une révolution perdue au profit du capital, dont les auteurs ont perdu la maîtrise au profit des investisseurs. Je ne prends pas parti dans la querelle. Je constate la rime.

# Ce que tu peux en prendre

Disco Elysium t'apprend que le dialogue peut être une action. Chaque phrase est un choix, chaque silence aussi. Le jeu n'a presque pas de combats, et il est plus intense que la plupart des jeux d'action.

Il t'apprend aussi à donner une voix à l'intérieur. Les compétences qui parlent sont une idée de mise en scène géniale : elles transforment la pensée d'un personnage en dialogue, en conflit, en théâtre.

Et il t'apprend la tendresse envers les épaves. Harry est un homme ruiné, ridicule, honteux. Le jeu ne le sauve pas. Mais il lui laisse, à la fin, la possibilité d'être un peu meilleur demain. Kim le regarde. Le phasme lui parle. C'est assez.
`,
};
export default book;
