const book = {
  id: "infini", title: "L'infini", sub: "Apprendre à compter ce qui ne finit pas", room: "sciences", type: "apprentissage", cote: "SC-001", color: 215, emblem: "∞",
  about: "De Zénon à Cantor : comment on a cessé d'avoir peur de l'infini, et comment on a découvert qu'il en existe plusieurs. Aucune formule à connaître. Un crayon suffit.",
  links: [
    { label: "ALT 236, Stendhal Syndrome #2 : Dans l'œil d'Escher", url: "https://www.youtube.com/watch?v=eYuBXxIYvgg", note: "Une analyse de la chaîne ALT 236." },
    { label: "L'hôtel de Hilbert", url: "https://fr.wikipedia.org/wiki/H%C3%B4tel_de_Hilbert", note: "L'expérience de pensée du chapitre 6, avec ses variantes." },
    { label: "L'argument de la diagonale de Cantor", url: "https://fr.wikipedia.org/wiki/Argument_de_la_diagonale_de_Cantor", note: "La preuve du chapitre 7, écrite avec les notations des mathématiciens. Lis-la après avoir fait la tienne." },
    { label: "Galilée, Discours concernant deux sciences nouvelles (1638)", note: "Première journée : le passage sur les carrés. Trois pages qui ont deux siècles et demi d'avance." },
    { label: "Jean-Pierre Belna, Cantor (Les Belles Lettres)", note: "Une biographie courte et sûre, en français." },
    { label: "David Hilbert, Sur l'infini (1925)", note: "La conférence d'où vient la phrase sur le paradis." },
  ],
  text: String.raw`
# Avant de commencer

Ce livre ne te demande aucune connaissance. Il te demande une chose : accepter de raisonner lentement sur des idées simples, et de ne pas reculer quand la conclusion est étrange.

@img https://commons.wikimedia.org/wiki/Special:FilePath/FlammarionWoodcut.jpg?width=1100 | Gravure parue dans L'Atmosphère de Camille Flammarion, 1888 : un voyageur passe la tête à travers la voûte du ciel. | Wikimedia Commons, domaine public

Voici le chemin. D'abord un vieux paradoxe, qui montre pourquoi l'infini a fait peur pendant deux mille ans. Puis une idée d'une simplicité enfantine : compter sans nombres. Puis un hôtel. Puis une preuve, une seule, que tu feras toi-même, et qui tient en dix lignes. À la fin, tu sauras qu'il existe des infinis plus grands que d'autres, et tu sauras le démontrer. Peu de gens le savent.

Prends un crayon. Je ne plaisante pas : aux endroits marqués *à toi*, arrête-toi et cherche avant de lire la suite. C'est la différence entre comprendre et avoir lu.

# Achille ne rattrape pas la tortue

Vers 450 avant notre ère, à Élée, dans le sud de l'Italie, un philosophe nommé Zénon invente des arguments pour défendre son maître Parménide, qui soutenait que le mouvement est une illusion. Nous n'avons plus ses textes. Nous les connaissons par Aristote, qui les rapporte pour les réfuter.

Voici le plus célèbre. Achille, le plus rapide des hommes, fait la course avec une tortue. Bon prince, il lui laisse cent mètres d'avance. Disons qu'il court dix fois plus vite qu'elle.

Achille s'élance et parcourt les cent mètres. Mais pendant ce temps, la tortue a avancé de dix mètres. Achille parcourt ces dix mètres. La tortue en a fait un de plus. Achille parcourt ce mètre. La tortue a avancé de dix centimètres. Et ainsi de suite. Chaque fois qu'Achille atteint l'endroit où était la tortue, elle n'y est plus. Il y a toujours une étape de plus. Il y en a une infinité. Or on ne peut pas achever une infinité d'étapes. Donc Achille ne rattrape jamais la tortue.

Tu sais que c'est faux. Tout le monde le sait. La difficulté est de dire où est l'erreur, et elle a résisté longtemps.

!! À TOI :: Avant de continuer : à quelle distance du départ Achille rattrape-t-il la tortue ? Additionne les étapes : 100, puis 10, puis 1, puis 0,1...

La somme s'écrit 111,111... mètres, avec des 1 sans fin. C'est un nombre parfaitement ordinaire : cent onze mètres et un neuvième. Achille rattrape la tortue là, et pas ailleurs.

Voilà l'erreur de Zénon. Il suppose qu'une infinité de longueurs ajoutées donne forcément une longueur infinie. C'est faux quand les morceaux rétrécissent assez vite. Fais l'expérience avec une feuille : colorie la moitié, puis la moitié de ce qui reste, puis la moitié de ce qui reste. Tu ajoutes une infinité de morceaux, un demi, un quart, un huitième, et tu ne dépasseras jamais la feuille. Le total est exactement un.

!! À RETENIR :: Une infinité de choses peut tenir dans un espace fini. Une somme sans fin peut avoir un résultat. C'est la première surprise, et la plus douce.

Il faudra pourtant attendre le XIXe siècle pour savoir l'écrire rigoureusement. Entre-temps, on a préféré interdire.

# L'interdit d'Aristote

Aristote règle la question par une distinction qui tiendra plus de vingt siècles.

Il y a, dit-il, deux manières de parler de l'infini. L'infini *en puissance* : tu peux toujours ajouter un à un nombre, toujours couper un segment en deux. C'est un processus qui ne s'arrête pas, et il n'y a là rien de scandaleux. Et l'infini *en acte* : une totalité infinie, donnée d'un coup, achevée, qu'on pourrait tenir dans la main comme un objet. Celui-là, dit Aristote, n'existe pas. Il n'y a pas de nombre infini, pas de grandeur infinie. Il n'y a que des choses finies qu'on peut toujours prolonger.

C'est une solution prudente, et elle marche très bien. Les mathématiciens grecs, puis arabes, puis européens, ont fait d'immenses choses en la respectant. Euclide ne dit pas qu'il y a une infinité de nombres premiers : il dit qu'il y en a plus que toute quantité qu'on lui proposera. La nuance est exactement celle d'Aristote.

En 1831 encore, le plus grand mathématicien de son temps, Gauss, écrit à un ami qu'il proteste contre l'usage d'une grandeur infinie comme d'une chose achevée : l'infini, dit-il, n'est qu'une façon de parler.

Pourquoi tant de méfiance ? Parce que ceux qui avaient regardé l'infini en face y avaient vu des monstres. Le plus clair de ces regards est celui de Galilée.

# Le scandale de Galilée

En 1638, vieux, aveugle bientôt, assigné à résidence par l'Inquisition, Galilée publie son dernier livre. C'est un dialogue. Au détour d'une discussion sur la matière, ses personnages tombent sur une question qui n'a rien à voir, et qu'ils ne savent pas résoudre.

Prends les nombres entiers : 1, 2, 3, 4, 5, et ainsi de suite. Prends maintenant leurs carrés : 1, 4, 9, 16, 25. Lesquels sont les plus nombreux ?

Première réponse, évidente : les entiers. Tous les carrés sont des entiers, mais beaucoup d'entiers ne sont pas des carrés : 2, 3, 5, 6, 7, 8. Les carrés se font même de plus en plus rares à mesure qu'on avance. Entre 1 et 100, il y en a dix. Entre 1 et 10 000, il y en a cent : un sur cent.

Deuxième réponse, tout aussi évidente. Chaque entier a un carré, et un seul. Chaque carré vient d'un entier, et d'un seul. Range-les sur deux lignes :

!! 1, 2, 3, 4, 5, 6 ... :: en dessous : 1, 4, 9, 16, 25, 36 ...

Personne n'est oublié, personne n'est en double. Il y a donc exactement autant de carrés que d'entiers.

Les deux raisonnements sont corrects, et ils se contredisent. Une partie serait aussi grande que le tout. Or c'était l'un des axiomes d'Euclide, de ceux qu'on ne discute pas : le tout est plus grand que la partie.

Galilée conclut avec sagesse. Les mots *égal*, *plus grand* et *plus petit*, dit son personnage, n'ont de sens que pour les quantités finies. Pour l'infini, ils ne s'appliquent pas. Il referme la porte et retourne à la physique.

Il avait tout sous les yeux. Il lui manquait seulement l'audace de prendre la deuxième réponse au sérieux.

# Compter sans savoir compter

Cette audace vient deux siècles et demi plus tard, d'un homme né à Saint-Pétersbourg en 1845, professeur dans une petite université allemande, à Halle : Georg Cantor.

Son point de départ est une question que tu n'as jamais pensé à te poser. Que veut dire *autant* ?

Imagine un berger qui ne sait pas compter. Il veut savoir, le soir, si toutes ses bêtes sont rentrées. Le matin, il met un caillou dans un sac pour chaque mouton qui sort. Le soir, il en retire un pour chaque mouton qui rentre. Si le sac est vide quand le dernier passe, le compte est bon. Il ne sait pas combien il a de moutons. Il sait qu'il y en a autant que de cailloux.

Ou imagine une salle de spectacle. Tu veux savoir s'il y a autant de spectateurs que de fauteuils. Tu n'as pas besoin de compter les uns, puis les autres. Tu regardes : si personne n'est debout et qu'aucun fauteuil n'est vide, c'est qu'il y en a autant.

Voilà l'idée. Deux collections ont autant d'éléments quand on peut les *apparier* : associer à chaque élément de l'une un élément de l'autre, sans en oublier et sans en répéter. Les mathématiciens appellent cela une bijection. Garde le mot du berger si tu préfères.

Ce qui est remarquable, c'est que cette définition ne demande pas de savoir compter. Elle vient avant les nombres. Et puisqu'elle ne demande pas d'arriver au bout d'un décompte, rien n'empêche de l'appliquer à des collections qui n'ont pas de bout.

C'est exactement ce qu'avait fait Galilée avec ses deux lignes. Cantor accepte le résultat. Oui, il y a autant de carrés que d'entiers. Oui, une partie peut être aussi grande que le tout. Ce n'est pas une contradiction : c'est la *marque* de l'infini. Son ami Richard Dedekind en fera même la définition : une collection est infinie quand on peut l'apparier avec l'une de ses propres parties. Aucune collection finie ne le peut. Retire un fauteuil à une salle pleine, quelqu'un reste debout.

!! À RETENIR :: Autant veut dire : on peut apparier. Pour les collections infinies, le tout n'est pas forcément plus grand que la partie. L'axiome d'Euclide ne vaut que pour le fini.

# L'hôtel de Hilbert

Pour faire sentir tout cela à ses étudiants, le mathématicien David Hilbert a inventé, dans un cours des années 1920, un hôtel. Je te le fais visiter.

L'hôtel a une infinité de chambres, numérotées 1, 2, 3, 4, et ainsi de suite, sans dernière. Ce soir, il est complet : chaque chambre est occupée.

Un voyageur se présente. Dans un hôtel ordinaire, complet veut dire complet. Ici, le réceptionniste sourit, et prend le micro.

!! À TOI :: Que dit-il ? Il n'a pas le droit de mettre deux clients dans une chambre, ni d'en renvoyer un seul.

Il demande à chaque client de passer dans la chambre suivante. Celui de la 1 va dans la 2, celui de la 2 dans la 3, celui de la 3 dans la 4. Chacun a une chambre, puisque chaque chambre a une suivante. Et la chambre 1 est libre. Le voyageur s'y installe.

Infini plus un égale infini. Ce n'est pas une formule vague : tu viens de voir l'appariement.

Une heure plus tard arrive un autocar. Il est infini lui aussi : il contient une infinité de passagers, numérotés 1, 2, 3. Décaler tout le monde d'une chambre ne suffit plus, ni de mille.

!! À TOI :: Cherche. Il faut libérer une infinité de chambres d'un coup, sans expulser personne.

Le réceptionniste demande à chaque client de passer dans la chambre dont le numéro est le double du sien. Le client de la 1 va dans la 2, celui de la 2 dans la 4, celui de la 3 dans la 6. Tous les anciens clients occupent maintenant les chambres paires. Toutes les chambres impaires sont libres, et il y en a une infinité : le passager 1 prend la chambre 1, le passager 2 la chambre 3, le passager 3 la chambre 5.

Infini plus infini égale infini.

On peut aller plus loin. Une infinité d'autocars infinis arrive en même temps. L'hôtel les loge encore. Je te donne seulement l'idée : range tous les voyageurs dans un grand tableau, une ligne par autocar, puis parcours ce tableau en diagonales, en zigzag, de coin en coin. Chaque voyageur finit par être atteint, à un rang précis. Ce rang est son numéro de chambre.

Cette dernière astuce a une conséquence qui a stupéfié Cantor lui-même. Les fractions, un demi, deux tiers, sept quarts, semblent infiniment plus nombreuses que les entiers : entre deux entiers, il y en a déjà une infinité, et entre deux fractions, il y en a encore une autre. Pourtant, on peut les ranger dans ce même tableau, numérateur en ligne, dénominateur en colonne, et les numéroter en zigzag. Il y a autant de fractions que d'entiers.

À ce stade, tu es en droit de penser que le mot *autant* ne veut plus rien dire. Tout ce qui est infini peut loger dans l'hôtel. Il n'y aurait donc qu'un seul infini, toujours le même, et l'affaire serait close.

C'est ce que tout le monde aurait parié. C'est faux.

# Un infini plus grand

Voici la preuve. Elle date de 1891. Elle est si courte que tu peux la retenir pour la vie, et elle est l'une des plus belles que les hommes aient trouvées.

Prenons, à la place des nombres, quelque chose de plus simple à dessiner : des suites infinies de pile ou face. Par exemple :

!! P F P P F F P ... :: une suite sans fin. Chacune est un client possible.

La question est : peut-on loger *toutes* les suites possibles de pile ou face dans l'hôtel de Hilbert, une par chambre ?

Supposons que oui. Supposons que quelqu'un, très habile, y soit parvenu, et qu'il te tende le registre de l'hôtel. Chambre 1 : telle suite. Chambre 2 : telle autre. Et il affirme : elles y sont toutes.

Tu vas lui prouver qu'il se trompe, sans même lire son registre en entier. Tu vas fabriquer une suite qui n'est dans aucune chambre.

Regarde le premier tirage de la suite de la chambre 1. Si c'est pile, écris face. Si c'est face, écris pile. Voilà le premier tirage de ta suite.

Regarde le deuxième tirage de la suite de la chambre 2. Écris le contraire. Voilà ton deuxième tirage.

Regarde le troisième tirage de la chambre 3, écris le contraire. Et continue ainsi, en descendant la diagonale du registre : pour la chambre numéro tant, tu regardes le tirage numéro tant, et tu l'inverses.

Tu obtiens une suite de pile ou face parfaitement définie. Où est-elle logée ?

!! À TOI :: Est-elle dans la chambre 1 ? Dans la chambre 2 ? Dans la chambre 1000 ? Dis pourquoi avant de lire.

Elle n'est pas dans la chambre 1 : elle diffère de la suite de la chambre 1 par son premier tirage, tu l'as fait exprès. Elle n'est pas dans la chambre 2 : elle en diffère par le deuxième. Elle n'est pas dans la chambre 1000 : elle en diffère par le millième. Elle n'est dans aucune chambre, puisqu'elle a été construite pour être différente de chacune, à un endroit au moins.

Le registre était donc incomplet. Et remarque bien que ton raisonnement ne dépend pas du registre : quel que soit celui qu'on te tend, la même manœuvre fabrique un absent. Ajouter l'absent ne répare rien : sur le registre corrigé, tu recommences.

Conclusion : il est *impossible* de loger toutes les suites de pile ou face dans l'hôtel. Ce n'est pas qu'on n'a pas encore trouvé comment. C'est qu'il n'existe aucune façon. Les chambres sont en nombre infini, les suites sont en nombre infini, et pourtant il y a strictement plus de suites que de chambres.

Il existe au moins deux infinis, et le second est plus grand que le premier.

!! À RETENIR :: L'argument de la diagonale. On suppose une liste complète ; on construit, en changeant la diagonale, un élément qui ne peut pas y figurer. Donc aucune liste n'est complète.

# Ce que cela veut dire

Les suites de pile ou face ne sont pas une curiosité. Remplace pile par 0 et face par 1 : chaque suite est l'écriture d'un nombre, comme 0,0100110..., un point sur une règle entre zéro et un. La preuve dit donc ceci : les points d'un segment de droite, si petit soit-il, sont plus nombreux que tous les nombres entiers. On ne peut pas les numéroter.

Cantor donne des noms. L'infini des entiers, celui de l'hôtel, il l'appelle *dénombrable* : c'est le plus petit. L'infini des points de la droite, il l'appelle le *continu*. Pour les désigner, il lui faut des symboles nouveaux, et il prend la première lettre de l'alphabet hébreu : aleph. Aleph zéro est le nombre des entiers. C'est un vrai nombre, d'un genre nouveau, qui répond à la question *combien*.

Et la surprise n'est pas finie. Cantor avait cherché une collection plus grande encore que le continu. Il pensait la trouver dans le plan : une feuille doit bien contenir plus de points qu'un trait. En 1877, il démontre le contraire. Il y a exactement autant de points dans un carré que sur un de ses côtés, autant dans l'espace entier que sur un segment d'un centimètre. Il écrit à Dedekind, en français dans une lettre en allemand :

> Je le vois, mais je ne le crois pas. | Georg Cantor, lettre à Richard Dedekind, 29 juin 1877

Mais des infinis plus grands existent. Reprends la preuve de la diagonale : elle fonctionne pour n'importe quelle collection. Les mathématiciens le disent ainsi : l'ensemble de toutes les parties d'un ensemble est toujours strictement plus grand que lui. On peut donc recommencer. Au-dessus des entiers, le continu. Au-dessus du continu, un infini plus grand. Au-dessus encore, un autre. Il n'y a pas de plus grand infini. Il y a une échelle infinie d'infinis.

# Le prix

Tu imagines l'accueil.

Le mathématicien le plus puissant d'Allemagne, Leopold Kronecker, qui avait été le professeur de Cantor à Berlin, tenait que seuls les nombres entiers existent vraiment, et que tout le reste est une construction des hommes. Il jugea ces travaux dépourvus de sens et s'employa à en gêner la publication. Cantor espéra toute sa vie une chaire à Berlin. Il ne l'eut jamais et resta à Halle.

Il répondit par une phrase qui est devenue une devise :

> L'essence des mathématiques réside précisément dans leur liberté. | Georg Cantor, Fondements d'une théorie générale des ensembles, 1883

Il voulait dire : un objet mathématique n'a pas à demander la permission d'exister. Il suffit qu'il ne se contredise pas.

À partir de 1884, Cantor traverse de graves crises de dépression, qui reviendront jusqu'à la fin. Il s'éloigne par moments des mathématiques, se passionne pour la théologie, écrit à Rome pour assurer que ses infinis ne menacent pas celui de Dieu. Il meurt en janvier 1918 dans une clinique de Halle, en pleine guerre.

Il avait eu le temps de voir le vent tourner. La génération suivante adopta sa théorie comme le sol même des mathématiques. En 1925, Hilbert, devenu le premier mathématicien du monde, prononça cette phrase :

> Du paradis que Cantor a créé pour nous, nul ne doit pouvoir nous chasser. | David Hilbert, Sur l'infini, 1925

# La question sans réponse

Il reste une question, la plus simple de toutes, et Cantor s'y est usé.

Nous avons deux infinis : celui des entiers, et celui du continu, plus grand. Y en a-t-il un *entre les deux* ? Existe-t-il une collection de points sur la droite qui soit trop grosse pour entrer dans l'hôtel, mais trop petite pour égaler la droite entière ?

Cantor était convaincu que non. C'est ce qu'on appelle l'hypothèse du continu. Il a cru la démontrer, puis démontrer son contraire, puis de nouveau la démontrer. Il n'y est jamais parvenu. En 1900, à Paris, Hilbert dresse la liste des vingt-trois problèmes qu'il lègue au siècle qui commence. Celui-là est le premier.

La réponse est arrivée en deux temps, et personne ne l'attendait sous cette forme.

En 1938, le logicien Kurt Gödel démontre qu'à partir des axiomes usuels des mathématiques, on ne peut pas réfuter l'hypothèse du continu. En 1963, un jeune Américain, Paul Cohen, démontre qu'à partir des mêmes axiomes, on ne peut pas non plus la prouver.

Lis bien. Ce n'est pas : nous ne savons pas encore. C'est : nous savons, par démonstration, que les règles du jeu ne tranchent pas. On peut bâtir des mathématiques cohérentes où il n'y a rien entre les deux infinis, et d'autres, tout aussi cohérentes, où il y a quelque chose. Les axiomes que tout le monde accepte ne choisissent pas.

Certains pensent qu'il faut chercher un axiome de plus, et qu'un jour on saura. D'autres pensent que la question n'a pas de réponse, comme il n'y a pas de réponse à *les échecs se jouent-ils mieux sur neuf cases de large ?* Le débat est ouvert aujourd'hui.

# Ce que tu sais maintenant

Reprends le chemin, sans regarder.

Une infinité de morceaux peut faire un total fini : c'est pour cela qu'Achille rattrape la tortue. Autant veut dire qu'on peut apparier : c'est le berger et ses cailloux. Une collection infinie peut être appariée avec une de ses parties : c'est Galilée et les carrés, et c'est ce qui permet à l'hôtel de Hilbert de n'être jamais plein. Et pourtant tout ne rentre pas dans l'hôtel : l'argument de la diagonale fabrique toujours un absent. Il y a donc plusieurs infinis, une échelle sans sommet, et entre les deux premiers barreaux, une question que les mathématiques ont prouvé ne pas pouvoir trancher.

!! POUR VÉRIFIER :: Explique la diagonale à quelqu'un, ce soir, avec une feuille et des pile ou face. Si tu y arrives en cinq minutes, tu as compris. Si tu bloques, tu sais exactement quel chapitre relire.

Une dernière remarque, qui dépasse les mathématiques. Pendant deux mille ans, les plus grands esprits ont tenu l'infini pour impensable. Il n'a pas fallu un calcul plus puissant pour le penser. Il a fallu revenir à une question d'enfant, *qu'est-ce que ça veut dire, autant ?*, et avoir le courage de suivre la réponse jusqu'au bout, même quand elle contredisait Euclide.

La plupart des portes fermées le sont de cette façon. Non par manque de force. Par une évidence que personne ne pense à interroger.

@yt eYuBXxIYvgg | ALT 236, Stendhal Syndrome #2 : Dans l'œil d'Escher (2017). Les mondes impossibles et l'infini dessiné.

`,
};
export default book;
