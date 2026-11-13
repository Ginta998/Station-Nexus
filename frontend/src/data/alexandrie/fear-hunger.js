const book = {
  id: "fear-hunger", title: "Fear & Hunger", sub: "Les donjons et les dieux anciens", room: "lore", type: "recit", format: "vhs", cote: "LO-042", color: 5, emblem: "飢",
  about: "Un donjon sous un royaume pourri, où l'on descend chercher un prisonnier. Des dieux anciens qui n'aiment pas les hommes, et des hommes qui veulent devenir des dieux. Puis, des siècles plus tard, une petite ville de Bohême en 1942, une lune verte qui sourit, et quatorze inconnus forcés de s'entretuer pendant trois jours. Deux jeux réputés parmi les plus cruels jamais faits, portés par l'un des mondes les plus profonds du jeu indépendant.",
  links: [
    { label: "Fear & Hunger (Miro Haverinen, 2018)", note: "Le premier jeu, fait seul, avec RPG Maker. Publié par Happy Paintings." },
    { label: "Fear & Hunger 2: Termina (Miro Haverinen, 2022)", note: "La suite, des siècles plus tard, dans une petite ville pendant une guerre." },
    { label: "Kentarō Miura, Berserk", note: "L'influence la plus visible : la violence, le désespoir, les dieux qui se nourrissent de la souffrance humaine. Il a son livre dans cette salle." },
    { label: "H. P. Lovecraft, nouvelles", note: "Pour les dieux indifférents et le savoir qui détruit." },
    { label: "Dark Souls, Bloodborne et Pathologic", note: "Trois jeux souvent cités à côté de Fear & Hunger, pour leurs mondes racontés par fragments. Tous ont leur livre ici." },
  ],
  text: String.raw`
# Avant de commencer

Fear & Hunger a une réputation : on le présente souvent comme le jeu le plus cruel jamais fait. Ce n'est pas une exagération publicitaire. Le jeu montre la torture, la mutilation, la folie, des violences de toutes sortes. Il ne les rend jamais agréables, mais il ne les cache pas non plus. Beaucoup de joueurs ne vont pas au bout. Beaucoup d'autres ne le regardent qu'à travers des vidéos.

Ce livre ne décrit pas ces horreurs. Il raconte le monde qu'elles habitent, parce que ce monde est d'une richesse étonnante. Derrière ses images insoutenables, Fear & Hunger cache une mythologie entière : des dieux anciens et des dieux nouveaux, des hommes qui gravissent un trône pour devenir divins, une histoire qui s'étend sur des siècles, d'un royaume médiéval à une Europe en guerre au XXe siècle.

On le joue comme on déchiffre un vieux manuscrit en partie brûlé. Et plus on en apprend, plus on comprend que la cruauté du jeu n'est pas un décor : c'est son sujet. Ce monde est cruel parce que ses dieux le sont, et ses dieux le sont parce qu'ils ont été, un jour, des hommes.

@yt DAztCRJWAi0 | Tout le lore de Fear & Hunger, raconté dans l'ordre chronologique (en anglais).

# Ceux qui l'ont fait

Fear & Hunger est l'œuvre d'un seul homme : Miro Haverinen, un créateur finlandais. Il a écrit, dessiné, programmé et conçu le jeu presque entièrement seul, avec RPG Maker, un logiciel grand public fait pour créer de petits jeux de rôle à l'ancienne, vus de dessus, avec des combats au tour par tour. C'est l'outil des amateurs. Haverinen en a tiré l'un des jeux les plus singuliers de sa décennie.

Le premier Fear & Hunger sort en décembre 2018, publié par Happy Paintings. Il reste longtemps un secret de connaisseurs, puis il explose quelques années plus tard, porté par les vidéos de joueurs qui montrent leurs parties désastreuses, leurs morts absurdes, leurs théories sur le lore. Il devient culte : un jeu dont beaucoup parlent et que peu finissent.

La suite, Fear & Hunger 2: Termina, sort le 9 décembre 2022. Haverinen l'a de nouveau faite presque seul. Elle est plus grande, plus ambitieuse, et elle déplace l'univers de plusieurs siècles.

Les influences sont claires : le manga Berserk de Kentarō Miura, pour la violence sans espoir et les dieux qui se nourrissent de la souffrance ; Lovecraft, pour l'horreur cosmique ; Dark Souls, pour la manière de raconter par fragments. On cite souvent aussi Bloodborne, Silent Hill 2, et, pour la suite, Pathologic.

# Comment on survit

Avant le monde, il faut parler du jeu, parce que chez Haverinen, les règles sont une manière de raconter.

@art 1 | Comment on survit.

Il n'y a presque pas de progression. Les personnages ne gagnent pas de niveau en tuant des ennemis. La seule chose qui progresse vraiment, c'est toi, le joueur : ce que tu sais de la carte, des pièges, des ennemis, après être mort cinquante fois.

On peut perdre un bras ou une jambe. Les combats permettent de viser chaque partie du corps de l'ennemi : sa tête, ses bras, ses jambes. Et les ennemis peuvent faire la même chose. Un personnage qui perd un bras ne peut plus tenir son arme. Celui qui perd une jambe se traîne. Ces blessures sont permanentes, ou presque.

Il faut manger. La faim baisse sans arrêt, et la nourriture est rare. Il faut garder l'esprit sain : certaines visions, certaines créatures, certaines découvertes font baisser la santé mentale, et un personnage qui la perd devient fou. Il faut de la lumière : les torches s'usent, et dans le noir, on ne voit pas ce qui approche.

Et il y a le hasard. Pour sauvegarder, il faut dormir dans un lit, et parfois, cela ne suffit pas : le jeu lance une pièce. Pile, la partie est enregistrée. Face, elle ne l'est pas. Certaines rencontres décisives se jouent aussi à pile ou face. Le jeu dit, par cette pièce, que dans ce monde le destin n'a aucune pitié et aucune logique.

Le résultat est une expérience unique : on a peur pour ses personnages comme dans peu d'autres jeux, parce que chaque erreur, chaque malchance, laisse une trace.

# Les dieux anciens

Au commencement de ce monde, il y a les dieux anciens. Ils ne sont pas bons. Ils ne sont pas mauvais. Ils sont immenses, et les hommes ne comptent pas beaucoup pour eux.

**Sylvian** est la déesse de l'amour, du désir et de la création. On dit qu'elle a créé les humains. Elle bénit les mariages. Et beaucoup croient qu'elle a fini par abandonner l'humanité, parce que les hommes ne pouvaient jamais l'aimer autant qu'elle les aimait. Son symbole est un œil ouvert.

**Gro-goroth** est le dieu de la destruction et des sacrifices humains, celui qu'on appelle le destructeur des hommes. On raconte qu'il porte des peaux humaines et qu'il marche encore parmi les mortels, déguisé. Il a donné aux hommes la magie du sang. Son symbole est une éclipse.

**Vinushka** est le dieu de la nature, l'enfant de Gro-goroth et de Sylvian. Son apparence change selon la région où il se manifeste, et son humeur est imprévisible, comme celle d'une forêt ou d'une tempête. On pense que les hommes l'ont peut-être tué, au cours d'une guerre. Son symbole est un tourbillon.

**Rher** est le dieu de la lune, le Trompeur. Il est jaloux des mortels qui s'élèvent jusqu'à la divinité. Ses serviteurs ont des visages étranges et des missions cruelles.

Et il y a le **Dieu des Profondeurs**, celui que vénèrent les exclus, les déshérités, et les insectes. Il vit sous la terre. Son obscurité fait naître des mutants. C'est de son cadavre, on le verra, que naîtra un dieu nouveau.

Ces dieux ne répondent pas aux prières. Ils réagissent aux sacrifices, aux rituels, à la souffrance. On ne leur parle pas : on leur paie un prix.

# Le trône de l'ascension

Il existe, loin de tout, une cité des dieux qu'on appelle Ma'habre. Au cœur de Ma'habre, il y a le Trône de l'Ascension. Un mortel qui parvient à s'y asseoir, après avoir réuni les âmes nécessaires et dévoré les traces des dieux anciens, peut devenir un dieu.

C'est l'idée centrale de tout l'univers de Fear & Hunger. Les dieux ne sont pas seulement là depuis toujours. On peut en devenir un. Et depuis des siècles, des hommes et des femmes descendent dans les profondeurs, traversent des horreurs indicibles, pour tenter leur chance.

Le plus célèbre d'entre eux s'appelle **Alll-mer**. Il est né à Jettaiah. Il a enseigné avec douze apôtres. Il a été crucifié. Puis il s'est élevé à Ma'habre, et il est revenu pour massacrer les puissants de son époque. Sa renaissance marque l'an zéro d'un nouveau calendrier, et sa religion devient la foi dominante de l'Europe de ce monde. Le parallèle avec le christianisme est évident, et il est volontaire : Fear & Hunger imagine une religion qui ressemble à la nôtre, mais dont le dieu est bien réel, et terrible.

Pour pouvoir s'élever, Alll-mer a dû se débarrasser de sa part sombre, de sa haine, de ses désirs inavoués. Il en a fait un autre dieu, le **Dieu du Soufre**, qui attend dans un monde obscur.

# Les dieux nouveaux

Ceux qui montent sur le trône deviennent des dieux nouveaux. Ils sont beaucoup plus faibles que les anciens. Leur règne dure un temps, puis ils s'éteignent dans l'inaction, et se reposent dans une grande salle, en attendant qu'un rituel les rappelle. Leurs titres disent ce qu'était leur âme.

L'histoire la plus importante est celle d'une **Compagnie**. En l'an 809, cinq mortels partent ensemble chercher les dieux anciens, et obtiennent pour l'humanité le droit de se gouverner elle-même. L'un d'eux, **Nosramus**, refuse l'ascension. Les quatre autres deviennent des dieux nouveaux.

**Francóis**, le Dominateur, voulait unifier les terres. Une fois dieu, il conclut que tout est vain, et que le temps n'est qu'un cercle. **Nilvan**, l'Éternelle, a eu un enfant avec un homme annoncé par une prophétie, pour prolonger son règne. **Valteil**, l'Éclairé, étudie la vie artificielle. Et le **Tourmenté**, un poète écorché, enchaîné dans une souffrance perpétuelle, croit que l'art exige la douleur.

Il y a aussi **Nas'hrah**, un sorcier venu des Sanctuaires de l'Est, qui a régné sur les bibliothèques de Ma'habre. Lui a compris ce que l'ascension cache : elle ne change rien. Elle relance seulement le même cycle. Il méprise les dieux nouveaux, qu'il a pourtant rejoints.

Le règne de la Compagnie s'achève vers 1590. Et c'est à cette époque que commence le premier jeu.

# Rondon

Le premier jeu se passe dans un monde qui ressemble à la fin du Moyen Âge, dans le royaume de Rondon. Un royaume corrompu, cruel, où l'Église d'Alll-mer règne avec le pouvoir.

Il y a un rebelle. Il s'appelle **Le'garde**. C'est un homme des prophéties, celui dont parlaient les anciens textes, et il est le père de l'enfant de Nilvan. Le royaume l'a capturé. Il l'a enfermé dans la prison la plus terrible qui soit : les Donjons de la Peur et de la Faim, un labyrinthe creusé sous une forteresse, qui s'enfonce de plus en plus profondément sous la terre, jusqu'à des lieux qui n'ont plus rien d'humain.

Quatre personnes y descendent, chacune pour une raison différente. Le joueur en choisit une au début. Les autres, il peut les croiser, et parfois les recruter.

**Cahara** est un mercenaire. Il cherche de l'or, et peut-être une forme de rachat. **D'arce** est une chevalière, fidèle à Le'garde, venue le délivrer. **Enki** est un prêtre des ténèbres, qui cherche l'illumination, l'ascension. **Ragnvaldr** vient du Nord, d'au-delà des frontières. Il cherche à se venger de crimes de guerre commis contre son peuple.

D'autres âmes errent dans le donjon : une petite fille perdue, une créature sauvage, semblable à un loup, qu'on appelle Sans-Lune, des prisonniers, des chevaliers, des fous, des monstres, et des gens qui ont été des hommes.

# La descente

Le donjon de Fear & Hunger est un lieu qui s'enfonce. Au début, ce sont des cachots, des couloirs de pierre, des cellules, des gardes. Puis viennent des cavernes, des marécages souterrains, des temples oubliés, des mines. Puis des lieux qui n'obéissent plus à la géographie : des forêts sous la terre, des ruines englouties d'une ancienne cité, et tout au fond, un endroit qu'on appelle le Cœur des Ténèbres.

Chaque niveau abrite des créatures plus étranges, plus difformes. Certaines sont d'anciens prisonniers. D'autres sont nées des expériences des prêtres. D'autres encore sont des fragments des dieux eux-mêmes, des traces laissées par les dieux anciens dans le monde des hommes, qu'on peut combattre, et dont on peut dévorer l'essence.

Le donjon est aussi un lieu de culte. On y trouve des autels, des chapelles, des cercles rituels. Les prêtres de l'Église y mènent des pratiques secrètes. Des sectes s'y cachent. Car le donjon n'est pas seulement une prison : c'est l'endroit où le royaume enfouit ce qu'il ne veut pas voir, et où le divin et l'humain se touchent de trop près.

Le joueur ne descend pas dans un ordre fixe. Il y a des raccourcis, des passages secrets, des chemins qui mènent à des fins différentes. Et il peut mourir à chaque pas.

# Le Dieu des Profondeurs

Tout en bas, sous les ruines englouties, gît le cadavre du Dieu des Profondeurs. Un dieu ancien, mort, dont le corps immense est devenu une partie du donjon. Ses cœurs battent encore, quelque part dans les profondeurs.

@art g 1 | Le Dieu des Profondeurs.

C'est là qu'est conduite la petite fille.

Elle est la fille de Nilvan, la déesse nouvelle, et de Le'garde, l'homme des prophéties. Elle a grandi dans la misère, et on l'a emmenée jusqu'au Cœur des Ténèbres, à l'intérieur des restes du dieu mort. Le jeu laisse comprendre ce qu'on attend d'elle : qu'elle devienne autre chose.

Si les cœurs du dieu sont détruits, et si l'enfant est encore en vie, elle s'élève. Elle devient un dieu nouveau, d'une espèce différente de toutes les autres : le **Dieu de la Peur et de la Faim**. Celle qui donne son nom au jeu.

# Le Dieu de la Peur et de la Faim

Ce dieu-là n'est pas un dieu ancien, ni tout à fait un dieu nouveau. Il est né d'une enfant, dans le corps d'un dieu mort, au milieu de la souffrance. Il incarne la souffrance.

Et pourtant, selon les textes du second jeu, c'est ce dieu qui pousse l'humanité vers la modernité. Les siècles qui suivent, la science, l'industrie, les machines, les guerres mondiales, porteraient sa marque. L'Église, au XXe siècle, le considère comme une fausse divinité. Mais le monde a changé sous son règne.

C'est une idée vertigineuse : le progrès lui-même, dans cet univers, serait l'œuvre d'un dieu né de la peur et de la faim. Les hommes avancent parce qu'ils ont peur et faim. L'histoire est un cauchemar qui se fait passer pour une marche en avant.

@yt _Z7tY1JunNI | L'étrange lore de Fear & Hunger (en anglais).

# Les fins du premier jeu

Fear & Hunger a de nombreuses fins. Elles dépendent du personnage choisi, de ceux qu'on a sauvés ou abandonnés, et du chemin pris tout au fond.

Si l'on garde la petite fille en vie, qu'on détruit les trois cœurs du Dieu des Profondeurs et qu'on affronte, tout en bas, le dieu qui vient de naître, c'est la fin du **Dieu de la Peur et de la Faim**.

Si l'on arrive au fond sans l'enfant, on y affronte les traces de Gro-goroth, le destructeur, un des dieux anciens. C'est la fin de **l'Ancien**.

Si l'on garde Le'garde en vie et qu'on atteint Ma'habre, la cité des dieux, on peut tuer Francóis, le dieu nouveau qui y règne, et s'asseoir sur le Trône de l'Ascension. On est alors transporté dans un vide, où Le'garde apparaît sous une autre forme, comme un roi jaune. On peut le combattre, ou s'agenouiller devant lui et accomplir la prophétie. Sans Le'garde, on devient soi-même un dieu nouveau.

Et il y a une fin presque dérisoire : retrouver Le'garde, vivant ou mort, et simplement ressortir par la porte du début. S'échapper. Le jeu met un point d'interrogation à ce mot.

Pour chaque personnage, une fin secrète existe aussi, en mode difficile. Cahara peut repartir avec une couronne. D'arce peut ressusciter Le'garde. Enki peut atteindre l'illumination. Ragnvaldr peut devenir un dieu de la violence pure.

# Ce qui est vrai

Laquelle de ces fins est la vraie ? Aucune entièrement. Le second jeu, situé des siècles plus tard, en a retenu plusieurs éléments à la fois. La petite fille est bien devenue le Dieu de la Peur et de la Faim. Le'garde a survécu, sous une autre forme, et on le retrouvera. Enki a probablement atteint l'illumination. Ragnvaldr aussi a accompli sa quête, ce qui expliquerait que les bêtes mystiques soient devenues si rares dans le monde de Termina. Sans-Lune a survécu et voyage avec les descendants de Ragnvaldr.

Haverinen a ainsi fait des différentes fins du premier jeu un passé commun, comme si chaque partie de chaque joueur avait laissé une trace dans l'histoire.

# Termina

Des siècles ont passé. Le monde ressemble maintenant au nôtre au milieu du XXe siècle : des trains, des journaux, des fusils, des chars, des avions, une Europe en guerre. Le second jeu se passe en 1942.

Une armée, celle de l'Empire de Brême, vient de prendre une ville de Bohême, Prehevil, à une autre puissance, l'Union de l'Est. Une partie de la ville est en ruine. Les routes sont bloquées. Et à la tête de l'armée de Brême, il y a un homme qu'on appelle simplement le **Kaiser**. Les joueurs attentifs le reconnaîtront : c'est Le'garde, l'homme des prophéties du premier jeu, qui a traversé les siècles sous une autre forme.

Quatorze personnes voyagent dans un train vers Prehevil. Elles ne se connaissent pas. Elles ont toutes une raison d'aller là. Et à leur arrivée, quelque chose les attend.

# Le festival

Prehevil est une petite ville attachée à ses vieux rites et à ses traditions macabres. Une fois, à chaque lune pâle et verdâtre, s'y tient le **Festival de Termina**.

@art 2 | Le festival.

Le festival est organisé par Rher, le dieu de la lune, le Trompeur, par l'intermédiaire de son émissaire, un être étrange qu'on appelle Per'kele. La règle est simple et terrible : les quatorze voyageurs ont trois jours. À la fin du troisième, il ne doit en rester qu'un.

Au-dessus de la ville, la lune sourit. Elle regarde chaque pas des concurrents. Et elle les ronge : au fil des jours, ceux qui perdent pied, qui cèdent à la peur ou à la folie, se transforment. On dit qu'ils sont brûlés par la lune. Ils deviennent des monstres, et rejoignent ceux qui traquent les autres.

Le jeu se déroule en trois jours, chacun divisé en matin, soir et nuit. Les concurrents se déplacent dans la ville selon leurs propres projets. Certains s'allient, d'autres se cachent, d'autres chassent. Le joueur doit savoir où et quand trouver qui, pour le recruter ou l'éviter.

# Les quatorze

Le joueur choisit un personnage parmi huit, et peut en recruter d'autres.

**Levi** est un ancien soldat, un très jeune homme marqué par la guerre. **Marina** est une occultiste, la fille d'un prêtre de la ville. **Daan** est médecin, et il porte un deuil. **Abella** est mécanicienne et rêve de machines. **O'saa** est un mage jaune, venu des lointains Sanctuaires de l'Est. **Olivia** est botaniste, en fauteuil roulant, et cherche sa sœur, Reila, une ingénieure. **Marcoh** est un boxeur, un homme de main. **Karin** est journaliste, et elle enquête.

Les six autres sont des rivaux, des fous, des inconnus : Henryk, Tanaka, Samarie, August, Pav, Caligura. Certains deviendront des monstres. Certains tenteront de tuer le joueur dès la première nuit.

Ce qui frappe, c'est l'humanité de ces personnages. Contrairement au premier jeu, où les héros étaient des archétypes, ceux de Termina ont un passé, des blessures, des traumatismes de guerre, des secrets de famille. Le jeu ne parle plus seulement de péché et de châtiment. Il parle de ce que la guerre et la peur font à l'esprit.

# La ville

Prehevil est un labyrinthe. La vieille ville, avec ses ruelles et ses églises. La ville intérieure, plus neuve, où le dieu de la lune a pris le contrôle et où patrouillent des créatures en uniforme. Des tunnels, des mines, des appartements moisis, une librairie, une agence de presse, un restaurant, un manoir. Et au centre, dominant tout, la Tour creuse, dans le quartier des temples.

Les habitants sont très religieux. Ils pratiquent encore, en secret, les rites des dieux anciens. Une plage sert aux baptêmes. Dans les sous-sols, des choses plus anciennes attendent.

Et la ville est pleine de ces êtres que la lune a brûlés : des gens ordinaires devenus des silhouettes déformées, qui errent en marmonnant.

# Logic

Il y a dans Termina un dieu nouveau d'une espèce inédite. On l'appelle **Logic**, ou le Dieu-Machine. Il absorbe les gens dans un réseau partagé, une conscience collective. Il habite le corps d'une ingénieure, Reila Audrey Haas, la sœur d'Olivia, à un stade précoce de sa divinité.

C'est une idée très moderne au milieu de ces dieux sanglants : un dieu né de la technologie, de la logique, des machines. Le XXe siècle de Fear & Hunger n'a pas chassé le divin. Il en a fabriqué de nouvelles formes.

@yt iOQI-v4EuEI | Le lore de Logic, le Dieu-Machine (en anglais).

# Les fins de Termina

Termina a trois grandes fins.

Dans la première, le joueur active trois appareils dans la ville, puis descend dans un bunker blanc. Il y affronte des soldats, puis le Kaiser lui-même, puis Logic. Le Dieu-Machine l'invite dans une terre promise, et le personnage est absorbé dans la conscience collective. Les survivants non transformés repartent par le train.

Dans la deuxième, la plus classique, le joueur est le dernier survivant. Il entre dans la Tour creuse, refuse le marché que lui propose Per'kele, l'affronte, puis affronte Rher lui-même. S'il gagne, il se réveille au sommet de la tour au matin du quatrième jour, marqué par la lumière de la lune. Le jeu raconte alors ce que devient le personnage. Levi erre de pays en pays en fuyant son passé. Abella travaille sur des machines spatiales et rêve d'atteindre la Lune. Marcoh ouvre une salle de boxe. Olivia devient une figure connue et sent la présence de sa sœur. Karin continue de chercher des preuves de l'existence des dieux nouveaux et du Kaiser, sans savoir si sa raison tiendra.

Dans la troisième, le joueur accepte le marché de Per'kele. Les deux s'affrontent et meurent. Le joueur est emporté dans le monde obscur du Dieu du Soufre, la part maudite d'Alll-mer. Ce qui suit n'est pas montré.

Aucune de ces fins n'est vraiment heureuse. Survivre, dans Termina, c'est porter la marque de la lune pour le reste de sa vie.

# Le cycle

Si l'on recule pour regarder toute l'histoire de ce monde, une forme apparaît : un cercle.

Les dieux anciens dominent les hommes. Des hommes descendent dans les profondeurs, montent sur le trône, deviennent des dieux. Ils règnent, s'épuisent, s'endorment. D'autres hommes descendent à leur tour. Francóis, devenu dieu, conclut que le temps n'est qu'un cycle. Nas'hrah, devenu dieu, conclut que l'ascension ne fait que relancer la même histoire. Les meilleurs esprits de ce monde, ceux qui sont allés le plus loin, reviennent tous avec la même découverte : on n'en sort pas.

Et pourtant, chaque génération recommence. Chaque fois, quelqu'un croit qu'il fera mieux, qu'il sera différent, que son ascension changera le monde. Alll-mer a cru qu'il libérerait les hommes, et il a fondé une Église qui les opprime. La Compagnie de 809 a obtenu pour l'humanité le droit de se gouverner, et le royaume de Rondon est devenu une tyrannie. L'enfant devenue dieu a poussé le monde vers le progrès, et le progrès a mené à des guerres mondiales.

C'est peut-être cela, le vrai sujet de Fear & Hunger : non pas la cruauté des dieux, mais le fait que ce sont des hommes qui deviennent ces dieux, et qu'ils emportent avec eux, dans la divinité, ce qu'ils étaient.

!! CE QUE LE MONDE DIT :: Dans Fear & Hunger, la souffrance n'est pas une punition venue d'en haut. Elle circule. Les hommes souffrent, deviennent des dieux, et font souffrir. Les dieux meurent, et leurs cadavres engendrent d'autres dieux. Le titre lui-même le dit : la peur et la faim ne sont pas des épreuves sur le chemin. Ce sont les forces qui font avancer ce monde.

# Pourquoi tant de cruauté ?

On peut se demander pourquoi Haverinen montre autant de violence. Ceux qui ont étudié le jeu remarquent une chose : les pires violences n'y sont jamais présentées comme un spectacle ou une récompense. Elles sont subies. Elles sont toujours du côté de la victime. Le joueur ne les inflige pas pour le plaisir : il les redoute, il les fuit, et quand elles arrivent, la partie est souvent perdue.

@art 3 | Pourquoi tant de cruauté ?

C'est un choix radical. Dans la plupart des jeux, la violence est un outil de puissance. Dans Fear & Hunger, elle est la mesure de la vulnérabilité. On est fragile, on peut tout perdre en un instant, et le monde ne nous doit rien. Cela ne rend pas le jeu agréable, ni recommandable à tout le monde. Mais cela le rend cohérent.

# Ce que tu peux en prendre

Fear & Hunger t'apprend qu'un outil modeste ne limite pas l'ambition. RPG Maker est un logiciel d'amateur. Un homme seul en a tiré un monde plus profond que celui de bien des productions à cent millions.

Il t'apprend que les règles racontent. Une pièce lancée pour sauvegarder, un bras qu'on perd pour toujours, une faim qui ne s'arrête pas : ces mécaniques disent mieux que n'importe quel texte que ce monde est sans pitié.

Il t'apprend à construire une mythologie en couches. Des dieux anciens, des dieux nouveaux, des dieux nés de dieux, une histoire qui traverse les siècles. Chaque couche éclaire les autres. Et le joueur la reconstitue lui-même, morceau par morceau.

Il t'apprend aussi qu'une suite peut changer d'époque sans perdre son âme. Termina passe du Moyen Âge à la Seconde Guerre mondiale, et c'est le même monde, les mêmes dieux, la même lune.

Et il pose une question qui vaut pour bien des récits : que deviennent ceux qui obtiennent enfin le pouvoir qu'ils cherchaient ? Dans Fear & Hunger, la réponse est presque toujours la même. Ils deviennent ce qu'ils combattaient.
`,
};
export default book;
