const book = {
  id: "dead-space", title: "Dead Space", sub: "Le Marqueur, l'Ishimura et l'ingénieur", room: "lore", type: "recit", cote: "LO-054", color: 20, emblem: "⟁", art: "Dead Space",
  about: "Un ingénieur monte à bord d'un vaisseau minier qui ne répond plus. Créé en 2008 par Glen Schofield et Michael Condrey chez Visceral Games, mis en musique par Jason Graves, Dead Space a inventé une horreur de science-fiction où l'on se bat en coupant des membres, où la santé s'affiche sur le dos du héros, et où une religion entière vénère l'objet qui va tuer l'humanité.",
  links: [
    { label: "Dead Space (2008) et son remake (Motive, 2023)", note: "Le remake réécrit et complète l'histoire : commence par lui si tu découvres." },
    { label: "Dead Space: Downfall (2008)", note: "Le film d'animation qui raconte la chute de l'Ishimura juste avant l'arrivée d'Isaac." },
    { label: "B. K. Evenson, Dead Space: Martyr (2010)", note: "Le roman de Michael Altman et du Marqueur noir, dans le cratère de Chicxulub." },
    { label: "Antony Johnston et Ben Templesmith, Dead Space (comics, 2008)", note: "La colonie d'Aegis VII avant le désastre." },
    { label: "Jason Graves, bande originale de Dead Space", note: "Une musique qui grince, souffle et frappe, enregistrée en grande partie avec des techniques d'orchestre aléatoires." },
  ],
  text: String.raw`
# Les créateurs, et le vaisseau qui ne répond plus

Dead Space naît en 2006, dans un studio d'Electronic Arts à Redwood Shores, en Californie, qui prendra ensuite le nom de Visceral Games. Glen Schofield, qui a longtemps travaillé sur des jeux d'action, veut faire le jeu d'horreur le plus effrayant possible, et il le dit sans détour : il veut que les joueurs aient peur comme ils avaient eu peur devant Alien ou The Thing. Michael Condrey produit le projet avec lui. Le scénariste Antony Johnston et l'équipe d'écriture bâtissent un univers complet, avec ses entreprises, sa religion et son histoire, bien avant que le joueur n'y mette les pieds. Le compositeur Jason Graves, avec le directeur audio Don Veca, invente une bande-son qui ne joue presque jamais de mélodie : des cordes qui crissent, des cuivres qui grondent, des silences, des respirations. Le jeu sort en octobre 2008.

L'histoire commence au XXVIe siècle. La Terre a épuisé ses ressources. Pour survivre, l'humanité envoie à travers l'espace des vaisseaux gigantesques, les planet crackers, des brise-planètes, qui arrachent des morceaux entiers de mondes morts et les découpent pour en extraire le métal. Le plus ancien et le plus grand de ces vaisseaux s'appelle l'USG Ishimura. Il appartient à une société minière, la Concordance Extraction Corporation. Il travaille depuis des mois autour d'Aegis VII, une planète où, officiellement, il est interdit de creuser.

L'Ishimura a cessé de répondre. Un petit vaisseau de réparation, l'USG Kellion, est envoyé pour comprendre la panne. À bord : un chef d'équipe, Zach Hammond, une spécialiste des systèmes informatiques, Kendra Daniels, quelques soldats, et un ingénieur. Il s'appelle Isaac Clarke. Il a une raison personnelle d'être là : sa compagne, Nicole Brennan, est médecin à bord de l'Ishimura. Peu avant le silence, elle lui a envoyé un message vidéo. Elle y pleure. Elle n'a pas eu le temps de dire pourquoi.

Le Kellion s'écrase à moitié en accostant. Les couloirs sont vides, éclairés en rouge. Il y a du sang sur les murs, et des inscriptions tracées avec ce sang. Une phrase revient : coupez-leur les membres. Personne ne comprend encore ce qu'elle veut dire.

@art 1 | L'Ishimura au-dessus d'Aegis VII

## L'année 2508, et le monde qui l'a produite

Pour comprendre Dead Space, il faut regarder le monde qui entoure l'Ishimura. L'histoire se déroule en 2508. La Terre est surpeuplée, polluée, presque vide de ressources. Ses gouvernements ont fusionné en un seul pouvoir, le Gouvernement de la Terre, qu'on appelle EarthGov. Il administre des colonies sur des dizaines de mondes, et il dépend entièrement des métaux que les brise-planètes arrachent à l'espace. Sans eux, l'humanité manquerait de tout en quelques années.

Ces vaisseaux appartiennent à des compagnies privées, et d'abord à la Concordance Extraction Corporation, la CEC. Les ouvriers y signent des contrats de plusieurs années, loin de chez eux, dans des conditions dangereuses, avec des équipements usés. L'Ishimura est en service depuis plus de soixante ans. Ses cloisons sont rafistolées, ses systèmes tombent en panne, et le personnel le sait. Une partie des journaux audio que trouve Isaac ne parle pas de monstres, mais de salaires, de fatigue, de pièces qu'on n'a pas remplacées. Dead Space décrit un futur où le travail ouvrier n'a pas disparu : il s'est seulement déplacé dans l'espace.

Il y a aussi des tensions politiques. Des colonies se sont soulevées contre la Terre, il y a longtemps, et une armée séparatiste, les forces armées des Colonies souveraines, a combattu le gouvernement central. Ce conflit appartient au passé quand Isaac monte à bord de l'Ishimura, mais il reviendra dans le troisième jeu, avec une expédition militaire oubliée.

Et puis il y a l'Église. L'Unitologie est née au XXIIIe siècle, autour de la figure de Michael Altman. Ses fidèles sont partout : dans les équipages, dans l'armée, dans l'administration. Ils paient très cher pour monter dans la hiérarchie de l'Église et recevoir ses enseignements secrets. Ils se saluent au nom d'Altman. Pour eux, la mort n'est pas une fin, mais le passage vers l'unité promise. Le gouvernement les tolère, les craint et s'en sert. Ses scientifiques savent depuis longtemps que les Marqueurs sont dangereux, mais ils continuent à les étudier, parce que ces objets semblent produire une énergie illimitée. Tout le drame de la série tient dans cette alliance malsaine : une Église qui adore l'arme, un État qui veut s'en servir, et une compagnie qui envoie ses ouvriers creuser à côté.

# Couper, et regarder dans son dos

Très vite, les morts se relèvent. Ce ne sont pas des zombies. Ce sont des nécromorphes : des cadavres réorganisés par un organisme étranger, qui les déplie, les recoud, les transforme en armes. Des lames d'os sortent des bras. Des corps se gonflent de pustules qui explosent. Des enfants deviennent des choses qui rampent par grappes. Ils sortent des conduits d'aération, partout, tout le temps.

Et ils ne meurent pas quand on leur tire dans la tête. C'est la grande idée de Dead Space, que les créateurs ont appelée le démembrement stratégique. Pour arrêter un nécromorphe, il faut lui couper les membres, un par un. Isaac n'est pas un soldat. Il n'a pas de fusil d'assaut, mais des outils de chantier : un découpeur plasma qui projette une ligne de lumière qu'on peut tourner à l'horizontale ou à la verticale, une scie circulaire qu'on lance, un lance-flammes, un rayon de force. Le joueur apprend à viser les genoux, les coudes, les épaules. Le combat devient une affaire de précision et de sang-froid, et chaque erreur se paie.

L'autre grande idée tient dans le dos d'Isaac. Dead Space n'affiche presque rien à l'écran. Pas de barre de vie dans un coin, pas de compteur de munitions. La santé est une colonne de lumière le long de la colonne vertébrale de sa combinaison, le RIG. Les munitions s'affichent en hologramme sur l'arme quand on vise. Les menus eux-mêmes apparaissent comme des projections devant lui : quand on ouvre l'inventaire, le jeu ne s'arrête pas, et un monstre peut attaquer pendant qu'on cherche une trousse de soin. Les designers voulaient qu'on ne sorte jamais du monde, qu'on n'ait jamais un instant de répit artificiel. Cette interface intégrée, qu'on dit diégétique, a été copiée par des dizaines de jeux.

Isaac reçoit aussi deux pouvoirs d'ingénieur, qui deviennent des armes. La stase ralentit le temps autour d'une cible : une porte qui claque trop vite, une machine qui tourne, un monstre qui charge. La kinésie lui permet de saisir des objets à distance et de les projeter, y compris les lames arrachées aux nécromorphes. Entre deux combats, il améliore son équipement sur des établis, avec des nœuds d'énergie trouvés dans les couloirs, et il achète munitions et combinaisons dans des boutiques automatiques. Même là, le jeu reste dans son monde : l'Ishimura est un vaisseau de travail, avec ses distributeurs et ses ateliers.

Le son fait la moitié de la peur. Don Veca et son équipe ont travaillé chaque bruit pour qu'on ne sache jamais s'il vient d'un monstre ou du vaisseau : un conduit qui cogne, une machine qui grince, une voix qui murmure, un enfant qui pleure quelque part. Jason Graves a enregistré l'orchestre en lui demandant de jouer des motifs libres, superposés, sans mesure commune, pour créer des masses sonores instables. La musique ne prévient presque jamais. Et la bande-annonce du premier jeu, en 2008, a marqué les joueurs avec une simple comptine, Twinkle, Twinkle, Little Star, chantée doucement sur des images de couloirs sanglants.

Il y a aussi le vide. Certaines parties du vaisseau ont perdu leur atmosphère. Isaac doit y marcher avec une réserve d'oxygène qui baisse. Le son disparaît presque entièrement : on n'entend plus que la respiration d'Isaac, les battements de son cœur, le bruit étouffé des coups. Et dans certaines zones, la gravité est coupée : Isaac saute d'une paroi à l'autre, colle ses bottes au plafond, et le haut et le bas n'existent plus.

!! À RETENIR :: Dead Space a montré qu'on pouvait faire de l'horreur avec les règles du jeu elles-mêmes. Couper au lieu de tirer, lire sa santé dans le dos du personnage, ouvrir un menu sans que le temps s'arrête : chaque mécanique rend le joueur plus vulnérable.

@art 3 | Isaac Clarke dans sa combinaison d'ingénieur

# Le Marqueur, et la chute de l'Ishimura

## L'Ishimura, avant Isaac

Le vaisseau qu'Isaac traverse raconte lui-même sa chute. Dead Space confie presque tout son récit aux traces laissées par l'équipage : des journaux audio, des vidéos de surveillance, des notes griffonnées, des messages inscrits avec du sang sur les cloisons. On ne voit presque jamais l'horreur se produire. On arrive toujours après.

Voici ce qu'on reconstitue. Les mineurs de la colonie d'Aegis VII ont sorti le Marqueur de la roche. Dans les semaines qui ont suivi, la colonie a sombré : insomnies, voix, gens qui se mettent à dessiner les mêmes symboles sur tous les murs, crimes sans raison. Puis les morts ont commencé à se relever. Pendant ce temps, l'Ishimura avait arraché à la planète un énorme bloc de roche, et le Marqueur avec lui. On l'a monté à bord, en cachette, sur ordre d'un capitaine unitologiste, Benjamin Mathius, qui voyait dans l'objet une relique sainte. Les colons ont suivi, avec leurs malades et leurs morts.

Trois personnages dominent ces archives. Le docteur Terrence Kyne, responsable scientifique, comprend avant tout le monde que le Marqueur rend fou et qu'il faut le remettre sur la planète. Il s'oppose au capitaine, et le capitaine meurt au cours de cet affrontement. Kyne passe le reste du jeu caché, à parler à Isaac par radio, à moitié lucide, à moitié perdu dans ses propres visions. Le docteur Challus Mercer, lui, est un fanatique. Il voit dans les nécromorphes la forme parfaite de l'humain, l'étape suivante. Il travaille à créer une créature qui se régénère sans fin, le Traqueur, et il lâche cette chose sur Isaac en lui récitant des sermons. Et puis il y a Nicole, la compagne d'Isaac, dont on suit les messages, un par un, à mesure qu'elle comprend que personne ne viendra les sauver.

Le vaisseau entier devient un organisme. Les nécromorphes ne sont pas une foule de monstres isolés : ils obéissent à une conscience commune, que les jeux appellent l'Esprit-ruche, une créature énorme restée sur Aegis VII, qui coordonne l'infestation à distance. Sur l'Ishimura, une matière organique recouvre peu à peu les murs, les machines, les cadavres. Des créatures immenses, comme le Léviathan accroché au réservoir d'eau du vaisseau, se forment à partir de ce qui reste de l'équipage. Isaac avance dans un corps vivant qui l'a déjà digéré à moitié.

La fin du premier jeu ferme la boucle. Kyne veut ramener le Marqueur sur la planète, parce qu'il pense que cela calmera l'Esprit-ruche. Kendra le tue et veut emporter l'objet pour le gouvernement. Isaac, guidé par l'image de Nicole, finit par replacer le Marqueur sur son socle, affronte l'Esprit-ruche et s'enfuit dans la navette de Kendra, pendant qu'Aegis VII se brise. Seul dans la navette, il regarde une dernière fois le message de Nicole jusqu'au bout. Elle y dit ce qu'elle n'avait jamais pu terminer. Puis il se retourne, et elle est assise à côté de lui.

@art 4 | Les couloirs de l'Ishimura

## Le Marqueur

Au fil des journaux audio, des vidéos et des messages laissés par l'équipage, Isaac reconstitue ce qui s'est passé. L'Ishimura n'était pas là seulement pour le minerai. Sur Aegis VII, une colonie minière clandestine avait trouvé un objet enfoui : une immense double spirale de pierre rouge, couverte de signes, haute comme un immeuble. On l'appelle le Marqueur.

Pour comprendre ce qu'il est, il faut remonter très loin. Au XXIIIe siècle, au fond du cratère de Chicxulub, au Mexique, celui de l'astéroïde qui a tué les dinosaures, des scientifiques ont trouvé un premier objet de ce genre, noir celui-là : le Marqueur noir. Un géophysicien, Michael Altman, a été parmi les premiers à l'étudier. Autour de l'objet, les gens ont commencé à entendre des voix, à voir des morts, à faire des cauchemars, à devenir violents. Altman a compris que le Marqueur était dangereux. Il est mort, et après sa mort on a fait de lui un prophète.

Car le Marqueur noir a donné naissance à une religion : l'Unitologie. Ses fidèles croient que les Marqueurs sont des objets sacrés, qui annoncent la Convergence, le jour où l'humanité sera rassemblée et rendue entière. Ils ont des églises, des prêtres, des millions de croyants, de l'argent et de l'influence. Une partie de l'équipage de l'Ishimura était unitologiste, à commencer par son capitaine. Quand le Marqueur rouge a été trouvé, ils y ont vu un miracle.

Le Marqueur rouge n'était pourtant pas un objet venu des étoiles. Le gouvernement de la Terre, après avoir étudié le Marqueur noir, avait essayé d'en fabriquer des copies. La planète Aegis VII cachait l'une d'elles, construite par des humains et abandonnée là. Une copie aussi dangereuse que l'original.

Voici ce que font les Marqueurs, d'après ce que les jeux finissent par révéler. Ils émettent un signal qui agit sur le cerveau humain. Ils provoquent la démence, les hallucinations, la paranoïa, l'obsession. Ils poussent les gens à les reproduire, à en dessiner les signes, à en construire d'autres. Ils poussent aussi au meurtre et au suicide. Et quand il y a assez de morts, ils réveillent le pathogène qui transforme les cadavres en nécromorphes. Les Marqueurs ne sont pas des reliques sacrées. Ce sont des outils de récolte.

Isaac l'apprend en même temps qu'il comprend autre chose. Kendra Daniels n'est pas une simple technicienne : elle est une agente du gouvernement, envoyée pour récupérer le Marqueur à tout prix. Zach Hammond meurt. Et Nicole, qu'Isaac croyait vivante, qu'il voyait parfois au bout d'un couloir, était morte depuis le début. Elle s'était donné la mort avant même l'arrivée du Kellion. Celle qu'il voyait était une hallucination envoyée par le Marqueur pour le guider, pour qu'il ramène l'objet à sa place et achève ce que l'objet voulait.

> Make us whole. | Le cri des Unitologistes et des nécromorphes, dans la série

@art 2 | Le Marqueur rouge sur Aegis VII

# Titan et Tau Volantis

## Le Sprawl

Dead Space 2 sort en janvier 2011. Il se passe trois ans après le premier jeu, sur le Sprawl, une immense ville spatiale construite sur un fragment de Titan, la plus grande lune de Saturne. Près d'un million de personnes y vivent : des familles, des écoles, une église unitologiste géante, des centres commerciaux, des hôpitaux. Isaac s'y réveille dans une camisole, dans un hôpital psychiatrique, sans souvenirs précis des trois dernières années. Autour de lui, l'épidémie vient de commencer.

Il comprend peu à peu ce qui lui est arrivé. Le gouvernement l'a récupéré après Aegis VII, et s'est servi de son cerveau. Isaac a regardé le Marqueur rouge de près, et l'objet a inscrit en lui ses propres plans. En fouillant sa mémoire, les scientifiques du Sprawl ont pu construire un nouveau Marqueur, énorme, caché sous la station. Le directeur de la ville, Hans Tiedemann, veut le contrôler et tout effacer derrière lui, y compris Isaac.

Isaac n'est plus le même. Il a désormais un visage, que le joueur voit souvent sans casque, et une voix, celle de l'acteur Gunner Wright. Il parle, il jure, il doute. Et il est malade. Les hallucinations de Nicole sont revenues, mais elles ne le guident plus : elles l'accusent, elles hurlent, elles l'attaquent. Il ne sait plus ce qui est réel. Il croise un autre survivant d'un programme sur les Marqueurs, Nolan Stross, qui a perdu sa famille sous l'influence de l'objet et dont la folie montre à Isaac ce qu'il risque de devenir. Il rencontre aussi Ellie Langford, une pilote de la sécurité, dure et lucide, qui devient son alliée.

Le jeu compte quelques-unes des scènes les plus célèbres de la série. Une école maternelle envahie. Une église unitologiste où l'on prie devant la statue d'un Marqueur. Le retour, dans la dernière partie, sur l'Ishimura lui-même, conservé dans un dock de la station comme une épave interdite : Isaac retraverse les couloirs du premier jeu, et la peur vient surtout de ce qu'on s'attend à voir. Et une machine qu'il faut utiliser sur soi-même : pour accéder aux données gravées dans son cerveau, Isaac doit enfoncer une aiguille dans son propre œil, en dirigeant lui-même le geste, au millimètre.

À la fin, Isaac affronte Nicole à l'intérieur de son propre esprit. Il accepte sa culpabilité, il cesse de fuir, et cette acceptation lui permet de résister à l'appel du Marqueur. Il détruit l'objet, et le Sprawl avec lui.

## Tau Volantis, et les lunes

Dead Space 3, en 2013, change d'échelle. Le gouvernement de la Terre s'est effondré. L'Unitologie a pris le pouvoir dans une partie des colonies, et sa branche la plus violente, le Cercle, menée par un fanatique nommé Jacob Danik, traque tous ceux qui s'opposent aux Marqueurs. Ellie est partie en mission sur une planète oubliée, à la limite de l'espace connu, et ne donne plus de nouvelles. On vient chercher Isaac, qui vit caché sur la Lune, pour qu'il la retrouve.

Cette planète s'appelle Tau Volantis. C'est un monde de neige et de glace, et c'est là que tout a commencé. Deux siècles plus tôt, une expédition militaire des Colonies souveraines y avait été envoyée en secret, parce qu'on avait capté un signal venu de là-bas. Ses soldats et ses savants y ont trouvé les restes d'une civilisation extraterrestre, et l'explication de tout. Les Marqueurs n'ont pas été inventés par ces extraterrestres. Ils ont été semés, dans l'univers, par des êtres beaucoup plus anciens : les Lunes frères. Chaque Lune est une créature immense, faite de la chair fondue de milliards d'êtres. Les Marqueurs servent à préparer une espèce à cette fusion, la Convergence. Quand elle a lieu, une nouvelle Lune naît, se nourrit de sa planète, puis part dans l'espace rejoindre les autres.

Les extraterrestres de Tau Volantis avaient compris cela trop tard. Mais ils avaient réussi à figer leur propre Lune au cœur de la planète, grâce à une machine colossale, en sacrifiant leur civilisation. Isaac, Ellie, son compagnon Robert Norton, et un soldat survivant, John Carver, que l'on peut incarner en jeu coopératif, cherchent le Codex, la clé de cette machine, qui pourrait arrêter tous les Marqueurs d'un coup. Le jeu se termine sur un sacrifice, Isaac et Carver tombant dans la Lune qu'ils viennent d'arrêter. Une extension, Awakened, ajoute un épilogue : les autres Lunes se sont réveillées, et elles approchent de la Terre.

Dead Space 3 a divisé les joueurs. Il est plus orienté vers l'action, il permet de fabriquer ses propres armes, il ajoute un mode coopératif et des achats payants. Beaucoup y ont vu la fin de l'horreur pure qui faisait la force de la série. Mais il a donné à l'univers sa mythologie complète, d'une ampleur cosmique.

# Les autres récits, et le remake

## Les histoires autour

La série ne s'est pas limitée aux trois jeux. Dès 2008, avant même la sortie du premier, Electronic Arts a publié une bande dessinée, Dead Space, écrite par Antony Johnston et dessinée par Ben Templesmith, qui raconte les dernières semaines de la colonie d'Aegis VII : les mineurs qui deviennent fous autour du Marqueur, les crimes, les premiers morts qui se relèvent. Le film d'animation Dead Space: Downfall, sorti la même année, suit la chute de l'Ishimura du point de vue de sa cheffe de la sécurité, Alissa Vincent, jusqu'à l'envoi du signal de détresse qui attirera Isaac.

Dead Space: Extraction, en 2009 sur la console Wii, est un jeu de tir sur rails qui revient sur ces mêmes jours, sur la colonie et sur le vaisseau. Le roman Dead Space: Martyr, de B. K. Evenson, publié en 2010, raconte la découverte du Marqueur noir au Mexique et la vie de Michael Altman, l'homme qui avait compris le danger et que l'Église a transformé en prophète après sa mort. D'autres jeux, d'autres films et d'autres romans ont suivi, comme Dead Space: Aftermath en 2011, ou le roman Catalyst. L'ensemble forme l'un des univers de science-fiction les plus cohérents du jeu vidéo.

## La fin de Visceral, et le remake

Malgré son succès critique, la série n'a jamais vendu autant qu'Electronic Arts l'espérait. Visceral Games a été fermé en 2017, alors qu'il travaillait sur un jeu Star Wars. Glen Schofield a fondé un autre studio, Striking Distance, et a créé The Callisto Protocol, sorti en 2022 : une prison sur une lune de Jupiter, des créatures, une caméra à l'épaule, un héritier direct de Dead Space.

En janvier 2023, le studio Motive, à Montréal, a sorti un remake du premier jeu. Il reprend l'histoire, les lieux et les mécaniques, mais en profondeur. Isaac parle, avec la voix de Gunner Wright. L'Ishimura devient un seul espace continu, sans écran de chargement, qu'on peut parcourir d'un bout à l'autre. Les corps des nécromorphes sont faits de couches, peau, muscles, os, que les armes arrachent une à une. Un système appelé le directeur d'intensité change en permanence les lumières, les bruits et les apparitions, pour qu'on ne puisse jamais se rassurer en connaissant le jeu par cœur. Et l'histoire de Nicole est complétée : on comprend mieux qui elle était, ce qu'elle a vu, et pourquoi elle a pleuré dans son dernier message.

@art g 1 | Une affiche du remake de 2023

# Ce qui fait peur, au fond

Dead Space ne fait pas peur seulement par ses monstres. Il fait peur par ce qu'il dit des institutions. La compagnie minière envoie ses ouvriers mourir dans un vaisseau trop vieux. Le gouvernement fabrique en secret des objets qu'il sait mortels, parce qu'il espère s'en servir comme source d'énergie. L'Église unitologiste transforme un instrument de mort en promesse de salut, et ses fidèles se sacrifient en chantant. Personne, au-dessus d'Isaac, ne dit la vérité.

Et Isaac est un ingénieur. Pas un élu, pas un guerrier. Il répare des portes, rétablit l'oxygène, relance des réacteurs, recâble des ascenseurs, tout en étant poursuivi par ce que sont devenus ses collègues. Le jeu fait de la compétence technique une forme de courage. Il y a quelque chose de touchant dans cet homme qui, pour survivre à l'horreur cosmique, continue simplement à faire son travail.

!! À REGARDER :: Dans le remake de 2023, cherche les journaux de Nicole. Ils racontent, jour après jour, la descente de l'Ishimura dans la folie, du point de vue d'une médecin qui essaie de soigner et qui comprend trop tard.
`,
};
export default book;
