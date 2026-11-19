const book = {
  id: "guru", title: "Guru", sub: "Journaux de ceux qui se sont crus élus", room: "histoire", type: "pensee", cote: "HI-015", color: 0, emblem: "⊙",
  about: "Jim Jones, Charles Manson, David Koresh, Shoko Asahara, Ma Anand Sheela, Anne Hamilton-Byrne, Credonia Mwerinde, Joseph Di Mambro, Bonnie Nettles, Marshall Applewhite : dix personnes, des femmes et des hommes, ont conduit des groupes qui ont fini dans la mort ou le crime. Chacun raconte sa vie depuis l'enfance, comme s'il te parlait à voix basse : les souvenirs, les blessures, les visions, puis le chemin vers le désastre. Ces récits sont imaginés, écrits à la première personne pour entrer dans leur tête. Les faits, les dates et les morts, eux, sont réels, et rappelés à la fin de chaque journal.",
  links: [
    { label: "Tim Reiterman, Raven: The Untold Story of the Rev. Jim Jones and His People (1982)", note: "L'enquête de référence sur le Temple du Peuple, par un journaliste blessé à Port Kaituma." },
    { label: "Haruki Murakami, Underground (1997)", note: "Les victimes de l'attentat du métro de Tokyo racontent, puis d'anciens membres d'Aum." },
    { label: "Waco: The Rules of Engagement (1997)", note: "Le documentaire sur le siège du Mont-Carmel." },
    { label: "Wild Wild Country (2018)", note: "La série documentaire sur Rajneeshpuram, avec Ma Anand Sheela elle-même." },
    { label: "Jeff Guinn, Manson (2013)", note: "La biographie la plus complète, qui démonte une partie de la légende." },
    { label: "Tragedy in Uganda : the Restoration of the Ten Commandments of God (CESNUR)", url: "https://www.cesnur.org/testi/uganda_002.htm", note: "Une analyse du mouvement de Kanungu et de ce qu'on sait vraiment de la fin." },
    { label: "MIVILUDES", url: "https://www.miviludes.interieur.gouv.fr", note: "La mission française de vigilance contre les dérives sectaires : informations, signalements, aide aux proches." },
    { label: "Robert Jay Lifton, Thought Reform and the Psychology of Totalism (1961)", note: "Le livre qui a décrit les huit mécanismes de l'emprise." },
  ],
  text: String.raw`
# Avant d'ouvrir ces journaux

Ce livre ne contient pas de vrais journaux. Aucune de ces femmes, aucun de ces hommes n'a écrit les pages que tu vas lire, et les dialogues sont imaginés eux aussi. Elles sont imaginées, à partir de ce qu'on sait de leur vie, de leurs sermons, de leurs lettres, des témoignages de ceux qui les ont suivis et de ceux qui s'en sont échappés. Le pari est le même que pour les autres voix de cette bibliothèque : entrer dans une tête pour comprendre comment elle fonctionne. Ici, comprendre ne veut pas dire excuser. Ces femmes et ces hommes ont fait tuer, ou ont mené à la mort, des centaines de personnes, dont beaucoup d'enfants.

Ce qu'on cherche à voir, c'est le mécanisme. Comment une femme ou un homme finit par se croire choisi. Comment il trouve des gens prêts à le croire. Comment l'amour qu'on lui porte devient une prison. Comment le groupe se ferme, se coupe du monde, se met à attendre la fin. Ces dix histoires sont très différentes, aux États-Unis, au Japon, en Inde et en Oregon, en Australie, en Ouganda, en Suisse, au Canada et en France. On croit souvent que les gourous sont tous des hommes. Ce n'est pas vrai : des femmes ont fondé, dirigé ou co-dirigé certains de ces groupes, et d'autres, à l'intérieur, ont été les premières à dire non. Et pourtant elles se ressemblent toutes.

À la fin de chaque journal, un encadré rappelle ce qui s'est réellement passé, sans rien inventer. Le dernier chapitre parle des signes qui permettent de reconnaître une emprise, et de ce qu'on peut faire.

# Les pères

Les États-Unis sont le pays des réveils religieux. Depuis le XVIIIe siècle, des prédicateurs y fondent des églises nouvelles, guérissent sous des tentes, annoncent la fin des temps, et des milliers de fidèles les suivent. La liberté religieuse y est presque absolue : l'État ne se mêle pas de ce qu'une communauté croit ni de la manière dont elle vit. C'est une force, qui a permis à des minorités persécutées de trouver refuge. C'est aussi un angle mort. Un pasteur charismatique peut y bâtir un monde fermé, avec ses propres lois, ses propres armes, ses propres prisons, sans que personne n'ose regarder à l'intérieur. Deux hommes, à vingt ans d'écart, ont fait de leur église un piège.

## Jim Jones, le Temple du Peuple

Assieds-toi. Je vais te raconter d'où je viens, parce que personne ne comprend un homme sans connaître la boue dans laquelle il a grandi.

Je suis né le 13 mai 1931 à Crete, un hameau de l'Indiana, au milieu des champs de maïs. Mon père, James Thurman Jones, était revenu de la Grande Guerre avec les poumons brûlés par les gaz. Il toussait toute la nuit. Il touchait une petite pension, il réparait parfois les routes, et il fréquentait des hommes qui portaient des cagoules blanches le soir. Ma mère, Lynetta, travaillait à l'usine et rêvait d'autre chose. Elle croyait aux esprits, à la réincarnation, et elle disait qu'avant ma naissance elle avait vu en rêve qu'elle mettrait au monde un messie. Elle n'était presque jamais là. Quand j'avais trois ans, en pleine Crise, la banque nous a pris la maison. Nous avons atterri dans une cabane à Lynn, un village voisin, sans eau courante ni électricité.

J'étais un enfant qu'on oubliait. Je traînais dans les rues de Lynn, parfois tout nu, et les femmes du village me donnaient à manger. L'une d'elles, Myrtle Kennedy, la femme du pasteur de l'église du Nazaréen, m'a pris sous son aile. Je dormais souvent chez elle. Elle m'a donné une Bible, m'emmenait à l'église plusieurs fois par semaine, et j'ai appris des versets par cœur avant de savoir faire mes lacets. J'ai compris là-bas une chose que je n'ai jamais oubliée : les gens qui chantent ensemble, qui pleurent ensemble, qui se prennent par la main, sont prêts à tout donner à celui qui leur parle.

J'allais dans toutes les églises de Lynn, l'une après l'autre. Je me suis fait baptiser plusieurs fois. Celle que je préférais, c'était l'église pentecôtiste, celle où les gens tombaient par terre, parlaient en langues, criaient. Ma mère détestait que j'y aille. J'y allais quand même. Je regardais le pasteur, je retenais ses gestes, ses silences, la façon dont il montait la voix au bon moment. Rentré chez moi, je l'imitais devant le miroir.

Il y avait une autre chose qui m'attirait : la mort. À Lynn, il y avait une fabrique de cercueils, et j'allais regarder les ouvriers travailler. Je ramassais les animaux écrasés sur la route, les chats, les oiseaux, et je leur faisais des enterrements, avec un sermon, des chants, une croix. Quand les autres enfants ne venaient pas, je faisais la cérémonie tout seul. Je disais aux autres que l'ange de la mort me guidait. Un jour, j'ai voulu prouver que je pouvais voler : j'ai sauté d'un toit, et je me suis cassé le bras. J'ai continué à dire que j'avais des pouvoirs.

Pendant la guerre, j'admirais Hitler. Je forçais les autres garçons à marcher au pas de l'oie. Je ne savais pas encore ce que je voulais. Je savais seulement que je voulais que les autres m'obéissent.

À quatorze ans, mes parents se sont séparés, et je suis parti avec ma mère à Richmond, une petite ville de l'Indiana. Au lycée, je m'habillais tous les jours en costume du dimanche, je portais ma Bible sous le bras, et je reprochais aux autres de boire, de fumer et de danser. L'été, j'ai organisé une ligue de baseball pour les enfants. Lors d'un match, j'ai vu comment on traitait les spectateurs noirs, et quelque chose s'est noué en moi. Mon père avait refusé un jour qu'un ami noir entre chez nous. Je ne lui ai plus parlé pendant des années. Le racisme, je l'ai appris à la maison, et je me suis juré de le combattre. C'est vrai. C'est peut-être la seule chose entièrement vraie de ma vie.

Je travaillais la nuit comme garçon de salle à l'hôpital de Richmond. C'est là que j'ai rencontré Marceline Baldwin, une élève infirmière, douce, méthodiste, d'une bonne famille. Je l'ai épousée en juin 1949. Pour tester son amour, je lui annonçais parfois que quelqu'un de sa famille était mort, je la consolais, puis je lui révélais que j'avais menti. Elle restait. Elle est toujours restée.

Je suis devenu marxiste en écoutant un discours d'Eleanor Roosevelt sur le sort des Noirs américains. J'allais aux réunions du Parti communiste à Indianapolis. Le FBI nous suivait. Alors j'ai eu une idée, et je te la dis comme je me la suis dite : comment montrer mon marxisme ? En entrant dans l'Église. Les Églises avaient ce que les communistes n'auraient jamais : les foules du dimanche.

En 1955, j'ai fondé ma propre église à Indianapolis. Pour réunir l'argent, j'ai vendu des singes au porte-à-porte, je n'en ai pas honte. Mon église accueillait les Noirs et les Blancs, sur les mêmes bancs, à la même table, dans une ville où le Ku Klux Klan défilait encore. On jetait des pierres sur nos fenêtres, on mettait des têtes de chat mort sur notre perron. Tant mieux : la persécution prouvait que nous avions raison. Marceline et moi avons adopté des enfants coréens, un enfant noir, un enfant blanc. Je les appelais ma famille arc-en-ciel. Le jour où nous avons ramené Jimmy, notre petit garçon noir, une voisine a craché sur le trottoir devant Marceline. Le soir, dans la cuisine, elle tremblait.

— Jim, ils vont nous rendre la vie impossible. Les enfants vont souffrir.

— Les enfants vont apprendre ce que c'est que le monde. Et le monde va apprendre ce que c'est que nous.

— Tu parles comme en chaire. Je te parle à toi.

— C'est la même chose, Marceline. Il n'y a plus de différence entre moi et la chaire.

Elle m'a regardé longtemps, avec ses yeux d'infirmière, ceux qui voient la fièvre avant le thermomètre. Elle n'a rien dit. Elle n'a presque jamais rien dit. C'est peut-être ce que je lui ai fait de plus grave. En 1961, la ville m'a nommé directeur de sa commission des droits de l'homme. J'allais m'asseoir dans les restaurants qui refusaient les Noirs, avec des amis noirs, et j'attendais qu'on nous serve.

C'est à cette époque que j'ai commencé les guérisons. Je faisais venir des malades sur scène, je posais les mains sur eux, et je brandissais devant la foule une chose sanglante que j'avais « arrachée » de leur corps : une tumeur, disais-je. C'étaient des morceaux de foie de poulet que mes assistantes cachaient dans une serviette. Je faisais fouiller les poubelles des fidèles pour connaître leurs secrets, et je les révélais en chaire comme si Dieu me les avait soufflés. Ils pleuraient. Ils m'appelaient Père.

En 1965, j'ai annoncé qu'une guerre nucléaire allait détruire Indianapolis, et j'ai emmené une centaine de fidèles en Californie, à Redwood Valley, que j'avais lu dans un magazine comme l'un des endroits les plus sûrs en cas de bombe. Puis nous sommes descendus vers San Francisco et Los Angeles, et nous sommes devenus des milliers. Des bus entiers de fidèles parcouraient l'Amérique pour mes tournées. Je pouvais remplir une salle en une heure, faire voter des centaines de gens en un après-midi. Les hommes politiques venaient me serrer la main. En 1976, le maire de San Francisco m'a nommé à la commission du logement de la ville.

Ils me donnaient tout : leurs maisons, leurs salaires, leurs pensions de retraite. Les vieilles dames noires me signaient leurs chèques. Je ne gardais presque rien pour moi, je le disais souvent. Mais je contrôlais tout. Je savais qui couchait avec qui, qui doutait, qui écrivait à sa famille. Chacun devait signer des lettres où il confessait des fautes, vraies ou inventées, et je les gardais. On ne quitte pas quelqu'un qui détient vos aveux. Je dormais de moins en moins. Je prenais des cachets pour dormir et d'autres pour me réveiller. Je disais maintenant que j'étais la réincarnation de Jésus, de Bouddha, de Lénine. Je disais que la Bible était un livre écrit par des esclavagistes, et je la jetais par terre devant eux. Personne ne sortait de la salle.

Un dimanche, à Redwood Valley, une vieille dame de Los Angeles est venue me voir après l'office. Elle avait mis son plus beau chapeau.

— Père, j'ai signé l'acte de ma maison au Temple. Mes enfants ne savent pas.

— Tu as bien fait, ma sœur. Tes enfants sont dans le monde. Ta famille, maintenant, c'est nous.

— Et si je tombe malade ?

— Tu ne tomberas pas malade. Et si tu tombes, c'est moi qui te soignerai.

Elle m'a embrassé la main. Je l'ai laissée faire. Je me disais que je l'aimais. Je crois même que c'était vrai. C'est cela qu'il faut comprendre : on peut aimer quelqu'un et lui prendre sa maison le même jour.

En 1977, un journal a préparé un long article sur nous. D'anciens membres racontaient les coups, l'argent, les enfants séparés de leurs parents. Il était temps de partir. Nous avions loué des terres au Guyana, en Amérique du Sud, au milieu de la jungle. Nous avons appelé ce lieu Jonestown.

Là-bas, ils travaillaient dans les champs du lever au coucher du soleil, sous la chaleur, la boue jusqu'aux genoux. Le soir, je parlais au micro, et ma voix sortait des haut-parleurs installés partout, parfois toute la nuit. Je leur lisais les nouvelles du monde, que je réécrivais : l'Amérique s'effondrait, les Noirs y étaient parqués dans des camps, la guerre approchait. Ceux qui se plaignaient étaient punis, enfermés dans une caisse sous terre, privés de nourriture, humiliés devant les autres. Les passeports étaient rangés chez moi, la seule route menait à une piste d'aviation, et la jungle faisait le reste. La nuit, je faisais sonner l'alarme. Je les rassemblais, je leur disais que des mercenaires arrivaient pour tuer les enfants, que l'heure était venue de mourir ensemble, et je les faisais répéter. Puis je leur disais que c'était un test. Ils rentraient se coucher. Ils étaient toujours là.

En novembre 1978, un député américain, Leo Ryan, est arrivé avec des journalistes et des parents inquiets. Je leur avais préparé une fête, de la musique, des sourires. À la fin de la visite, des familles ont demandé à partir avec lui. Si une seule porte s'ouvre, tout s'effondre. Je ne pouvais pas laisser cette porte ouverte.

@yt 6S_d1eVv0E8 | Jonestown: The Life and Death of Peoples Temple (2006), de Stanley Nelson, avec des survivants et des archives. Bande-annonce.

!! CE QUI S'EST PASSÉ :: Le 18 novembre 1978, des hommes armés de Jonestown ont tué Leo Ryan et quatre autres personnes sur la piste de Port Kaituma. Le même jour, à Jonestown, Jim Jones a ordonné à ses fidèles de boire un poison. 909 personnes sont mortes dans le village, dont plus de 300 enfants, qui n'ont rien choisi. Beaucoup d'adultes ont été forcés, sous la menace des armes. Jones est mort d'une balle dans la tête. Avec les morts de Port Kaituma et de Georgetown, le bilan est de 918. Marceline Jones est morte avec eux.

## David Koresh, le Mont-Carmel

Ma mère avait quatorze ans quand je suis né, le 17 août 1959, à Houston, au Texas. Mon père en avait vingt. Il est parti avant que je sache marcher. On m'a appelé Vernon Wayne Howell. C'est ma grand-mère qui m'a élevé, et pendant longtemps elle m'a laissé croire qu'elle était ma mère. Ma vraie mère venait parfois en visite, et on me la présentait comme une tante. Quand j'ai appris la vérité, j'avais déjà compris que les adultes mentent sur les choses les plus importantes.

À l'école, à Dallas puis à Garland, j'étais le garçon lent. Je voyais mal, je lisais mal, on a dit que j'étais dyslexique, et on m'a mis dans une classe pour élèves en difficulté. Les autres se moquaient de moi. Je me suis mis au sport, j'ai musclé mon corps, et on a cessé de me frapper. J'ai quitté le lycée avant la fin. Je réparais des voitures, je faisais des petits boulots, je me faisais renvoyer ou je partais.

Mais il y avait une chose que je savais faire mieux que personne : la Bible. Ma mère avait rejoint l'Église adventiste du septième jour. Je m'y suis plongé, des chapitres entiers, des livres entiers, jusqu'à les réciter sans ouvrir le volume. Les mots que je n'arrivais pas à lire à l'école, je les retenais à l'oreille, et ils ne me quittaient plus. Je jouais aussi de la guitare, du rock, très fort, et je rêvais d'être une vedette. Un jour, dans une église adventiste de Tyler, j'ai annoncé qu'un verset d'Isaïe m'ordonnait d'épouser la fille du pasteur. On m'a chassé de l'église.

En 1981, j'avais vingt-deux ans, je suis arrivé à Waco, au centre du Mont-Carmel. Les Davidiens de la Branche, comme on les appelait, vivaient là depuis des décennies, dans des bâtiments de bois au milieu de la prairie texane. Leur histoire remontait aux années trente, à un Bulgare, Victor Houteff, qui avait quitté l'Église adventiste en annonçant le retour imminent du Christ. Après lui, d'autres prophètes avaient pris la relève, chacun avec sa date de fin du monde, et chaque date était passée. Ils attendaient toujours. Ils avaient besoin de quelqu'un qui sache lire les signes. Moi, je savais.

La vieille Lois Roden dirigeait le centre. Elle avait plus de soixante ans. Elle enseignait une chose que personne d'autre n'osait dire au Texas : que l'Esprit saint était féminin, une Mère. Les pasteurs des alentours la traitaient de folle. La première fois qu'elle m'a reçu, dans sa cuisine, elle m'a fait réciter l'Apocalypse pendant une heure sans m'interrompre.

— Tu as la mémoire, Vernon. Tu as la voix. Est-ce que tu as la lumière ?

— Je ne sais pas, sœur Roden. Je sais seulement que quand j'ouvre le Livre, il me parle.

— Il parle à beaucoup de gens. La question, c'est ce que tu en fais quand tu refermes le Livre.

— Laissez-moi prêcher, et vous verrez.

Elle m'a laissé prêcher. Je parlais pendant des heures, parfois toute la nuit, et personne ne s'endormait. J'ouvrais les sept sceaux de l'Apocalypse, ces sept énigmes que personne n'avait jamais su déchiffrer. Je montrais comment chaque verset répondait à un autre, comment tout s'emboîtait. Son fils, George Roden, me haïssait. Il voulait le centre pour lui. En 1984, il nous a chassés à la pointe du fusil, moi et une vingtaine de fidèles.

Nous avons vécu deux ans dans des bus et des tentes, à Palestine, à une centaine de kilomètres. J'ai voyagé pour trouver d'autres âmes : en Californie, en Angleterre, en Australie, en Israël. À Jérusalem, j'ai reçu une vision. J'ai compris que j'étais le nouveau Cyrus, le roi que la Bible appelle l'oint de Dieu, celui qui libère son peuple. Je suis revenu avec cette certitude, et des gens de partout m'ont suivi au Texas.

En 1987, George Roden a déterré un cercueil dans le cimetière du centre. Il voulait me défier : celui qui ressusciterait le mort serait le vrai prophète. J'ai voulu prouver à la police qu'il violait une sépulture. Nous sommes revenus au Mont-Carmel avec des fusils, la nuit, pour prendre des photos. Ça a tiré. Roden a été blessé. Au procès, mes compagnons ont été acquittés, et le jury n'a pas pu se mettre d'accord sur moi. Deux ans plus tard, Roden a tué un homme à la hache, un autre qui se disait messie, et on l'a enfermé dans un hôpital psychiatrique. Nous avons payé ses dettes d'impôts au comté, et le Mont-Carmel est redevenu à nous. Dans un des bâtiments, d'anciens occupants avaient laissé un laboratoire de drogue. Nous l'avons signalé à la police. Je voulais qu'on voie que nous respections la loi.

En 1990, j'ai changé de nom devant un tribunal de Californie. David, pour la lignée du roi David. Koresh, pour Cyrus. Je leur ai enseigné que les hommes du groupe devaient renoncer à leurs femmes, que j'étais le seul à pouvoir donner des enfants à la maison de David. Ils l'ont accepté. Je leur ai montré que c'était écrit.

Nous avons commencé à acheter des armes. Beaucoup d'armes. Nous en revendions aussi, dans les salons d'armes du Texas, c'était un commerce, et cela finançait la communauté. Mais surtout, je préparais les miens. Je leur expliquais que la fin viendrait du gouvernement, des soldats, du feu, comme dans l'Apocalypse, et qu'il faudrait tenir. Chaque nouveau fusil était une page de la prophétie.

@img https://commons.wikimedia.org/wiki/Special:FilePath/USAWDTX_068-01559_%E2%80%93_Aerial_photo_of_Mount_Carmel_center.jpg?width=1280 | Le centre du Mont-Carmel vu d'avion, près de Waco, au Texas. | Wikimedia Commons

Le 27 février 1993, le journal de Waco a commencé à publier une longue enquête sur moi. Ils m'appelaient le Messie pécheur. Le lendemain matin, ils sont venus. Des agents fédéraux, cachés dans des remorques à bétail, des hélicoptères au-dessus de nous. Je suis allé à la porte. Ça a tiré de partout. J'ai été touché au poignet et au flanc. Il y a eu des morts des deux côtés. Puis le FBI a pris la place, et le siège a commencé.

Pendant cinquante et un jours, j'ai parlé au téléphone avec des négociateurs. Je leur expliquais les sceaux, pendant des heures. Ils coupaient l'électricité. Ils passaient de la musique à plein volume toute la nuit, des chants de moines tibétains, des bruits de fraise de dentiste, des cris de lapins qu'on égorge, des chansons de Nancy Sinatra. Ils allumaient des projecteurs pour nous empêcher de dormir. Ils croyaient qu'ils nous faisaient peur. Ils ne comprenaient pas que tout cela était écrit. Chaque jour de siège me donnait raison. Certains sont sortis, une trentaine, dont beaucoup d'enfants. Les autres sont restés avec moi.

Je leur ai promis de me rendre quand j'aurais fini d'écrire mon commentaire sur les sept sceaux. Je l'écris. J'ai terminé le premier.

@yt g0MLilbLeZ4 | Waco: American Apocalypse (2023), série documentaire de Tiller Russell, avec les images inédites du siège. Bande-annonce.

!! CE QUI S'EST PASSÉ :: Le raid du 28 février 1993 a tué quatre agents fédéraux et six Davidiens. Le 19 avril, au 51e jour du siège, le FBI a lancé un assaut au gaz lacrymogène avec des blindés ; un incendie a ravagé le bâtiment. L'enquête officielle l'attribue aux Davidiens eux-mêmes, ce que certains contestent encore. Près de quatre-vingts personnes sont mortes, dont plus d'une vingtaine d'enfants, et Koresh lui-même, d'une balle dans la tête. Des témoignages ont établi que Koresh imposait ses « mariages » à des adolescentes, dont l'une avait quatorze ans : des abus sexuels sur mineures. La gestion du siège par l'État a elle aussi été durement critiquée.

# Faire la guerre au monde

Les trois journaux qui suivent viennent de mondes très différents : la Californie hippie de la fin des années soixante, le Japon riche et vide des années quatre-vingt, un désert de l'Oregon où des milliers d'Occidentaux en robes orange ont bâti une ville en quelques mois. Ils ont pourtant un point commun. Dans chacun, le groupe a fini par considérer le monde extérieur comme un ennemi à frapper. Les meurtres, le gaz, les bactéries : ce ne sont plus seulement des fidèles qu'on enferme, ce sont des inconnus qu'on attaque.

## Charles Manson, la Famille

Ma mère s'appelait Kathleen Maddox. Elle avait seize ans quand je suis né, le 12 novembre 1934, à Cincinnati, dans l'Ohio. Sur le premier papier, on m'a appelé « sans nom Maddox ». Elle buvait, elle partait des jours entiers, elle me laissait chez des voisins, chez des grands-mères, chez qui voulait bien. On raconte qu'un jour, dans un bar, elle m'a échangé contre une cruche de bière, et qu'un oncle a dû venir me récupérer. Je ne sais pas si c'est vrai. Ça ressemble à ce que j'ai vécu.

Quand j'avais quatre ans, elle a braqué une station-service avec son frère, et elle est partie en prison. On m'a envoyé chez une tante, à McMechen, en Virginie-Occidentale, une petite ville d'ouvriers au bord de l'Ohio. Ma tante était une femme très religieuse et très dure. Mon oncle se moquait de moi parce que je pleurais. Le premier jour d'école, il m'a habillé avec une robe de fille, pour, disait-il, faire de moi un homme. J'ai appris ce jour-là qu'on survit en faisant rire, ou en faisant peur.

Ma mère est sortie de prison quand j'avais huit ans. Elle m'a repris, puis elle a voulu me placer. À douze ans, on m'a envoyé dans un pensionnat de frères catholiques, à Terre Haute, dans l'Indiana. Je me suis enfui. Je suis revenu vers elle. Elle ne voulait pas de moi. J'ai volé, dans des magasins, dans des maisons. J'ai été envoyé à Boys Town, le célèbre foyer pour garçons du père Flanagan, au Nebraska. J'y suis resté quatre jours avant de m'enfuir avec un autre garçon en volant une voiture. Puis les maisons de correction, l'une après l'autre, dans l'Indiana, à Washington, en Virginie. Les gardiens frappaient, les grands garçons faisaient pire. Je suis devenu ce qu'il fallait devenir pour survivre là-dedans.

J'ai passé plus de la moitié de ma vie d'adulte enfermé. Vols de voitures, chèques volés, proxénétisme, violation de liberté conditionnelle. En prison, j'ai appris deux choses. La première, dans un cours pour détenus inspiré du livre de Dale Carnegie, Comment se faire des amis : les gens vous suivent quand vous leur renvoyez ce qu'ils veulent entendre, quand vous répétez leur prénom, quand vous les écoutez. La seconde, à McNeil Island, auprès d'un vieux gangster des années trente, Alvin Karpis, qui avait été l'ennemi public numéro un : il m'a appris à jouer de la guitare. Je me suis mis à écrire des chansons. Je me suis dit que je serais plus grand que les Beatles.

Le 21 mars 1967, on m'a relâché. J'avais trente-deux ans. J'ai demandé à rester en prison : je ne savais pas vivre ailleurs. Ils ont refusé.

Je suis allé à San Francisco. C'était l'été de l'amour. À Haight-Ashbury, des milliers de jeunes avaient quitté leurs familles et dormaient dans les parcs, dans des appartements ouverts à tous. Ils cherchaient un père, et ils ne le savaient pas. Moi, je savais. La première, c'était Mary Brunner, une bibliothécaire de l'université de Berkeley. Elle m'a laissé vivre chez elle. Puis d'autres, surtout des filles, très jeunes, perdues, que leurs parents n'écoutaient pas. Je leur disais qu'elles étaient belles, que leur vie d'avant était un mensonge, que l'ego est une prison, qu'il fallait mourir à soi-même pour renaître. Je leur donnais du LSD, de la musique, une famille. Nous sommes partis sur les routes dans un vieux bus scolaire repeint en noir.

Un jour, à Venice, au bord de la plage de Los Angeles, j'ai vu une fille rousse assise sur un banc, qui pleurait. Dix-huit ans, des taches de rousseur, un sac à ses pieds. Son père l'avait mise dehors. Je me suis assis à côté d'elle, sans rien dire, et j'ai attendu qu'elle me regarde.

— Qu'est-ce que tu me veux ?

— Rien. C'est toi qui veux quelque chose. Tu veux qu'on t'aime sans te demander d'être quelqu'un d'autre.

— Comment vous savez ça ?

— Parce que c'est ce que tout le monde veut. Moi, je suis le seul à le dire. Viens.

Elle s'appelait Lynette Fromme. Plus tard, on l'a appelée Squeaky, à cause de sa petite voix. Elle est venue. Elle est restée. Elle n'est jamais vraiment repartie. C'est ça, le truc, mec : je ne les ai pas prises. Je les ai ramassées. Tout le monde les avait laissées par terre.

À Los Angeles, au printemps 1968, un batteur des Beach Boys, Dennis Wilson, a pris deux de mes filles en stop. Elles l'ont ramené à moi. Nous nous sommes installés chez lui, dans sa grande maison de Sunset Boulevard, une vingtaine de personnes. Il me présentait à des producteurs, à des musiciens. Les Beach Boys ont même enregistré une de mes chansons, en changeant le titre et les paroles, sans mettre mon nom. Je ne l'ai jamais pardonné. Puis Dennis en a eu assez, et il est parti de chez lui pour ne plus nous voir.

Nous avons trouvé refuge dans un vieux ranch où l'on tournait des westerns, le ranch Spahn, dans les collines au nord de la ville. Le propriétaire, George Spahn, avait plus de quatre-vingts ans et voyait à peine. Les filles s'occupaient de lui. En échange, nous vivions là, entre les décors de saloons en carton et les chevaux de location. Le soir, autour du feu, je parlais. Ils m'écoutaient comme personne ne m'avait jamais écouté.

En décembre 1968, l'Album blanc des Beatles est sorti. Je l'ai écouté en boucle, et j'ai entendu ce qu'ils me disaient, à moi. Helter Skelter. Une guerre entre les Noirs et les Blancs allait éclater. Nous nous cacherions dans un trou au fond du désert de la Vallée de la Mort, pendant qu'elle détruisait tout. Ensuite, nous sortirions, et le monde serait à nous.

En mai 1969, un producteur de disques, Terry Melcher, le fils de l'actrice Doris Day, est venu au ranch m'écouter. Je l'avais connu par Dennis. Il habitait avant une grande maison sur les hauteurs de Los Angeles, au bout d'une allée, Cielo Drive. Il a dit qu'il réfléchirait. Il n'a jamais rappelé. Je n'oublie jamais ceux qui m'ont fermé une porte. Les filles le savaient. Elles savaient tout ce que je pensais avant que je le dise.

En juillet, l'argent manquait. Un musicien que nous connaissions, Gary Hinman, devait nous donner de l'argent. Il a refusé. Il est mort. Un de mes garçons a été arrêté. Il fallait maintenant que la police regarde ailleurs. Le moment était venu de montrer au monde ce qu'était Helter Skelter. J'ai dit aux enfants de faire quelque chose d'horrible, et de laisser des signes qui feraient croire à d'autres coupables. La première nuit, je ne serais pas là. Je ne me salis jamais les mains.

@img https://commons.wikimedia.org/wiki/Special:FilePath/Haight-Ashbury_signs_(San_Francisco)_(TK3).JPG?width=1280 | Le carrefour de Haight et Ashbury, à San Francisco, cœur de l'été de l'amour de 1967. | Wikimedia Commons

!! CE QUI S'EST PASSÉ :: Dans la nuit du 8 au 9 août 1969, des membres de la Famille ont tué, au 10050 Cielo Drive, l'actrice Sharon Tate, enceinte de huit mois, et quatre autres personnes : Jay Sebring, Wojciech Frykowski, Abigail Folger et Steven Parent. La nuit suivante, ils ont tué Leno et Rosemary LaBianca. Gary Hinman avait été tué en juillet, et Donald Shea le serait en août. Manson a été arrêté en octobre 1969 au ranch Barker, dans le désert, caché dans un placard sous un évier. Au procès, il s'est gravé une croix sur le front, et ses disciples l'ont imité. Condamné à mort en 1971 comme celui qui avait ordonné les meurtres, il a vu sa peine commuée en prison à vie en 1972, quand la Californie a aboli la peine de mort. Il est mort en prison en 2017. Ses victimes sont souvent moins connues que lui : c'est l'une des injustices de cette histoire.

## Shoko Asahara, Aum

Je suis né Chizuo Matsumoto, le 2 mars 1955, à Yatsushiro, dans la préfecture de Kumamoto, sur l'île de Kyūshū. Mon père fabriquait des tatamis, ces nattes de paille tressée qui couvrent le sol des maisons japonaises. Nous étions pauvres, très nombreux, et j'étais le quatrième fils. Je suis né avec un glaucome. Mon œil gauche ne voyait rien, le droit voyait mal. Je ne pourrais pas faire le métier de mon père. À six ans, mes parents m'ont envoyé dans un internat pour aveugles. Je n'ai plus jamais vécu avec ma famille.

Là-bas, j'ai découvert une chose qui a décidé de ma vie : j'étais celui qui voyait le mieux. Presque tous les autres enfants étaient complètement aveugles. Ils dépendaient de moi pour aller quelque part, pour lire une étiquette, pour trouver une porte. Je les emmenais à la boutique de bonbons, et je me faisais payer. Je les protégeais, et je les frappais. Je leur prenais leur argent. Les professeurs me trouvaient intelligent et inquiétant. Je disais à mes camarades que je deviendrais Premier ministre. Je rêvais, la nuit, d'un royaume peuplé de robots qui m'obéiraient. J'ai compris très jeune que le pouvoir n'a pas besoin d'être grand : il suffit d'être un peu moins aveugle que les autres.

En 1973, j'ai terminé l'école et j'ai tenté le concours de la faculté de droit de l'université de Tokyo, la plus prestigieuse du pays, celle qui forme les ministres. J'ai été recalé. Je ne l'ai jamais oublié. Je suis devenu ce que deviennent beaucoup d'aveugles au Japon : acupuncteur. J'ai ouvert une boutique de médecine chinoise près de Tokyo. Je me suis marié l'année suivante. J'ai eu des enfants. En 1981, la police m'a condamné à une amende pour avoir vendu sans autorisation des remèdes de ma fabrication, des herbes macérées que je faisais passer pour des médicaments miracles. Encore une humiliation.

Alors je me suis tourné vers ce qui ne demande pas de diplôme. L'astrologie chinoise, le taoïsme, puis le yoga, la méditation, le bouddhisme ésotérique, les prophéties de Nostradamus, très à la mode dans le Japon de ces années-là, et même le christianisme ésotérique. J'ai fréquenté une nouvelle religion japonaise qui enseignait comment obtenir des pouvoirs surnaturels par l'ascèse. J'ai pris un nouveau nom : Shoko Asahara. En 1984, j'ai ouvert une petite école de yoga dans un appartement de Shibuya, à Tokyo. J'ai fait publier dans un magazine des photographies de moi en lévitation, assis en lotus, suspendu au-dessus du sol. Les lecteurs ne voyaient pas que je sautais.

Je suis allé en Inde, plusieurs fois. Je suis monté vers l'Himalaya. Je suis revenu en annonçant que j'avais atteint l'éveil, que j'avais rencontré le dieu Shiva et qu'il m'avait confié une mission : prêcher le vrai bouddhisme. J'ai même été reçu par le dalaï-lama, en 1987. Il n'a sans doute vu en moi qu'un étrange Japonais de plus. Moi, je me suis servi de la photo pendant des années. Cette année-là, mon école est devenue Aum Shinrikyo, la vérité suprême d'Aum.

Les jeunes sont venus, beaucoup de jeunes, et beaucoup étaient brillants. Des étudiants en médecine, en chimie, en physique, des ingénieurs sortis des meilleures universités, celles qui m'avaient refusé. Ils s'ennuyaient dans ce Japon riche et vide des années de la bulle, où l'on ne parlait que d'argent, de carrière, de voitures. Je leur offrais une aventure spirituelle, une hiérarchie, des grades, un sens. Je leur vendais aussi mon eau de bain, à boire, mes cheveux, mon sang, et des casques couverts d'électrodes censés leur transmettre mes ondes cérébrales. Ils payaient très cher. Ils étaient heureux de payer.

La première à rester, c'était une jeune employée de bureau, Hisako Ishii. Elle était venue à un cours de yoga, un soir, dans notre petite salle de Shibuya, et elle n'était jamais repartie. Elle comptait mieux que n'importe quel comptable. Un jour, elle m'a apporté les registres.

— Maître, les dons ont doublé ce mois-ci. Mais certains disciples ont donné tout ce qu'ils avaient. Ils n'ont plus de quoi payer leur loyer.

— Alors ils vivront ici, avec nous. Le loyer est un attachement.

— Leurs parents téléphonent. Ils demandent à les voir.

— Les parents sont aussi un attachement. Tu le sais, Ishii. Tu as renoncé aux tiens.

Elle a baissé la tête et elle a rangé les registres. Elle est devenue l'une de mes plus proches disciples, et la gardienne de l'argent d'Aum. Je lui faisais plus confiance qu'à moi-même. C'est une phrase étrange à écrire pour un homme qui se disait éveillé.

En 1989, le gouvernement de Tokyo nous a reconnus comme organisation religieuse. Plus d'impôts, le droit d'acheter des terrains, de construire. Au pied du mont Fuji, à Kamikuishiki, nous avons bâti de grands hangars sans fenêtres, que nous appelions les satyans. Les disciples y vivaient, y méditaient, y travaillaient. Des parents se sont plaints que leurs enfants avaient disparu. Un jeune avocat les aidait, Tsutsumi Sakamoto. Il préparait un procès contre nous.

@img https://commons.wikimedia.org/wiki/Special:FilePath/080103_hakkai_fuji.jpg?width=1280 | Le mont Fuji. Aum avait bâti ses laboratoires et ses dortoirs à Kamikuishiki, au pied de la montagne. | Wikimedia Commons

En 1990, je me suis présenté aux élections législatives, avec vingt-quatre de mes disciples. Ils dansaient dans les rues de Tokyo avec de grands masques d'éléphant et des masques à mon effigie, en chantant mon nom. Nous avons eu à peine quelques centaines de voix chacun. Le Japon m'a humilié une fois de plus. Alors le Japon serait puni.

Je prêchais maintenant l'Armageddon. Une guerre mondiale allait venir, et seuls ceux qui m'auraient suivi survivraient. Si elle ne venait pas assez vite, nous la ferions venir. J'ai créé, à l'intérieur de la secte, des ministères, comme un gouvernement : la Santé, la Science, le Renseignement, la Construction. Je nommais ministres mes disciples les plus doués. Nous étions un État dans l'État. Mon pays, c'était moi. Nous avons ouvert des branches en Russie, où des dizaines de milliers de personnes nous ont suivis après la chute de l'Union soviétique.

Il y a eu des morts. Un disciple qui voulait partir. L'avocat Sakamoto, sa femme et leur bébé. J'appelais cela poa : tuer quelqu'un pour sauver son âme, pour l'empêcher d'accumuler plus de mauvais karma. Mes disciples le croyaient, parce qu'ils avaient besoin de le croire. Après ce qu'ils avaient fait pour moi, ils ne pouvaient plus revenir en arrière.

En mars 1995, j'ai appris que la police préparait une grande opération contre nos bâtiments. Il fallait la retarder, créer le chaos. J'ai donné l'ordre.

!! CE QUI S'EST PASSÉ :: En novembre 1989, des membres d'Aum ont assassiné l'avocat Tsutsumi Sakamoto, sa femme Satoko et leur fils Tatsuhiko, quatorze mois ; leurs corps n'ont été retrouvés qu'en 1995. En juin 1994, une attaque au gaz sarin à Matsumoto a tué huit personnes. Le 20 mars 1995, cinq membres ont libéré du sarin dans cinq rames du métro de Tokyo, à l'heure de pointe : 13 morts, des milliers de personnes touchées, certaines handicapées à vie. Asahara a été arrêté le 16 mai 1995, caché dans un recoin aménagé dans le mur d'un des bâtiments de Kamikuishiki. Condamné à mort en 2004, il a été exécuté le 6 juillet 2018 avec six anciens dirigeants d'Aum.

## Ma Anand Sheela, Rajneeshpuram

Je suis née Sheela Ambalal Patel, le 28 décembre 1949, à Baroda, dans le Gujarat, à l'ouest de l'Inde. J'étais la plus jeune de six enfants, dans une famille aisée, cultivée, qui croyait aux études. À dix-huit ans, on m'a envoyée en Amérique, au New Jersey, dans une université d'État, à Montclair. J'étais petite, vive, je parlais fort, je n'avais peur de personne. Là-bas, j'ai rencontré un Américain, Marc Silverman, un garçon doux et sérieux de la banlieue de Chicago. Je l'ai épousé. Je suis devenue Sheela Silverman.

En 1972, nous sommes rentrés en Inde, Marc et moi. On parlait partout d'un maître, un ancien professeur de philosophie, Bhagwan Shree Rajneesh, qui enseignait la méditation à Bombay, puis dans un grand ashram à Pune. Il parlait de liberté, de rire, de danse, de sexe, de tout ce que les religions interdisent. Des Occidentaux venaient du monde entier pour l'écouter, en robes orange, avec des colliers de perles de bois et son portrait en médaillon. Nous sommes devenus ses disciples. Il m'a donné un nouveau nom : Ma Anand Sheela.

Je ne suis pas venue pour méditer. Je l'ai dit souvent, et c'est vrai. Je suis venue pour lui. La première fois qu'il m'a reçue, il m'a prise dans ses bras. Je n'avais jamais été tenue comme cela. J'ai pleuré comme une enfant.

— Pourquoi pleures-tu, Sheela ?

— Je ne sais pas. Je me sens chez moi.

— Alors reste. Ici, tu n'as besoin de rien comprendre. Tu as seulement besoin d'être là.

Il riait doucement. Il avait des yeux immenses, une barbe grise, une voix qui faisait les phrases plus lentes. J'aurais fait n'importe quoi pour cette voix. Je l'ai fait. Je suis venue pour lui. Je l'aimais, d'un amour que je ne sais pas nommer. Je voulais être près de lui, le servir, être celle qu'il regarde. À l'ashram, j'ai commencé par la cuisine, les comptes, les petites tâches. J'étais efficace. Je savais parler aux fournisseurs, aux fonctionnaires, aux journalistes. Je montais.

Marc est tombé malade, et il est mort. J'ai épousé un autre disciple américain, John Shelfer. Ma vie, de toute façon, n'était plus à moi.

En 1981, Bhagwan m'a nommée sa secrétaire personnelle. Il venait d'entrer dans une période de silence : il ne parlait plus en public. J'étais sa voix. C'est moi qui disais ce qu'il voulait, ce qu'il pensait, qui il recevait. Les autorités indiennes lui cherchaient des ennuis, des impôts, des procès. Je l'ai convaincu de partir pour l'Amérique. En juillet 1981, nous avons acheté un ranch immense dans le désert de l'Oregon, le Big Muddy Ranch : plus de vingt-cinq mille hectares de collines brûlées, de genévriers et de rivières à sec, à des heures de la première ville. Des milliers de disciples y ont construit une ville en quelques mois. Des routes, des maisons, un barrage, un centre commercial, un aéroport avec sa propre compagnie aérienne, une police. Nous l'avons appelée Rajneeshpuram.

Un soir, dans sa chambre, à Pune, il m'a parlé de l'Amérique.

— Sheela, il me faut un endroit où personne ne viendra nous dire comment vivre.

— Il n'y en a pas, Bhagwan. Il faut le construire.

— Alors construis-le. Tu es la seule ici qui sait parler aux avocats.

— Et si on nous attaque ?

— On nous attaquera. Fais ce qu'il faut.

Fais ce qu'il faut. Je l'ai entendu cent fois, après. Il n'a jamais dit quoi. Il n'en avait pas besoin. Il savait que je ferais toujours un peu plus que ce qu'il n'avait pas dit.

@img https://commons.wikimedia.org/wiki/Special:FilePath/Oregon_Rajneeshpuram.jpg?width=1280 | Rajneeshpuram, la ville bâtie en quelques mois dans le désert de l'Oregon. | Wikimedia Commons

Le village le plus proche, Antelope, comptait une quarantaine d'habitants, des retraités, des éleveurs. Ils nous regardaient comme des envahisseurs. Ils avaient raison. Nous avons acheté des maisons à Antelope, nous avons voté aux élections municipales, et nous avons pris la mairie. Nous avons rebaptisé le village Rajneesh.

Bhagwan aimait les Rolls-Royce. Les disciples lui en ont offert des dizaines, plus de quatre-vingt-dix à la fin, une pour chaque jour. Chaque après-midi, il traversait la ville au volant, très lentement, et des milliers de disciples en rouge se rangeaient au bord de la route pour le saluer en chantant. Les télévisions adoraient. Moi, je donnais des interviews où j'insultais tout le monde : les fermiers, les politiciens, les journalistes, l'Amérique entière. Plus ils nous détestaient, plus les nôtres se serraient autour de nous. Et plus ils se serraient, plus j'avais de pouvoir.

En 1984, le comté de Wasco voulait nous empêcher de construire. Il y avait des élections à la commission du comté. Si nous la gagnions, plus personne ne nous arrêterait. Nous avons fait venir des milliers de sans-abri, des grandes villes de tout le pays, en bus, avec la promesse d'un toit et de repas, pour qu'ils votent pour nous. Le comté a refusé de les inscrire. Alors nous avons décidé de rendre malades les habitants de The Dalles, la ville principale du comté, pour qu'ils ne puissent pas aller voter. Mes plus proches s'en sont chargés.

Je contrôlais tout. J'avais fait installer des micros dans les chambres, dans les bureaux, dans les téléphones, même dans la chambre de Bhagwan. J'avais une équipe qui m'obéissait sans poser de questions. Mais autour de lui, une autre cour s'était formée : des Américains riches, des vedettes de Hollywood, son médecin, sa compagne. Il les écoutait de plus en plus, et moi de moins en moins. Il prenait des médicaments. Il parlait de nouveau, et ce qu'il disait ne passait plus par moi.

En septembre 1985, je suis partie. Je suis partie avant qu'ils ne me prennent, avec une vingtaine de fidèles, en avion, vers l'Europe. Quelques jours plus tard, Bhagwan a convoqué la presse et m'a tout mis sur le dos : les empoisonnements, les écoutes, les complots. Il a fait brûler mes robes et cinq mille exemplaires du livre de sa religion, dont il disait que j'étais l'auteur. Il en avait le droit, je suppose. C'est moi qui avais fait ce qu'il fallait faire. Ou ce qu'il voulait qu'on fasse, sans jamais le dire.

!! CE QUI S'EST PASSÉ :: En septembre 1984, des membres du mouvement ont contaminé les bars à salades de dix restaurants de The Dalles avec des salmonelles : environ 750 personnes sont tombées malades, sans décès. C'est la plus grande attaque biologique de l'histoire des États-Unis. Le groupe a aussi tenté d'empoisonner des élus du comté et préparé l'assassinat d'un procureur fédéral, Charles Turner. Sheela, arrêtée en Allemagne de l'Ouest en octobre 1985, extradée, a plaidé coupable en 1986 : condamnée à vingt ans, peine réduite, elle a été libérée après vingt-neuf mois, fin 1988. Elle a ensuite tenu deux maisons de retraite en Suisse. Rajneesh, expulsé des États-Unis en 1985, a pris le nom d'Osho et est mort en Inde en 1990.

@yt XEbjE6ECv00 | Wild Wild Country (2018), des frères Way : l'histoire de Rajneeshpuram, racontée par ceux qui l'ont bâtie et par Sheela elle-même. Bande-annonce.

# Les mères

On imagine le gourou en homme barbu qui prêche sous une tente. Mais l'emprise n'a pas de sexe. Des femmes ont fondé des groupes, d'autres les ont tenus de l'intérieur, et le rôle qu'elles se donnent est souvent le même : la mère. Celle qui protège, qui sait ce qui est bon pour toi, qui ne peut pas te vouloir de mal. C'est peut-être le rôle le plus difficile à soupçonner. Ma Anand Sheela en était déjà une figure. En voici deux autres : l'une en Australie, qui s'est fait une famille avec les enfants des autres ; l'autre en Ouganda, qui disait parler au nom de la Vierge Marie, et dont le mouvement a fini dans la plus grande mort collective de ces journaux.

## Anne Hamilton-Byrne, la Famille

Assieds-toi droit. Les enfants de ma maison s'asseyaient droit, et ils ne parlaient que lorsqu'on les y invitait. Je ne te demande pas d'être un enfant. Je te demande d'être poli.

Je suis née Evelyn Grace Victoria Edwards, le 30 décembre 1921, à Sale, dans le Gippsland, l'État de Victoria. Un pays de pâturages, de vent et de pluie. Mon père travaillait où il pouvait. Ma mère entendait des voix. On l'a enfermée dans un asile quand j'étais petite. On m'a envoyée, avec mes frères et sœurs, dans des orphelinats, puis chez les uns et chez les autres. Je me souviens des dortoirs, du gruau, des sœurs qui frappaient avec une règle. Je me souviens surtout d'une chose : personne ne viendrait me chercher. J'ai décidé très tôt que, plus tard, c'est moi qui viendrais chercher les autres.

J'étais belle, et je l'ai su avant de savoir lire. Je me suis mariée jeune, avec un homme qui est mort. J'ai eu une fille. Je me suis inventé des noms, des familles, des passés. Au début des années soixante, à Melbourne, j'enseignais le yoga. Le yoga, à cette époque, en Australie, c'était exotique, presque scandaleux. Des dames riches venaient à mes cours. Des médecins aussi. Et un jour, un vieux monsieur aux cheveux blancs, très doux, qui s'asseyait au premier rang et qui me regardait comme on regarde une apparition.

Il s'appelait Raynor Johnson. Un physicien, le directeur d'un collège de l'université de Melbourne, un homme qui écrivait des livres sur l'âme et la survie après la mort. Les gens instruits l'écoutaient. Après un cours, il est resté dans la salle.

— Madame, je cherche depuis quarante ans une preuve que l'esprit existe. Je crois que je l'ai devant moi.

— Vous cherchez une preuve, professeur. Moi, je ne prouve rien. Je suis.

— Alors apprenez-moi.

— Je vais vous apprendre. Mais d'abord, vous allez m'aider. J'ai besoin de gens qui ont un nom.

Il m'a aidée. Toute sa vie. Grâce à lui sont venus des universitaires, des avocats, des infirmières, des psychiatres. Nous nous réunissions dans une maison qu'il avait au bord des collines, Santiniketan. On a fini par nous appeler la Famille. Je leur ai dit, peu à peu, qui j'étais vraiment : l'incarnation du Christ, revenue sur terre pour préparer ceux qui survivraient à la fin du monde. Les professeurs ont pris des notes.

Il fallait des enfants. Des enfants purs, élevés loin du monde, qui seraient les maîtres de l'après. Je n'en avais pas assez. Alors j'en ai pris. Des membres de la Famille me donnaient les leurs. Certaines femmes du groupe, des infirmières, des employées d'adoption, savaient où trouver des bébés que des mères célibataires abandonnaient. On a fait de faux papiers. Les enfants portaient tous mon nom. Je leur ai teint les cheveux en blond, tous, le même blond. Les mêmes habits, les mêmes coupes. On les prenait pour des frères et sœurs. C'est ce qu'ils étaient. Mes enfants.

Nous les avons installés dans une maison au bord du lac Eildon, dans la montagne, Kai Lama. Des tantes, des femmes de la Famille, les gardaient. Ils ne connaissaient ni la télévision, ni l'école, ni les autres enfants. Ils m'appelaient Mère. Quand je venais, en voiture, avec mes grands chapeaux et mes lunettes noires, ils se mettaient en rang. Je n'aimais pas qu'on pleure. Je n'aimais pas qu'on désobéisse. Les tantes punissaient pour moi.

Une des filles, Sarah, était plus vive que les autres. Elle posait des questions. Adolescente, un jour, dans le salon, elle m'a regardée en face.

— Pourquoi est-ce qu'on ne peut pas aller à l'école comme les enfants du village ?

— Parce que tu n'es pas comme les enfants du village. Tu es choisie.

— Je n'ai pas demandé à être choisie.

— Personne ne le demande, Sarah. C'est pour cela que c'est un honneur.

— Alors c'est un honneur que je vous rends.

Je l'ai fait mettre dehors. Elle était à peine plus qu'une enfant. Je pensais qu'elle reviendrait en rampant, comme reviennent ceux qui n'ont nulle part où aller. Elle n'est pas revenue. Elle est allée voir la police.

Ils sont venus en août 1987, au lac, avec des voitures et des assistantes sociales. Ils ont emmené mes enfants. Je n'étais pas là. Ils m'ont cherchée des années. En 1993, ils m'ont trouvée en Amérique, dans une maison des montagnes Catskill, au nord de New York, avec mon mari. On m'a ramenée en Australie, menottes aux poignets, devant les caméras. J'avais soixante et onze ans. Je souriais. On ne m'a pas appris à faire autre chose.

Ils m'ont jugée pour des papiers. De faux certificats de naissance. Une amende. Rien d'autre. Personne n'a pu prouver le reste devant un tribunal, ou personne n'a voulu. Je suis rentrée chez moi. Je suis Mère. On ne juge pas une mère.

!! CE QUI S'EST PASSÉ :: De la fin des années soixante à 1987, la Famille a élevé au moins vingt-huit enfants, dont beaucoup obtenus par des adoptions frauduleuses, coupés du monde, les cheveux teints en blond, soumis à des privations, à des coups et, selon leurs témoignages, à des doses de LSD lors de rituels. Après la fuite de Sarah, la police de Victoria a perquisitionné la maison du lac Eildon le 14 août 1987. Anne Hamilton-Byrne et son mari, arrêtés aux États-Unis en 1993, n'ont été condamnés que pour falsification de documents, à une amende. Elle est morte en 2019, atteinte de démence. Sarah, devenue médecin, a raconté son enfance dans un livre ; les enfants de la Famille ont témoigné dans le documentaire The Family (2016).

## Credonia Mwerinde, Kanungu

Chut. Ici, on ne parle pas. Tu as vu les autres, dans la cour : ils se font des signes avec les mains, ils baissent les yeux. Le silence est le premier des commandements que la Vierge nous a rendus. Les paroles inutiles sont des péchés, et il y a tant de péchés dans ce monde qu'il fallait bien commencer quelque part. Je vais te parler quand même. À toi seul. Parce que demain, il n'y aura plus personne pour raconter.

Je suis née dans le Kigezi, au sud-ouest de l'Ouganda, près de Kanungu, il y a une cinquantaine d'années. Des collines vertes, tellement penchées qu'on y cultive comme on grimpe. Des bananeraies, du thé, de la brume le matin dans les vallées. Une famille catholique, comme presque tout le monde chez nous depuis les Pères blancs. Mon père, Paulo Kashaku, avait des visions. Il disait qu'une de ses filles, morte jeune, lui était apparue. On le prenait pour un vieux qui rêvait.

Je n'ai pas été une sainte. Je le dis avant que les journaux le disent. J'ai vendu de la bière de banane, le tonto, dans un petit débit au bord de la route. Les hommes venaient boire, chanter, se battre, me raconter leurs péchés. J'ai eu des hommes. J'ai eu des enfants. J'ai connu la misère et la honte qu'on vous jette au visage au marché. Je savais ce qu'est un pécheur. C'est pour cela, je crois, que la Vierge m'a choisie. On ne choisit pas une femme propre pour parler aux sales.

En 1988, dans une grotte de la montagne, à Nyabugoto, j'ai vu la Vierge. Elle était debout dans la lumière, au fond du rocher. Elle m'a dit que le monde allait finir, que les hommes avaient oublié les dix commandements, et qu'elle voulait qu'on les restaure avant qu'il soit trop tard. Je suis redescendue. J'ai vidé les jarres de bière dans le fossé. J'ai fermé le débit. Ma fille Ursula a eu les mêmes visions. Les gens du village ont commencé à monter à la grotte.

En 1989, nous sommes allées voir un homme important. Joseph Kibwetere. Un homme riche, respecté, catholique depuis toujours, qui avait fondé une école et fait de la politique. Il disait avoir vu la Vierge, lui aussi, quelques années plus tôt. Il nous a reçues dans sa maison, avec du thé et des biscuits, comme on reçoit des paysannes. Je l'ai regardé en face.

— Monsieur Kibwetere, la Vierge m'a parlé de vous. Elle dit que vous êtes choisi.

— Madame, beaucoup de gens viennent me dire que la Vierge leur parle.

— Combien d'entre eux savent que vous l'avez vue, vous aussi ? Elle me l'a dit. Elle vous attend depuis longtemps.

Il est resté silencieux un long moment. Puis il s'est mis à genoux. Ce jour-là, il est devenu notre prophète. Moi, je suis devenue celle qui transmet les messages. On disait qu'il était le chef. Les gens qui vivaient avec nous savaient que les messages venaient de moi. Et que les messages commandaient au chef.

Mon père nous a donné sa terre à Kanungu. Nous y avons construit des maisons, une école, une église. Un prêtre nous a rejoints, le père Dominic Kataribabo, un homme instruit, qui avait étudié en Amérique. L'Église l'a chassé à cause de nous. Il est resté. Nous avons écrit un livre, Un message urgent du ciel : la fin des temps présents. Nous l'avons vendu dans les villages. Les gens sont venus, des centaines, puis des milliers peut-être. Des paysans, des instituteurs, des veuves, des familles entières, avec leurs enfants. Ils vendaient leurs champs, leurs vaches, leurs maisons, et ils nous apportaient l'argent. Ils n'en auraient plus besoin. Le monde allait finir.

Nous vivions selon les commandements, et selon les nôtres. Le silence. Les signes avec les mains. Les hommes d'un côté, les femmes de l'autre, même les époux. Pas de viande, peu de nourriture, des jeûnes. Le travail aux champs, la prière, la confession. Des uniformes de couleurs différentes selon qu'on était nouveau ou ancien, selon qu'on était prêt ou non. Les enfants ne connaissaient plus leurs parents. On leur disait que leurs vrais parents étaient la Vierge et nous.

Un jour, une jeune femme est venue me trouver, à la porte de ma maison. Elle avait le droit de parler, puisqu'elle me parlait à moi. Elle tremblait.

— Mère, mon petit garçon est malade. Il faudrait l'emmener au dispensaire, à Kanungu.

— Le dispensaire, c'est le monde. Le monde va finir. Ton fils sera guéri par la Vierge, ou il ira auprès d'elle. Dans les deux cas, il sera sauvé.

— Et si je veux l'emmener quand même ?

— Alors tu pars avec lui. Et tu pars sans ton âme.

Elle est restée. Je ne lui ai plus jamais parlé. Ici, on ne parle pas.

Le monde devait finir avec l'an deux mille. Le 31 décembre 1999, nous avons prié toute la nuit. Le matin, le soleil s'est levé sur les collines, comme d'habitude. Les gens me regardaient. Certains voulaient leur argent. J'ai reçu un nouveau message : la Vierge avait accordé un délai. L'an deux mille n'était pas fini. Il fallait être prêts, et elle viendrait chercher ceux qui l'étaient. Le père Dominic m'a parlé, un soir, dans la sacristie.

— Credonia, ils ont donné tout ce qu'ils avaient. S'ils redescendent dans les villages, ils diront qu'on les a volés. La police viendra.

— Ils ne redescendront pas, mon père.

— Comment le savez-vous ?

— La Vierge me l'a dit.

Il s'est tu. Il savait, je crois, ce qu'il y avait déjà sous la terre, chez lui, et ailleurs. Il le savait mieux que moi.

Ces jours-ci, nous avons fait la fête. Nous avons tué un taureau, nous avons acheté des caisses de Coca-Cola, nous avons mangé de la viande, pour la première fois depuis des années. Les enfants riaient. Les gens chantaient, sans paroles, en battant des mains. Nous avons fini la nouvelle église. Cette nuit, tout le monde a prié. Demain matin, nous nous rassemblerons dans l'ancienne église, celle qui sert de réfectoire. On a cloué des planches sur les fenêtres. On a apporté des bidons. La Vierge viendra à dix heures.

Je ne te dis pas où je serai. On ne me retrouvera pas. On ne retrouvera ni Joseph, ni le père Dominic, ni Ursula. On dira que nous sommes morts dans le feu avec les autres, ou que nous nous sommes enfuis avec l'argent. On ne saura jamais. C'est ainsi. Chut.

!! CE QUI S'EST PASSÉ :: Le 17 mars 2000, vers dix heures et demie, l'ancienne église du Mouvement pour la restauration des dix commandements de Dieu, à Kanungu, a pris feu, fenêtres condamnées et portes fermées : plusieurs centaines de personnes sont mortes à l'intérieur, dont de très nombreux enfants (les décomptes varient d'environ 330 à plus de 500). Dans les jours suivants, la police a découvert des fosses communes ailleurs : 153 corps à Rutoma, plus d'une centaine chez le père Kataribabo, d'autres encore, tués des semaines ou des mois plus tôt. Au total, près de 780 morts : c'est l'une des plus grandes morts collectives liées à un mouvement religieux à l'époque moderne. Credonia Mwerinde, Joseph Kibwetere et Dominic Kataribabo n'ont jamais été retrouvés ni identifiés ; ils sont présumés morts, et personne n'a été jugé.

# Partir vers les étoiles

À partir des années soixante-dix, une autre famille de croyances se répand en Occident : celle qu'on appellera le Nouvel Âge. On y mélange les religions orientales, l'ésotérisme européen, l'astrologie, la médecine douce, les extraterrestres et la fin d'un cycle cosmique. La plupart de ceux qui s'y intéressent n'en meurent pas, heureusement. Mais deux groupes, l'un en Suisse et au Canada, l'autre né au Texas et mort en Californie, ont poussé ces idées jusqu'au bout. Le second a été fondé par une femme et un homme, ensemble. Leurs chefs ont promis à leurs fidèles un départ : vers Sirius, par le feu, ou vers un vaisseau caché derrière une comète. Et ils l'ont organisé.

## Joseph Di Mambro, l'Ordre du Temple Solaire

Je suis né le 19 août 1924 à Pont-Saint-Esprit, dans le Gard, au bord du Rhône. J'étais l'aîné de trois enfants. Mon père, venu d'Italie, était ouvrier verrier. À l'école, on m'appelait le Rital, on se moquait de mon nom, de mon accent, de mes vêtements. J'ai appris à me taire et à observer. À seize ans, en pleine guerre, je suis entré en apprentissage chez un bijoutier-horloger. J'ai appris à manier les choses fines et brillantes : les ressorts, les rouages, les pierres, l'or. J'ai appris surtout que les gens paient très cher ce qui brille, et qu'ils ne regardent jamais l'intérieur des montres.

Je me suis marié en 1944, j'ai eu un fils. J'ai ouvert une bijouterie. Après la guerre, les affaires ont décliné. Je me suis découvert un autre talent : je parlais aux gens de leurs vies antérieures, de leurs guides, de l'au-delà. On me disait médium. En 1956, je suis entré dans l'AMORC, l'Ancien et mystique ordre de la Rose-Croix, une société ésotérique venue d'Amérique, avec ses grades, ses rituels, ses robes, ses secrets transmis par lettres. J'ai dirigé une loge à Nîmes. J'y ai appris tout ce qu'il faut savoir sur la mise en scène du sacré : la lumière, l'encens, les mots anciens, l'attente. J'y suis resté jusqu'en 1970.

À la fin des années soixante, j'ai fait des affaires de bijoux avec un associé. Un jour, j'ai disparu avec son or et ses pierres. Il ne m'a jamais revu. J'ai vécu un moment en Israël, où mon second fils, Élie, est né. Revenu à Pont-Saint-Esprit, je me suis installé comme psychologue, sans diplôme. En 1972, le tribunal m'a condamné à six mois de prison pour chèques sans provision, abus de confiance et usurpation du titre de psychiatre.

Alors je suis parti vers la Suisse. En 1973, j'ai ouvert un centre de préparation à l'ère nouvelle, près de Genève, puis une petite communauté, la Pyramide, dans une maison de la campagne genevoise. Je disais que des maîtres invisibles, ceux de la Grande Loge blanche, me parlaient. En 1978, j'ai fondé la Golden Way, une fondation qui organisait des conférences, des retraites, des cérémonies. Son président était un chef d'orchestre réputé, Michel Tabachnik. Les gens riches de Suisse, de France, du Québec s'ennuyaient comme les autres. Ils voulaient des secrets. Je leur ai donné des templiers, des rose-croix, des maîtres qui parlaient depuis une étoile, Sirius.

Au début des années quatre-vingt, j'ai rencontré Luc Jouret, un médecin homéopathe belge, né au Congo, beau, éloquent, qui donnait des conférences sur la santé naturelle, l'écologie, la fin d'un cycle. Il parlait mieux que moi. Il était exactement le visage qu'il me fallait. En 1984, nous avons fondé ensemble à Genève l'Ordre international chevaleresque Tradition solaire, qu'on appellerait l'Ordre du Temple Solaire. Il était la façade, il faisait les conférences au Québec, en Suisse, en France. J'étais le maître. Les gens venaient pour lui. Ils restaient pour moi.

Après une de ses conférences, je l'ai invité à dîner, dans un restaurant de Genève, au bord du lac. Je l'ai laissé parler une heure. Puis j'ai posé ma fourchette.

— Docteur, vous dites des choses vraies. Mais vous les dites dans des salles des fêtes, devant quarante personnes.

— C'est un début.

— C'est une fin. Moi, j'ai les Maîtres, les rituels, une maison, des fidèles qui donnent. Vous, vous avez la parole. Ensemble, nous aurions un Ordre.

— Les Maîtres vous parlent vraiment, Joseph ?

— Ils vous parleront aussi, si vous le voulez assez.

Il a souri. Il avait compris, je crois, ce que je lui proposais. Ou il ne l'avait pas compris, et c'était encore mieux.

En 1982, j'avais annoncé qu'une enfant-roi allait naître. Sa mère, Dominique, était selon moi la réincarnation de la reine Hatchepsout. La petite est née le 22 mars 1982. Je l'ai appelée Emmanuelle. C'était l'enfant cosmique, née pour annoncer l'ère nouvelle. Elle portait des gants, un casque pour la protéger des ondes, on ne lui permettait pas de jouer avec les autres enfants, ni de toucher les adultes. Elle était à moi, et à la cause.

Les cérémonies étaient magnifiques. Des capes blanches, des épées, de l'encens, des chants, et au moment voulu, les Maîtres apparaissaient dans la salle : des silhouettes de lumière, une épée qui s'élevait dans les airs, le Graal. C'était un membre de l'Ordre, Tony Dutoit, qui manœuvrait les appareils, les projecteurs, les hologrammes, derrière un mur. Les membres donnaient des fortunes : des maisons, des héritages, des comptes en banque. Ce n'étaient pas des naïfs. Il y avait parmi eux des médecins, des cadres, un maire, des fonctionnaires, des gens instruits. C'est justement pour cela que cela marchait : plus on est intelligent, plus on trouve de bonnes raisons de croire ce qu'on a envie de croire. Je décidais aussi qui devait vivre avec qui. Je séparais les couples, je formais des unions que j'appelais cosmiques.

À la fin des années quatre-vingt, tout a commencé à se défaire. Mon propre fils, Élie, avait trouvé le placard où l'on rangeait les accessoires des apparitions. Il a dit aux autres que les Maîtres n'existaient pas. D'autres sont partis, et ils réclamaient l'argent qu'ils avaient donné. Je faisais surveiller ceux qui doutaient, écouter leurs téléphones. En 1993, au Québec, la police a arrêté Jouret et d'autres pour un trafic d'armes. Les journaux ont commencé à écrire sur nous. J'étais malade, aussi : les reins, le diabète, mon corps qui m'abandonnait. Je ne supporterais pas qu'on me voie vieillir, perdre, être jugé.

Il fallait que l'Ordre parte avant d'être détruit. Depuis quelques années, je parlais du Transit : un départ vers Sirius, par le feu, où nos corps solaires nous attendaient. Je me suis persuadé qu'Emmanuelle était menacée par l'Antéchrist, et que l'Antéchrist, c'était le bébé que les Dutoit, les traîtres, venaient d'avoir. J'ai écrit les lettres qui expliqueraient notre départ au monde : ce ne serait en rien un suicide, au sens humain du terme. Ceux qui ne seraient pas prêts à partir seraient aidés.

@img https://commons.wikimedia.org/wiki/Special:FilePath/20151016-SalvanVillage.jpg?width=1280 | Salvan, en Valais. C'est dans les chalets de ce village que Joseph Di Mambro est mort, en octobre 1994. | Wikimedia Commons

!! CE QUI S'EST PASSÉ :: Le 30 septembre 1994, à Morin-Heights, au Québec, Tony Dutoit, sa femme Nicky et leur bébé de trois mois ont été assassinés. Les 4 et 5 octobre, à Cheiry et à Salvan, en Suisse, et à Morin-Heights, 53 personnes sont mortes : une partie s'est donné la mort, beaucoup ont été tuées, droguées ou abattues, et les chalets ont été incendiés. Élie Di Mambro a été tué comme « traître ». Di Mambro, sa femme et Emmanuelle, douze ans, sont morts à Salvan. En décembre 1995, 16 membres, dont trois enfants, ont été retrouvés morts dans le Vercors, en France. En mars 1997, cinq autres sont morts à Saint-Casimir, au Québec.

## Bonnie Nettles, Heaven's Gate

Bonsoir, mon cœur. Pose ton manteau. Je vais te dire mon thème astral, d'abord, et après tu sauras tout de moi. Vierge, ascendant Lion. Une infirmière qui voulait commander. Voilà.

Je suis née Bonnie Lu Trousdale, le 29 août 1927, à Houston, au Texas. Une famille baptiste, des dimanches à l'église, des tartes aux noix de pécan, la chaleur humide qui colle au cou de mai à octobre. J'étais une petite fille sage. Trop sage. Je regardais par la fenêtre de l'église pendant le sermon, et je me demandais ce qu'il y avait au-dessus du ciel, puisque Dieu ne pouvait pas être seulement au plafond.

Je suis devenue infirmière. J'aimais soigner. J'aimais surtout le moment où quelqu'un meurt, je l'avoue, pas parce que j'aimais la mort, mais parce que je voyais quelque chose quitter le corps. Un souffle, une lumière. Les médecins ne voyaient rien. Moi si. Je me suis mariée, j'ai eu quatre enfants, j'ai fait des gâteaux d'anniversaire et des lessives. Et le soir, je lisais. La théosophie, Madame Blavatsky, les maîtres invisibles, les soucoupes, l'astrologie. Je tenais des séances. Un esprit me parlait, un moine du XIXe siècle, frère Francis. Il me disait qu'un homme viendrait. Qu'on se reconnaîtrait.

En mars 1972, dans un hôpital de Houston, il est venu. Un grand homme triste, aux yeux très bleus, professeur de musique. On a parlé dix minutes et j'ai su.

— Vous ne me connaissez pas, madame, et pourtant vous me regardez comme si...

— Comme si je vous attendais. Je vous attendais. On se connaît depuis longtemps, monsieur Applewhite. Bien avant cette vie.

— Je ne crois pas à ces choses-là.

— Ce n'est pas grave. Elles croient en vous.

Il a ri. Puis il a pleuré. Il m'a raconté qu'il se détestait. Qu'il aimait des hommes, que ça lui avait coûté sa femme, son poste, ses enfants. Je lui ai pris la main et je lui ai dit que ça n'avait aucune importance, parce que nous n'étions pas vraiment des humains. Nous étions des êtres venus d'au-dessus, dans des corps empruntés. Le corps, son désir, sa honte : un vêtement. On l'enlève. Je crois que c'est la plus belle chose qu'on lui ait jamais dite. Je crois aussi que c'est la plus dangereuse.

J'ai quitté mon mari. J'ai quitté mes enfants. Ça, je ne l'écris pas facilement, même ici. Les deux plus jeunes étaient encore à la maison. Je me disais qu'ils comprendraient plus tard. Nous sommes partis, lui et moi, sur les routes. Nous nous sommes appelés les Deux, comme les deux témoins de l'Apocalypse. Puis Bo et Peep, les bergers. Puis Ti et Do, les notes de la gamme. C'était souvent mon idée, les noms. Je choisissais. Il chantait.

En 1975, à Waldport, dans une salle d'hôtel au bord du Pacifique, une vingtaine de personnes sont parties avec nous le soir même. Une jeune femme est venue me trouver après la réunion.

— Ti, j'ai un fils de six ans. Est-ce que je peux l'emmener ?

— Le Niveau au-dessus n'accueille pas les liens, ma chérie. Ton fils a son propre chemin.

— Je ne peux pas le laisser.

— Alors tu n'es pas prête. Ce n'est pas un reproche. Reviens quand tu le seras.

Je ne sais plus si elle est venue. D'autres sont venus, des mères, des pères, en laissant un enfant derrière eux. Je ne leur ai jamais demandé ce qu'il était devenu.

C'est moi qui ai écrit beaucoup des règles. Je savais tenir un service d'hôpital : les horaires, les tâches, les rondes. J'ai tenu la classe comme un service. Chacun son partenaire, son emploi du temps à la minute, ses vêtements, ses repas. Pas d'excès, pas de désir, pas de secret. Les élèves m'appelaient Ti, et ils me craignaient un peu plus que lui. Do était le cœur. J'étais la règle.

En 1983, on m'a retiré un œil. Un cancer. Les élèves étaient bouleversés. Do surtout. Je leur ai dit que mon véhicule s'usait, que c'était normal, que je partirais avant eux pour préparer la place. Le cancer est allé dans le foie. Je suis à Dallas. J'ai mal. Do me tient la main, comme dans l'hôpital de Houston, il y a treize ans.

— Ti, ne pars pas. Je ne sais pas faire sans toi.

— Tu sais. Tu as toujours su. Je vais juste devant. Garde-les ensemble. Garde-les purs.

— Et si je me trompe ? Et si tout ça...

— Do. Regarde-moi. Il n'y a pas de si.

Je l'ai dit d'une voix très sûre. Je crois que c'est la dernière chose que je lui ai apprise.

!! CE QUI S'EST PASSÉ :: Bonnie Nettles, Ti, a co-fondé et co-dirigé avec Marshall Applewhite le groupe qui deviendra Heaven's Gate ; dans les premières années, beaucoup d'anciens membres la décrivent comme la figure dominante du couple. Elle a quitté son mari et ses quatre enfants en 1972. Elle est morte d'un cancer le 19 juin 1985, à Dallas. Applewhite a continué à enseigner qu'elle les attendait au « Niveau au-dessus de l'humain » ; douze ans plus tard, il a conduit trente-huit élèves à la mort avec lui.

## Marshall Applewhite, Heaven's Gate

Je suis né le 17 mai 1931 à Spur, une petite ville poussiéreuse du nord du Texas. Mon père, Marshall Herff Applewhite, était pasteur presbytérien. Il fondait des églises, l'une après l'autre, et nous déménagions sans cesse, d'une petite ville texane à une autre. Le dimanche, je le regardais prêcher. Il savait tenir une salle, faire pleurer, faire espérer. J'étais un enfant très croyant, sérieux, doué pour le chant. Tout le monde disait que je deviendrais pasteur, comme lui.

J'ai étudié la philosophie à l'Austin College, puis je suis entré au séminaire presbytérien, en Virginie, pour devenir pasteur. Je n'y suis pas resté. La musique m'appelait plus fort que Dieu. J'avais une belle voix de baryton. J'ai fait mon service dans l'armée, puis une maîtrise de musique à l'université du Colorado. J'ai chanté dans des opéras, à Houston, dans des comédies musicales. Je me suis marié, j'ai eu deux enfants. De l'extérieur, j'étais l'homme parfait : un professeur de chant élégant, cultivé, aimé de ses étudiants.

De l'intérieur, je me détestais. J'aimais les hommes. Dans le Texas et l'Alabama des années cinquante et soixante, c'était un péché, un crime, une maladie. J'enseignais à l'université d'Alabama quand on a découvert ma liaison avec un étudiant. On m'a renvoyé. Ma femme est partie avec les enfants. Je suis allé à Houston, où j'ai dirigé le département de musique d'une petite université catholique, Saint-Thomas. J'ai recommencé. En 1970, j'ai démissionné, en disant que je souffrais de dépression. C'était vrai. Je me sentais coupé en deux, et je cherchais quelqu'un qui me dise que ce n'était pas ma faute.

En 1972, à Houston, j'ai rencontré Bonnie Nettles, une infirmière, mariée, mère de quatre enfants. Elle lisait les étoiles, elle parlait avec des esprits, elle s'intéressait à la théosophie, aux soucoupes volantes. Elle m'a regardé et elle m'a dit qu'elle m'attendait. Nous ne nous sommes plus quittés. Ce n'était pas un amour comme les autres : c'était, disions-nous, une rencontre d'âmes venues d'ailleurs. Ensemble, nous avons compris. Nous étions les deux témoins dont parle l'Apocalypse, ceux qui doivent prêcher, être tués, puis ressusciter et monter au ciel dans une nuée. La nuée, nous le savions maintenant, serait un vaisseau.

Nous avons quitté nos familles et nos métiers. Nous avons parcouru l'Amérique en voiture, en vivant de rien. En 1974, dans le Missouri, on m'a arrêté pour une voiture de location que nous n'avions pas rendue et une carte de crédit. J'ai passé six mois en prison. J'y ai écrit, j'y ai prié, j'en suis sorti encore plus sûr de moi. Nous nous faisions appeler Bo et Peep, comme les bergers de la comptine, parce que nous étions venus rassembler un troupeau.

En 1975, à Waldport, une petite ville de la côte de l'Oregon, nous avons tenu une réunion dans une salle d'hôtel. Une vingtaine de personnes sont parties avec nous le soir même, en laissant tout : leurs voitures, leurs comptes, leurs enfants parfois. Les journaux nationaux en ont parlé, on a dit qu'elles avaient disparu. Elles n'avaient pas disparu. Elles nous suivaient. Nous avons eu jusqu'à deux cents fidèles à travers le pays.

Nous leur apprenions à se défaire de l'humain. Pas de sexe, pas d'attachements, pas d'alcool, pas de drogue, pas de plaisirs. Les mêmes vêtements pour tous, les mêmes coupes de cheveux courtes, pour qu'on ne distingue plus les hommes des femmes. Des noms nouveaux, en trois lettres suivies de « ody ». Chacun avait un partenaire qui le surveillait. Des règles écrites pour chaque geste : comment se raser, comment manger, comment parler, comment se taire. Nous étions une classe, je disais, et j'étais le professeur. Après des années de clandestinité, nous nous faisions désormais appeler Ti et Do, comme les notes de musique : Bonnie était Ti, et moi, Do.

En 1985, Bonnie est morte d'un cancer. Je pensais qu'elle ne pouvait pas mourir. Je me suis dit qu'elle avait seulement quitté son véhicule, son corps, et qu'elle m'attendait au Niveau au-dessus de l'humain. J'ai continué seul. Une quarantaine d'élèves sont restés. Dans les années quatre-vingt-dix, ils ont fondé une entreprise de création de sites internet, Higher Source, et ils étaient très doués. En 1993, nous avons acheté une pleine page dans un grand journal américain, pour adresser au monde l'Ultime Offre : la Terre allait être recyclée, labourée comme un champ, et ceux qui voulaient partir devaient nous rejoindre maintenant. Huit d'entre nous, moi compris, avons choisi une opération pour ne plus jamais être tentés par le corps. Je me sentais enfin en paix avec lui.

Un soir, quelques semaines après, une élève est venue frapper à ma porte. Elle avait gardé ses cheveux très courts, comme tous, et elle tenait un carnet.

— Do, est-ce que Ti nous voit ?

— Ti nous voit. Ti nous attend.

— Alors pourquoi est-ce qu'elle est morte comme les humains ? Avec un cancer, à l'hôpital ?

— Parce que son véhicule était humain. Elle, non.

— Et nous ? Comment est-ce qu'on partira ?

Je n'ai pas répondu ce soir-là. J'ai mis douze ans à répondre. C'est la réponse que je regrette de ne pas avoir laissée sans réponse.

En 1996, nous avons loué une grande maison blanche à Rancho Santa Fe, près de San Diego. Une comète approchait, Hale-Bopp, la plus brillante depuis des siècles. Un homme a raconté à la radio qu'un objet la suivait. J'y ai vu le vaisseau. C'était le signal. Les élèves ont enregistré leurs messages d'adieu en vidéo, un par un, souriants, sereins. Ils ont acheté des chaussures de sport identiques, des survêtements noirs, et cousu sur leurs manches un écusson : Heaven's Gate Away Team, l'équipe de Heaven's Gate en mission. Nous allions quitter nos véhicules et monter.

@img https://commons.wikimedia.org/wiki/Special:FilePath/Comet-Hale-Bopp-29-03-1997.jpeg?width=1280 | La comète Hale-Bopp, photographiée le 29 mars 1997, trois jours après la découverte des corps de Rancho Santa Fe. | Wikimedia Commons

!! CE QUI S'EST PASSÉ :: Fin mars 1997, à Rancho Santa Fe, Marshall Applewhite et 38 membres de Heaven's Gate sont morts ensemble, en trois groupes, sur plusieurs jours. Leurs corps ont été découverts le 26 mars par un ancien membre qui avait reçu leurs vidéos d'adieu. Il n'y avait aucun vaisseau derrière la comète : l'« objet » était une étoile mal identifiée sur une photographie.

# Ceux qui sont partis

Dans chacune de ces histoires, quelqu'un est sorti. Ce sont souvent eux qui ont permis de savoir ce qui s'était passé à l'intérieur, et c'est leur courage qui mérite qu'on s'en souvienne.

À Jonestown, une jeune femme, Deborah Layton, haute responsable du Temple, s'est enfuie en mai 1978. Elle a signé une déclaration sous serment qui décrivait les répétitions de suicide collectif, les armes, les punitions, et elle a prévenu les autorités américaines de ce qui risquait d'arriver. On ne l'a pas assez écoutée. Elle a raconté son histoire, des années plus tard, dans un livre au titre terrible, Seductive Poison. Le jour du massacre, une poignée de fidèles ont réussi à fuir dans la jungle, et quelques autres, cachés, ont survécu.

Et il y a celles qui ont dit non jusqu'au bout. Le dernier soir de Jonestown, sur la bande magnétique qui a tout enregistré, une femme de soixante ans, Christine Miller, contredit Jim Jones devant toute l'assemblée. Elle dit que les enfants méritent de vivre, qu'on pourrait partir ailleurs, en Russie. Il lui répond, la foule la fait taire. Elle est morte avec les autres. Mais sa voix est restée, et c'est souvent elle qu'on cite pour dire qu'il était possible de refuser.

Au Mont-Carmel, une trentaine de Davidiens, dont des enfants, sont sortis pendant le siège. Neuf adultes ont survécu à l'incendie du 19 avril. L'un d'eux, David Thibodeau, batteur dans le groupe de rock de Koresh, a écrit son récit, qui a servi de base à une série télévisée. Il y décrit à la fois l'emprise et l'humanité de ceux qui sont morts.

Chez Manson, c'est une jeune femme de la Famille, Linda Kasabian, présente lors des meurtres, qui a témoigné au procès en échange de l'immunité. Son témoignage, pendant des jours, a permis de condamner Manson et ses complices. Elle a ensuite passé sa vie à fuir la célébrité.

Au Japon, l'écrivain Haruki Murakami a interrogé, pendant un an, des dizaines de victimes de l'attentat du métro, puis d'anciens membres d'Aum. Il y découvre des jeunes gens sérieux, souvent brillants, qui cherchaient un sens que la société japonaise ne leur donnait plus. Il en tire une conclusion inconfortable : ce qui les a fait entrer, ce n'est pas la bêtise, c'est une soif réelle, que personne d'autre n'avait su entendre.

Dans l'Ordre du Temple Solaire, un ancien fidèle, Thierry Huguenin, a échappé de justesse à la mort à Salvan, en octobre 1994. Il a raconté ce qu'il avait vécu dans un livre, Le 54e, du nombre de morts dont il aurait dû faire partie. Et chez Heaven's Gate, un ancien membre qui avait quitté le groupe peu avant la fin a été celui qui a découvert les corps, après avoir reçu une vidéo d'adieu.

En Australie, c'est une adolescente qui a fait tomber la Famille. Sarah Hamilton-Byrne, chassée par Anne à l'adolescence, est allée voir la police au lieu de revenir. Sans elle, les enfants du lac Eildon seraient peut-être restés des années de plus. Devenue médecin, elle a écrit son histoire.

Tous disent la même chose, chacun à sa façon. On n'entre pas dans ces groupes parce qu'on est faible. On y entre parce qu'on cherche quelque chose de beau : la justice, une famille, un sens, la pureté, l'éternité. Et on en sort, quand on en sort, grâce à un lien qui n'a pas été coupé : un parent qui a continué à écrire, un ami qui n'a pas jugé, un doute qu'on a gardé en soi malgré tout.

# Reconnaître l'emprise

Mis côte à côte, ces dix journaux montrent les mêmes étapes. D'abord, une femme ou un homme qui se sent rejeté, humilié ou ignoré, et qui trouve un récit où il est l'élu. Ensuite, des gens qui cherchent quelque chose de réel : la justice raciale chez Jones, une famille chez Manson, le sens chez Asahara, la liberté chez Rajneesh, une mère chez Anne Hamilton-Byrne, le salut chez Credonia Mwerinde, la beauté chez Di Mambro, la pureté chez Bonnie Nettles et Applewhite. Le groupe leur donne d'abord ce qu'ils cherchent. C'est pour cela qu'ils restent.

Puis le groupe se referme, toujours de la même manière. Il coupe les liens avec la famille et les anciens amis, présentés comme des ennemis ou des gens qui ne peuvent pas comprendre. Il prend l'argent, les biens, le temps, le sommeil. Il installe une langue à part, des mots que seuls les membres comprennent. Il demande des confessions, qui deviennent des moyens de pression. Il réécrit la morale : ce qui était un crime devient un devoir, si le chef le demande. Et il annonce une fin, qui finit par devenir une sortie.

En 1961, un psychiatre américain, Robert Jay Lifton, a étudié des prisonniers soumis à la rééducation idéologique en Chine. Il a décrit huit mécanismes qu'on retrouve, à des degrés divers, dans tous ces journaux. Le contrôle du milieu : on maîtrise tout ce que la personne voit, lit et entend. La manipulation mystique : on organise des « miracles » et des coïncidences pour faire croire à un destin. L'exigence de pureté : le monde est divisé entre le bien absolu du groupe et le mal du dehors, et personne n'est jamais assez pur. Le culte de la confession : on avoue ses fautes, et ces aveux deviennent des armes. La science sacrée : la doctrine est présentée comme une vérité totale qu'on ne discute pas. La langue chargée : des mots à part, des formules toutes faites qui remplacent la pensée. La doctrine avant la personne : quand l'expérience contredit le dogme, c'est l'expérience qui a tort. Et la dispensation de l'existence : ceux du dehors ne comptent pas, ils ne méritent pas de vivre tout à fait.

Plus tard, un ancien membre d'une secte devenu thérapeute, Steven Hassan, a proposé une grille plus simple, qu'il appelle BITE, pour comportement, information, pensée et émotion. Une emprise contrôle ce que tu fais de tes journées, ce que tu as le droit de savoir, ce que tu as le droit de penser, et ce que tu as le droit de ressentir, en particulier la peur et la culpabilité.

En France, la loi About-Picard de 2001 a créé le délit d'abus de faiblesse par sujétion psychologique, et une loi de 2024 a renforcé la lutte contre les dérives sectaires, y compris dans le domaine de la santé, où les promesses de guérison miraculeuse ont beaucoup progressé.

Ces signes permettent de reconnaître un danger bien avant la tragédie, chez soi ou chez un proche. Un groupe ou une personne qui te demande de couper les ponts avec ceux que tu aimes. Qui exige de plus en plus d'argent ou de temps. Qui interdit le doute. Qui a réponse à tout et ne se trompe jamais. Qui fait peur à ceux qui veulent partir.

!! SI TU T'INQUIÈTES POUR TOI OU POUR UN PROCHE :: En France, la MIVILUDES informe et reçoit les signalements, et des associations comme l'UNADFI ou le CCMM accompagnent les familles et les anciens membres. Garder le lien avec la personne, sans la juger ni l'humilier, est ce qui l'aide le plus à revenir.
`,
};
export default book;
