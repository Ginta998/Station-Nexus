const book = {
  id: "final-fantasy-xii", title: "Final Fantasy XII", sub: "The Zodiac Age · Ivalice", room: "lore", type: "recit", cote: "LO-053", color: 38, emblem: "黄",
  art: "Final Fantasy XII: The Zodiac Age",
  about: "Deux empires, des royaumes broyés entre eux, une princesse qu'on croit morte, un orphelin qui rêve de ciel, deux pirates, un chevalier accusé d'un meurtre qu'il n'a pas commis, et des dieux qui écrivent l'histoire en secret. Le monde d'Ivalice selon Yasumi Matsuno, illustré par les artworks de SteamGridDB.",
  links: [
    { label: "Final Fantasy XII: The Zodiac Age (2017)", note: "La version à jouer : les douze métiers, la musique réenregistrée, le mode accéléré." },
    { label: "Final Fantasy Tactics (1997) et Vagrant Story (2000)", note: "Les deux autres grands récits d'Ivalice, par la même équipe. Tactics est le chef-d'œuvre de Matsuno." },
    { label: "Final Fantasy XII Original Soundtrack, Hitoshi Sakimoto", note: "La bande originale, dans sa version de 2006 ou réenregistrée pour The Zodiac Age." },
    { label: "Final Fantasy XII Ultimania Omega et les artbooks du jeu", note: "Les livres d'art et de données publiés au Japon, avec les dessins d'Akihiko Yoshida et les décors de Minaba et Kamikokuryo." },
    { label: "Final Fantasy XII: Revenant Wings (2007)", note: "La suite sur Nintendo DS, un an après la fin, avec Vaan et Penelo." },
    { label: "Les artworks Final Fantasy XII sur SteamGridDB", url: "https://www.steamgriddb.com/search/heroes?term=Final%20Fantasy%20XII%20The%20Zodiac%20Age", note: "Les images qui illustrent ce livre, et bien d'autres, choisies et partagées par la communauté." },
  ],
  text: String.raw`
# Avant de commencer, et ceux qui l'ont fait

Il y a des Final Fantasy qui racontent l'histoire d'un héros. Celui-ci raconte l'histoire d'un monde.

On l'a souvent mal compris à sa sortie. On attendait un jeune homme élu, une grande histoire d'amour, un méchant qui veut détruire l'univers. On a trouvé une guerre entre empires, des royaumes coincés entre deux puissances, des intrigues de palais, des sénateurs, des juges en armure, des pirates du ciel, et un garçon des rues, Vaan, qui n'est pas vraiment le centre de l'histoire. Les joueurs ont mis des années à comprendre que c'était voulu. Final Fantasy XII ressemble moins à un conte qu'à une chronique politique, quelque part entre Star Wars, les tragédies de Shakespeare et l'histoire de la Méditerranée.

@art 1 | Ivalice, vu par les artistes qui ont prêté leurs images à SteamGridDB.

Le jeu est né dans la tête de Yasumi Matsuno. C'est l'un des auteurs les plus singuliers du jeu vidéo japonais. Avant de rejoindre Square, il avait créé Tactics Ogre, un jeu de stratégie où la guerre civile, le nettoyage ethnique et la trahison étaient racontés avec une gravité rare. Chez Square, il a fait Final Fantasy Tactics, en 1997, puis Vagrant Story, en 2000. Les deux se passent dans un même monde, qu'il a appelé Ivalice. Un monde de royaumes médiévaux, de religions organisées, de magie et de machines anciennes, où les puissants manipulent les faibles et où les héros découvrent que l'Histoire officielle est un mensonge.

Final Fantasy XII devait être son grand œuvre : un Final Fantasy entier situé dans Ivalice. Le développement a commencé vers 2001 et a duré près de cinq ans. Il a été long, difficile. En 2005, Matsuno a quitté le projet, officiellement pour raisons de santé, puis l'entreprise. Le jeu a été achevé par d'autres : Hiroyuki Ito, le créateur du système de combat en temps actif des anciens Final Fantasy, et Hiroshi Minagawa, qui avait travaillé avec Matsuno depuis Tactics Ogre, en ont pris la direction. On a dit que l'histoire avait été raccourcie, que certaines idées avaient disparu en route. On ne sait pas exactement ce que Matsuno aurait fait de la fin. On sent, dans le jeu, l'ampleur de ce qui avait été prévu.

L'équipe artistique est celle de Vagrant Story. Akihiko Yoshida dessine les personnages : des silhouettes longues, des visages fins, des costumes mêlant le médiéval, l'oriental et le baroque. Hideo Minaba et Isamu Kamikokuryo dirigent l'art des décors. Pour imaginer Rabanastre et les villes d'Ivalice, l'équipe s'est inspirée de la Méditerranée, de l'Inde, et surtout de la Turquie : on dit que plusieurs membres ont voyagé à Istanbul pour en rapporter des images. On le voit dans les coupoles, les bazars, les tissus, la lumière poudreuse du désert.

La musique est d'Hitoshi Sakimoto, le compositeur fidèle de Matsuno, celui de Tactics et de Vagrant Story. Pour la première fois dans la série principale, Nobuo Uematsu n'a pas écrit la bande originale : il n'a signé qu'une chanson, le thème de fin, Kiss Me Good-Bye, chantée par Angela Aki. Sakimoto, lui, a écrit une partition orchestrale ample, faite de cuivres et de cordes, plus proche de la musique de film que de la mélodie de jeu. Le scénario a été écrit avec Daisuke Watanabe et Miwa Shoda.

Le jeu sort en 2006 au Japon et en Amérique du Nord, au début de 2007 en Europe, sur PlayStation 2. Il reçoit des critiques enthousiastes, et le magazine japonais Famitsu lui donne la note parfaite. Puis il divise le public : son système de combat, ses personnages, sa fin. En 2007, une version japonaise enrichie, International Zodiac Job System, remplace le grand plateau de compétences commun par douze métiers liés aux signes du zodiaque.

C'est cette version qui a été remastérisée en 2017, sous le nom de The Zodiac Age, pour PlayStation 4, puis pour ordinateur en 2018, et pour les consoles suivantes en 2019. Les graphismes ont été refaits, la musique réenregistrée par un orchestre, et l'on peut accélérer le temps du jeu, ce qui a changé la vie de tous ceux qui chassaient les monstres rares. C'est par cette version que beaucoup de joueurs ont découvert, ou redécouvert, l'un des mondes les plus riches de toute la série.

Je vais te raconter ce monde. Je te préviens que je raconte tout, la fin comprise.

# Ivalice : deux empires et des royaumes au milieu

Commence par une carte. Au nord-ouest, l'empire d'Archadia, dont la capitale, Archadès, est une ville verticale de tours et de quartiers suspendus, où les riches vivent en haut, les pauvres en bas, et où personne ne regarde le sol. L'empire est gouverné par une dynastie, la maison Solidor, et par un Sénat qui la surveille et la jalouse. Il est puissant, organisé, technique. Ses vaisseaux du ciel sont les meilleurs du monde, ses laboratoires les plus avancés, sa police impitoyable.

À l'est, l'empire de Rozarria, son rival, gouverné par la maison Margrace. On ne le visite presque pas pendant le jeu, mais on sent sa présence partout, comme on sent une armée de l'autre côté d'une frontière. Un de ses princes, un séducteur nonchalant nommé Al-Cid Margrace, traverse l'histoire en observateur. Les deux empires se préparent depuis des années à une guerre. Ils ne se touchent pas directement. Entre eux, il y a des royaumes.

Ce sont eux, les vrais personnages du jeu. Le royaume de Landis, déjà conquis par Archadia avant le début de l'histoire. Le royaume de Nabradia, allié de Dalmasca. Et le royaume de Dalmasca, une petite monarchie du désert, dont la capitale, Rabanastre, est une ville marchande aux coupoles blanches, traversée de caravanes. Dalmasca n'a ni grande armée ni grande industrie. Elle a une position, au carrefour des routes, et c'est ce qui la condamne : pour que l'une des puissances attaque l'autre, il faut d'abord passer par elle.

@art 2 | Les cités d'Ivalice : des coupoles, des tours, des ponts suspendus.

Ivalice n'est pas peuplé que d'humains, qu'on appelle les Humes. Il y a les Bangaa, grands êtres reptiliens aux longues oreilles pendantes, marchands, mercenaires, chasseurs de primes. Les Seeq, massifs et porcins, souvent voyous. Les Moogles, petits êtres ailés, ingénieurs et mécaniciens. Et les Viera, grandes femmes aux longues oreilles, qui vivent depuis des siècles dans une forêt, à l'écart de tout, et qui ne quittent presque jamais leur village. Les races cohabitent dans les villes, avec leurs préjugés et leurs quartiers.

Le monde marche à la magie et à la pierre. Il existe une substance, la magicite, qui contient de l'énergie magique : on s'en sert pour lancer des sorts, mais aussi pour faire voler les navires et tourner les machines. Les vaisseaux du ciel d'Ivalice flottent grâce à elle, et le ciel est sillonné de navires de commerce, de croiseurs de guerre, de petits bâtiments de pirates.

Et il y a une autre pierre, bien plus rare, la néthicite. La néthicite fait l'inverse de la magicite : elle absorbe l'énergie magique autour d'elle. Une petite quantité suffit à vider un lieu de toute magie ; une grande quantité, si on la libère, peut détruire une ville entière. Il en existe des fragments très anciens, appelés néthicites déifactes, d'une puissance inouïe. Toute l'histoire tourne autour d'eux.

Car il y a une légende fondatrice. Il y a sept siècles, un homme, le roi Raithwall, a unifié Ivalice. On l'appelle le Roi-Dynaste. On dit qu'il a reçu des dieux trois pierres de néthicite, le Fragment de l'Aube, le Fragment du Crépuscule et le Fragment de Minuit, et qu'il s'en est servi pour soumettre ses ennemis. À sa mort, son empire a été partagé entre ses héritiers. Les grandes maisons royales d'Ivalice descendent de lui, dont celle de Dalmasca. Et les fragments ont été cachés, chacun dans un royaume.

Ce que la légende ne dit pas, et que tu découvriras, c'est qui étaient ces dieux.

# Rabanastre, deux ans après

Le jeu commence par une guerre perdue.

Archadia a envahi Nabradia. La capitale nabradienne, Nabudis, a été anéantie en une nuit par une explosion de lumière dont personne ne connaît l'origine. Puis l'empire a marché sur Dalmasca. À la forteresse de Nalbina, qui garde la frontière, l'armée dalmasquienne a tenté de résister. Le prince Rasler, l'héritier de Nabradia, venait d'épouser la princesse de Dalmasca, Ashe : un mariage d'amour et d'alliance. Il est tombé à Nalbina, d'une flèche, sous les yeux de ses soldats. La forteresse est tombée avec lui.

Le roi de Dalmasca, Raminas, a alors accepté de signer la paix, c'est-à-dire la reddition. Pendant la nuit de la signature, il a été assassiné. Les témoins ont désigné le coupable : un capitaine dalmasquien, Basch fon Ronsenburg, un chevalier venu de Landis, connu pour sa loyauté. On a annoncé son exécution. Quelques jours plus tard, on a annoncé la mort de la princesse Ashe, qu'on disait suicidée de chagrin. Dalmasca est devenue une province de l'empire.

C'est la scène d'ouverture du jeu, et tu la vis à travers un jeune soldat, Reks, qui assiste à l'assassinat du roi et voit le visage du coupable. Il meurt peu après de ses blessures. Il avait un petit frère.

Deux ans plus tard, ce petit frère s'appelle Vaan. Il a dix-sept ans. Il est orphelin, il vit dans la ville basse de Rabanastre, sous les rues, avec d'autres gamins. Il vole de quoi manger aux soldats impériaux, et il rêve de posséder un vaisseau et de devenir pirate du ciel. Son amie Penelo, une danseuse qui a perdu ses frères à la guerre, essaie de le garder dans le droit chemin. Il hait l'empire et il hait Basch, l'homme qui, croit-il, a tué le roi et causé la mort de Reks.

Rabanastre, au début du jeu, est une ville occupée. Des soldats en armure circulent dans les rues, les Bangaa font leurs affaires, les marchands parlent bas. Et ce jour-là, un nouveau consul impérial arrive pour gouverner la ville : Vayne Carudas Solidor, le fils aîné de l'empereur d'Archadia. Il prononce un discours habile, promet la paix et la prospérité, et une partie de la foule l'applaudit.

Vaan, lui, décide de voler le palais pendant la réception. Il se glisse dans les sous-sols, trouve la salle du trésor, et y prend une pierre qui brille d'une lumière étrange. Il ne sait pas ce que c'est. C'est le Fragment de l'Aube, la néthicite de Raithwall.

Au même moment, deux autres voleurs sont dans le palais, venus pour la même pierre : un jeune homme élégant, ironique, qui parle comme un héros de roman, Balthier, et sa compagne, une Viera silencieuse et grande, Fran. Ce sont de vrais pirates du ciel, propriétaires d'un vaisseau rapide, le Strahl. Et pendant que les trois se croisent, la résistance dalmasquienne attaque le palais. Dans la confusion, Vaan rencontre une jeune femme de la résistance qui se fait appeler Amalia.

Ils fuient ensemble par les égouts. Ils sont arrêtés. On les jette dans les cachots de Nalbina. Et là, au fond d'une cage suspendue, ils trouvent un prisonnier qu'on croyait mort depuis deux ans : Basch.

@art 3 | Rabanastre, la ville du désert, ses coupoles et ses bazars.

Basch jure qu'il n'a pas tué le roi. Il dit que l'assassin portait son visage. Qu'il avait un frère jumeau, Noah, qui a servi Archadia et qui est devenu l'un de ses Juges, sous le nom de Gabranth. Que ce frère a tué le roi en se faisant passer pour lui. Vaan ne le croit pas. Il veut le frapper. Il a besoin de lui pour sortir. Ils s'évadent ensemble.

Et la jeune femme de la résistance révèle qui elle est. Amalia n'existe pas. C'est Ashe, la princesse de Dalmasca, qu'on a déclarée morte. Elle a passé deux ans cachée, à diriger une résistance impuissante. Elle cherche la preuve de son sang royal, que l'empire lui a prise, pour pouvoir se faire reconnaître et réclamer son trône. Cette preuve, c'est précisément la pierre que Vaan a volée.

Voilà le groupe formé, par hasard, comme dans les vieux récits d'aventure. Un orphelin et son amie, deux pirates, un chevalier déshonoré, une princesse sans royaume. Personne n'a choisi les autres. Ils vont traverser Ivalice ensemble, et le monde va changer autour d'eux.

# La maison Solidor et les Juges

Il faut maintenant regarder l'empire de près, parce qu'il est le vrai moteur de l'histoire.

L'empereur d'Archadia s'appelle Gramis Gana Solidor. Il est vieux, malade, et il sait que le Sénat attend sa mort pour réduire le pouvoir de sa famille. Il a deux fils vivants. L'aîné, Vayne, celui qui gouverne Rabanastre, a autrefois été le général le plus brillant de l'empire ; on dit qu'il a fait exécuter deux de ses frères aînés pour trahison, sur l'ordre de son père. Le cadet, Larsa, a douze ans. C'est un enfant d'une maturité étonnante, curieux, poli, sincèrement attaché à la paix. Il traverse l'histoire en cherchant à comprendre ce que fait son frère, qu'il admire.

Vayne est l'un des antagonistes les plus intéressants de la série. Il n'est pas fou, il n'est pas cruel par plaisir, il ne veut pas détruire le monde. Il est convaincu que l'histoire d'Ivalice a toujours été dirigée par d'autres que les hommes, et que le temps est venu que les hommes la reprennent. Il veut la puissance pour cela, et il est prêt à tout pour l'obtenir : tuer, trahir, mentir, sacrifier des villes. Il est charismatique, intelligent, d'un calme effrayant. Il aime sincèrement son petit frère.

L'empire tient par les Juges. Ce sont les soldats d'élite de l'empereur, à la fois juges, policiers et généraux. Ils portent des armures intégrales aux casques monumentaux, et l'on ne voit jamais leur visage. Au-dessus d'eux, cinq Juges-Magistères, les plus hauts gradés, répondent directement à la maison Solidor. L'un d'eux s'appelle Gabranth. C'est le frère de Basch. Il a choisi l'empire quand Landis, leur pays natal, a été conquis, tandis que son frère choisissait de fuir et de servir Dalmasca. Il hait son frère d'une haine faite de jalousie et de culpabilité. Il a été chargé de protéger Larsa, et il s'y attache.

@art g 1 | Une affiche du jeu : les personnages, les uniformes, les armures des Juges.

Et puis il y a les laboratoires. À Archadès se trouve Draklor, le grand laboratoire de l'empire. Il est dirigé par le docteur Cidolfus Demen Bunansa, qu'on appelle simplement le docteur Cid. Un homme brillant, excentrique, qui parle tout seul, comme s'il conversait avec quelqu'un d'invisible. Cid a percé le secret de la néthicite : il sait en fabriquer. La néthicite artificielle, moins puissante que les fragments de Raithwall, permet de construire des armes qui absorbent la magie et la relâchent d'un coup. C'est elle qui a anéanti Nabudis : on y a fait l'essai du Fragment de Minuit, la néthicite de Nabradia, et la ville a disparu.

Et voici le secret que Balthier porte depuis le début. Balthier n'est pas son vrai nom. Il s'appelle Ffamran Mied Bunansa. Il est le fils du docteur Cid. Il était Juge, autrefois, au service de l'empire. Il a vu son père changer, devenir obsédé par la néthicite et par la voix qu'il entend, et il s'est enfui pour devenir pirate. Il joue au héros insouciant pour ne pas avoir à être le fils de cet homme. Quand il le retrouve, le jeu lui donne ses plus belles scènes.

Car Cid ne parle pas tout seul. Il parle à Venat. Venat est un être immortel, invisible pour presque tous, qui a quitté les siens pour aider les humains. C'est Venat qui a soufflé à Cid les secrets de la néthicite. Et c'est par Venat qu'on comprend enfin ce qu'est Ivalice.

# Les Occuria et le refus d'Ashe

Les dieux qui ont donné les fragments à Raithwall existent. Ils s'appellent les Occuria. Ce sont des êtres immortels qui vivent à l'écart, dans une cité cachée nommée Giruvegan. Depuis des millénaires, ils guident l'histoire des humains. Ils choisissent un roi, lui donnent la puissance, le laissent unifier le monde, puis l'abandonnent quand il ne leur sert plus. Raithwall était leur instrument. L'histoire d'Ivalice, avec ses dynasties, ses guerres et ses paix, a été en grande partie écrite par eux.

Venat est une Occuria qui a refusé ce rôle. Elle pense que les humains doivent écrire leur histoire eux-mêmes. Pour cela, il faut briser le pouvoir des Occuria, et donc leur arme : la néthicite. En aidant Cid à fabriquer de la néthicite artificielle, Venat donne aux humains une puissance qui ne dépend plus des dieux. Et c'est Vayne, l'héritier des Solidor, que Venat et Cid ont choisi pour la porter. Vayne n'est donc pas seulement un tyran ambitieux. C'est un homme qui veut libérer l'humanité de ses maîtres invisibles, et qui le fait par la conquête.

Pendant ce temps, Ashe avance. Elle a retrouvé le Fragment de l'Aube. Elle a visité le tombeau de Raithwall, dans le désert, et y a reçu la pierre de son ancêtre. Elle a vu, avec horreur, ce que la néthicite pouvait faire, quand un vaisseau de guerre impérial a été détruit d'un seul coup par la puissance du fragment. Elle a été trahie par son plus fidèle chevalier, Vossler, qui s'était allié à l'empire en croyant sauver Dalmasca par un compromis. Elle a erré, avec ses compagnons, de royaume en royaume.

Et elle arrive à Giruvegan. Les Occuria la reçoivent. Ils lui proposent ce qu'ils ont proposé à Raithwall. Elle est son héritière. Ils lui donnent une arme, l'Épée des Rois, capable de tailler de nouveaux fragments dans la grande source de la néthicite, le Cristal solaire, qui se trouve au sommet d'une tour antique, le Pharos de Ridorana. Avec cette puissance, elle pourra détruire Archadia. Venger son père, son mari, son peuple. Reprendre son royaume. Devenir la nouvelle reine-instrument d'Ivalice.

Tout au long du voyage, Ashe a vu apparaître devant elle le fantôme de Rasler, son mari mort. Il ne parle pas. Il la regarde, il lui montre la direction. Elle croit que c'est l'esprit de Rasler qui la guide vers la vengeance. Elle découvre que ce sont les Occuria qui lui envoient cette image, pour la pousser là où ils le veulent.

!! LE CHOIX D'ASHE :: Au sommet du Pharos, devant le Cristal solaire, Ashe a le pouvoir de détruire l'empire qui a tué tous les siens. Elle refuse. Elle comprend que la vengeance ferait d'elle une autre Archadia, et une servante des Occuria. Elle brise le Cristal solaire, pour que personne, ni elle, ni Vayne, ni les dieux, ne puisse plus jamais s'en servir.

C'est le cœur du jeu. Toute l'histoire est construite pour amener une princesse à renoncer à la vengeance qui lui est due. Les joueurs qui attendaient un héros triomphant ont été déroutés. Ceux qui y reviennent y voient l'un des récits les plus mûrs de la série : une femme qui choisit de ne pas devenir ce qu'elle combat.

Le docteur Cid meurt au pied du Pharos, vaincu par son propre fils, après un combat où il refuse jusqu'au bout de se reconnaître dans Balthier. Mais Vayne a déjà pris ce qu'il voulait. Il a reçu, avec l'aide de Venat, une puissance fondée sur la néthicite artificielle, et il a une forteresse.

# Bahamut

Entre-temps, à Archadès, l'empereur Gramis est mort. Empoisonné. Vayne a accusé le Sénat, a fait exécuter les sénateurs qui s'opposaient à lui, et a pris le trône. Larsa, qui a compris, se tourne vers Ashe. La guerre entre Archadia et Rozarria est sur le point d'éclater, et Vayne veut la commencer en écrasant ce qui reste de résistance à Rabanastre.

Il a pour cela le Bahamut. C'est une forteresse volante gigantesque, un vaisseau de guerre de la taille d'une ville, alimenté par la néthicite artificielle de Cid. Il plane au-dessus de Rabanastre, prêt à anéantir la capitale de Dalmasca comme Nabudis a été anéantie.

Les alliés d'Ashe rassemblent une flotte de fortune. La résistance dalmasquienne, des navires du marquis Ondore, qui gouverne une cité libre suspendue dans le ciel, Bhujerba, et qui fut longtemps l'allié ambigu de tout le monde. Une bataille aérienne s'engage autour du Bahamut. Vaan et ses compagnons montent à bord.

@art 4 | Le ciel d'Ivalice, ses vaisseaux et ses forteresses volantes.

Dans la forteresse, ils affrontent d'abord Gabranth. Le Juge, déchiré entre son serment et ce qu'il a vu de Vayne, finit par se retourner contre son maître pour protéger Larsa. Il meurt réconcilié avec son frère. Puis ils affrontent Vayne lui-même. Il se bat avec une puissance démesurée, puis fusionne avec Venat et avec la machine, et devient une créature ailée de lumière et de métal. Il tombe. Il dit, en mourant, quelque chose qui ressemble à un regret de ne pas avoir pu achever ce qu'il voulait pour les hommes.

Le Bahamut, privé de son maître, commence à tomber sur Rabanastre. Pour l'éviter, Balthier et Fran restent à bord. Ils réparent ce qu'ils peuvent, détournent la forteresse, qui s'écrase loin de la ville. On les croit morts.

L'épilogue se déroule quelque temps plus tard. Ashe est couronnée reine de Dalmasca. Larsa est devenu empereur d'Archadia, et la paix est signée avec Rozarria. Basch, que le monde croit toujours mort, a pris l'identité de son frère : il porte l'armure de Gabranth, sous le nom de Juge Noah, et il protège désormais Larsa, comme son frère l'avait fait. Personne, dans l'empire, ne sait qui est sous le casque.

Et Vaan et Penelo sont devenus pirates du ciel, avec leur propre petit vaisseau. Penelo reçoit une lettre. Balthier et Fran sont vivants. Ils ont repris le Strahl, que Vaan avait gardé pour eux, et ils sont repartis vers de nouvelles aventures, en laissant un mot qui dit, en substance, qu'ils reviendront un jour le chercher. Le jeu se termine dans le ciel.

On comprend alors pourquoi Vaan n'est pas le héros. Il est le témoin. Celui qui a vu l'histoire passer, qui y a participé à sa place, et qui en est sorti libre de faire sa vie. Matsuno a fait du personnage principal un regard, comme ces narrateurs de roman qui racontent la vie d'un grand homme. Le grand homme, ici, c'est une princesse qui a renoncé à se venger, un chevalier qui a pris le nom de son frère, un pirate qui a tué son père. Vaan a regardé. Toi aussi.

Une suite, Revenant Wings, sortie en 2007 sur Nintendo DS, raconte une aventure de Vaan et Penelo un an plus tard. Les fans d'Ivalice s'accordent à dire que l'essentiel est dans le premier jeu.

# Le jeu lui-même : gambits, permis et chasses

Il faut parler de la manière de jouer, parce que c'est aussi par elle que Final Fantasy XII raconte son monde.

Pour la première fois dans la série principale, il n'y a pas d'écran de combat séparé. Les monstres sont visibles dans le paysage, et l'on se bat là où on les rencontre, sans transition. Le monde paraît ainsi continu, vaste, vivant, comme dans les jeux en ligne qui se développaient à l'époque. On traverse des plaines immenses, des déserts, des forêts, des marais, des mines, avec des créatures qui vivent leur vie autour de soi.

Les combats se jouent avec des gambits. Ce sont des règles qu'on donne à chaque personnage, sous la forme : si telle situation, alors telle action. Si un allié a moins de la moitié de sa santé, le soigner. Si un ennemi est vulnérable au feu, lui lancer un sort de feu. Si un allié est mort, le ranimer. On empile ces règles par ordre de priorité, et les personnages se battent seuls. Le joueur devient un stratège qui programme son équipe, puis la regarde agir, et corrige. Beaucoup ont trouvé cela froid. D'autres y voient l'un des systèmes les plus intelligents jamais inventés dans un jeu de rôle : on ne joue plus chaque coup, on pense la bataille.

@art 5 | Une scène du jeu, partagée sur SteamGridDB.

Pour progresser, chaque personnage dispose d'un tableau de permis : une grille de cases qu'on débloque avec des points gagnés au combat, et qui donnent le droit d'utiliser une arme, une armure, un sort, une compétence. Dans la version d'origine, tous les personnages partageaient le même grand tableau, et finissaient par tous savoir tout faire. The Zodiac Age a remplacé ce système par douze métiers, chacun lié à un signe du zodiaque : le chevalier, le moine, le mage blanc, le mage noir, l'archer, le machiniste, le bushi, et d'autres. Chaque personnage peut en prendre deux. Cela oblige à faire des choix, à composer une équipe, et cela a donné au jeu une profondeur stratégique que beaucoup de joueurs trouvent supérieure à l'original.

Il y a les chasses. Dans les tavernes d'Ivalice, on trouve des avis de recherche affichés par des habitants qui veulent qu'on les débarrasse d'un monstre. Un clan de chasseurs, dirigé par un Moogle du nom de Montblanc, centralise ces contrats. Chaque chasse est une petite histoire : un fermier dont le troupeau est menacé, un marchand qui a perdu sa cargaison, un vieillard qui veut venger un ami. Certaines chasses mènent vers des monstres d'une puissance démesurée, cachés au fond du monde, qu'on met des dizaines d'heures à vaincre.

Il y a les invocations. Dans Final Fantasy XII, on les appelle les Esper. Ce sont des démons anciens, que les dieux ont enfermés pour les punir de leur orgueil, et qu'on peut affronter puis appeler à l'aide. Leurs noms viennent de Final Fantasy Tactics, où ils étaient les Lucavi, les démons du zodiaque : Bélias, Mateus, Adrammelech, Zalera, Zeromus, Ultima, et Zodiark, le plus puissant, caché au plus profond du monde. C'est l'un des signes que XII et Tactics partagent le même Ivalice, à des époques différentes.

Il y a enfin la musique, que The Zodiac Age a réenregistrée avec un orchestre, et qu'on peut écouter dans sa version d'origine ou dans la nouvelle. Les thèmes de Sakimoto donnent à chaque lieu son caractère : la marche majestueuse de l'empire, les cuivres de Rabanastre, les plaines immenses, les donjons pleins de chœurs.

Et l'on peut, dans The Zodiac Age, accélérer le jeu. Quatre fois plus vite. Cela semble un détail. C'est ce qui a permis à toute une génération de joueurs de traverser Ivalice en entier, chasses comprises, sans y perdre une année.

@yt GhcSQ_92DKs | Le problème du héros de Final Fantasy XII : pourquoi Vaan n'est pas le centre de l'histoire (en anglais).

# Ce que tu peux en prendre

Quatre choses.

La première est le héros-témoin. Matsuno a pris un risque énorme : mettre au centre un garçon qui n'est pas le moteur de l'histoire. On le lui a reproché. Mais ce choix permet de raconter une histoire politique à hauteur d'homme, par quelqu'un qui n'en comprend pas tout au début et qui apprend en même temps que le spectateur. Quand ton sujet est un monde, une guerre, une époque, demande-toi si le meilleur personnage pour le raconter n'est pas celui qui le regarde.

La deuxième est l'antagoniste qui a raison sur un point. Vayne veut libérer l'humanité de ses dieux. C'est une cause juste. Il la sert par le meurtre, la guerre et le mensonge. Ashe, de son côté, a toutes les raisons de se venger, et elle y renonce. Le jeu oppose ainsi deux personnes qui ont toutes deux de bonnes raisons, et les départage par ce qu'elles sont prêtes à faire. C'est ce qui rend un conflit adulte.

La troisième est le monde qui existe sans toi. Ivalice a ses races, ses économies, ses religions, ses frontières, ses tavernes, ses avis de chasse, ses rumeurs. Tout cela existe même quand le récit ne s'en sert pas. Le joueur le sent, et il croit au reste. Si tu construis un univers, laisse-y des choses qui ne servent pas l'intrigue : ce sont elles qui le rendent vrai.

La quatrième est le renoncement comme victoire. La plus grande scène du jeu n'est pas une bataille gagnée, c'est une arme brisée. Une princesse qui pouvait tout détruire et qui choisit de ne pas le faire. Au cinéma comme ailleurs, le moment où un personnage refuse ce qu'on attendait de lui reste souvent plus fort que celui où il l'accomplit.

@yt OMqeDQ8Ktqg | L'empire de Rozarria et le monde d'Ivalice, une chaîne consacrée au lore (en anglais).

@art 6 | Pour finir, un autre regard d'artiste sur Ivalice.
`,
};
export default book;
