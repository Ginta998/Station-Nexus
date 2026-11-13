const book = {
  id: "elden-ring", title: "Elden Ring", sub: "L'Ordre d'or et l'anneau brisé", room: "lore", type: "recit", format: "vhs", cote: "LO-002", color: 42, emblem: "環",
  art: "Elden Ring",
  about: "Une reine devenue déesse, une loi qui interdit la mort, des enfants qui s'entre-tuent pour les morceaux. L'histoire de l'Entre-terre remise dans l'ordre, des origines de Marika jusqu'aux six fins.",
  links: [
    { label: "ALT 236, Mythologics #12 : Elden Ring", url: "https://www.youtube.com/watch?v=ezSMt7VCg3k", note: "Une analyse de la chaîne ALT 236." },
    { label: "Elden Ring (FromSoftware, 2022) et Shadow of the Erdtree (2024)", note: "Dirigé par Hidetaka Miyazaki. Le passé du monde, celui d'avant le jeu, a été écrit avec George R. R. Martin." },
    { label: "Les descriptions d'objets et les monologues des épées-monuments", note: "Les stèles plantées dans le paysage racontent la guerre de l'Éclatement, bataille par bataille." },
    { label: "Le Rameau d'or de James Frazer", note: "Le roi qui doit mourir pour que la terre vive, l'arbre sacré, le prêtre meurtrier. Une des grandes sources de ce genre de mythe. Libre de droits." },
    { label: "L'Edda et le Crépuscule des dieux", note: "L'arbre-monde, les dieux qui savent qu'ils vont tomber, le monde refait après l'incendie." },
    { label: "Les vidéos de lore", note: "VaatiVidya en anglais, Hunter Gaming et d'autres en français. Sur Marika et Radagon, sur Miquella, les lectures divergent : compare-les." },
  ],
  text: String.raw`
# Un monde raconté par ses ruines

Tu arrives dans l'Entre-terre comme un mort qu'on a rappelé. Tu es un Sans-éclat : le descendant d'exilés à qui la lumière de la grâce a été retirée autrefois, et à qui on la rend soudain. Une lueur dorée te montre une direction. On te dit de devenir Seigneur d'Elden. Personne ne t'explique ce que cela veut dire.

@yt K_03kFqWfqs | Elden Ring (2022), bande-annonce de l'histoire.

Autour de toi, tout est après. Les châteaux sont tenus par des fous, les soldats montent la garde devant des portes que plus personne n'attaque, un arbre de lumière haut comme le ciel domine un pays où rien ne meurt tout à fait et où rien ne naît plus. Quelque chose s'est cassé, il y a longtemps, et le monde continue par habitude.

Ce livre remet cette cassure dans l'ordre. Je donne les noms en français courant : ils peuvent différer, ici ou là, de la traduction officielle du jeu. Je te préviens comme pour Bloodborne : l'ordre est une reconstruction. Le jeu donne des morceaux, des noms gravés, des objets, des fantômes qui murmurent. J'indique ce qui est sûr et ce qui est discuté. Et je commence par où le jeu finit, parce que c'est son extension qui a révélé le début.


# Ceux qui l'ont fait

Elden Ring est développé par FromSoftware et édité par Bandai Namco en 2022. Il est dirigé par Hidetaka Miyazaki. Pour la première fois, le studio fait appel à un écrivain extérieur : George R. R. Martin, l'auteur du Trône de fer, a écrit l'histoire ancienne de l'Entre-terre, celle qui s'est passée avant le jeu. Miyazaki et son équipe ont écrit le jeu lui-même par-dessus.

La musique est signée Tsukasa Saitoh, Shoi Miyazawa, Yuka Kitamura, Tai Tomisawa, Yoshimi Kudo et Soma Tanizaki. L'extension Shadow of the Erdtree est sortie en 2024.

# Comment on parcourt l'Entre-terre

Elden Ring est le premier grand monde ouvert de FromSoftware. Là où Dark Souls et Bloodborne étaient des labyrinthes reliés entre eux, l'Entre-terre est un pays entier, qu'on traverse à cheval, dans n'importe quelle direction, en suivant ce qui attire l'œil : une tour au loin, un château sur une falaise, une lumière dans une vallée.

@art 1 | Comment on parcourt l'Entre-terre.

Le cheval s'appelle Torrent. C'est une monture spectrale, qu'on invoque d'un sifflet et qui saute très haut. Melina te le confie dès le début, en échange d'un pacte : la conduire jusqu'à l'Arbre.

Le jeu ne pose presque aucun marqueur sur la carte. Les fragments de carte se trouvent sur des stèles, et dessinent le pays morceau par morceau. Les sites de grâce, des points de lumière dorée, servent de refuges : on s'y repose, on y monte en niveau, et les ennemis renaissent. Leurs rayons dorés indiquent vaguement une direction, sans jamais dire pourquoi.

On peut invoquer à ses côtés des esprits de morts, conservés dans des cendres. Et partout, sous la terre, dans des grottes, des catacombes, des mines, d'anciens tunnels, il y a des donjons plus petits. Au-dessus, les grandes forteresses, qu'on appelle les donjons hérités : le château de Voilorage, l'académie de Raya Lucaria, le Manoir du Volcan, la capitale Leyndell, et d'autres. Chacun est un monde en soi.

Le jeu s'est vendu à plus de vingt millions d'exemplaires. C'est le plus grand succès du studio, et il a fait connaître sa manière de raconter à un public immense.

# Les terres

L'Entre-terre est faite de régions très différentes, et chacune raconte un morceau de l'histoire.

**Nécrolimbe**, où l'on arrive, est une terre verte, paisible en apparence, dominée par le château de Voilorage, tenu par Godrick le Greffé, un demi-dieu faible qui coud sur son corps les membres de ses ennemis pour paraître plus fort.

**Liurnia des Lacs** est un pays d'eau et de brume, au nord, autour de l'académie de Raya Lucaria où règne Rennala. C'est là que commence la quête de Ranni.

**Caelid** est la province détruite par la Pourriture écarlate de Malenia, un désert rouge et malade, où Radahn erre.

**Le plateau d'Altus** et le **mont Gelmir** mènent vers la capitale. Sur le mont Gelmir, le Manoir du Volcan abrite une confrérie d'assassins au service de Rykard, le dieu-serpent.

**Leyndell**, la capitale royale, s'étend au pied de l'Arbre-Monde, défendue par Morgott.

Plus haut, **les Sommets des géants**, glacés, où l'on trouve la forge et le dernier des géants de feu. Plus loin encore, **le champ de neige consacré** et l'**Arbre sacré de Miquella**, où dort Malenia. Et **Farum Azula**, la cité des dragons, qui flotte dans une tempête hors du temps.

Sous la terre, il y a d'autres mondes : des rivières souterraines sous un ciel d'étoiles artificiel, des cités antiques, les racines profondes de l'Arbre, et un lac de pourriture. Le monde d'Elden Ring est aussi profond que large.

# Avant l'or

L'Entre-terre n'a pas toujours été dorée. Le jeu laisse voir, sous l'ordre présent, plusieurs mondes plus anciens.

Il y eut un âge des dragons. Dans une cité qui s'effrite au milieu d'une tempête hors du temps, Farum Azula, un dragon à plusieurs têtes attend encore le retour de son dieu. Il s'appelle Placidusax, et le jeu le dit clairement : il fut Seigneur d'Elden avant qu'il y ait un Arbre. Son dieu est parti. Lui est resté.

Il y eut le Creuset. C'est le nom que le jeu donne à la vie d'avant, quand tout était mêlé : des hommes à cornes, à ailes, à queue, des formes qui n'étaient pas encore séparées. L'Arbre-Monde, à ses débuts, portait cette couleur rouge et or. Plus tard, l'ordre nouveau tiendra ces mélanges pour une souillure, et ceux qui naissent avec des cornes, les Présages, seront mutilés ou jetés aux égouts. Retiens cela : la religion de ce monde a honte de sa propre origine.

Et il y eut d'autres puissances venues du ciel. C'est un des fils les plus étranges du jeu : presque tout ce qui règne ici est tombé d'en haut. Une étoile d'or a apporté une bête, la Bête d'Elden, envoyée par une volonté lointaine que les hommes appellent la Volonté suprême. D'autres météores ont apporté d'autres choses : des astres sans forme, une pourriture, une lune. Les dieux de ce monde sont des étrangers.

!! À RETENIR :: La Volonté suprême n'apparaît jamais. Elle agit par des intermédiaires : la Bête d'Elden, qui est l'anneau lui-même, et les Deux Doigts, des mains géantes qui prétendent parler pour elle.

# La femme du village

Qui était Marika avant d'être une déesse ? Le jeu de base ne le disait pas. Il la disait seulement issue d'un peuple venu d'ailleurs, les Numen. L'extension a répondu, et la réponse éclaire tout le reste.

Dans le Royaume des ombres, une terre cachée, tu trouves un village vide, couvert de fleurs. C'était un village de chamanes. Leur chair avait une propriété : elle se mêlait harmonieusement à d'autres chairs. Un peuple voisin, les Cornus, qui se croyait élu parce qu'il portait la marque du Creuset, s'en est servi. Ils enfermaient des gens dans de grandes jarres pour en faire, disaient-ils, des saints, et ils y ajoutaient la chair des chamanes pour que le mélange prenne. Tu marches dans leurs geôles. Les jarres y sont encore.

Marika venait de ce village. Elle est celle qui a survécu.

Le jeu ne raconte pas sa montée, mais il en montre le lieu : une porte faite de corps entassés, par laquelle elle est devenue dieu. Puis il montre la suite. Marika envoie son propre fils, Messmer, mener contre les Cornus une croisade d'extermination par le feu. Elle scelle ensuite ce pays derrière un voile, avec le fils qu'elle y laisse, et n'en reparle jamais.

Voilà le socle de toute l'histoire, et il est établi : l'Ordre d'or est né d'une vengeance. La femme qui instaurera une loi de grâce et de lumière a commencé par un massacre, et elle l'a caché. Dans le village, elle a laissé une mèche de ses cheveux d'or, avec un vœu de guérison pour les siens. Il n'y avait plus personne à guérir.

# Le réceptacle

Qu'est-ce que le Cercle d'Elden ? Oublie l'idée d'un bijou. C'est la loi du monde, sous la forme d'un entrelacs de runes. Celui qui le porte en lui fixe les règles de la réalité : ce qui vit, ce qui meurt, ce qui est permis.

@art g 1 | Le réceptacle.

Marika en devient le réceptacle. Elle règne depuis une capitale bâtie au pied de l'Arbre-Monde, et son premier époux est un guerrier nommé Godfrey. Avec lui, elle soumet tout. Les géants de feu, dont la flamme pouvait brûler l'Arbre, sont exterminés jusqu'au dernier, et le dernier est maudit à garder sa forge pour l'éternité.

Puis elle fait deux choses qui décident de tout.

La première : elle retire une rune du Cercle. C'est la rune de la Mort. Elle la confie à son frère d'ombre, une bête nommée Maliketh, qui la scelle dans son épée. Dès lors, dans l'Entre-terre, on ne meurt plus vraiment. Les âmes retournent à l'Arbre par ses racines et renaissent. C'est cela, l'Ordre d'or : un monde d'où la mort a été ôtée.

Demande-toi ce que vaut un tel cadeau de la part d'une femme qui a vu son peuple mis en jarres. Elle a voulu un monde où cela ne puisse plus arriver. Elle a obtenu un monde figé.

La seconde : quand Godfrey a gagné sa dernière bataille et qu'il ne reste plus d'ennemi, la lumière quitte ses yeux. Marika le dépouille de la grâce et l'exile, lui et ses guerriers, hors de l'Entre-terre. Ce sont les premiers Sans-éclat. Elle leur dit d'aller combattre et mourir au loin, et qu'un jour la grâce leur sera rendue. Tu es l'un de leurs descendants. Elle avait prévu ton retour avant même de briser quoi que ce soit.

# L'époux qui était elle

Au nord, un royaume résiste : celui de la reine Rennala, à l'académie de Raya Lucaria, où l'on étudie les étoiles et la lune. Marika envoie contre elle un champion aux cheveux rouges, Radagon. Deux guerres, pas de vainqueur. Radagon et Rennala tombent amoureux, se marient, et les deux royaumes font la paix. Ils ont trois enfants : Radahn, Rykard et Ranni.

Puis, quand Godfrey est exilé, Radagon quitte Rennala sans un mot et monte à la capitale pour devenir le second époux de Marika. Rennala en perd la raison. Tu la trouves berçant un œuf d'ambre dans une bibliothèque, entourée d'étudiants qui rampent.

Et voici le secret que le jeu ne te livre que tard, par une phrase gravée au pied d'une statue : Radagon est Marika.

Ils partagent un seul corps. Comment, pourquoi, depuis quand ? Le jeu ne tranche pas, et c'est l'une des questions les plus disputées. Ce qui est sûr, c'est que la déesse s'est épousée elle-même, et que ces deux moitiés ne voulaient pas la même chose. Radagon est le fidèle : il croit à l'Ordre, il le sert jusqu'au bout. Marika, elle, a cessé d'y croire. Tu peux entendre ses paroles en certains lieux. Elle y dit à ses enfants qu'ils peuvent devenir ce qu'ils veulent, seigneurs ou dieux, mais que s'ils échouent ils seront abandonnés et sacrifiés.

De cette union naissent des jumeaux, Miquella et Malenia. Tous deux sont maudits dès la naissance. Miquella ne grandira jamais : il restera un enfant. Malenia porte en elle la Pourriture écarlate, qui la ronge. La lecture la plus répandue y voit le prix d'un dieu qui s'est uni à lui-même.

!! LES ENFANTS :: De Marika et Godfrey : Godwyn le Doré, et les jumeaux Présages, Morgott et Mohg, nés avec des cornes et cachés sous la ville. De Radagon et Rennala : Radahn, Rykard, Ranni. De Radagon et Marika : Miquella et Malenia. Et, caché dans l'ombre, Messmer.

# La nuit des couteaux noirs

Tout tient encore. Puis vient une nuit.

Parmi les enfants des dieux, certains sont des Empyréens : ils peuvent succéder à Marika, devenir à leur tour le réceptacle. Ranni est l'une d'eux. Les Deux Doigts l'ont choisie, et lui ont donné, comme à tout Empyréen, une ombre chargée de la servir et de la surveiller. Ranni ne veut pas de ce destin. Elle ne veut pas être l'instrument d'une volonté qui se sert de son corps.

Alors elle conçoit le crime le plus adroit de cette histoire. Elle fait dérober à Maliketh un fragment de la rune de la Mort. Des tueuses venues du peuple de Marika en imprègnent leurs lames. Et la même nuit, deux meurtres ont lieu.

Elles tuent Godwyn le Doré, le fils aimé, le premier demi-dieu à mourir. Mais elles ne tuent que son âme. Au même instant, Ranni tue son propre corps, et lui seul. La mort a été partagée en deux moitiés. L'âme de Ranni survit et se loge dans une poupée. Le corps de Godwyn survit sans âme, enterré sous les racines de l'Arbre, et il se met à pousser : son visage monstrueux affleure partout sous la terre, et de lui sortent Ceux qui vivent dans la mort.

Ranni a-t-elle agi seule ? Les tueuses étaient du sang de Marika, et beaucoup pensent que la reine savait, ou voulait. Le jeu ne le dit pas.

Ce qui est établi, c'est la suite. Marika, quand son fils meurt, brise le Cercle d'Elden.

# L'Éclatement

Pourquoi l'a-t-elle fait ? Par chagrin, dit la version que l'on raconte. Par dessein, pensent ceux qui se souviennent qu'elle avait préparé le retour des exilés. Les deux se tiennent, et le jeu te laisse choisir.

Radagon, dans le même corps, tente de réparer l'anneau à coups de marteau. Il échoue. Pour ce crime, Marika est emprisonnée à l'intérieur de l'Arbre. C'est là que tu la trouveras : un torse de pierre fendu, suspendu à une rune.

Les morceaux du Cercle, les Grandes Runes, tombent aux mains de ses enfants. Chacun en veut davantage. C'est la guerre de l'Éclatement, et elle n'a pas de héros.

Rykard, pour devenir immortel, se laisse dévorer par un serpent géant et devient ce serpent. Mohg, le Présage des égouts, fonde sous terre une dynastie de sang autour d'un dieu qu'il a enlevé. Morgott, son jumeau, l'enfant à cornes que l'Ordre a rejeté, défend la capitale contre tous ses frères avec une fidélité que personne ne lui a demandée. Il n'est jamais reconnu roi.

Et les deux plus forts se rencontrent. Radahn, le géant qui avait appris la magie de la gravité pour ne jamais quitter son cheval trop frêle, et qui retenait les étoiles dans le ciel, affronte Malenia, l'épée de Miquella, qui n'a jamais connu la défaite. Aucun ne cède. Alors Malenia, à bout, laisse s'ouvrir ce qu'elle avait retenu toute sa vie : la Pourriture fleurit. Une province entière, Caelid, devient un désert rouge où tout se décompose sans mourir. Radahn y erre depuis, l'esprit détruit, dévorant ses propres soldats. Malenia est ramenée endormie chez son frère.

La guerre n'a pas de vainqueur. La Volonté suprême se détourne de ces enfants. Et la grâce, longtemps après, revient aux yeux des morts exilés.

# Ceux qui te guident

Te voici. Et tu dois apprendre à te méfier de tous ceux qui te montrent le chemin.

Les Deux Doigts te disent de réunir les Grandes Runes et de réparer l'anneau. Mais quand tu arrives enfin devant l'Arbre, des ronces en ferment l'entrée. L'Arbre refuse tout le monde. Les Doigts se taisent, sans réponse. L'ordre que tu sers ne sait plus ce qu'il veut.

Une jeune fille à l'œil clos, Melina, t'accompagne depuis le début. Elle dit être née au pied de l'Arbre et avoir reçu de sa mère une mission. Elle sait ce qu'il faut faire : commettre le péché capital. Brûler l'Arbre avec la flamme des géants, celle que Marika avait fait éteindre. Et pour allumer ce feu, il faut une offrande. Ce sera elle.

Mais le feu ne suffit pas. Pour que l'Arbre brûle, il faut rendre au monde ce que Marika lui avait retiré. Tu dois vaincre Maliketh et libérer la rune de la Mort. La mort revient dans l'Entre-terre, et alors seulement les ronces s'ouvrent.

Sens la logique de l'ensemble. La déesse avait ôté la mort pour bâtir son ordre. Pour le relever, ou pour l'achever, il faut d'abord défaire son premier geste. Beaucoup y voient la preuve qu'elle avait tout prévu : qu'elle a brisé l'anneau et rappelé les exilés pour que quelqu'un fasse ce qu'elle ne pouvait pas faire, enchaînée à sa moitié fidèle.

À l'entrée, un guerrier t'attend. C'est Godfrey, le premier époux, revenu d'exil lui aussi, mort et rappelé comme toi. Il porte sur le dos le spectre d'un lion qui le rendait sage. Au milieu du combat, il le tue, arrache son armure, et reprend son vrai nom de barbare. C'est l'un des plus beaux moments du jeu : un roi qui choisit de mourir tel qu'il était avant qu'on fasse de lui un roi.

# Les cités éternelles

Sous l'Entre-terre, dans des grottes immenses, on trouve des cités en ruine sous un ciel d'étoiles. Ce ciel est faux : un plafond de pierre où brillent des lumières. On les appelle les cités éternelles, et elles appartenaient à un peuple disparu, les Nox.

Les Nox ont tenté, il y a très longtemps, de créer leur propre Seigneur, sans l'accord de la Volonté suprême. Pour les punir, elle les a enfouis sous la terre et leur a retiré le ciel. Ils ont continué à vivre dans le noir, en fabriquant des étoiles, et en cherchant à la fois à imiter la vie et à défier les dieux. C'est à eux qu'on doit le Miroir d'imitation, une larme d'argent qui prend la forme de qui la regarde.

C'est aussi dans l'une de ces cités, Nokron, que se cache un objet essentiel à la quête de Ranni : une lame capable de blesser les Doigts eux-mêmes, ces mains géantes qui parlent au nom de la Volonté suprême. Les Nox avaient forgé de quoi tuer leurs maîtres. Ils n'ont jamais pu s'en servir.

# La quête de Ranni

La quête de Ranni est la plus longue du jeu, et la plus belle. On la commence en rencontrant, dans une tour de Liurnia, une petite sorcière bleue à quatre bras, une poupée habitée par l'âme de Ranni. Elle t'engage.

@art 2 | La quête de Ranni.

Autour d'elle, une petite famille : **Blaidd**, un guerrier à tête de loup, son ombre, chargé de la protéger, qui la sert comme un frère ; **Iji**, un forgeron géant, bienveillant et fidèle ; et **Seluvis**, un précepteur qui la trahit.

Ranni veut deux choses : se libérer pour toujours du destin que les Doigts lui ont tracé, et trouver une épée qui lui appartient, une lame faite de lune, cachée par sa famille. Pour cela, elle t'envoie sous la terre, dans les cités éternelles, à la recherche de la lame qui tue les Doigts. Puis dans les profondeurs, à travers le lac de pourriture, jusqu'à une tombe scellée, où l'attend une créature venue des étoiles. Puis jusqu'à un autel lunaire, caché tout au bout du monde.

Au bout de la quête, tu trouves Ranni, son corps de poupée abandonné, comme morte, dans un tombeau. Tu lui passes au doigt un anneau qui scelle votre union. Elle revient, sous une forme nouvelle, et te confie l'épée de la Lune noire. Elle te promet de t'attendre à la fin.

Blaidd, lui, n'a pas cette chance. Les Doigts l'avaient fait naître pour accompagner Ranni, mais aussi pour la surveiller, et l'empêcher de les trahir. Quand elle les trahit, ce lien le déchire entre sa loyauté et sa nature. Il perd la raison. Iji l'enferme pour le protéger de lui-même. On le retrouve plus tard, déchaîné, et il faut le combattre.

C'est cette quête qui mène à la fin de l'âge des Étoiles, celle où Ranni emporte l'ordre loin du monde.

# Les âmes que tu croises

Comme dans tous les jeux de Miyazaki, les personnages secondaires portent des histoires aussi fortes que les grandes. Quelques-unes, parmi des dizaines.

**Alexandre le Poing de fer** est une jarre de guerrier. Littéralement : une grande jarre de terre, vivante, qui parle avec une bonne humeur inébranlable. On le trouve coincé dans le sol, et il faut le sortir de là. Ces jarres sont remplies des restes de grands guerriers, et Alexandre veut devenir le plus grand de tous. On le croise sans cesse au fil du voyage, toujours enthousiaste, toujours en quête de combats. À la fin, au bout du monde, il te demande un dernier duel, pour éprouver sa valeur. Quand il se brise, il te parle avec fierté et sans rancune. C'est un des adieux les plus touchants du jeu.

**Millicent** est une jeune femme rongée par la Pourriture écarlate. On la soigne avec une aiguille d'or. On découvre peu à peu qu'elle est un bourgeon de Malenia, une de ses filles, née de la fleur de pourriture. Un vieil homme qui l'a aidée voulait en réalité qu'elle s'épanouisse, qu'elle devienne une nouvelle déesse de la pourriture. Millicent refuse. Elle choisit de rester elle-même, malgré ce qu'elle porte en elle, et affronte ses propres sœurs pour garder ce choix.

**Gideon Ofnir**, le Tout-Sachant, dirige la Table ronde, le refuge où se réunissent les Sans-éclat. Il collectionne les secrets, il veut tout savoir sur les demi-dieux et sur les Grandes Runes. Il veut devenir Seigneur d'Elden. On le combat dans la capitale, à la fin, juste avant Godfrey. Il meurt en disant qu'il ne savait pas encore tout.

**Hyetta** est une jeune femme aveugle qu'on croise sur la route. Elle te demande de lui apporter des grappes de raisin, puis d'autres fruits, de plus en plus étranges. Elle cherche quelque chose, sans savoir quoi. C'est la Flamme frénétique qu'elle cherche, et qu'elle t'invite à trouver. Elle est la petite porte d'entrée vers la fin la plus terrible.

Et il y a les autres : un homme qui coud des vêtements et rêve d'être beau, un chevalier qui ne veut plus se battre, une sorcière exilée de l'académie, un marchand qui te trahit et revient toujours en souriant. Chacun a son destin, et beaucoup finissent mal.

# Le dernier combat

Dans l'Arbre, le corps de pierre se relève. C'est Radagon qui se bat, pas Marika : le fidèle défend jusqu'au bout la loi que sa propre moitié a brisée. Quand il tombe, la Bête d'Elden sort de lui, faite d'étoiles et d'or. Tu affrontes l'anneau lui-même.

Puis tu te tiens devant ce qui reste de la reine, et tu choisis quel monde vient après. Le jeu offre six fins. Elles valent d'être comprises, car chacune est une réponse à la question que pose toute l'histoire : que fait-on d'un ordre qui a échoué ?

Tu peux simplement réparer l'anneau et régner. C'est l'âge de la Fracture : le même ordre, recollé, avec ses défauts.

Tu peux le réparer avec la rune d'un sage silencieux, Masque d'or, qui a compris le vice de l'Ordre : les dieux y étaient trop humains, capricieux, blessés. Sa rune ôte aux dieux leurs passions. C'est l'Ordre parfait, sans personne pour le trahir, et sans personne tout court.

Tu peux le réparer avec la rune de Fia, la compagne des morts, qui a couché auprès du cadavre de Godwyn pour faire naître une loi où la mort a sa place. Ceux qui vivent dans la mort cesseraient d'être chassés.

Tu peux le réparer avec la rune d'un homme abject, un profanateur de cadavres que le jeu nomme d'après ce qu'il mange, et qui veut que tous les êtres naissent maudits, pour que la malédiction ne soit plus une honte. C'est la plus sombre, et elle a pourtant sa logique : c'est la vengeance des Présages.

Tu peux écouter les Trois Doigts, enfermés nus sous la capitale, et recevoir la Flamme frénétique. Elle enseigne que toute séparation est une faute, que la naissance, les âmes distinctes, la douleur viennent d'une erreur de la création, et qu'il faut tout refondre en un seul brasier. Si tu la prends, Melina te quitte, et te promet de te tuer.

Et tu peux suivre Ranni. Si tu as servi la sorcière dans sa longue quête, elle vient elle-même prendre la tête de la déesse et t'emmène. Sa fin s'appelle l'âge des Étoiles. Elle n'installe pas un ordre meilleur. Elle emporte l'ordre au loin, hors du monde, là où il ne pourra plus être ni vu ni touché, et laisse les hommes à la nuit, au doute et à la solitude, sans dieu dans leur corps ni dans leur ciel.

# Messmer et le Royaume des ombres

L'extension Shadow of the Erdtree t'emmène dans le Royaume des ombres, la terre que Marika avait scellée. C'est un pays immense, sous un arbre noir, couvert de ruines, de cimetières, de croix brûlées.

Il est gardé par **Messmer l'Empaleur**, le fils caché de Marika, celui qui a mené pour elle la croisade contre les Cornus. Il porte une flamme, et un serpent vit enroulé en lui. Ses soldats ont brûlé, empalé, massacré le peuple cornu. Il a obéi à sa mère, puis elle l'a laissé là, enfermé dans le pays qu'il avait dévasté. On le trouve dans un château fait pour lui, qu'il n'a jamais pu quitter. Le jeu laisse entendre que Marika le craignait, parce qu'il portait en lui ce serpent, une part de ce qu'elle voulait oublier.

Dans le Royaume des ombres, on suit les traces de Miquella, avec des personnages venus le chercher : Leda, une chevalière qui lui est dévouée jusqu'au fanatisme ; Ansbach, un vieux serviteur de Mohg ; Thiollier, un assassin timide ; Freyja, une ancienne compagne d'armes de Radahn ; un Cornu en quête de vengeance. Peu à peu, le charme de Miquella se dissipe, et chacun découvre qu'il ne l'aimait peut-être pas de son plein gré. Le groupe se déchire.

On y rencontre aussi Bayle l'Épouvante, un dragon ancien, mutilé, qui hait les dragons de Farum Azula. Un vieux chasseur, Igon, a juré de le tuer, et t'aide à l'affronter.

Et à la toute fin, sur une colline couverte de fleurs, Miquella apparaît, devenu presque dieu. Il a pris pour époux Radahn, dont il a fait revenir l'âme dans un corps nouveau. C'est le dernier combat : un géant qui fut le plus grand des héros, et un enfant qui veut régner par l'amour.

# Miquella, ou la bonté qui dévore

Il reste une figure, que l'extension a placée au centre, et qui est la plus fine de toute l'œuvre.

@art 3 | Miquella, ou la bonté qui dévore.

@yt sNgER9MVNFs | Shadow of the Erdtree (2024), bande-annonce de l'histoire.

Miquella, l'enfant éternel, était le plus aimé des demi-dieux. Il inspirait l'amour à quiconque l'approchait. Il avait quitté la foi de son père parce qu'elle ne pouvait pas guérir sa sœur. Il avait planté son propre arbre pour accueillir tous ceux que l'Ordre rejetait. Tout le monde, dans le jeu, parle de lui avec tendresse.

Dans l'extension, tu marches sur ses traces, et tu trouves ce qu'il a laissé derrière lui, morceau par morceau : sa chair, ses doutes, ses peurs, et pour finir son amour, sa moitié nommée Trina. Il a tout abandonné pour monter à son tour par la porte des dieux. Il veut fonder un âge de compassion, où tous seront doux les uns envers les autres.

Et tu comprends, avec ceux qui le suivaient et que son charme vient de quitter, ce que valait cet amour. Ils l'aimaient parce qu'il les y contraignait. Le sang versé par Mohg, l'enlèvement, la guerre de Radahn : le jeu laisse entendre que Miquella a tout arrangé, pour obtenir le corps et l'époux dont son ascension avait besoin.

Regarde le parallèle. Marika a bâti un monde sans mort après avoir vu mourir les siens. Son fils veut bâtir un monde sans cruauté, et pour y parvenir il retire à chacun la liberté de ne pas l'aimer. Un dieu qui a jeté son amour pour faire régner l'amour. Le jeu te demande de l'arrêter, lui, le plus doux de tous. C'est sa leçon la plus dure.

# Ce que tu peux en prendre

Trois choses, pour toi qui écris des mondes.

La première : un monde se raconte par ce qui manque. Le personnage principal de cette histoire, Marika, n'a pas une seule scène. Tu ne la vois que brisée. Tout ce que tu sais d'elle vient de ce qu'elle a laissé : des paroles gravées, un village, des enfants abîmés. Et c'est pour cela qu'elle obsède. Un personnage absent dont tout porte la trace est plus grand que celui qu'on te montre.

La deuxième : chaque ordre naît d'une blessure et la reproduit. La reine dont on a mis le peuple en jarres fait jeter aux égouts les enfants à cornes. L'enfant maudit que l'Ordre n'a pas su guérir invente une bonté qui asservit. Quand tu construis une religion, un empire, une famille, demande-toi quelle peur l'a fondé. Tu sauras ce qu'il interdit et qui il sacrifie.

La troisième : la fin n'est pas une victoire, c'est un choix de valeur. Le jeu ne te demande pas si tu es assez fort. Il te demande, une fois que tu l'es, ce que tu juges réparable. Recoller, purifier, faire une place aux morts, maudire tout le monde, tout brûler, ou tout éloigner. Chaque joueur répond selon ce qu'il croit. Une bonne fin fait cela : elle rend la décision au spectateur, et elle la lui rend lourde.

Marika avait dit à ses enfants qu'ils pouvaient devenir ce qu'ils voulaient. Aucun n'y est arrivé. La phrase s'adressait peut-être à toi.

@yt ezSMt7VCg3k | ALT 236, Mythologics #12 : Elden Ring (2022).

`,
};
export default book;
