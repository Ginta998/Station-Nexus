const book = {
  id: "guru", title: "Guru", sub: "Journaux de ceux qui se sont crus élus", room: "histoire", type: "pensee", cote: "HI-015", color: 0, emblem: "⊙",
  about: "Jim Jones, Charles Manson, David Koresh, Shoko Asahara, Ma Anand Sheela, Joseph Di Mambro, Marshall Applewhite : sept personnes ont conduit des groupes qui ont fini dans la mort ou le crime. Ces journaux intimes sont imaginés, écrits à la première personne pour entrer dans leur tête. Les faits, les dates et les morts, eux, sont réels, et rappelés à la fin de chaque journal.",
  links: [
    { label: "Tim Reiterman, Raven: The Untold Story of the Rev. Jim Jones and His People (1982)", note: "L'enquête de référence sur le Temple du Peuple, par un journaliste blessé à Port Kaituma." },
    { label: "Haruki Murakami, Underground (1997)", note: "Les victimes de l'attentat du métro de Tokyo racontent, puis d'anciens membres d'Aum." },
    { label: "Waco: The Rules of Engagement (1997)", note: "Le documentaire sur le siège du Mont-Carmel." },
    { label: "Wild Wild Country (2018)", note: "La série documentaire sur Rajneeshpuram, avec Ma Anand Sheela elle-même." },
    { label: "Jeff Guinn, Manson (2013)", note: "La biographie la plus complète, qui démonte une partie de la légende." },
    { label: "MIVILUDES", url: "https://www.miviludes.interieur.gouv.fr", note: "La mission française de vigilance contre les dérives sectaires : informations, signalements, aide aux proches." },
    { label: "Robert Jay Lifton, Thought Reform and the Psychology of Totalism (1961)", note: "Le livre qui a décrit les huit mécanismes de l'emprise." },
  ],
  text: String.raw`
# Avant d'ouvrir ces journaux

Ce livre ne contient pas de vrais journaux. Aucun de ces hommes n'a écrit les pages que tu vas lire. Elles sont imaginées, à partir de ce qu'on sait de leur vie, de leurs sermons, de leurs lettres, des témoignages de ceux qui les ont suivis et de ceux qui s'en sont échappés. Le pari est le même que pour les autres voix de cette bibliothèque : entrer dans une tête pour comprendre comment elle fonctionne. Ici, comprendre ne veut pas dire excuser. Ces hommes ont fait tuer des centaines de personnes, dont beaucoup d'enfants.

Ce qu'on cherche à voir, c'est le mécanisme. Comment un homme finit par se croire choisi. Comment il trouve des gens prêts à le croire. Comment l'amour qu'on lui porte devient une prison. Comment le groupe se ferme, se coupe du monde, se met à attendre la fin. Ces sept histoires sont très différentes, aux États-Unis, au Japon, en Inde et en Oregon, en Suisse, au Canada et en France. Et pourtant elles se ressemblent toutes.

À la fin de chaque journal, un encadré rappelle ce qui s'est réellement passé, sans rien inventer. Le dernier chapitre parle des signes qui permettent de reconnaître une emprise, et de ce qu'on peut faire.

# Les pères

## Jim Jones, le Temple du Peuple

*Indianapolis, 1956.* Ils m'appellent pasteur, mais je n'ai jamais cru à leur Dieu blanc assis sur un nuage. Je crois aux gens. Dans mon église, les Noirs et les Blancs s'assoient sur les mêmes bancs, mangent à la même table, et cela suffit à faire de moi un homme dangereux dans cette ville. On jette des pierres sur nos fenêtres. Tant mieux. La persécution prouve que nous avons raison. J'ai adopté des enfants de toutes les couleurs. Nous les appelons notre famille arc-en-ciel.

*Indianapolis, 1961.* La ville m'a nommé directeur de sa commission des droits de l'homme. Je vais dans les restaurants qui refusent les Noirs et je m'assois avec eux jusqu'à ce qu'on nous serve. Je suis courageux, je le sais, et c'est ce courage qui leur fait croire tout le reste. Le dimanche, je commence à dire que je lis dans les pensées. Je fais fouiller les poubelles des fidèles pour connaître leurs secrets, et je les révèle en chaire comme si Dieu me les avait soufflés. Ils pleurent. Ils m'appellent Père.

*Californie, 1972.* J'ai déplacé tout le monde vers l'Ouest, d'abord à Redwood Valley, puis à San Francisco. Je leur ai dit qu'une guerre nucléaire allait venir et que nous serions à l'abri ici. Ils m'ont suivi. Ils me suivent toujours. Le dimanche, je soigne des cancers sur scène. Je sais ce que c'est : des morceaux de foie de poulet qu'on cache dans une serviette, et que je brandis devant la foule comme une tumeur arrachée. Je me dis que l'espoir qu'ils ressentent est réel, même si la tumeur ne l'est pas. Les politiciens viennent me voir. Je peux remplir une salle en une heure, faire voter des centaines de personnes en une journée. On me nomme à la commission du logement de la ville.

*1976.* Ils me donnent tout. Leurs maisons, leurs salaires, leurs pensions. Les vieux, surtout, me signent leurs chèques de retraite. Je ne garde rien pour moi, je le dis souvent, et c'est presque vrai. Mais je contrôle tout. Je sais qui couche avec qui, qui doute, qui parle à sa famille. J'ai fait installer un système : chacun doit écrire des lettres où il confesse ses fautes, et je les garde. On ne quitte pas quelqu'un qui détient vos aveux. Je ne dors presque plus. Je prends des cachets pour dormir et d'autres pour me réveiller. Je dis maintenant que je suis la réincarnation de Jésus, de Bouddha, de Lénine. Je dis que la Bible est un livre écrit par des esclavagistes. Je dis que le socialisme est la seule religion. Personne ne sort de la salle. Un journal prépare un article sur nous : d'anciens membres parlent de coups, d'argent, d'enfants séparés de leurs parents. Il est temps de partir.

*Guyana, 1978.* Nous avons construit notre terre promise au milieu de la jungle. Jonestown. Près d'un millier de personnes. Ici, personne ne peut partir : la forêt nous entoure, la seule route mène à une piste d'aviation, et les passeports sont rangés chez moi. Je parle aux haut-parleurs jour et nuit. Je leur dis que la CIA arrive, que des mercenaires vont venir tuer les enfants, que le monde entier veut nous détruire. Je ne sais plus très bien si je le crois. La nuit, nous faisons des exercices. Je les réveille, je les rassemble, je leur dis que la fin est venue et qu'il faut être prêts à mourir ensemble. Puis je leur dis que c'était un test. Ils rentrent se coucher. Ils sont toujours là.

*Novembre 1978.* Un député américain arrive avec des journalistes et des parents inquiets. Il s'appelle Leo Ryan. Il veut voir. Je leur ai préparé une fête, de la musique, des sourires. Mais à la fin de la visite, des familles ont demandé à partir avec lui. Si une seule porte s'ouvre, tout s'effondre. Je ne peux pas laisser cette porte ouverte.

!! CE QUI S'EST PASSÉ :: Le 18 novembre 1978, des hommes armés de Jonestown ont tué Leo Ryan et quatre autres personnes sur la piste de Port Kaituma. Le même jour, à Jonestown, Jim Jones a ordonné à ses fidèles de boire un poison. 909 personnes sont mortes dans le village, dont plus de 300 enfants, qui n'ont rien choisi. Beaucoup d'adultes ont été forcés, sous la menace des armes. Jones est mort d'une balle dans la tête. Avec les morts de Port Kaituma et de Georgetown, le bilan est de 918.

## David Koresh, le Mont-Carmel

*Waco, Texas, 1983.* Je m'appelle encore Vernon Howell. On m'a mis à l'école dans une classe pour élèves en difficulté, je joue de la guitare et je connais la Bible par cœur. Des chapitres entiers, sans rien regarder. Ici, au Mont-Carmel, chez les Davidiens de la Branche, ils attendent la fin du monde depuis des décennies. Ils ont besoin de quelqu'un qui sache la lire. Moi, je sais. Les sept sceaux de l'Apocalypse, que personne n'a jamais pu ouvrir : je les ouvre.

*1987.* L'ancien chef, George Roden, ne voulait pas me laisser la place. Il a déterré un cercueil pour prouver qu'il pouvait ressusciter les morts. Nous sommes revenus avec des fusils. Le tribunal nous a laissés repartir. J'ai pris le centre. Ceux qui restent sont à moi. Je leur enseigne pendant des heures, parfois toute la nuit, et ils ne s'endorment pas. Je leur explique que je suis l'Agneau, celui dont parle l'Apocalypse. Que la fin viendra du gouvernement, des soldats, du feu.

*1990.* J'ai changé de nom. David, pour le roi. Koresh, pour Cyrus, le roi perse que la Bible appelle l'oint de Dieu. Les hommes du groupe doivent rester chastes. Toutes les femmes sont à moi : c'est ainsi, je leur ai montré que c'était écrit. Nous achetons des armes, beaucoup d'armes. Nous en revendons aussi, c'est un commerce. Mais surtout, je me prépare. Ce qui doit arriver arrivera, et nous serons armés.

*27 février 1993.* Le journal de Waco commence à publier une longue enquête sur moi. Ils m'appellent le Messie pécheur. D'anciens fidèles parlent aux autorités. Des enfants que j'ai frappés, des femmes que j'ai prises, des armes que j'ai achetées. Je ne m'en cache pas devant les miens : je leur ai expliqué que tout cela est dans les Écritures, et ils le croient. Ce qui est écrit doit arriver.

*28 février 1993.* Ils sont venus. Des agents fédéraux, dans des camionnettes, avec des grenades et des fusils. Ça a tiré de partout. Il y a des morts des deux côtés. J'ai été blessé. Maintenant le FBI nous encercle. Ils coupent l'électricité, ils passent de la musique à plein volume toute la nuit, des chants de moines, des bruits de dentiste, des lapins qu'on égorge. Ils croient qu'ils nous font peur. Ils ne comprennent pas que tout cela est écrit. Chaque jour de siège me donne raison.

*Avril 1993.* Je leur ai promis de sortir quand j'aurais fini d'écrire mon commentaire sur les sept sceaux. Je l'écris. Je n'en suis qu'au premier.

!! CE QUI S'EST PASSÉ :: Le raid du 28 février 1993 a tué quatre agents fédéraux et six Davidiens. Le siège a duré 51 jours. Le 19 avril 1993, le FBI a lancé un assaut au gaz lacrymogène ; un incendie a ravagé le bâtiment. L'enquête officielle l'attribue aux Davidiens eux-mêmes, ce que certains contestent encore. 76 personnes sont mortes, dont Koresh et environ 25 enfants. Des témoignages et des enquêtes ont établi que Koresh imposait ses « mariages » à des adolescentes : des abus sexuels sur mineures. La gestion du siège par l'État a elle aussi été durement critiquée.

# Faire la guerre au monde

## Charles Manson, la Famille

*Terminal Island, Californie, 1967.* J'ai trente-deux ans et j'en ai passé plus de la moitié dans des maisons de correction et des prisons. Vols de voitures, chèques volés, proxénétisme. Je ne sais rien faire d'autre que survivre là où les autres s'écrasent. En prison, j'ai appris la guitare, et j'ai lu un livre sur la manière de se faire des amis et d'influencer les gens. J'ai appris que les gens vous suivent quand vous leur renvoyez ce qu'ils veulent entendre. On me relâche. J'ai demandé à rester. Ils ont refusé.

*San Francisco, été 1967.* Haight-Ashbury. Des milliers de jeunes ont quitté leurs familles et dorment dans les parcs. Ils cherchent un père, et ils ne le savent pas. Moi, je sais. Je ramasse surtout des filles, très jeunes, perdues, que leurs parents n'écoutaient pas. Je leur dis qu'elles sont belles, que leur ancienne vie était un mensonge, que l'ego est une prison. Je leur donne des drogues, de la musique, une famille. Nous partons sur les routes dans un vieux bus.

*Los Angeles, 1968.* Un batteur des Beach Boys, Dennis Wilson, a pris deux de mes filles en stop, et nous nous sommes installés chez lui. Il me présente à des producteurs. Je vais être une star, plus grand que les Beatles. Ils écoutent mes chansons, poliment. Personne ne signe. Nous vivons maintenant dans un vieux ranch où l'on tournait des westerns, le ranch Spahn, au nord de la ville. Les filles s'occupent du vieux propriétaire presque aveugle. Le soir, je parle. Ils m'écoutent comme personne ne m'a jamais écouté.

*Décembre 1968.* L'Album blanc des Beatles est sorti. Je l'écoute en boucle, et j'entends ce qu'ils me disent, à moi. Helter Skelter. Une guerre entre les Noirs et les Blancs va éclater, et nous nous cacherons dans un trou au fond du désert pendant qu'elle détruit tout. Ensuite, nous sortirons, et le monde sera à nous. Si la guerre ne commence pas toute seule, il faudra lui montrer comment.

*Août 1969.* J'ai dit aux enfants de faire quelque chose d'horrible, et de laisser des signes qui feront croire à d'autres coupables. La première nuit, je ne serai pas là. Je ne me salis jamais les mains.

!! CE QUI S'EST PASSÉ :: Dans la nuit du 8 au 9 août 1969, des membres de la Famille ont tué, à Los Angeles, l'actrice Sharon Tate, enceinte de huit mois, et quatre autres personnes. La nuit suivante, ils ont tué Leno et Rosemary LaBianca. D'autres meurtres liés au groupe ont eu lieu avant et après. Manson n'a pas tué ces victimes de ses mains, mais il a été condamné en 1971 comme celui qui les avait ordonnés. Sa condamnation à mort a été commuée en prison à vie quand la Californie a aboli la peine de mort en 1972. Il est mort en prison en 2017. Ses victimes sont souvent moins connues que lui : c'est l'une des injustices de cette histoire.

## Shoko Asahara, Aum

*Kumamoto, 1960.* Je suis presque aveugle. Mes parents m'ont envoyé dans une école pour aveugles, alors que mon œil gauche voit un peu. Ici, c'est moi qui vois le mieux. Les autres dépendent de moi pour se déplacer, pour lire, pour tout. Je leur fais payer chaque service. Je découvre que le pouvoir n'a pas besoin d'être grand. Il suffit d'être un peu moins aveugle que les autres.

*Tokyo, 1984.* J'ai ouvert une école de yoga. Je m'appelle désormais Shoko Asahara. Je publie des photographies de moi en lévitation, assis en lotus, suspendu au-dessus du sol. Ils ne voient pas que je saute. Les jeunes viennent, beaucoup de jeunes, et beaucoup sont brillants : des étudiants en médecine, en chimie, en physique, des ingénieurs. Ils s'ennuient dans ce Japon riche et vide. Je leur offre une aventure spirituelle, une hiérarchie, un sens. Je leur vends aussi mon eau de bain, mes cheveux, mon sang, à boire.

*1990.* Je me suis présenté aux élections législatives avec vingt-quatre de mes disciples. Ils dansaient dans les rues avec des masques à mon effigie. Nous avons eu à peine quelques centaines de voix chacun. Le Japon m'a humilié. Alors le Japon sera puni. Je prêche maintenant l'Armageddon. Une guerre mondiale va venir, et seuls ceux qui m'auront suivi survivront. Si elle ne vient pas assez vite, nous la ferons venir. Mes scientifiques travaillent. Ils fabriquent ce que je leur demande.

*1994.* Il y a eu des morts. Des membres qui voulaient partir. Un avocat qui défendait leurs familles, sa femme et leur bébé, quelques années plus tôt. J'appelle cela poa : tuer quelqu'un pour sauver son âme, pour l'empêcher d'accumuler plus de mauvais karma. Mes disciples le croient, parce qu'ils ont besoin de le croire. Après ce qu'ils ont fait pour moi, ils ne peuvent plus revenir en arrière.

*1993.* À Tokyo, nous avons essayé de répandre une bactérie depuis le toit d'un de nos immeubles. Les voisins se sont plaints d'une odeur. Personne n'est tombé malade. Mes scientifiques me disent qu'ils ont échoué, mais qu'ils savent maintenant fabriquer autre chose. Je leur donne des titres de ministres. Nous avons un ministère de la Santé, un ministère de la Science, un ministère du Renseignement. Nous sommes un État dans l'État. Mon pays, c'est moi.

*Mars 1995.* La police va venir. Il faut la retarder, créer le chaos. Je donne l'ordre.

!! CE QUI S'EST PASSÉ :: En 1989, des membres d'Aum ont assassiné l'avocat Tsutsumi Sakamoto, sa femme et leur fils d'un an. En juin 1994, une attaque au gaz sarin à Matsumoto a tué huit personnes. Le 20 mars 1995, cinq membres ont libéré du sarin dans cinq rames du métro de Tokyo : 13 morts, plus de 5 000 personnes touchées, certaines handicapées à vie. Asahara a été arrêté en mai 1995, condamné à mort, et exécuté le 6 juillet 2018 avec plusieurs anciens dirigeants d'Aum.

## Ma Anand Sheela, Rajneeshpuram

*Bombay, 1968.* J'ai dix-huit ans. Mon père m'a emmenée écouter un maître, Bhagwan Shree Rajneesh. Il parle de méditation, de liberté, de sexe, de rire, de tout ce que les religions interdisent. Des Occidentaux viennent du monde entier pour l'écouter, en robes orange. Je ne suis pas venue pour méditer. Je suis venue pour lui. Quelques années plus tard, je rejoins son ashram de Pune, et je ferai tout ce qu'il faut pour être près de lui.

*1981.* Je suis devenue sa secrétaire. C'est moi qui parle en son nom, qui gère l'argent, qui décide qui le voit. Il ne parle plus en public, il garde le silence : je suis sa voix. Nous avons acheté un ranch immense dans le désert de l'Oregon, aux États-Unis. Des milliers de disciples y construisent une ville en quelques mois, avec des routes, des maisons, un aéroport, une police. Nous l'appelons Rajneeshpuram. Les fermiers du coin nous regardent comme des envahisseurs. Ils ont raison.

*1983.* Bhagwan aime les Rolls-Royce. Il en a maintenant des dizaines, une pour chaque jour. Il fait le tour de la ville chaque après-midi, et les disciples se rangent au bord de la route pour le saluer. Les journalistes adorent. Moi, je donne des interviews à la télévision où j'insulte tout le monde, les politiciens, les voisins, l'Amérique. Plus ils nous détestent, plus les nôtres se serrent autour de nous.

*1984.* Le comté veut nous empêcher de construire. Il y a des élections. Si nous gagnons le comté, plus personne ne nous arrêtera. Nous faisons venir des milliers de sans-abri de toutes les villes du pays, en bus, pour qu'ils votent pour nous. Et nous avons décidé de rendre malades ceux de la ville voisine, pour qu'ils ne puissent pas aller voter. Mes plus proches s'en chargent. Je contrôle tout, je fais écouter les chambres, j'ai installé des micros partout, même chez Bhagwan.

*Septembre 1985.* Je pars. Je pars avant qu'ils ne me prennent. Il va tout me mettre sur le dos. Il en a le droit, je suppose. C'est moi qui ai fait ce qu'il fallait faire.

!! CE QUI S'EST PASSÉ :: En septembre 1984, des membres du mouvement ont volontairement contaminé des bars à salades de restaurants de The Dalles, en Oregon : 751 personnes sont tombées malades, sans décès. C'est la plus grande attaque biologique de l'histoire des États-Unis. Le groupe avait aussi prévu d'assassiner un procureur fédéral. Sheela a été arrêtée en Allemagne, extradée, condamnée, et a passé un peu plus de trois ans en prison ; elle a ensuite dirigé des maisons de soins en Suisse. Rajneesh a été expulsé des États-Unis en 1985, a pris le nom d'Osho, et est mort en Inde en 1990.

# Partir vers les étoiles

## Joseph Di Mambro, l'Ordre du Temple Solaire

*Genève, 1984.* J'ai été bijoutier, horloger, escroc parfois. Je connais la valeur des choses brillantes. Les gens riches de Suisse, de France, du Québec, s'ennuient comme les autres. Ils veulent des secrets. Je leur donne des templiers, des rose-croix, des maîtres invisibles qui parlent depuis une étoile. Avec Luc Jouret, un médecin homéopathe belge qui parle mieux que moi, nous fondons l'Ordre du Temple Solaire. Il donne des conférences sur la santé, l'écologie, la fin d'un cycle. Les gens viennent pour lui. Ils restent pour moi.

*1990.* Les cérémonies sont magnifiques. Des capes blanches, des épées, de l'encens, et au moment voulu, les Maîtres apparaissent dans la salle, des silhouettes de lumière. C'est mon fils qui règle les projecteurs et les hologrammes, derrière un mur. Ma fille, Emmanuelle, est l'enfant cosmique, née sans péché pour annoncer l'ère nouvelle. On ne lui permet pas de jouer avec les autres enfants. Les membres donnent des fortunes : des maisons, des héritages, des comptes en banque.

*1992.* Jouret parle de plus en plus de la fin du monde, du feu, de la purification. Il fait des conférences au Québec, en Suisse, en France. Moi, je sens les choses se défaire. Les membres demandent des comptes, l'argent manque, les enfants grandissent. Je fais des crises. Je me dis malade, je le suis peut-être. Les Maîtres de Sirius me disent qu'il ne reste plus beaucoup de temps.

*1993.* Mon propre fils a quitté l'Ordre et révèle tout : les projecteurs, l'argent, les mensonges. D'autres partent. La police enquête au Québec sur des achats d'armes. Je suis malade. Je ne supporterai pas qu'on me voie vieillir, perdre, être jugé. Il faut que l'Ordre parte avant d'être détruit. Je l'appelle le Transit : un départ vers Sirius, par le feu.

*Octobre 1994.* Tout est prêt. Les lettres qui expliqueront notre départ sont écrites. Ceux qui ne sont pas prêts à partir seront aidés.

!! CE QUI S'EST PASSÉ :: Les 4 et 5 octobre 1994, 53 personnes sont mortes à Cheiry et Salvan, en Suisse, et à Morin-Heights, au Québec : une partie s'est donné la mort, beaucoup ont été tuées, et les bâtiments ont été incendiés. À Morin-Heights, un bébé de trois mois avait été assassiné quelques jours plus tôt, désigné comme l'Antéchrist. Di Mambro et Jouret sont morts à Salvan. En décembre 1995, 16 personnes, dont trois enfants, ont été retrouvées mortes dans le Vercors, en France. En mars 1997, cinq autres sont mortes à Saint-Casimir, au Québec.

## Marshall Applewhite, Heaven's Gate

*Houston, 1972.* J'étais professeur de musique. J'ai une belle voix de baryton, j'ai chanté des opéras. J'ai perdu mon poste, mon mariage, mes certitudes. À l'hôpital, j'ai rencontré une infirmière, Bonnie Nettles. Elle lit les étoiles. Ensemble, nous avons compris : nous sommes deux êtres venus d'au-delà des humains, les Deux dont parle l'Apocalypse. Nous allons montrer le chemin du Niveau au-dessus de l'humain. Un vaisseau viendra chercher ceux qui seront prêts.

*1975.* Nous parcourons l'Amérique et nous donnons des réunions. Des dizaines de personnes quittent tout, du jour au lendemain, pour nous suivre. Leurs familles, leurs métiers, leurs noms. Nous leur apprenons à se défaire de l'humain : pas de sexe, pas d'attachements, pas de plaisirs. Les mêmes vêtements pour tous, les mêmes coupes de cheveux. Ils deviennent des enfants. Nous les appelons nos élèves.

*1976.* Les journaux disent que des gens disparaissent après nos réunions. C'est vrai : ils nous suivent. Alors nous disparaissons à notre tour. Pendant des années, nous vivons cachés, en petits groupes, dans des campements, dans des maisons louées, en déménageant sans cesse. Les élèves portent des noms qui finissent tous par -ody. Ils obéissent à des règles écrites pour chaque geste : comment se raser, comment manger, comment parler. Chacun a un partenaire qui le surveille.

*1985.* Bonnie est morte. Je pensais qu'elle ne pouvait pas mourir. Je me dis qu'elle a seulement quitté son véhicule, son corps, et qu'elle m'attend là-haut. Je dirige seul, maintenant. Les élèves restent, une quarantaine. Ils créent des sites internet pour gagner de l'argent, ils sont très doués. Nous vivons en communauté dans une grande maison en Californie.

*1997.* Une comète approche, Hale-Bopp, la plus brillante depuis des siècles. Quelqu'un a dit à la radio qu'un objet la suivait. J'y ai vu le vaisseau. C'est le signal. Nous enregistrons nos messages d'adieu en vidéo, un par un, souriants. Nous allons quitter nos véhicules et monter.

!! CE QUI S'EST PASSÉ :: Fin mars 1997, à Rancho Santa Fe, en Californie, Marshall Applewhite et 38 membres de Heaven's Gate sont morts ensemble, en plusieurs groupes, sur plusieurs jours. Il n'y avait aucun vaisseau derrière la comète : l'« objet » était une étoile mal identifiée sur une photographie.

# Reconnaître l'emprise

Mis côte à côte, ces sept journaux montrent les mêmes étapes. D'abord, un homme qui se sent rejeté, humilié ou ignoré, et qui trouve un récit où il est l'élu. Ensuite, des gens qui cherchent quelque chose de réel : la justice raciale chez Jones, une famille chez Manson, le sens chez Asahara, la liberté chez Rajneesh, la beauté chez Di Mambro, la pureté chez Applewhite. Le groupe leur donne d'abord ce qu'ils cherchent. C'est pour cela qu'ils restent.

Puis le groupe se referme, toujours de la même manière. Il coupe les liens avec la famille et les anciens amis, présentés comme des ennemis ou des gens qui ne peuvent pas comprendre. Il prend l'argent, les biens, le temps, le sommeil. Il installe une langue à part, des mots que seuls les membres comprennent. Il demande des confessions, qui deviennent des moyens de pression. Il réécrit la morale : ce qui était un crime devient un devoir, si le chef le demande. Et il annonce une fin, qui finit par devenir une sortie.

Ces signes permettent de reconnaître un danger bien avant la tragédie, chez soi ou chez un proche. Un groupe ou une personne qui te demande de couper les ponts avec ceux que tu aimes. Qui exige de plus en plus d'argent ou de temps. Qui interdit le doute. Qui a réponse à tout et ne se trompe jamais. Qui fait peur à ceux qui veulent partir.

!! SI TU T'INQUIÈTES POUR TOI OU POUR UN PROCHE :: En France, la MIVILUDES informe et reçoit les signalements, et des associations comme l'UNADFI ou le CCMM accompagnent les familles et les anciens membres. Garder le lien avec la personne, sans la juger ni l'humilier, est ce qui l'aide le plus à revenir.
`,
};
export default book;
