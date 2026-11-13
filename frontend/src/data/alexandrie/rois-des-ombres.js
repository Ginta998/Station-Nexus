const book = {
  id: "rois-des-ombres", title: "Les rois des ombres", sub: "Journaux de reines et de rois du crime, de Canton à Medellín", room: "histoire", type: "pensee", cote: "HI-016", color: 42, emblem: "♠",
  about: "Une reine pirate de la mer de Chine, le parrain de l'opium de Shanghai, la reine des loteries de Harlem, le banquier du crime new-yorkais, le premier ennemi public de l'après-guerre français, une reine de beauté napolitaine devenue figure de la Camorra, un parrain yakuza, la reine des bandits de l'Inde et la marraine de la cocaïne de Miami. Neuf journaux intimes imaginés, à la première personne. Les faits, eux, sont réels, et rappelés à la fin de chaque journal, avec ceux qui en ont payé le prix.",
  links: [
    { label: "Dian Murray, Pirates of the South China Coast, 1790-1810 (1987)", note: "L'étude de référence sur la confédération de Zheng Yi Sao." },
    { label: "Brian G. Martin, The Shanghai Green Gang (1996)", note: "Du Yuesheng, l'opium et le pouvoir à Shanghai." },
    { label: "Shirley Stewart, The World of Stephanie St. Clair (2014)", note: "La reine des loteries de Harlem, née aux Antilles françaises." },
    { label: "Phoolan Devi, Moi, Phoolan Devi, reine des bandits (1996)", note: "Son autobiographie, dictée à deux journalistes." },
    { label: "Cocaine Cowboys (2006)", note: "Le documentaire sur la guerre de la cocaïne à Miami, où apparaît Griselda Blanco." },
    { label: "F. Scott Fitzgerald, Gatsby le Magnifique (1925)", note: "Le personnage de Meyer Wolfsheim, l'homme qui a truqué les World Series, est inspiré d'Arnold Rothstein." },
  ],
  text: String.raw`
# Avant d'ouvrir ces journaux

Les journaux qui suivent sont imaginés. Aucune de ces femmes, aucun de ces hommes n'a écrit ces pages. Elles sont reconstituées à partir de ce qu'on sait de leur vie : procès, archives de police, enquêtes de journalistes et d'historiens, et parfois leurs propres récits, quand ils en ont laissé. Le but est d'entendre la voix qu'ils avaient dans la tête. Celle d'une personne qui se raconte comme une reine, un homme d'affaires, une bienfaitrice, une vengeresse ou un rebelle. Presque jamais comme quelqu'un qui fait du mal.

On connaît trop bien les rois les plus célèbres de l'ombre : Al Capone, Lucky Luciano, Pablo Escobar. Le cinéma, les séries et les chansons les ont transformés en légendes. Ce livre regarde ailleurs. Il va chercher des figures moins évidentes, et des femmes, car le crime organisé n'a jamais été une affaire d'hommes seulement, même si les récits l'ont souvent oublié. Une pirate chinoise du XIXe siècle qui commandait plus de navires que bien des marines. Une immigrée antillaise qui a tenu tête à la mafia de New York. Une jeune fille de basse caste devenue la hors-la-loi la plus célèbre de l'Inde.

À la fin de chaque journal, un encadré dit ce qui s'est réellement passé, et ce que cela a coûté.

# Les mers et l'opium de la Chine

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

# New York, entre deux guerres

## Stephanie St. Clair, Harlem

*New York, 1912.* Je suis arrivée des Antilles. Je parle français, je parle mal anglais, et je suis noire, et je suis une femme. Dans cette ville, il faut choisir : on travaille comme bonne chez les Blancs, ou on trouve autre chose. J'ai économisé. Je ne laisserai personne décider à ma place.

*1923.* À Harlem, tout le monde joue au numéro. C'est une loterie illégale : on parie quelques cents sur un nombre à trois chiffres, tiré des résultats de la Bourse ou des courses. Les pauvres jouent tous les jours, parce que c'est le seul rêve qu'ils peuvent se payer. Les banques ne prêtent pas aux Noirs. Moi, je deviens la banque. Avec mes dix mille dollars d'économies, j'ouvre ma propre loterie. On m'appelle Madame Queen, ou Queenie. Je m'habille comme une reine, en fourrures, avec des chapeaux à plumes. J'ai engagé un jeune homme dur et intelligent, Bumpy Johnson, pour protéger mes collecteurs.

*1929.* Les policiers de Harlem me rançonnent, puis m'arrêtent quand même. Je fais quelque chose que personne n'a jamais fait : j'achète des encarts dans les journaux pour dénoncer leur corruption, noms et sommes. On me met en prison. À ma sortie, je vais témoigner devant la commission qui enquête sur la police de New York. Plusieurs policiers perdent leur poste. Personne ne m'avait jamais vue venir.

*1931.* La Prohibition va finir, et les gangsters blancs cherchent un autre commerce. Dutch Schultz, l'un des plus violents, a décidé de prendre les loteries de Harlem. Il envoie ses hommes, il menace, il frappe, il tue. Les autres banquiers noirs cèdent l'un après l'autre. Moi, je ne cède pas. Je fais casser ses boutiques, je fais savoir partout qu'il est un voleur, je vais voir la police, je refuse de payer. C'est une guerre.

*Octobre 1935.* Dutch Schultz a été abattu par les siens, dans un restaurant du New Jersey. Il est mourant, à l'hôpital. Je lui ai envoyé un télégramme, avec un verset de la Bible sur ce qu'on récolte quand on sème. Les journaux l'ont publié. Je suis toujours là.

!! CE QUI S'EST PASSÉ :: Stephanie St. Clair a dirigé pendant des années l'une des plus grandes loteries clandestines de Harlem, une activité illégale qui reposait sur l'argent des plus pauvres, mais aussi l'un des rares commerces tenus par des Noirs à New York. Elle a combattu ouvertement la corruption policière et la mafia. En 1938, elle a tiré sur son compagnon et a été condamnée à plusieurs années de prison. Elle est morte en 1969, presque oubliée, avant que des historiens et des fictions ne la ramènent dans la lumière.

## Arnold Rothstein, New York

*New York, 1899.* Mon père est un commerçant respecté, pieux, généreux. Mon frère aîné étudiait pour devenir rabbin. Moi, je joue aux dés dans les ruelles et je gagne. Je ne bois pas, je ne fume pas, je ne me bats pas. Je calcule. Les autres jouent avec leur chance. Je joue avec la leur.

*1910.* J'ai ouvert une maison de jeu, puis plusieurs. Je prête de l'argent à ceux qui perdent, avec des intérêts. Je parie sur les courses de chevaux, et je m'arrange pour savoir avant les autres. On m'appelle le Cerveau. Les hommes politiques de la ville viennent jouer chez moi, et je les laisse gagner quand il le faut.

*1919.* La finale du championnat de baseball, les World Series. Des joueurs de l'équipe de Chicago ont accepté de perdre exprès. On dit que c'est moi qui ai payé. Je dis que des escrocs se sont servis de mon nom. Je suis allé témoigner devant le grand jury, calme, élégant. Ils n'ont rien pu prouver. J'ai gagné beaucoup d'argent cette semaine-là. Le pays entier découvre que même son sport national peut s'acheter.

*1923.* La Prohibition est la plus grande affaire de ma vie. Je ne vends pas l'alcool : je finance ceux qui le vendent. Je fais venir le whisky d'Europe par bateaux entiers. Je prête aux jeunes gangsters de la ville, je leur apprends à s'habiller, à parler, à corrompre plutôt qu'à tuer. Ils s'appellent Luciano, Lansky, Costello. Je fais avec le crime ce que les grandes banques font avec l'industrie. J'organise.

*Novembre 1928.* J'ai perdu une partie de poker, il y a quelques semaines, une très grosse somme. J'ai refusé de payer : je pense que la partie était truquée. Ce soir, on m'a appelé pour un rendez-vous dans un hôtel. J'y vais.

!! CE QUI S'EST PASSÉ :: Arnold Rothstein a été blessé par balle le 4 novembre 1928 à l'hôtel Park Central de New York et est mort deux jours plus tard. Il a refusé de dire qui avait tiré. Son rôle dans le scandale des « Black Sox » de 1919 n'a jamais été prouvé devant un tribunal. Il est considéré comme celui qui a transformé les bandes new-yorkaises en un crime organisé, financé et structuré comme une entreprise, et il a inspiré à Fitzgerald le personnage de Meyer Wolfsheim.

# Paris et Naples, après la guerre

## Pierre Loutrel, Paris

*Paris, 1941.* La France est occupée. Je suis un voyou de Pigalle, et les Allemands paient bien. J'entre à la Carlingue, la Gestapo française de la rue Lauriston. Nous arrêtons des résistants, nous pillons des appartements de Juifs, nous faisons du marché noir. On m'appelle Pierrot le Fou, parce que je bois, je tire, et je ne recule devant rien. Je ne crois à rien, ni à la France, ni à l'Allemagne. Je crois à l'argent et à la peur que je fais.

*Août 1944.* Les Allemands vont perdre. J'ai changé de camp à temps, avec un brassard de la Résistance. Personne ne pose de questions dans ce désordre. J'ai rencontré des hommes comme moi, qui ont traversé la guerre de tous les côtés : Jo Attia, revenu des camps, Abel Danos, Georges Boucheseiche. Ensemble, nous serons les meilleurs.

*Février 1946.* Les voitures de la police roulent encore au gazogène. Nous, nous avons des Tractions Avant de Citroën, les voitures les plus rapides du moment, volées, et des mitraillettes. Nous attaquons les fourgons qui transportent les salaires et les recettes, en plein jour, à Paris, sur la Côte d'Azur, puis nous disparaissons. Les journaux nous appellent le gang des Tractions Avant. Et moi, ils m'appellent l'ennemi public numéro un. Ils ont inventé ce titre pour moi.

*Novembre 1946.* J'ai trop bu, ce soir. Nous avons braqué une bijouterie, rue Boissière. En rangeant mon pistolet dans ma ceinture, je me suis tiré une balle dans le ventre. Les autres me portent dans la voiture. Je sais que je ne verrai pas de médecin.

!! CE QUI S'EST PASSÉ :: Pierre Loutrel a été membre de la Gestapo française pendant l'Occupation, puis a dirigé le gang des Tractions Avant, auteur de nombreux braquages sanglants en 1946. Blessé par sa propre arme lors d'un braquage le 6 novembre 1946, il est mort quelques jours plus tard. Ses complices l'ont enterré en secret sur une île de la Seine, près de Limay ; son corps n'a été retrouvé qu'en 1949. Sa bande a fait plusieurs victimes, dont des policiers et des passants.

## Pupetta Maresca, Naples

*Castellammare di Stabia, 1954.* J'ai dix-neuf ans et j'ai gagné un concours de beauté. Tout le quartier m'appelle Pupetta, la petite poupée. Ma famille est connue : on les appelle les Couteaux, parce que les hommes de chez nous savent s'en servir. Je vais épouser Pasquale Simonetti, qu'on surnomme Pascalone de Nola. Il fixe les prix des fruits et des légumes au marché de Naples. Ceux qui ne paient pas ne vendent plus.

*Juillet 1955.* Quatre-vingts jours. Mon mariage a duré quatre-vingts jours. Pasquale a été tué en pleine rue, sur ordre d'un rival du marché, Antonio Esposito. Je suis enceinte de six mois. La police ne fera rien, je le sais. À Naples, c'est à la famille de laver le sang.

*Août 1955.* Je suis allée moi-même. J'ai trouvé Esposito dans la rue, je l'ai tué, à coups de pistolet. Au procès, la salle est pleine. Des femmes pleurent pour moi, des chanteurs écrivent des chansons sur moi, on fera un film. Je dis aux juges que je referais la même chose. Je donne naissance à mon fils en prison. Je l'appelle Pasqualino, comme son père.

*1974.* Mon fils a dix-huit ans. Il a disparu. On ne retrouvera jamais son corps. Je sais que c'est un message, de ceux qui ont des comptes à régler avec moi ou avec l'homme qui partage maintenant ma vie, un trafiquant de la Camorra. Dans ce monde, la vengeance ne s'arrête jamais. Elle change seulement de cible.

*1982.* Raffaele Cutolo, le chef de la Nouvelle Camorra organisée, fait la guerre à tout Naples depuis sa prison. Il menace ma famille. J'ai convoqué les journalistes et, devant les caméras, je l'ai défié. Je n'ai jamais eu peur des hommes. Ce sont eux qui ont peur des femmes qui n'ont plus rien à perdre.

!! CE QUI S'EST PASSÉ :: Assunta « Pupetta » Maresca a été condamnée pour le meurtre d'Antonio Esposito et a passé une dizaine d'années en prison. Devenue une célébrité en Italie, elle a joué dans un film et inspiré plusieurs fictions. Elle a ensuite été mêlée aux affaires de la Camorra, poursuivie à plusieurs reprises, et a parfois été acquittée. Son fils a disparu en 1974. Elle est morte en 2021. Sa légende de vengeresse a longtemps masqué la réalité des guerres de la Camorra, qui ont fait des milliers de morts à Naples.

# Kobe et les ravins de la Chambal

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

# Griselda Blanco, de Medellín à Miami

*Medellín, 1955.* J'ai douze ans. J'habite un quartier de baraques, et ma mère me bat. Je vole, je fais les poches, je fais pire. Je comprends que dans ce monde, il y a ceux qui ont peur et ceux qui font peur. Je ne serai pas de ceux qui ont peur.

*New York, 1974.* Les Américains veulent de la cocaïne, et ils ont de l'argent. J'ai trouvé comment la faire passer : dans des soutiens-gorge et des corsets fabriqués à Medellín, avec des poches cachées, portés par des jeunes femmes qui prennent l'avion. Les douaniers ne regardent pas les femmes. Je suis la première à faire passer la drogue en si grandes quantités. On m'appelle la Marraine.

*1975.* La police de New York a démantelé une partie de mon réseau. Je suis rentrée en Colombie, puis je suis partie pour Miami. Là-bas, la cocaïne arrive par avions entiers, et des dizaines de bandes se disputent la ville. Je n'ai pas l'intention de partager.

*Miami, 1979.* Mes hommes ont tiré en plein jour, dans un centre commercial, avec des mitraillettes. Je fais tuer depuis des motos : un tueur à l'arrière, qui tire, et la moto disparaît dans la circulation. Trois de mes maris sont morts. On m'appelle la Veuve noire. J'ai appelé l'un de mes fils Michael Corleone, comme dans Le Parrain. Je connais les films par cœur. Je les trouve trop doux.

*1985.* Les agents fédéraux m'ont arrêtée en Californie, chez moi, pendant que je lisais la Bible. Ils veulent me juger pour meurtre et me condamner à mort. Je n'ai peur de rien. J'ai survécu à tous ceux qui voulaient ma place.

!! CE QUI S'EST PASSÉ :: Griselda Blanco a été l'une des pionnières du trafic de cocaïne vers les États-Unis, et l'une des figures les plus violentes de la guerre de la drogue à Miami à la fin des années 1970, qui a fait des centaines de morts ; on lui attribue des dizaines de meurtres. Condamnée pour trafic, elle a échappé à un procès pour meurtre à cause d'un scandale lié à un témoin de l'accusation. Expulsée vers la Colombie en 2004, elle a été tuée à Medellín en 2012 par un tueur à moto, la méthode qu'elle avait rendue célèbre.

# Ce que l'ombre ne dit pas

Les neuf voix de ce livre se ressemblent. Presque toutes commencent de la même façon : un enfant pauvre, orphelin, battu, méprisé, une immigrée, une fille de basse caste. Le crime y apparaît d'abord comme une porte de sortie, la seule ouverte, et c'est souvent vrai. Puis il devient un commerce, une famille, un empire, un service rendu au peuple, une vengeance. Chacun transforme la violence en récit.

Il y a une part de vérité dans ces récits, et c'est pour cela qu'ils fonctionnent. Stephanie St. Clair a vraiment combattu une police corrompue et une mafia raciste. Phoolan Devi a vraiment été la victime d'une société qui ne protégeait pas les filles comme elle. Du Yuesheng a vraiment financé des écoles et des hôpitaux. Zheng Yi Sao a vraiment interdit à ses pirates de violer leurs captives, à une époque où presque personne ne le faisait. Mais ces récits laissent toujours de côté ceux qui ont payé : les villageois rançonnés, les ouvriers massacrés de Shanghai, les joueurs ruinés, les passants tués dans un centre commercial, les familles des hommes de Behmai, les toxicomanes de Miami et de New York.

Ce livre propose un réflexe simple. Quand un film, une série ou une chanson te fait aimer l'une de ces figures, cherche le nom d'une de ses victimes, et lis son histoire à elle. Les reines et les rois de l'ombre ont toujours eu de bons conteurs. Leurs victimes, rarement.
`,
};
export default book;
