const book = {
  id: "rois-des-ombres", title: "Les rois des ombres", sub: "Journaux de reines et de rois du crime, de Canton à Chicago, de Harlem à Medellín", room: "histoire", type: "pensee", cote: "HI-016", color: 42, emblem: "♠",
  about: "Une reine pirate de la mer de Chine, le parrain de l'opium de Shanghai, le cerveau du crime new-yorkais, Al Capone, Lucky Luciano, la reine des loteries de Harlem et Bumpy Johnson, son parrain, le premier ennemi public de l'après-guerre, Jacques Mesrine, une reine de beauté devenue figure de la Camorra, un parrain yakuza, la reine des bandits de l'Inde et la marraine de la cocaïne de Miami. Treize journaux intimes imaginés, à la première personne. Les faits, eux, sont réels, et rappelés à la fin de chaque journal, avec ceux qui en ont payé le prix.",
  links: [
    { label: "Dian Murray, Pirates of the South China Coast, 1790-1810 (1987)", note: "L'étude de référence sur la confédération de Zheng Yi Sao." },
    { label: "Brian G. Martin, The Shanghai Green Gang (1996)", note: "Du Yuesheng, l'opium et le pouvoir à Shanghai." },
    { label: "Shirley Stewart, The World of Stephanie St. Clair (2014)", note: "La reine des loteries de Harlem, née aux Antilles françaises." },
    { label: "Phoolan Devi, Moi, Phoolan Devi, reine des bandits (1996)", note: "Son autobiographie, dictée à deux journalistes." },
    { label: "Jacques Mesrine, L'Instinct de mort (1977)", note: "Le seul livre écrit par l'un d'eux, en prison. À lire en sachant qu'il se met en scène." },
    { label: "Laurence Bergreen, Capone: The Man and the Era (1994)", note: "La biographie de référence." },
    { label: "Mayme Hatcher Johnson, Harlem Godfather (2008)", note: "Bumpy Johnson raconté par sa veuve." },
    { label: "Cocaine Cowboys (2006)", note: "Le documentaire sur la guerre de la cocaïne à Miami, où apparaît Griselda Blanco." },
    { label: "F. Scott Fitzgerald, Gatsby le Magnifique (1925)", note: "Le personnage de Meyer Wolfsheim, l'homme qui a truqué les World Series, est inspiré d'Arnold Rothstein." },
  ],
  text: String.raw`
# Avant d'ouvrir ces journaux

Les journaux qui suivent sont imaginés. Aucune de ces femmes, aucun de ces hommes n'a écrit ces pages. Elles sont reconstituées à partir de ce qu'on sait de leur vie : procès, archives de police, enquêtes de journalistes et d'historiens, et parfois leurs propres récits, quand ils en ont laissé. Le but est d'entendre la voix qu'ils avaient dans la tête. Celle d'une personne qui se raconte comme une reine, un homme d'affaires, une bienfaitrice, une vengeresse ou un rebelle. Presque jamais comme quelqu'un qui fait du mal.

On croit connaître les rois les plus célèbres de l'ombre : Al Capone, Lucky Luciano, Jacques Mesrine. Le cinéma, les séries et les chansons les ont transformés en légendes, et ce livre leur donne la parole, comme aux autres. Mais il va aussi chercher des figures moins évidentes, et des femmes, car le crime organisé n'a jamais été une affaire d'hommes seulement, même si les récits l'ont souvent oublié. Une pirate chinoise du XIXe siècle qui commandait plus de navires que bien des marines. Une immigrée antillaise qui a tenu tête à la mafia de New York, avec à ses côtés un jeune homme de Harlem qui deviendra son parrain, Bumpy Johnson. Une jeune fille de basse caste devenue la hors-la-loi la plus célèbre de l'Inde.

À la fin de chaque journal, un encadré dit ce qui s'est réellement passé, et ce que cela a coûté.

# Les mers et l'opium de la Chine

Au tournant du XIXe siècle, la côte du sud de la Chine est un monde à part. Des milliers d'îles, d'estuaires et de criques entre Canton et le Vietnam, des villages de pêcheurs qui vivent sur l'eau, des marchands européens qui attendent, à Macao et à Canton, le thé, la soie et la porcelaine. L'empire des Qing est immense, mais sa marine est faible, et la mer appartient à qui sait la tenir. Un siècle plus tard, la ville de Shanghai, ouverte de force aux étrangers après les guerres de l'opium, est devenue la plus grande métropole d'Asie, divisée en concessions où chaque puissance fait sa loi. Dans ces deux mondes, des femmes et des hommes venus de tout en bas ont bâti des empires.

## Zheng Yi Sao, la mer de Chine

*Canton, 1801.* Je travaille sur un bateau de fleurs, une de ces maisons flottantes du port où les marins viennent boire, jouer et payer des femmes. Je ne sais pas lire. Mais je sais compter, et je sais écouter les hommes quand ils boivent. Un capitaine pirate, Zheng Yi, m'a demandée en mariage. J'ai posé mes conditions : une part de son butin, et le droit de parler dans ses conseils. Il a accepté. Les autres rient. Ils ne riront pas longtemps.

*1805.* Les pirates de la côte se battaient entre eux comme des chiens. Mon mari les a réunis en une confédération, six flottes, chacune avec sa couleur. La nôtre est la Flotte rouge, la plus grande. Nous ne sommes plus des voleurs de barques : nous taxons les villages de la côte, nous vendons des laissez-passer aux navires marchands, nous protégeons ceux qui paient. Nous sommes un gouvernement de la mer.

*1807.* Zheng Yi est mort dans une tempête. Les capitaines croyaient que la flotte allait se partager entre eux. Je l'ai prise. J'ai choisi pour me seconder Zhang Bao, un garçon de pêcheur que mon mari avait adopté et formé. Il commande les batailles, je commande tout le reste. Plus tard, je l'épouserai.

*1808.* J'ai écrit des lois, ou plutôt je les ai fait écrire. Celui qui désobéit à un ordre a la tête tranchée. Celui qui vole le butin commun, ou qui le cache, est puni. Celui qui déserte perd ses oreilles. Le butin est enregistré, et partagé selon des règles. Les femmes capturées ne doivent pas être violées : celui qui le fait meurt. Certains disent que je suis cruelle. Je dis qu'une armée sans loi n'est qu'une foule, et qu'une foule finit toujours par se noyer.

*1809.* L'empereur a envoyé ses jonques de guerre contre nous. Nous les avons détruites ou capturées. Les Portugais de Macao et les Anglais de la Compagnie des Indes ont essayé à leur tour. Nous avons pris leurs navires, et nous avons demandé des rançons pour leurs marins. Des dizaines de milliers d'hommes m'obéissent, et des centaines de navires. Je sais pourtant qu'aucune flotte ne gagne une guerre éternelle contre un empire.

*Canton, 1810.* Je suis allée moi-même, sans armes, avec des femmes et des enfants de nos équipages, au palais du gouverneur, pour négocier. Ils voulaient notre reddition. J'ai obtenu notre pardon. Nous gardons notre argent. Zhang Bao reçoit un grade dans la marine impériale, et des navires pour chasser les pirates qui n'ont pas suivi. Je descends à terre, vivante, riche, et libre. Combien de pirates peuvent en dire autant ?

!! CE QUI S'EST PASSÉ :: Zheng Yi Sao, qu'on appelle aussi Ching Shih, a commandé de 1807 à 1810 l'une des plus grandes forces pirates de l'histoire, avec des centaines de navires et des dizaines de milliers de pirates. Sa confédération a rançonné les villages côtiers, attaqué des navires et vendu des captifs. Après l'amnistie de 1810, elle a vécu à Canton, où elle tenait, dit-on, une maison de jeu. Elle est morte en 1844, à près de soixante-dix ans, dans son lit.

## Du Yuesheng, Shanghai

*Shanghai, 1900.* Je vends des fruits sur les quais de la rivière Huangpu. Mes parents sont morts, je ne sais pas écrire, et j'ai de grandes oreilles dont tout le monde se moque. On m'appellera plus tard Du aux grandes oreilles, et ceux qui riaient trembleront. Je fais des courses pour la Bande verte, la société secrète qui tient les docks, les tripots, les maisons de passe.

*1915.* Je travaille pour Huang Jinrong. Il est à la fois chef de la police chinoise de la Concession française et l'un des parrains de la Bande verte. Dans cette ville, la loi et le crime portent souvent le même uniforme. Je m'occupe de l'opium. Les Français ferment les yeux, et je leur verse ce qu'il faut pour qu'ils continuent à les fermer.

*1925.* L'opium m'a rendu riche, plus riche que mon maître. Je contrôle son commerce dans toute la Concession. Je suis aussi devenu un homme respectable : je porte une longue robe de soie, je fonde des écoles, je donne aux hôpitaux, je finance des opéras. Les banquiers me saluent. Ce qu'ils savent de moi, ils préfèrent l'oublier.

*Avril 1927.* Le général Tchang Kaï-chek veut se débarrasser des communistes qui tiennent les syndicats de Shanghai. Il ne peut pas le faire lui-même, pas encore. Nous, nous pouvons. J'ai invité Wang Shouhua, le chef des syndicats ouvriers, à dîner chez moi. Il est venu. Il n'est jamais reparti. Le 12 avril, mes hommes, en brassards blancs, ont attaqué les ouvriers armés dans toute la ville. Les soldats ont suivi. La rue s'est couverte de morts. Le général m'en est reconnaissant. On me donne un grade de général, je siège dans des banques, des chambres de commerce et des œuvres de charité.

*1937.* Les Japonais attaquent Shanghai. Je ne resterai pas sous leurs ordres. Je pars à Hong Kong, puis à l'intérieur du pays, et je continue à servir le gouvernement : la contrebande, le renseignement, l'argent. Je fume moi-même l'opium que j'ai vendu à des millions de gens. Il me ronge, comme il les a rongés.

!! CE QUI S'EST PASSÉ :: Du Yuesheng a dominé le trafic d'opium de Shanghai dans les années 1920 et 1930 et fait de la Bande verte une puissance politique. Le massacre du 12 avril 1927, auquel ses hommes ont participé, a fait des centaines de morts, peut-être bien plus, et marqué le début de la répression des communistes par le Guomindang. Après la victoire communiste de 1949, il s'est réfugié à Hong Kong, où il est mort en 1951.

# La Prohibition

Le 16 janvier 1920, les États-Unis interdisent la fabrication, le transport et la vente de l'alcool. Le dix-huitième amendement à la Constitution, porté par des ligues de tempérance et des églises protestantes, devait rendre le pays plus sobre et plus moral. Il va enrichir le crime comme rien auparavant. Pendant treize ans, jusqu'en décembre 1933, des millions d'Américains continuent de boire dans des bars clandestins, les speakeasies, et des bandes d'immigrés, irlandais, juifs, italiens, polonais, deviennent des entreprises qui brassent des millions de dollars, achètent des policiers, des juges, des élus, et se font la guerre à la mitraillette dans les rues de Chicago et de New York. Trois hommes ont dessiné ce nouveau monde.

## Arnold Rothstein, le cerveau

*New York, 1899.* Mon père est un commerçant respecté, pieux, généreux. Mon frère aîné étudiait pour devenir rabbin. Moi, je joue aux dés dans les ruelles et je gagne. Je ne bois pas, je ne fume pas, je ne me bats pas. Je calcule. Les autres jouent avec leur chance. Je joue avec la leur.

*1910.* J'ai ouvert une maison de jeu, puis plusieurs. Je prête de l'argent à ceux qui perdent, avec des intérêts. Je parie sur les courses de chevaux, et je m'arrange pour savoir avant les autres. On m'appelle le Cerveau. Les hommes politiques de la ville viennent jouer chez moi, et je les laisse gagner quand il le faut.

*1919.* La finale du championnat de baseball, les World Series. Des joueurs de l'équipe de Chicago ont accepté de perdre exprès. On dit que c'est moi qui ai payé. Je dis que des escrocs se sont servis de mon nom. Je suis allé témoigner devant le grand jury, calme, élégant. Ils n'ont rien pu prouver. J'ai gagné beaucoup d'argent cette semaine-là. Le pays entier découvre que même son sport national peut s'acheter.

*1923.* La Prohibition est la plus grande affaire de ma vie. Je ne vends pas l'alcool : je finance ceux qui le vendent. Je fais venir le whisky d'Europe par bateaux entiers. Je prête aux jeunes gangsters de la ville, je leur apprends à s'habiller, à parler, à corrompre plutôt qu'à tuer. Ils s'appellent Luciano, Lansky, Costello. Je fais avec le crime ce que les grandes banques font avec l'industrie. J'organise.

*Novembre 1928.* J'ai perdu une partie de poker, il y a quelques semaines, une très grosse somme. J'ai refusé de payer : je pense que la partie était truquée. Ce soir, on m'a appelé pour un rendez-vous dans un hôtel. J'y vais.

!! CE QUI S'EST PASSÉ :: Arnold Rothstein a été blessé par balle le 4 novembre 1928 à l'hôtel Park Central de New York et est mort deux jours plus tard. Il a refusé de dire qui avait tiré. Son rôle dans le scandale des « Black Sox » de 1919 n'a jamais été prouvé devant un tribunal. Il est considéré comme celui qui a transformé les bandes new-yorkaises en un crime organisé, financé et structuré comme une entreprise, et il a inspiré à Fitzgerald le personnage de Meyer Wolfsheim.

## Al Capone, Chicago

*Brooklyn, 1917.* On m'a ouvert la joue au couteau dans un bar de Coney Island, le Harvard Inn, pour une phrase de trop à une fille assise avec son frère. Trois entailles, de l'oreille à la bouche. Je travaille comme videur pour Frankie Yale, qui tient l'endroit et une partie du port. Les journaux m'appelleront plus tard Scarface, et je détesterai ce nom toute ma vie. Sur les photos, je tournerai toujours le bon profil vers l'objectif. Pour l'instant, je casse des bras, je ramasse l'argent des paris, et j'apprends comment fonctionne un quartier : qui paie qui, qui a peur de qui, qui ferme les yeux.

*Chicago, 1921.* Johnny Torrio m'a fait venir ici. Il est petit, calme, il ne boit pas, il ne jure pas, il rentre dîner chez sa femme tous les soirs. Et il a compris avant tout le monde ce que la Prohibition allait faire de nous. Depuis janvier 1920, le pays a interdit l'alcool. Le pays a soif quand même. Les ouvriers des abattoirs, les employés de bureau, les juges, les policiers, les sénateurs : tout le monde veut boire. Nous allons leur vendre de la bière, du whisky, du gin fabriqué dans des baignoires, et nous allons devenir plus riches que les banquiers.

*1924.* Nous avons pris Cicero, une ville de la banlieue ouest. Le jour des élections municipales, mes hommes ont tenu les bureaux de vote avec des revolvers. Notre candidat a gagné. La police de Cicero nous appartient, la mairie aussi. Mon frère Frank a été tué dans la fusillade avec les policiers de Chicago venus mettre de l'ordre. Je l'ai enterré dans un cercueil d'argent. Les fleurs ont coûté une fortune. Je pleure à l'enterrement, devant tout le monde.

*Janvier 1925.* Torrio s'est fait tirer dessus devant chez lui, par les hommes du North Side, la bande irlandaise de Dean O'Banion, que nous avions fait tuer quelques mois plus tôt dans sa boutique de fleuriste. Torrio a survécu. Il a eu peur. Il est parti en Italie, et il m'a tout laissé. J'ai vingt-six ans et je possède des brasseries, des centaines de bars clandestins, des maisons closes, des tripots, une ville de banlieue entière, et la moitié de la police.

*1927.* Je reçois les journalistes dans ma suite de l'hôtel Metropole, au milieu des tapis et des portraits de George Washington. Je leur dis que je suis un homme d'affaires, que je rends service au public, que tout le monde boit et que moi seul ai le courage de le dire. Je dis : quand je vends de l'alcool, on appelle ça de la contrebande ; quand mes clients le servent sur des plateaux d'argent sur Lake Shore Drive, on appelle ça de l'hospitalité. Ils l'écrivent. Les gens me saluent dans la rue. Au stade, la foule m'applaudit. Les North Siders, eux, ne comprennent pas que la guerre coûte plus cher que la paix. L'an dernier, ils ont mitraillé mon quartier général de Cicero, l'hôtel Hawthorne, depuis une file de voitures, en plein jour, pendant que je déjeunais. Je ne l'oublierai pas.

*Février 1929.* Je suis en Floride, dans ma villa de Palm Island, au soleil, le 14 février. Tout le monde le sait. J'ai même rendez-vous ce jour-là avec le procureur du comté de Miami. C'est très bien ainsi.

*1930.* La Bourse s'est effondrée, la crise est partout. J'ai ouvert une soupe populaire pour les chômeurs de Chicago. Des milliers de repas par jour, du café, des beignets, sans poser de questions. Les journaux m'appellent maintenant l'ennemi public numéro un. Le président Hoover lui-même a demandé qu'on m'arrête. Un jeune agent du Trésor, Eliot Ness, détruit mes brasseries une à une avec un camion blindé, et il convoque les photographes chaque fois. Ça me coûte de l'argent, pas ma liberté.

*Octobre 1931.* Ils m'ont eu, mais pas pour un meurtre, ni pour l'alcool. Pour mes impôts. Des comptables du Trésor ont fouillé pendant des années mes dépenses : mes costumes, mes chemises de soie, mes villas, mes voitures, les factures de mes fêtes. Ils ont prouvé que je dépensais un argent que je n'avais jamais déclaré. Onze ans. J'ai toujours payé tout le monde, sauf l'État.

!! CE QUI S'EST PASSÉ :: Le 14 février 1929, sept hommes liés au gang de Bugs Moran ont été alignés contre un mur d'un garage de Chicago et tués à la mitraillette par des hommes déguisés en policiers. Le massacre de la Saint-Valentin est attribué à l'organisation de Capone, qui n'a jamais été inculpé. Les guerres de la Prohibition ont fait des centaines de morts à Chicago. Capone a été condamné en octobre 1931 à onze ans de prison pour fraude fiscale, envoyé à Atlanta puis à Alcatraz en 1934. Libéré en 1939, rongé par une syphilis qui avait atteint son cerveau, il a fini sa vie dans sa villa de Floride avec l'esprit d'un enfant. Il est mort en janvier 1947, à quarante-huit ans.

@yt 2J5OE16C_zY | Capone (2020), de Josh Trank, avec Tom Hardy : les dernières années, en Floride, quand la mémoire s'en va. Bande-annonce.

## Lucky Luciano, New York

*New York, 1906.* J'ai huit ans, je viens de Sicile, de Lercara Friddi, un village de mineurs de soufre. Je ne parle pas anglais. Dans le Lower East Side, les immeubles sont si serrés qu'on voit à peine le ciel, et chaque rue a sa bande, juive, irlandaise, italienne. Je fais payer aux petits garçons juifs une protection pour aller à l'école sans être battus. Un jour, l'un d'eux refuse. Il est maigre, il se bat comme un fou, et il ne lâche rien. Il s'appelle Meyer Lansky. Il deviendra mon meilleur ami, et le meilleur cerveau que j'aie jamais connu.

*1916.* La maison de correction, pour avoir vendu de l'héroïne. Six mois. J'ai compris là-bas qu'on ne se fait pas prendre avec la marchandise sur soi. On la fait porter par d'autres. *1920.* La Prohibition. Avec Lansky et Bugsy Siegel, puis Frank Costello, nous faisons venir l'alcool par bateaux entiers depuis le Canada et les Caraïbes. Arnold Rothstein, le banquier du crime, finance nos premiers chargements et nous apprend à nous habiller, à parler, à corrompre plutôt qu'à tuer.

*1929.* On m'a enlevé, battu, poignardé, laissé pour mort sur une plage de Staten Island. J'ai survécu. Depuis, on m'appelle Lucky, le chanceux. Je ne sais toujours pas qui l'a fait. Je sais seulement ce que cela m'a appris : les vieux chefs siciliens se font la guerre pour des questions d'honneur et de villages d'origine. Joe Masseria d'un côté, Salvatore Maranzano de l'autre. Ils tuent des gens qui pourraient leur rapporter de l'argent. Ils refusent de travailler avec les juifs, avec les Irlandais, avec quiconque n'est pas de leur île. Le monde a changé. Eux non. On les appelle les moustachus.

*15 avril 1931.* J'ai déjeuné avec Joe Masseria, mon patron, dans un restaurant de Coney Island. Nous avons beaucoup mangé, puis joué aux cartes. Je suis allé aux toilettes. Quand je suis revenu, il était mort, et ceux qui avaient tiré étaient partis. *10 septembre 1931.* Salvatore Maranzano, qui croyait avoir gagné la guerre et se faisait appeler le chef de tous les chefs, a reçu dans son bureau de Park Avenue des hommes qui se présentaient comme des inspecteurs des impôts. Il avait prévu de me faire tuer le jour même. J'ai été plus rapide.

Il n'y aura plus de chef de tous les chefs. Il y aura une Commission, comme le conseil d'administration d'une grande entreprise : les cinq familles de New York et celles des autres villes se partagent les territoires, règlent leurs différends autour d'une table, et ne tuent plus sans autorisation. Les juifs de Lansky travailleront avec nous. Je suis devenu le patron le plus puissant d'Amérique sans jamais en porter le titre.

*1936.* Un procureur ambitieux, Thomas Dewey, veut faire carrière sur mon dos. Il me fait condamner pour proxénétisme, sur le témoignage de prostituées qu'il a fait parler. Trente à cinquante ans. Je continue à diriger depuis ma cellule de Dannemora, près de la frontière canadienne. *1942.* La marine américaine craint les sabotages dans le port de New York, que mes hommes tiennent, des dockers aux pêcheurs. On vient me voir en prison. Je fais passer le mot aux dockers. J'aide mon pays. *Février 1946.* Mon pays me libère pour services rendus, et m'expulse en même temps, vers l'Italie, sur un cargo. Mes amis viennent me dire adieu sur le quai, avec du homard et du champagne. Les journalistes ne peuvent pas monter à bord.

!! CE QUI S'EST PASSÉ :: La Commission organisée par Luciano a structuré la mafia américaine pendant des décennies : racket, jeux, drogue, syndicats, meurtres décidés en conseil. Expulsé en 1946, Luciano a tenté de s'installer à Cuba, d'où les États-Unis l'ont fait chasser, puis a vécu à Naples, d'où il a continué à peser, notamment dans les filières de l'héroïne. Il est mort d'une crise cardiaque à l'aéroport de Naples en janvier 1962, alors qu'il venait rencontrer un producteur qui voulait faire un film de sa vie.

# Harlem

Dans les années vingt, Harlem, au nord de Manhattan, est devenu le cœur de l'Amérique noire. Des centaines de milliers de Noirs du Sud, fuyant la ségrégation et les lynchages, y sont arrivés en quelques années. C'est le temps de la Renaissance de Harlem : les poètes Langston Hughes et Claude McKay, le Cotton Club où joue Duke Ellington devant un public uniquement blanc, les églises immenses, les journaux noirs. Mais les banques ne prêtent pas aux Noirs, les propriétaires blancs louent cher des logements insalubres, et la police est corrompue. Dans ce Harlem-là, une loterie illégale, le numéro, fait vivre des milliers de personnes. Deux figures l'ont dominée.

## Stephanie St. Clair, Harlem

*New York, 1912.* Je suis arrivée des Antilles. Je parle français, je parle mal anglais, et je suis noire, et je suis une femme. Dans cette ville, il faut choisir : on travaille comme bonne chez les Blancs, ou on trouve autre chose. J'ai économisé. Je ne laisserai personne décider à ma place.

*1923.* À Harlem, tout le monde joue au numéro. C'est une loterie illégale : on parie quelques cents sur un nombre à trois chiffres, tiré des résultats de la Bourse ou des courses. Les pauvres jouent tous les jours, parce que c'est le seul rêve qu'ils peuvent se payer. Les banques ne prêtent pas aux Noirs. Moi, je deviens la banque. Avec mes dix mille dollars d'économies, j'ouvre ma propre loterie. On m'appelle Madame Queen, ou Queenie. Je m'habille comme une reine, en fourrures, avec des chapeaux à plumes. J'ai engagé un jeune homme dur et intelligent, Bumpy Johnson, pour protéger mes collecteurs.

*1929.* Les policiers de Harlem me rançonnent, puis m'arrêtent quand même. Je fais quelque chose que personne n'a jamais fait : j'achète des encarts dans les journaux pour dénoncer leur corruption, noms et sommes. On me met en prison. À ma sortie, je vais témoigner devant la commission qui enquête sur la police de New York. Plusieurs policiers perdent leur poste. Personne ne m'avait jamais vue venir.

*1931.* La Prohibition va finir, et les gangsters blancs cherchent un autre commerce. Dutch Schultz, l'un des plus violents, a décidé de prendre les loteries de Harlem. Il envoie ses hommes, il menace, il frappe, il tue. Les autres banquiers noirs cèdent l'un après l'autre. Moi, je ne cède pas. Je fais casser ses boutiques, je fais savoir partout qu'il est un voleur, je vais voir la police, je refuse de payer. C'est une guerre.

*Octobre 1935.* Dutch Schultz a été abattu par les siens, dans un restaurant du New Jersey. Il est mourant, à l'hôpital. Je lui ai envoyé un télégramme, avec un verset de la Bible sur ce qu'on récolte quand on sème. Les journaux l'ont publié. Je suis toujours là.

!! CE QUI S'EST PASSÉ :: Stephanie St. Clair a dirigé pendant des années l'une des plus grandes loteries clandestines de Harlem, une activité illégale qui reposait sur l'argent des plus pauvres, mais aussi l'un des rares commerces tenus par des Noirs à New York. Elle a combattu ouvertement la corruption policière et la mafia. En 1938, elle a tiré sur son compagnon et a été condamnée à plusieurs années de prison. Elle est morte en 1969, presque oubliée, avant que des historiens et des fictions ne la ramènent dans la lumière.

## Bumpy Johnson, Harlem

*Charleston, Caroline du Sud, 1915.* Je m'appelle Ellsworth Raymond Johnson. On m'appelle Bumpy à cause d'une bosse sur l'arrière de mon crâne. Mon grand frère est recherché pour un meurtre. Dans le Sud, pour un Noir, être recherché par les Blancs, cela veut dire une corde à un arbre. Mes parents nous envoient vers le Nord, à Harlem, chez des parents. J'ai dix ans. Je n'oublierai jamais ce que c'est que d'avoir peur dans son propre pays.

*Harlem, 1920.* Harlem est la capitale du monde noir. Il y a des poètes, des musiciens de jazz, des églises, des journaux, des clubs où les Blancs viennent écouter Duke Ellington. Et il y a ceux qui se font battre dans la rue parce qu'ils sont petits et qu'ils parlent avec l'accent du Sud. J'ai appris à me battre. J'ai appris à frapper le premier. J'ai quitté le lycée. Je fais le garde du corps pour les banquiers de la loterie clandestine, je cambriole, je fais travailler des filles. La prison, plusieurs fois, presque dix ans au total.

*1932.* À ma sortie, une femme m'attend. Stephanie St. Clair, Madame Queen, la reine des loteries de Harlem. Elle parle anglais avec un accent français, elle porte des fourrures et des plumes, et elle est la seule à ne pas plier devant Dutch Schultz, le gangster blanc qui veut prendre tous nos numéros. Elle me fait son garde du corps, puis le chef de ses hommes. Nous faisons la guerre à Schultz. Ses collecteurs disparaissent, ses boutiques brûlent. Il envoie des tueurs. Nous tenons. En 1935, ce sont les siens qui l'abattent, dans un restaurant du New Jersey.

*1936.* Il faut maintenant parler avec les Italiens. Ils ont gagné la guerre des Blancs, et ils veulent leur part de Harlem. Je ne peux pas les battre, ils ne peuvent pas me remplacer : aucun Italien ne peut tenir Harlem sans moi. Alors nous avons fait affaire. Ils prennent leur pourcentage sur les loteries, et Harlem reste à moi. Personne n'y travaille sans mon accord. Je suis devenu ce qu'on appelle le parrain de Harlem.

*1940.* J'écris des poèmes. Personne ne le croit, et pourtant. Je joue aux échecs dans les parcs de Harlem, et je bats presque tout le monde. Je porte des costumes parfaits. À Thanksgiving, je fais distribuer des dindes aux familles pauvres du quartier. À Noël, des cadeaux pour les enfants. Les gens m'aiment et ils me craignent, et je crois que c'est la même chose ici.

*1952.* Ils m'ont condamné à quinze ans, pour un trafic d'héroïne. Je les ferai presque tous, dont une grande partie à Alcatraz, l'île-prison de la baie de San Francisco, celle où Capone avait perdu la tête. Pendant ce temps, Harlem change. L'héroïne est partout, dans les escaliers, dans les squares. Je sais que j'en ai vendu. Je n'aime pas y penser.

*1963.* Je suis sorti. Harlem n'est plus le même. Malcolm X parle à la tribune, les jeunes ne veulent plus de vieux parrains. Je suis devenu une légende de quartier, un vieil homme élégant qu'on salue. La police me surveille toujours. Un jour, j'en ai eu assez : je suis entré au commissariat et j'ai refusé d'en partir, pour protester contre la surveillance. Ils m'ont accusé de quelque chose. J'ai été acquitté.

!! CE QUI S'EST PASSÉ :: Bumpy Johnson a dominé pendant des décennies le crime organisé de Harlem : loteries, racket et, d'après sa condamnation de 1952, héroïne, dont la diffusion a dévasté le quartier dans les années 1950 et 1960. Il est mort d'une crise cardiaque dans un restaurant de Harlem, le 7 juillet 1968, à soixante-deux ans. Sa veuve, Mayme Hatcher Johnson, a publié en 2008 un livre sur lui. Il a inspiré de nombreux personnages, joué notamment par Laurence Fishburne dans Cotton Club (1984) et Hoodlum (1997), et par Forest Whitaker dans la série Godfather of Harlem.

@yt saLIFFijcNA | Godfather of Harlem (2019), avec Forest Whitaker dans le rôle de Bumpy Johnson, à sa sortie d'Alcatraz.

# Paris et Naples, après la guerre

L'Europe sort de la Seconde Guerre mondiale en ruines, pleine d'armes, de rancunes et de gens qui ont appris à tuer. En France, les frontières entre la Résistance, la collaboration et le milieu ont été floues pendant quatre ans, et beaucoup de truands en sortent avec des papiers neufs. Les années soixante et soixante-dix voient naître une autre figure : le braqueur médiatique, qui joue avec les journaux et la police. À Naples, la Camorra, la mafia de Campanie, tient les marchés, la contrebande et les quartiers, et les femmes y ont toujours eu leur place, derrière les hommes ou à leur place quand ils meurent.

## Pierre Loutrel, Paris

*Paris, 1941.* La France est occupée. Je suis un voyou de Pigalle, et les Allemands paient bien. J'entre à la Carlingue, la Gestapo française de la rue Lauriston. Nous arrêtons des résistants, nous pillons des appartements de Juifs, nous faisons du marché noir. On m'appelle Pierrot le Fou, parce que je bois, je tire, et je ne recule devant rien. Je ne crois à rien, ni à la France, ni à l'Allemagne. Je crois à l'argent et à la peur que je fais.

*Août 1944.* Les Allemands vont perdre. J'ai changé de camp à temps, avec un brassard de la Résistance. Personne ne pose de questions dans ce désordre. J'ai rencontré des hommes comme moi, qui ont traversé la guerre de tous les côtés : Jo Attia, revenu des camps, Abel Danos, Georges Boucheseiche. Ensemble, nous serons les meilleurs.

*Février 1946.* Les voitures de la police roulent encore au gazogène. Nous, nous avons des Tractions Avant de Citroën, les voitures les plus rapides du moment, volées, et des mitraillettes. Nous attaquons les fourgons qui transportent les salaires et les recettes, en plein jour, à Paris, sur la Côte d'Azur, puis nous disparaissons. Les journaux nous appellent le gang des Tractions Avant. Et moi, ils m'appellent l'ennemi public numéro un. Ils ont inventé ce titre pour moi.

*Novembre 1946.* J'ai trop bu, ce soir. Nous avons braqué une bijouterie, rue Boissière. En rangeant mon pistolet dans ma ceinture, je me suis tiré une balle dans le ventre. Les autres me portent dans la voiture. Je sais que je ne verrai pas de médecin.

!! CE QUI S'EST PASSÉ :: Pierre Loutrel a été membre de la Gestapo française pendant l'Occupation, puis a dirigé le gang des Tractions Avant, auteur de nombreux braquages sanglants en 1946. Blessé par sa propre arme lors d'un braquage le 6 novembre 1946, il est mort quelques jours plus tard. Ses complices l'ont enterré en secret sur une île de la Seine, près de Limay ; son corps n'a été retrouvé qu'en 1949. Sa bande a fait plusieurs victimes, dont des policiers et des passants.

## Jacques Mesrine, Paris

*Clichy, 1950.* Je m'ennuie à l'école, je m'ennuie à la maison, je m'ennuie partout. On me renvoie de deux collèges. Mon père est un dessinateur en broderie, un homme honnête, courtois, triste. Je l'aime et je ne veux pas de sa vie. Je regarde les films de gangsters américains, les chapeaux, les manteaux, les voitures. Je me dis que la vie, la vraie, est ailleurs.

*Algérie, 1957.* J'ai fait la guerre, volontaire, comme parachutiste puis dans les commandos. J'y ai appris les armes, et que les règles ne valent rien quand on a un fusil. J'en reviens décoré, et vide. Je ne supporte plus le travail, les horaires, les patrons. Je me mets à cambrioler.

*1962-1968.* Les cambriolages, les braquages, la prison, la sortie, les braquages encore. Je me marie, j'ai trois enfants, je pars, je reviens. J'essaie parfois une vie normale : un restaurant, un emploi. Je n'y arrive pas. *1968.* Je pars au Canada avec ma compagne, Jeanne Schneider. Nous travaillons chez un millionnaire comme domestiques. Il nous renvoie. Nous l'enlevons pour une rançon. On me reprend.

*Montréal, août 1972.* On dit que le pénitencier de Saint-Vincent-de-Paul est imprenable. J'en suis sorti avec d'autres, à travers les clôtures, en plein jour. Une semaine plus tard, nous sommes revenus avec des armes pour libérer ceux qui étaient restés. Ça n'a pas marché, ça a tiré. Les journaux du monde entier parlent de moi. J'aime cela plus que l'argent. Le mois suivant, deux gardes forestiers nous reconnaissent dans un bois, près de la frontière. Ils meurent.

*Compiègne, juin 1973.* De retour en France, on me juge pour une vieille affaire. Un complice a caché un pistolet dans les toilettes du palais de justice. Je l'ai sorti en pleine audience et j'ai pris le président du tribunal en otage. Je suis sorti avec lui, en le tenant devant moi. *Septembre 1973.* Le commissaire Broussard m'a retrouvé dans un appartement de Paris. Après de longues heures de siège, je lui ai ouvert la porte, et je lui ai offert le champagne. Il faut savoir perdre avec style.

*La Santé, 1977.* En prison, j'ai écrit un livre, L'Instinct de mort. Je raconte tout, ou presque. J'y avoue des meurtres, pour qu'on comprenne qui je suis. Le livre se vend, on le lit dans les lycées en cachette. Je dénonce les quartiers de haute sécurité, l'isolement total, les gardiens. Certains m'écoutent : sur ce point, je n'ai pas tort.

*Mai 1978.* Je me suis évadé de la Santé avec François Besse, en escaladant le mur avec une échelle, en plein jour. On m'appelle l'ennemi public numéro un. Je change de visage, de perruque, de lunettes, de nom. Je donne des interviews à des magazines, je pose avec des armes. *1979.* J'ai enlevé un milliardaire pour une rançon. J'ai torturé un journaliste qui avait écrit des choses fausses sur moi. Je dis à tout le monde que je ne me laisserai jamais prendre vivant. Je crois que je sais comment cela va finir. Je fais tout pour que ce soit une belle fin.

!! CE QUI S'EST PASSÉ :: Jacques Mesrine a commis des dizaines de braquages, des enlèvements et plusieurs meurtres, dont ceux des deux gardes forestiers canadiens en 1972. Le journaliste Jacques Tillier, qu'il avait attiré dans une grotte en 1979, a survécu de justesse à ses balles. Le 2 novembre 1979, la police l'a abattu dans sa voiture, porte de Clignancourt, à Paris, sans sommation. Cette mort a longtemps fait débat. En 2008, Jean-François Richet en a tiré deux films avec Vincent Cassel.

@yt SYJ2JDbjLF0 | Mesrine, L'Instinct de mort (2008), de Jean-François Richet, avec Vincent Cassel. Bande-annonce.

## Pupetta Maresca, Naples

*Castellammare di Stabia, 1954.* J'ai dix-neuf ans et j'ai gagné un concours de beauté. Tout le quartier m'appelle Pupetta, la petite poupée. Ma famille est connue : on les appelle les Couteaux, parce que les hommes de chez nous savent s'en servir. Je vais épouser Pasquale Simonetti, qu'on surnomme Pascalone de Nola. Il fixe les prix des fruits et des légumes au marché de Naples. Ceux qui ne paient pas ne vendent plus.

*Juillet 1955.* Quatre-vingts jours. Mon mariage a duré quatre-vingts jours. Pasquale a été tué en pleine rue, sur ordre d'un rival du marché, Antonio Esposito. Je suis enceinte de six mois. La police ne fera rien, je le sais. À Naples, c'est à la famille de laver le sang.

*Août 1955.* Je suis allée moi-même. J'ai trouvé Esposito dans la rue, je l'ai tué, à coups de pistolet. Au procès, la salle est pleine. Des femmes pleurent pour moi, des chanteurs écrivent des chansons sur moi, on fera un film. Je dis aux juges que je referais la même chose. Je donne naissance à mon fils en prison. Je l'appelle Pasqualino, comme son père.

*1974.* Mon fils a dix-huit ans. Il a disparu. On ne retrouvera jamais son corps. Je sais que c'est un message, de ceux qui ont des comptes à régler avec moi ou avec l'homme qui partage maintenant ma vie, un trafiquant de la Camorra. Dans ce monde, la vengeance ne s'arrête jamais. Elle change seulement de cible.

*1982.* Raffaele Cutolo, le chef de la Nouvelle Camorra organisée, fait la guerre à tout Naples depuis sa prison. Il menace ma famille. J'ai convoqué les journalistes et, devant les caméras, je l'ai défié. Je n'ai jamais eu peur des hommes. Ce sont eux qui ont peur des femmes qui n'ont plus rien à perdre.

!! CE QUI S'EST PASSÉ :: Assunta « Pupetta » Maresca a été condamnée pour le meurtre d'Antonio Esposito et a passé une dizaine d'années en prison. Devenue une célébrité en Italie, elle a joué dans un film et inspiré plusieurs fictions. Elle a ensuite été mêlée aux affaires de la Camorra, poursuivie à plusieurs reprises, et a parfois été acquittée. Son fils a disparu en 1974. Elle est morte en 2021. Sa légende de vengeresse a longtemps masqué la réalité des guerres de la Camorra, qui ont fait des milliers de morts à Naples.

# Kobe et les ravins de la Chambal

Au Japon, les yakuzas ne se cachent pas comme les mafias d'ailleurs : ils ont des bureaux avec leur nom sur la porte, des cartes de visite, des codes d'honneur hérités des joueurs et des colporteurs de l'époque d'Edo. Après 1945, dans un pays détruit et occupé, ils deviennent indispensables, sur les ports, sur les chantiers, dans le spectacle. En Inde, dans les ravins de la rivière Chambal, entre l'Uttar Pradesh et le Madhya Pradesh, des bandes de dacoïts vivent depuis des siècles dans un labyrinthe de terre où la police ne s'aventure pas, et la caste y décide de presque tout, y compris de qui devient bandit.

## Kazuo Taoka, Kobe

*Kobe, 1920.* Mon père est mort avant ma naissance, ma mère quand j'avais six ans. Mon oncle m'a recueilli à Kobe. Je travaille sur les quais, je me bats beaucoup. On m'appelle l'Ours, à cause de ma façon de frapper. Le Yamaguchi-gumi, la famille qui tient une partie du port, m'a remarqué. Pour la première fois, quelqu'un me donne une place.

*1937.* J'ai tué un homme d'une bande rivale. Prison. Je n'ai rien dit, je n'ai donné personne. Chez nous, c'est la seule chose qui compte, et on s'en souviendra. *1946.* Le Japon est en ruines, occupé par les Américains. Le chef de la famille est mort. On me choisit. J'ai trente-trois ans. Je suis le troisième oyabun du Yamaguchi-gumi, et nous ne sommes que quelques dizaines.

*1960.* Je n'aime pas qu'on dise que je suis un voyou. J'ai des entreprises : le chargement des navires dans le port, des chantiers, et une agence de spectacles qui organise les tournées des plus grandes chanteuses du pays. Je porte un costume et des lunettes. Je règle les conflits du port, je fournis des hommes aux employeurs, je garde la paix dans les rues à ma façon. Une famille, pour moi, c'est cela : des enfants qui doivent obéissance, et un père qui leur doit protection.

*1965.* Nous avons absorbé, ou écrasé, des centaines de groupes à travers le pays. Dans chaque ville, il a fallu choisir : nous rejoindre, ou disparaître. Nos guerres font des morts, et la police japonaise lance contre nous de grandes opérations. Les journaux parlent de moi comme d'un empereur de l'ombre. Je ne me cache pas. Mon nom est sur la porte de mes bureaux.

*1978.* J'ai pris une balle dans le cou, dans une boîte de nuit de Kyoto. J'ai survécu. Le tireur a été retrouvé mort quelques semaines plus tard, dans la montagne. Je ne m'en suis pas occupé. Mes enfants s'en sont occupés.

!! CE QUI S'EST PASSÉ :: Sous Kazuo Taoka, de 1946 à sa mort, le Yamaguchi-gumi est passé de quelques dizaines de membres à plus de dix mille, devenant la plus grande organisation criminelle du Japon, au prix de guerres de gangs meurtrières. Taoka est mort d'une crise cardiaque en 1981. Sa succession a déclenché l'une des guerres de yakuzas les plus sanglantes du siècle.

## Phoolan Devi, les ravins de la Chambal

*Uttar Pradesh, 1974.* Je suis née mallah, une caste de bateliers, tout en bas. Dans mon village, les grandes familles thakurs possèdent la terre, et nous travaillons pour elles. On m'a mariée à onze ans à un homme beaucoup plus âgé que moi. Je me suis enfuie. On m'a ramenée. On me traite de mauvaise fille. J'ai appris très tôt que, pour une fille comme moi, il n'existe pas de justice.

*1979.* Des bandits m'ont enlevée. Les dacoïts vivent dans les ravins de la rivière Chambal, un labyrinthe de terre où la police ne va pas. Leur chef voulait me faire du mal. Un autre bandit, Vikram, l'a tué pour me protéger. Il est devenu mon compagnon. Il m'a appris à tirer. Pour la première fois, j'ai une arme, et des hommes baissent les yeux devant moi.

*1980.* Vikram a été assassiné par d'autres membres de la bande, des thakurs. Ils m'ont emmenée dans un village, Behmai, et m'y ont gardée prisonnière pendant des semaines. Je n'écrirai pas ici ce qu'ils m'ont fait. Le village a regardé, et n'a rien fait. Je me suis échappée. J'ai formé ma propre bande.

*Février 1981.* Nous sommes revenus à Behmai.

*1983.* Toute l'Inde parle de moi. On m'appelle la reine des bandits. Les pauvres m'aiment, les puissants me haïssent, la police me cherche partout. Je suis fatiguée. J'ai négocié ma reddition, avec mes conditions : pas de peine de mort, pas de pendaison pour mes hommes, un bout de terre pour ma famille. Devant des milliers de gens, j'ai déposé mon fusil devant les portraits de Gandhi et de la déesse Durga.

!! CE QUI S'EST PASSÉ :: Le 14 février 1981, à Behmai, vingt-deux hommes, pour la plupart de la caste thakur, ont été alignés et abattus par la bande de Phoolan Devi ; elle a toujours nié avoir tiré elle-même. Après sa reddition en 1983, elle a passé onze ans en prison sans être jugée. Libérée en 1994, elle a été élue députée au Parlement indien en 1996. Elle a été assassinée devant chez elle, à New Delhi, en 2001. Elle reste, en Inde, à la fois une criminelle, une victime et un symbole pour les femmes et les castes opprimées.

@yt Vb8cRenDMOg | Bandit Queen (1994), de Shekhar Kapur, le film tiré de la vie de Phoolan Devi, qu'elle a contesté à sa sortie. Bande-annonce.

# Medellín et Miami

À la fin des années soixante-dix, la cocaïne remplace l'herbe et l'héroïne dans les soirées américaines. Elle est produite en Bolivie et au Pérou, raffinée en Colombie, et elle entre aux États-Unis par la Floride, à bord de petits avions, de bateaux de pêche, de valises. Miami devient en quelques années une ville d'argent sale, de banques pleines de billets, de voitures de luxe et de fusillades en plein jour. La police et la presse parlent des cocaine cowboys. Parmi eux, une femme.

## Griselda Blanco, de Medellín à Miami

*Medellín, 1955.* J'ai douze ans. J'habite un quartier de baraques, et ma mère me bat. Je vole, je fais les poches, je fais pire. Je comprends que dans ce monde, il y a ceux qui ont peur et ceux qui font peur. Je ne serai pas de ceux qui ont peur.

*New York, 1974.* Les Américains veulent de la cocaïne, et ils ont de l'argent. J'ai trouvé comment la faire passer : dans des soutiens-gorge et des corsets fabriqués à Medellín, avec des poches cachées, portés par des jeunes femmes qui prennent l'avion. Les douaniers ne regardent pas les femmes. Je suis la première à faire passer la drogue en si grandes quantités. On m'appelle la Marraine.

*1975.* La police de New York a démantelé une partie de mon réseau. Je suis rentrée en Colombie, puis je suis partie pour Miami. Là-bas, la cocaïne arrive par avions entiers, et des dizaines de bandes se disputent la ville. Je n'ai pas l'intention de partager.

*Miami, 1979.* Mes hommes ont tiré en plein jour, dans un centre commercial, avec des mitraillettes. Je fais tuer depuis des motos : un tueur à l'arrière, qui tire, et la moto disparaît dans la circulation. Trois de mes maris sont morts. On m'appelle la Veuve noire. J'ai appelé l'un de mes fils Michael Corleone, comme dans Le Parrain. Je connais les films par cœur. Je les trouve trop doux.

*1985.* Les agents fédéraux m'ont arrêtée en Californie, chez moi, pendant que je lisais la Bible. Ils veulent me juger pour meurtre et me condamner à mort. Je n'ai peur de rien. J'ai survécu à tous ceux qui voulaient ma place.

!! CE QUI S'EST PASSÉ :: Griselda Blanco a été l'une des pionnières du trafic de cocaïne vers les États-Unis, et l'une des figures les plus violentes de la guerre de la drogue à Miami à la fin des années 1970, qui a fait des centaines de morts ; on lui attribue des dizaines de meurtres. Condamnée pour trafic, elle a échappé à un procès pour meurtre à cause d'un scandale lié à un témoin de l'accusation. Expulsée vers la Colombie en 2004, elle a été tuée à Medellín en 2012 par un tueur à moto, la méthode qu'elle avait rendue célèbre.

@yt jtIRkurw6T8 | Cocaine Cowboys (2006), de Billy Corben : la guerre de la cocaïne à Miami, racontée par ceux qui l'ont faite. Bande-annonce.

# Ce que l'ombre ne dit pas

Les treize voix de ce livre se ressemblent. Presque toutes commencent de la même façon : un enfant pauvre, orphelin, battu, méprisé, une immigrée, une fille de basse caste. Le crime y apparaît d'abord comme une porte de sortie, la seule ouverte, et c'est souvent vrai. Puis il devient un commerce, une famille, un empire, un service rendu au peuple, une vengeance. Chacun transforme la violence en récit.

Il y a une part de vérité dans ces récits, et c'est pour cela qu'ils fonctionnent. Stephanie St. Clair a vraiment combattu une police corrompue et une mafia raciste. Phoolan Devi a vraiment été la victime d'une société qui ne protégeait pas les filles comme elle. Du Yuesheng a vraiment financé des écoles et des hôpitaux. Bumpy Johnson a vraiment nourri des familles de Harlem. Capone a vraiment ouvert une soupe populaire. Zheng Yi Sao a vraiment interdit à ses pirates de violer leurs captives, à une époque où presque personne ne le faisait. Mais ces récits laissent toujours de côté ceux qui ont payé : les villageois rançonnés, les ouvriers massacrés de Shanghai, les joueurs ruinés, les passants tués dans un centre commercial, les familles des hommes de Behmai, les toxicomanes de Miami et de New York.

Ce livre propose un réflexe simple. Quand un film, une série ou une chanson te fait aimer l'une de ces figures, cherche le nom d'une de ses victimes, et lis son histoire à elle. Les reines et les rois de l'ombre ont toujours eu de bons conteurs. Leurs victimes, rarement.
`,
};
export default book;
