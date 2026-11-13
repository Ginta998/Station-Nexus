const book = {
  id: "blade-runner", title: "Blade Runner", sub: "Plus humain que l'humain", room: "lore", type: "recit", format: "vhs", cote: "LO-041", color: 20, emblem: "人",
  about: "Los Angeles, 2019. Il pleut sans arrêt. Des publicités géantes flottent entre les tours. Une entreprise fabrique des êtres artificiels qu'on ne distingue des humains que par un test sur leurs émotions. Quatre d'entre eux sont revenus sur Terre pour rencontrer leur créateur, et un policier fatigué est chargé de les abattre. Un roman de Philip K. Dick, un film mal reçu devenu un mythe, et une suite qui a osé lui répondre trente-cinq ans plus tard.",
  links: [
    { label: "Philip K. Dick, Les androïdes rêvent-ils de moutons électriques ? (1968)", note: "Le roman d'origine. Très différent du film, et passionnant pour cela." },
    { label: "Ridley Scott, Blade Runner (1982)", note: "Écrit par Hampton Fancher et David Peoples. Plusieurs versions : celle de 1982, la version dite du réalisateur (1992), et The Final Cut (2007), la seule que Scott ait entièrement contrôlée." },
    { label: "Vangelis, bande originale de Blade Runner", note: "Des synthétiseurs, un saxophone, de la pluie. Publiée officiellement plus de dix ans après le film." },
    { label: "Denis Villeneuve, Blade Runner 2049 (2017)", note: "La suite, photographiée par Roger Deakins. Deux Oscars : photographie et effets visuels." },
    { label: "Shinichirō Watanabe, Blade Runner: Black Out 2022 (2017)", note: "Un court métrage d'animation par le réalisateur de Cowboy Bebop, qui relie les deux films." },
    { label: "Blade Runner (Westwood Studios, 1997)", note: "Un jeu d'enquête qui se passe en parallèle du film, avec un autre blade runner." },
    { label: "Moebius et Dan O'Bannon, The Long Tomorrow (1976)", note: "Une bande dessinée de polar futuriste parue dans Métal hurlant, souvent citée parmi les inspirations visuelles du film." },
  ],
  text: String.raw`
# Avant de commencer

Il y a des films qui sont des succès, et des films qui deviennent des mondes. Blade Runner a d'abord été un échec. À sa sortie, en juin 1982, il passe presque inaperçu, écrasé par E.T. et par les grands films d'aventure de l'été. Les critiques le trouvent lent, froid, confus. Il ne rapporte pas l'argent qu'il a coûté.

Puis, lentement, il devient autre chose. Les vidéoclubs, les diffusions à la télévision, les nouvelles versions remontées par Ridley Scott lui-même. Toute une génération d'artistes le découvre et ne s'en remet pas. Les villes du cyberpunk, les néons sous la pluie, les mégacorporations, les êtres artificiels qui veulent vivre : une immense partie de la science-fiction des quarante années suivantes en descend.

Et au cœur de tout cela, il y a une question que le film pose sans jamais y répondre clairement : qu'est-ce qui fait de nous des humains ? Les souvenirs ? Les émotions ? Le fait d'être né ? Ou la capacité de faire grâce à quelqu'un, au dernier moment ?

Ce livre traverse le roman, le film, ses versions, sa suite et ses prolongements. Prends ton temps. Il pleut toujours sur Los Angeles.

@yt _XB60udZi1g | L'importance des yeux dans Blade Runner (en anglais).

# Ceux qui l'ont fait

**Philip K. Dick.** Écrivain américain né en 1928, il a publié plus de quarante romans et plus d'une centaine de nouvelles, presque tous hantés par les mêmes questions : qu'est-ce qui est réel ? Comment savoir si l'on est soi-même ? Il a longtemps vécu pauvrement, en écrivant très vite pour des éditeurs de poche. En 1968, il publie Les androïdes rêvent-ils de moutons électriques ?

Il ne verra jamais le film terminé. Il meurt en mars 1982, trois mois avant la sortie. Mais il a eu le temps de voir quelques images, en particulier les effets spéciaux de la ville, et il s'en est montré enthousiaste. Il a aussi salué la réécriture du scénario.

**Hampton Fancher et David Peoples.** Fancher, ancien acteur, écrit la première adaptation et se bat pendant des années pour la faire produire. C'est lui qui choisit de laisser de côté une grande partie du roman. Quand Ridley Scott arrive, il demande des réécritures, et c'est David Peoples, un autre scénariste, qui reprend le texte. Peoples écrira plus tard Impitoyable pour Clint Eastwood et L'Armée des douze singes pour Terry Gilliam.

Le titre, lui, ne vient pas de Dick. Il vient d'un projet de film de William S. Burroughs, lui-même tiré d'un roman d'Alan E. Nourse. Les producteurs en ont acheté les droits séparément, simplement pour le nom.

**Ridley Scott.** Il vient de triompher avec Alien. Il a d'abord refusé le projet. Puis, après avoir quitté une adaptation de Dune qui n'avançait pas, et après la mort de son frère aîné, il cherche un film qui l'occupe vite et complètement. Il accepte Blade Runner au début de 1980.

**Le financement.** Le studio qui devait produire le film se retire après avoir dépensé une partie du budget. Le producteur Michael Deeley trouve en quelques jours un nouvel accord : la Ladd Company, associée à Warner Bros., le producteur hongkongais Run Run Shaw, et la société Tandem. Le budget dépasse les vingt millions de dollars.

**Le monde visuel.** Syd Mead, un dessinateur industriel qui concevait des voitures et des objets pour de grandes entreprises, est engagé comme futuriste visuel. Il dessine les voitures volantes, qu'on appelle les spinners, les rues, les objets du quotidien. Le chef décorateur est Lawrence G. Paull. Les effets spéciaux sont supervisés par Douglas Trumbull, qui avait travaillé sur 2001, l'odyssée de l'espace, et Richard Yuricich. Tout est fait à la main : maquettes, peintures sur verre, expositions multiples. Aucun ordinateur.

**Vangelis.** Le compositeur grec, qui vient de signer Les Chariots de feu, improvise la musique devant les images du film, dans son studio de Londres, sur un synthétiseur Yamaha CS-80. Le saxophone du thème d'amour est joué par Dick Morrissey. La musique sera nommée aux BAFTA et aux Golden Globes, mais ne sera publiée officiellement qu'en 1994.

**Les acteurs.** Harrison Ford, juste après Star Wars et Les Aventuriers de l'arche perdue, joue Rick Deckard. Rutger Hauer, acteur néerlandais, joue Roy Batty. Sean Young joue Rachael. Daryl Hannah, Pris. Joanna Cassidy, Zhora. Brion James, Leon. Edward James Olmos, Gaff. M. Emmet Walsh, le capitaine Bryant. Joe Turkel, Eldon Tyrell. William Sanderson, J. F. Sebastian.

Le tournage, de mars à juillet 1981, est épuisant. Scott est exigeant, perfectionniste, souvent en conflit avec son équipe et avec Ford. Les deux hommes ont reconnu plus tard avoir eu des rapports difficiles.

# Le roman

Le roman de Dick ne ressemble presque pas au film. Il se passe en 1992 dans les premières éditions, puis en 2021 dans les suivantes, à San Francisco, après une guerre nucléaire qu'on appelle la Guerre mondiale Terminus. Une poussière radioactive tombe sans cesse. La plupart des humains sont partis vivre sur Mars et dans les colonies. Ceux qui restent sont ceux qui n'ont pas pu partir, ou pas voulu.

Presque tous les animaux sont morts. Posséder un animal vivant est devenu le signe suprême de la réussite et de la vertu. Rick Deckard, chasseur de primes, n'a qu'un mouton électrique sur le toit de son immeuble, et il en a honte. Il rêve d'acheter un vrai animal. C'est pour cela qu'il accepte de traquer six androïdes : la prime lui permettra de s'offrir une chèvre.

Les gens vivent avec une machine, l'orgue d'humeur, qui leur permet de régler leurs émotions comme on règle un thermostat. Et ils pratiquent une religion, le mercérisme : en tenant les poignées d'une boîte à empathie, chacun partage, en même temps que tous les autres, les souffrances d'un vieil homme, Wilbur Mercer, qui gravit éternellement une colline sous les jets de pierres. L'empathie est le cœur de l'humanité. C'est ce qui manque, dit-on, aux androïdes.

Le roman pose une question plus vertigineuse encore que le film. À la fin, on apprend que Mercer est peut-être un faux, un acteur filmé dans un studio. Et Deckard trouve dans le désert un crapaud, qu'il croit vivant, avant de découvrir qu'il est électrique lui aussi. Sa femme s'occupe quand même de lui. Le faux mérite-t-il qu'on l'aime ? Le roman répond doucement que oui.

Le film a gardé le chasseur, les androïdes, le test, Rachael, et presque rien d'autre. Ce n'est pas une trahison : c'est une autre œuvre, née du même germe.

# Los Angeles, 2019

Le film s'ouvre sur une vue aérienne d'une ville immense, la nuit. Des cheminées d'usines crachent des flammes vers le ciel. Des lumières à perte de vue. Au centre, deux pyramides gigantesques, le siège de la Tyrell Corporation. Dans un œil, en très gros plan, on voit le reflet des flammes.

En bas, dans les rues, il pleut. Il pleut toujours. Les trottoirs sont noirs de monde, de parapluies au manche lumineux, de vendeurs, de marchés en plein air, de vélos. On parle un mélange d'anglais, de japonais, d'espagnol, d'allemand, qu'un personnage appelle le langage de la ville. Des écrans géants couvrent les façades. Un dirigeable passe au-dessus des toits en vantant les colonies, une nouvelle vie dans un monde nouveau, une chance de recommencer.

Ceux qui l'ont pu sont partis. Ceux qui restent vivent dans le bruit, le néon et l'humidité.

Ridley Scott a construit cette ville en partie sur les décors de rues d'un vieux studio de Warner, transformés, recouverts, saturés de détails. Il a tourné aussi dans de vrais bâtiments de Los Angeles : le Bradbury Building, avec ses escaliers et ses balcons de fer, qui devient l'immeuble de Sebastian, et l'Ennis House, une maison de l'architecte Frank Lloyd Wright, aux murs de blocs sculptés, pour l'appartement de Deckard.

Cette ville a été imitée des centaines de fois. Mais elle a d'abord été une idée simple : un futur qui n'a pas remplacé le passé, mais qui s'est empilé dessus, comme les couches d'une vieille affiche.

# Les répliquants

Dans le film, les êtres artificiels ne s'appellent pas des androïdes, mais des répliquants. La Tyrell Corporation les fabrique. Ce ne sont pas des robots de métal : ce sont des êtres de chair, créés par génie génétique, physiquement identiques aux humains, souvent plus forts, plus rapides, plus intelligents.

Ils travaillent dans les colonies, là où les humains ne veulent pas aller : dans les mines, sur les champs de bataille, dans les maisons de plaisir. Ce sont des esclaves. Ils ont l'interdiction de venir sur Terre. Ceux qui y viennent sont abattus par des policiers spéciaux, les blade runners. Le film ne dit pas tuer. Il dit retirer.

Le dernier modèle s'appelle Nexus-6. Ses concepteurs ont remarqué que les répliquants, avec le temps, développaient leurs propres émotions. Par sécurité, on leur a donné une durée de vie de quatre ans. Ensuite, ils meurent.

La devise de la Tyrell Corporation est : plus humain que l'humain.

# Le test

Comment reconnaître un répliquant, s'il est identique à un humain ? Par un test, le Voight-Kampff. Un appareil, posé sur une table, observe de près l'œil de la personne interrogée, sa pupille, son iris, sa respiration. L'examinateur pose des questions, souvent cruelles, qui doivent provoquer une émotion : une tortue sur le dos dans le désert, un portefeuille en peau de veau, une collection de papillons. Le répliquant met une fraction de seconde de trop à réagir, ou réagit mal.

Le film s'ouvre sur une de ces scènes. Un blade runner interroge un employé de la Tyrell, Leon. On lui pose la question de la tortue. Il se trouble, s'énerve. Puis on lui demande de parler de sa mère. Il sort une arme sous la table et tire.

Ce test, c'est le cœur du film. Il dit que la seule différence entre l'humain et le répliquant serait l'émotion, l'empathie. Et tout le film va montrer que cette frontière ne tient pas : que les répliquants ressentent, et que les humains, eux, ont souvent cessé de ressentir.

# Deckard

Rick Deckard est un ancien blade runner. Il a quitté le métier. On le trouve au début assis à un comptoir de rue, sous la pluie, en train de commander des nouilles. Un policier, Gaff, vient le chercher. Gaff parle le langage de la ville, marche avec une canne, et plie sans arrêt de petits origamis avec des bouts de papier.

Le capitaine Bryant explique la situation. Un groupe de répliquants Nexus-6 s'est échappé d'une colonie, a tué des humains, détourné une navette, et est revenu sur Terre. Il en reste quatre en liberté : Roy Batty, un modèle de combat, le chef ; Leon, un ouvrier ; Zhora, entraînée pour des opérations d'assassinat ; et Pris, un modèle de plaisir. Le blade runner qui les traquait, c'est celui qu'on a vu se faire tirer dessus par Leon. Deckard ne veut pas reprendre. Bryant lui fait comprendre qu'il n'a pas le choix.

Deckard est un personnage de film noir : un détective solitaire, fatigué, qui boit, qui ne croit plus en grand-chose, et qui va découvrir qu'on lui a menti. Dans la version de 1982, sa voix intérieure commente l'action, comme dans les polars des années 1940. Harrison Ford détestait cette voix ajoutée après le tournage.

# Rachael

Deckard se rend à la Tyrell Corporation, dans l'une des pyramides, pour vérifier que le test fonctionne sur les nouveaux modèles. Eldon Tyrell, le fondateur, un homme mince aux grosses lunettes, le reçoit dans une salle immense baignée par la lumière orange d'un soleil couchant. Il lui demande de faire le test sur son assistante, Rachael.

Rachael est belle, froide, élégante, coiffée et habillée comme une actrice des années 1940. Deckard lui pose plus de cent questions. Il faut beaucoup plus de temps que d'habitude. Puis il conclut : c'est une répliquante. Et elle ne le sait pas.

Tyrell explique. Rachael est une expérience. On lui a implanté les souvenirs de sa nièce. Elle croit avoir eu une enfance, une mère, une vie. Ces souvenirs lui servent de coussin, dit-il en substance : ils rendent les émotions plus stables, plus contrôlables.

Plus tard, Rachael vient chez Deckard pour lui prouver qu'elle est humaine. Elle lui montre une photo d'elle enfant avec sa mère. Deckard, cruellement, lui récite des souvenirs qu'elle n'a jamais racontés à personne : une araignée devant sa fenêtre, des œufs, des petits. Ce sont les souvenirs de la nièce de Tyrell. Rachael pleure. Elle s'en va.

C'est une des scènes les plus terribles du film. Une femme découvre que tout ce qu'elle croyait être sa vie appartient à quelqu'un d'autre.

# Leon et Zhora

Deckard fouille la chambre d'hôtel de Leon. Il y trouve des photos. Les répliquants collectionnent les photos, comme Rachael : ils n'ont pas de passé, alors ils s'en fabriquent un. Sur l'une d'elles, en l'agrandissant avec une machine qui obéit à la voix, en zoomant dans les reflets d'un miroir, Deckard découvre une femme allongée, et une écaille.

L'écaille mène à un serpent artificiel, et le serpent à une boîte de nuit, où Zhora fait un numéro de danse avec lui. Deckard l'aborde, maladroitement, en se faisant passer pour l'employé d'un comité de surveillance des mœurs. Elle comprend, l'attaque, s'enfuit dans la foule. Deckard la poursuit à travers les rues bondées, sous la pluie, et lui tire dans le dos. Elle traverse des vitrines, au ralenti, et tombe au milieu des mannequins.

C'est un meurtre sordide, sans gloire. Le film ne cache pas que Deckard fait un sale métier.

Juste après, Leon le surprend, le désarme, le frappe, et s'apprête à le tuer. Un coup de feu. Leon s'effondre. C'est Rachael qui a tiré. Elle vient de tuer un des siens pour sauver l'homme qui la traque.

# Pris et Sebastian

Pris, pendant ce temps, a trouvé un refuge. Elle s'est cachée près de l'immeuble de J. F. Sebastian, un généticien qui travaille pour Tyrell. Sebastian a vingt-cinq ans mais en paraît beaucoup plus : il souffre d'une maladie qui fait vieillir prématurément. Il vit seul dans un immeuble immense et désert, entouré de jouets vivants qu'il a fabriqués lui-même, des automates qui marchent, parlent et le saluent.

Pris se fait passer pour une jeune fille perdue. Sebastian l'accueille. Puis Roy arrive.

Roy et Pris comprennent que Sebastian partage quelque chose avec eux : il ne vivra pas longtemps non plus. Ils lui demandent de les conduire jusqu'à Tyrell. Sebastian joue aux échecs à distance avec Tyrell. C'est par cette partie que Roy va entrer.

# Le créateur

Roy entre dans la chambre de Tyrell, au sommet de la pyramide, la nuit. Tyrell est en robe de chambre, dans un lit immense entouré de bougies. Il n'a pas peur. Il accueille Roy comme on accueille un fils.

Roy lui demande plus de vie. Il veut vivre plus que quatre ans. Tyrell lui explique, avec patience, pourquoi c'est impossible : chaque tentative pour modifier un organisme vivant une fois qu'il est formé le tue. Il n'y a rien à faire. Il lui dit qu'il a eu une vie brillante, intense, et que la flamme qui brûle deux fois plus fort brûle deux fois moins longtemps.

Roy l'écoute. Il avoue des choses qu'il a faites, des choses dont il n'est pas fier. Tyrell le rassure. Roy l'embrasse. Puis il lui écrase le crâne entre ses mains.

C'est un meurtre de père, un meurtre de dieu. La créature tue son créateur parce qu'il ne peut pas lui donner ce qu'elle demande : du temps.

@yt JVUjHTwIPvY | Une analyse de Blade Runner (en anglais).

# La dernière nuit

Deckard arrive à l'immeuble de Sebastian. Il est seul. Pris l'attend, immobile au milieu des automates, déguisée en poupée, le visage peint en blanc avec une bande noire sur les yeux. Elle l'attaque, acrobatique, féroce. Il finit par l'abattre. Elle se débat longtemps sur le sol, en hurlant, avant de mourir.

Roy revient. Il trouve Pris morte. Il l'embrasse. Puis il commence à chasser Deckard.

C'est l'inversion de tout le film. Le chasseur devient la proie. Roy joue avec lui, le traque dans l'immeuble délabré, à travers les murs, en hurlant comme un loup. Il lui casse deux doigts, pour chacune des deux femmes que Deckard a tuées. Il lui laisse une chance de fuir. Et il commence à mourir : sa main se raidit, il s'enfonce un clou dans la paume pour la garder vivante.

Deckard s'enfuit sur le toit. Il saute vers l'immeuble voisin, rate son saut, et reste suspendu à une poutre, sous la pluie, au-dessus du vide. Roy le rejoint, une colombe blanche dans les bras. Il le regarde lutter. Il lui fait remarquer, en substance, que c'est une sacrée expérience de vivre dans la peur, et que c'est cela, être un esclave.

La main de Deckard glisse. Roy l'attrape et le hisse sur le toit. Il lui sauve la vie.

# Les larmes dans la pluie

Roy s'assoit face à Deckard, sous la pluie, la colombe contre lui. Et il parle.

Il raconte des choses qu'il a vues, et que les humains ne verraient jamais : des vaisseaux en feu au large d'une constellation lointaine, des rayons qui scintillent dans le noir près d'une porte de l'espace. Des noms de lieux qu'on ne connaît pas, et qu'on n'a pas besoin de connaître pour comprendre. Et il dit que tous ces moments vont disparaître avec lui, perdus dans le temps, comme des larmes dans la pluie. Puis il dit qu'il est temps de mourir. Il baisse la tête. La colombe s'envole.

Ce monologue est l'un des plus célèbres du cinéma. Il a une histoire. Le scénario prévoyait un discours plus long. Juste avant le tournage, Rutger Hauer l'a réécrit lui-même, l'a raccourci, et y a ajouté l'image des larmes dans la pluie. Il trouvait que le personnage, au moment de mourir, ne devait pas faire un grand discours, mais dire quelque chose de simple sur ce qu'il a vécu.

Le répliquant, la machine, l'esclave, le meurtrier, meurt en faisant ce que les humains du film ne font jamais : il fait grâce. Il épargne l'homme qui a tué ses amis. Et il pleure non pas sur sa mort, mais sur la perte de ses souvenirs, de ce qu'il a vu, de ce qui faisait de lui quelqu'un. Il est, à cet instant, plus humain que l'humain.

!! CE QUE ROY COMPREND :: Toute sa révolte visait à obtenir plus de temps. Il ne l'a pas eu. Mais dans sa dernière minute, il découvre que ce qui comptait, ce n'était pas la durée, c'était ce qu'il avait vu et ressenti. Et qu'une vie, même courte, même fabriquée, vaut d'être épargnée.

# La licorne

Gaff arrive sur le toit. Il regarde Deckard. Il lui lance, à propos de Rachael, qu'il est dommage qu'elle ne vive pas, mais qu'après tout, qui vit vraiment ?

Deckard rentre chez lui. Rachael est vivante, endormie. Il la réveille. Ils partent ensemble. En sortant, Deckard remarque, posée par terre devant la porte, une petite licorne en papier argenté. Un origami de Gaff. Gaff est venu. Il aurait pu tuer Rachael. Il ne l'a pas fait.

Dans la version de 1982, l'histoire s'arrête sur une fin heureuse : Deckard et Rachael s'enfuient en voiture, à travers des paysages verdoyants, et la voix de Deckard explique que Rachael n'a pas de date limite. Ces plans de montagnes et de forêts ont été pris dans des chutes de tournage du film Shining, de Stanley Kubrick. Le studio avait imposé cette fin après des projections tests où le public s'était montré déconcerté.

Dans les versions suivantes, il n'y a plus de voix, plus de fin heureuse. Les portes de l'ascenseur se ferment sur Deckard et Rachael. Et c'est tout.

# Deckard est-il un répliquant ?

Dans la version de 1992, puis dans The Final Cut de 2007, Ridley Scott a ajouté un plan qui change tout. Pendant que Deckard rêve, assis à son piano, on voit une licorne blanche galoper au ralenti dans une forêt.

À la fin, Gaff laisse une licorne en papier devant sa porte. Comment pouvait-il connaître le rêve de Deckard ? Comme Deckard connaissait les souvenirs de Rachael, parce qu'ils étaient implantés ? Si Gaff connaît les rêves de Deckard, c'est peut-être que Deckard est lui aussi un répliquant.

Ridley Scott a dit et répété que oui, pour lui, Deckard est un répliquant. Harrison Ford a toujours dit le contraire, et pensait jouer un humain. Hampton Fancher, le scénariste, a dit préférer que la question reste ouverte. Le film, lui, ne tranche pas, et c'est sa force : la question de savoir si le chasseur est de la même nature que ses proies est plus intéressante que sa réponse.

# Les versions

Blade Runner existe en plusieurs versions, et cette histoire fait partie du film.

Une version de travail est montrée au public en mars 1982, lors de projections tests. Les réactions sont mauvaises. Le studio fait ajouter la voix de Deckard, écrite par un scénariste qui n'est pas crédité, et la fin heureuse. C'est cette version qui sort aux États-Unis en juin 1982. Une version internationale, à peine différente, contient un peu plus de violence.

En 1992, après la redécouverte d'une copie de travail, le studio sort une version dite du réalisateur, sans voix ni fin heureuse, et avec le rêve de la licorne. Scott y a participé, mais n'a pas eu le temps d'aller au bout.

En 2007, pour les vingt-cinq ans du film, sort The Final Cut. C'est la seule version que Ridley Scott a entièrement contrôlée. Les images sont restaurées, des erreurs corrigées, et c'est celle qu'on recommande aujourd'hui.

# Ce que le film a semé

Quand William Gibson, l'écrivain qui allait inventer le mot cyberespace, est allé voir Blade Runner en 1982, il était en train d'écrire son premier roman, Neuromancien. Il a raconté être sorti de la salle avant la fin, bouleversé, parce que le film ressemblait déjà à ce qu'il avait en tête.

Blade Runner et Neuromancien sont devenus les deux piliers du cyberpunk : des villes saturées d'écrans et de pluie, des entreprises plus puissantes que les États, des êtres artificiels, des marginaux qui survivent dans les interstices. Au Japon, Akira et Ghost in the Shell en reprennent l'imaginaire. Dans le jeu vidéo, il est partout.

En 1993, le film entre au registre national des films des États-Unis, qui conserve les œuvres jugées culturellement importantes. Des cinéastes comme Denis Villeneuve, Christopher Nolan ou Guillermo del Toro l'ont cité parmi leurs influences.

# Black Out 2022

Entre 2019 et 2049, trente ans passent. Pour les raconter, trois courts métrages sont sortis juste avant la suite, en 2017.

Le premier, Black Out 2022, est un film d'animation réalisé par Shinichirō Watanabe, le créateur de Cowboy Bebop. En 2022, les humains persécutent les répliquants. Un petit groupe de Nexus-8, des modèles qui n'ont plus de limite de quatre ans, organise une attaque : une explosion électromagnétique au-dessus de Los Angeles. Pendant des jours, plus aucune machine ne fonctionne. Toutes les données numériques sont effacées. On ne sait plus qui est répliquant et qui ne l'est pas.

Après le Black Out, la fabrication des répliquants est interdite. La Tyrell Corporation fait faillite.

Les deux autres, 2036: Nexus Dawn et 2048: Nowhere to Run, réalisés par Luke Scott, le fils de Ridley, présentent le nouveau maître du monde, Niander Wallace, et un vieux répliquant fugitif, Sapper Morton.

# Blade Runner 2049

En 2017, trente-cinq ans après le premier film, sort Blade Runner 2049, réalisé par le Québécois Denis Villeneuve, qui vient de faire Premier Contact. Le scénario est de Hampton Fancher, revenu, et de Michael Green. La photographie est de Roger Deakins, qui obtient enfin, après de nombreuses nominations, l'Oscar de la meilleure photographie. La musique est de Hans Zimmer et Benjamin Wallfisch. Ridley Scott est producteur.

Le monde a changé. Niander Wallace, un industriel aveugle et mégalomane, a sauvé l'humanité de la famine grâce à une agriculture synthétique, puis a racheté les restes de Tyrell. Il fabrique une nouvelle génération de répliquants, les Nexus-9, conçus pour obéir. Les vieux modèles, eux, sont encore traqués.

Le héros s'appelle K. C'est un blade runner de la police de Los Angeles, joué par Ryan Gosling. Et c'est un répliquant. Il le sait. Tout le monde le sait. Ses collègues le méprisent, les voisins écrivent des insultes sur sa porte. Il chasse les siens, et il obéit.

Le soir, il rentre chez lui, où l'attend Joi, une compagne holographique vendue par la société de Wallace. Elle est tendre, attentive, elle change de robe pour lui faire plaisir. Elle n'existe que dans les murs de son appartement, et dans un petit appareil qu'il porte sur lui.

# L'enfant

Au début du film, K retire un vieux répliquant, Sapper Morton, qui cultive des vers dans une ferme isolée. Sous un arbre mort, il trouve une boîte enterrée. Dedans, des ossements. Ceux d'une femme, morte en accouchant, il y a trente ans. Et sur les os, un numéro de série : c'était une répliquante.

Une répliquante a eu un enfant. C'est impossible. C'est le miracle que Tyrell avait cherché et que Wallace cherche à son tour, pour fabriquer des répliquants capables de se reproduire, et donc d'en produire autant qu'il le voudra. La supérieure de K, le lieutenant Joshi, lui ordonne de trouver l'enfant et de le faire disparaître, avant que la nouvelle ne détruise le fragile équilibre du monde.

La femme s'appelait Rachael.

K commence l'enquête. Et à mesure qu'il avance, il découvre des détails qui le concernent. Un petit cheval de bois, sculpté, dont il a le souvenir depuis toujours, un souvenir d'enfance qu'il croyait implanté. Une date gravée dessus. Un orphelinat. K commence à croire que l'enfant, c'est lui. Qu'il est né. Qu'il a une âme. Joi l'appelle désormais Joe.

Une spécialiste en fabrication de souvenirs, le docteur Ana Stelline, qui vit enfermée dans une bulle stérile à cause d'un système immunitaire défaillant, examine son souvenir. Elle se met à pleurer. Ce souvenir est réel. Quelqu'un l'a vécu.

# Deckard

K retrouve Deckard, vieilli, réfugié dans les ruines radioactives de Las Vegas, avec un chien, dans un ancien casino où des hologrammes d'Elvis Presley et de Frank Sinatra chantent dans le vide. Deckard était le père. Il a laissé l'enfant pour le protéger, et ne l'a jamais connu.

Luv, l'assistante répliquante de Wallace, une tueuse redoutable, retrouve K et enlève Deckard. Joi est détruite. Wallace propose à Deckard une nouvelle Rachael, identique, recréée. Deckard refuse : elle n'a pas les bons yeux.

K est recueilli par la résistance des répliquants. Leur chef, Freysa, était là quand l'enfant est né. Elle lui apprend la vérité. L'enfant était une fille. Ce n'est pas lui. Son souvenir a été copié dans d'autres têtes pour brouiller les pistes. Il n'est pas l'élu. Il n'est personne de spécial.

Dans la rue, une immense publicité holographique pour Joi se penche vers lui, nue, bleue, et l'appelle Joe, comme le faisait la sienne. Il comprend que tout ce qu'elle lui disait était peut-être un programme vendu à des millions d'exemplaires. Ou peut-être pas. Le film ne tranche pas.

# Sous la neige

K décide quand même d'agir. Il intercepte le convoi qui emmène Deckard, combat Luv dans l'eau glacée, au pied d'une digue, la tue, et sauve Deckard. Il est gravement blessé.

Il conduit Deckard jusqu'au bâtiment où travaille le docteur Ana Stelline. C'est elle, la fille de Deckard et de Rachael. La première enfant née d'une répliquante. Elle vit enfermée, mais elle fabrique, pour tous les répliquants, les souvenirs qui les rendent humains. Le souvenir du cheval de bois était le sien.

Deckard entre. Il pose la main sur la vitre de la bulle où sa fille fait tomber une neige artificielle.

K, lui, est resté dehors. Il s'allonge sur les marches, sous la vraie neige, et regarde ses mains. On entend, dans la musique, le thème de Vangelis qui accompagnait la mort de Roy.

# Ce que 2049 répond

Blade Runner demandait : un être artificiel peut-il être humain ? 2049 pose une question plus dure : faut-il être spécial pour que sa vie compte ?

K passe le film à croire qu'il est l'élu, l'enfant né, le miracle. Il découvre qu'il ne l'est pas. Il n'est qu'un répliquant parmi d'autres, avec un souvenir emprunté. Et c'est précisément à ce moment qu'il fait son seul acte vraiment libre : il sauve un homme qui n'est pas son père et le conduit vers une fille qui n'est pas sa sœur. Personne ne le lui ordonne. Personne ne le saura.

Le film, très long, très lent, très beau, ne rapporte pas l'argent espéré. Il remporte deux Oscars, pour la photographie et les effets visuels. Comme le premier, il a gagné ses admirateurs avec le temps.

@yt pJPN5zrg7rI | L'humanité de Blade Runner 2049 (en anglais).

!! CE QUE LA SAGA DIT :: Roy épargne Deckard. K sauve Deckard. Dans les deux films, le geste le plus humain est accompli par un répliquant, au moment où il n'a plus rien à gagner. La saga ne dit pas ce qu'est un humain. Elle montre ce qu'il fait.

# Les autres Blade Runner

Il existe d'autres prolongements. En 1997, le studio américain Westwood sort un jeu d'aventure et d'enquête, Blade Runner. On y incarne Ray McCoy, un autre blade runner, qui traque d'autres répliquants pendant les mêmes jours que Deckard, en croisant les lieux et les personnages du film. Le jeu a plusieurs fins, selon que McCoy décide d'être humain ou répliquant, de chasser ou de fuir.

En 2021, une série d'animation, Blade Runner: Black Lotus, se passe en 2032. Son héroïne est une répliquante, Elle, qui se réveille sans mémoire et cherche à savoir qui elle est.

Philip K. Dick, lui, a écrit bien d'autres histoires adaptées au cinéma, comme les nouvelles qui ont donné Total Recall et Minority Report. Mais aucune n'a eu le destin de son roman aux moutons électriques.

# Ce que tu peux en prendre

Blade Runner t'apprend que le décor peut être le sujet. Los Angeles en 2019, avec sa pluie, ses néons, ses langues mêlées, ses publicités pour une vie meilleure ailleurs, raconte déjà toute l'histoire : un monde où la technologie a tout envahi sauf l'essentiel.

Il t'apprend à donner au méchant la plus belle scène. Roy Batty commence comme un tueur. Il finit en poète. Ce retournement ne vient pas d'un discours, mais d'un geste : tendre la main. Le spectateur change de camp en une seconde.

Il t'apprend aussi que les acteurs peuvent écrire. Les plus beaux mots du film ne viennent pas du scénario mais de Rutger Hauer, qui a compris mieux que tout le monde ce que son personnage devait dire en mourant : peu de choses, et vraies.

Il t'apprend qu'un échec n'est pas une fin. Le film a raté sa sortie. Il a été remonté, réévalué, redécouvert, jusqu'à devenir un des films les plus influents de l'histoire. Une œuvre a parfois besoin de temps pour trouver son public.

Et 2049 t'apprend qu'une suite peut répondre au lieu de répéter. Villeneuve n'a pas refait Blade Runner. Il lui a posé une nouvelle question, et a donné à un personnage ordinaire, sans destin, la plus belle fin de la saga.
`,
};
export default book;
