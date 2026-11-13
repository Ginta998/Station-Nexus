const book = {
  id: "ramanujan", title: "Ramanujan", sub: "L'homme qui connaissait l'infini", room: "sciences", type: "recit", cote: "SC-002", color: 32, emblem: "∑",
  about: "Un employé de bureau de Madras, sans diplôme, écrit en 1913 à un mathématicien de Cambridge une lettre pleine de formules que personne n'a jamais vues. Six ans plus tard, il est membre de la Royal Society. Un an après, il meurt, à trente-deux ans, en laissant des cahiers que l'on n'a pas fini de comprendre.",
  links: [
    { label: "Robert Kanigel, L'homme qui connaissait l'infini (1991)", note: "La grande biographie, d'où vient le film." },
    { label: "Matthew Brown, The Man Who Knew Infinity (2015)", note: "Le film, avec Dev Patel en Ramanujan et Jeremy Irons en Hardy." },
    { label: "G. H. Hardy, L'Apologie d'un mathématicien (1940)", note: "Le petit livre où Hardy dit ce qu'il doit à Ramanujan, et pourquoi les mathématiques sont belles." },
    { label: "George Andrews et Bruce Berndt, Ramanujan's Lost Notebook", note: "L'édition, en plusieurs volumes, du cahier retrouvé en 1976. Pour les courageux." },
    { label: "L'infini, dans cette même salle", note: "Le livre sur l'infini et ceux qui ont essayé de le compter." },
  ],
  text: String.raw`
# Kumbakonam, et la lettre

Srinivasa Ramanujan est né le 22 décembre 1887 dans le sud de l'Inde, à Erode, et a grandi à Kumbakonam, une ville de temples, dans le pays tamoul. Sa famille était brahmane, pauvre. Son père était commis chez un marchand de saris. Sa mère, très pieuse, chantait au temple. La déesse de la famille s'appelait Namagiri, et Ramanujan dira toute sa vie que c'est elle qui lui donnait ses formules, en rêve, écrites sur sa langue.

Il était un enfant silencieux, obstiné, brillant à l'école. À onze ans, il épuisait les connaissances mathématiques des étudiants qui logeaient chez ses parents. À treize ans, il maîtrisait un traité avancé de trigonométrie et redécouvrait seul des résultats connus depuis un siècle. À quinze ans, il a mis la main sur un livre qui a décidé de sa vie : un recueil anglais, le Synopsis of Elementary Results in Pure Mathematics de George Shoobridge Carr, un manuel de révision pour étudiants, qui alignait des milliers de théorèmes et de formules sans démonstrations, ou avec des démonstrations très brèves.

Ce livre a été son unique maître. Ramanujan l'a traité comme un livre d'énigmes. Il a refait chaque formule, et il a continué, plus loin, beaucoup plus loin. Et il a pris l'habitude de Carr : écrire des résultats sans démontrer. Il notait ses découvertes dans des cahiers, par centaines, des formules sur l'infini, sur les séries, sur les fractions continues, sur les nombres premiers, souvent sans un mot d'explication. Le papier coûtait cher. Il travaillait sur une ardoise, avec une craie, qu'il effaçait avec son coude, et ne recopiait dans les cahiers que le résultat final.

Cette passion l'a perdu. Il a obtenu une bourse pour le collège. Il l'a perdue, parce qu'il ne travaillait que les mathématiques et échouait dans toutes les autres matières. Il s'est enfui, est revenu, a tenté un autre collège à Madras, a échoué encore. Il n'a jamais obtenu de diplôme. On l'a marié, selon la coutume, à une enfant de dix ans, Janaki, qui ne viendrait vivre avec lui que des années plus tard. Il était pauvre, malade parfois, sans emploi. Il allait de maison en maison, ses cahiers sous le bras, montrer ses formules à qui voulait bien les regarder.

Certains les ont regardées. Un fonctionnaire, passionné de mathématiques, lui a trouvé un emploi de commis au Port Trust de Madras, l'administration du port, à trente roupies par mois. Ses chefs l'ont encouragé à écrire à des mathématiciens anglais. Deux n'ont pas répondu, ou ont répondu poliment. Le troisième s'appelait Godfrey Harold Hardy.

Hardy avait trente-cinq ans. Il était professeur à Cambridge, l'un des meilleurs mathématiciens d'Angleterre, spécialiste de l'analyse et de la théorie des nombres. Un homme timide, excentrique, athée militant, qui ne supportait pas les miroirs et adorait le cricket. Il recevait souvent des lettres de fous qui prétendaient avoir démontré des choses impossibles.

En janvier 1913, il reçoit une lettre de Madras. Dix pages couvertes d'une écriture régulière, et d'une centaine de formules. L'auteur se présente : un employé de bureau, sans diplôme, qui a vingt-trois ans et qui a fait des mathématiques seul. Hardy la parcourt, la met de côté, agacé. Puis il y repense, toute la journée. Le soir, il la montre à son collègue et ami, John Littlewood. Ils passent la soirée dessus.

Certaines formules étaient connues. D'autres étaient fausses. Mais beaucoup étaient nouvelles, et certaines étaient extraordinaires. Hardy dira plus tard que quelques-unes l'avaient complètement terrassé, qu'il n'avait jamais rien vu de pareil, et qu'elles devaient être vraies, parce que personne n'aurait eu l'imagination de les inventer si elles étaient fausses. Il en conclut que l'auteur était un génie mathématique de premier ordre, comparable aux plus grands, Euler ou Jacobi.

Hardy répond. Il demande des démonstrations. Ramanujan, qui n'en a jamais écrit, envoie d'autres formules, et explique qu'il a besoin de nourriture pour son cerveau plus que de démonstrations. Hardy décide de le faire venir à Cambridge. Mais un brahmane n'a pas le droit de traverser la mer : c'est une souillure. La mère de Ramanujan refuse. Puis, raconte-t-on, elle fait un rêve où la déesse Namagiri lui ordonne de laisser partir son fils. En mars 1914, Ramanujan embarque pour l'Angleterre.

# Cambridge

Ramanujan arrive à Cambridge en avril 1914. Quelques mois plus tard, la guerre éclate. Les jeunes gens partent au front, les collèges se vident, les vivres manquent. Ramanujan est végétarien strict, il fait sa cuisine lui-même dans sa chambre, avec ce qu'il trouve, souvent mal. Il a froid. Il ne connaît personne. Il ne se plaint pas.

Avec Hardy, il travaille. C'est l'une des plus étonnantes collaborations de l'histoire des sciences : un Anglais rigoureux, qui exige des preuves pour tout, et un Indien qui voit les résultats et ne sait pas comment il les voit. Hardy doit lui apprendre ce qu'est une démonstration, combler les trous de sa formation, sans briser ce qui fait son génie. Il dira qu'il a plus appris de Ramanujan que Ramanujan n'a appris de lui.

Ensemble, ils s'attaquent à une question qui paraît enfantine : de combien de manières peut-on écrire un nombre comme une somme de nombres entiers ? Le nombre 4 peut s'écrire 4, 3 + 1, 2 + 2, 2 + 1 + 1, 1 + 1 + 1 + 1 : cinq façons. Pour 10, il y en a 42. Pour 100, plus de cent quatre-vingt-dix millions. Pour 200, près de quatre mille milliards. On appelle cela les partitions d'un nombre. Personne ne savait les compter pour les grands nombres. Hardy et Ramanujan trouvent une formule qui donne une approximation d'une précision stupéfiante, et inventent pour cela une méthode nouvelle, qu'on appelle aujourd'hui la méthode du cercle. Elle sert encore, un siècle plus tard, dans de nombreux domaines.

Ramanujan publie, seul ou avec Hardy, une vingtaine d'articles. Il travaille sur les nombres hautement composés, ceux qui ont plus de diviseurs que tous les nombres plus petits. Sur les séries infinies. Sur des formules pour le nombre pi, si rapides qu'on s'en sert encore aujourd'hui, sous des formes améliorées, dans les ordinateurs qui calculent des milliers de milliards de décimales. Sur les propriétés étranges des partitions : il remarque, par exemple, que le nombre de partitions de 4, 9, 14, 19, et de tous les nombres qui finissent par 4 ou 9, est toujours divisible par 5. Personne n'avait vu ces régularités.

En 1918, il est élu membre de la Royal Society, l'académie des sciences britannique, l'un des premiers Indiens à recevoir cet honneur, et membre du Trinity College, le premier Indien. Il a trente ans.

Mais il est malade. Depuis 1917, il souffre, maigrit, tousse. Les médecins parlent de tuberculose. On pense aujourd'hui qu'il souffrait peut-être d'une infection parasitaire contractée en Inde. Il passe de sanatorium en sanatorium. Il fait une tentative de suicide, en se jetant devant une rame de métro à Londres ; le conducteur parvient à freiner.

C'est pendant cette maladie qu'a lieu l'histoire la plus célèbre. Hardy vient le voir à l'hôpital, à Putney, en taxi. Il lui dit, pour engager la conversation, que le numéro du taxi était 1729, un nombre plutôt ennuyeux. Ramanujan répond aussitôt que non, que c'est au contraire un nombre très intéressant : c'est le plus petit nombre qui puisse s'écrire de deux manières différentes comme la somme de deux cubes. Un cube de 1 et un cube de 12, ou un cube de 9 et un cube de 10. Depuis, les mathématiciens appellent 1729 le nombre de Hardy-Ramanujan, et l'on appelle nombres taxis ceux qui ont cette propriété.

# Le dernier cahier, et ce qu'on peut en retenir

En 1919, Ramanujan rentre en Inde, très affaibli. Il retrouve sa femme, Janaki, qui le soigne. Il continue à travailler, couché, jusqu'à ses dernières semaines. Il écrit à Hardy, en janvier 1920, une dernière lettre, où il annonce avoir découvert des fonctions nouvelles, qu'il appelle les fonctions thêta simulées, et en donne des exemples, sans définition précise. Il meurt le 26 avril 1920, à Kumbakonam. Il a trente-deux ans.

Ce n'est pas la fin. Ses cahiers, ceux de sa jeunesse, contiennent des milliers de résultats. Des mathématiciens passent des décennies à les démontrer, un par un. Le mathématicien américain Bruce Berndt y consacre une grande partie de sa carrière : il établit que presque tous sont justes. Beaucoup étaient en avance de cinquante ans sur leur temps.

Et en 1976, un autre Américain, George Andrews, fouille la bibliothèque de Trinity College, à Cambridge, dans des papiers légués par un mathématicien mort. Il trouve une centaine de feuillets de la main de Ramanujan, écrits pendant sa dernière année, en Inde. On l'appelle le cahier perdu. Il contient des centaines de formules nouvelles, notamment sur les fonctions thêta simulées de la dernière lettre. Pendant des décennies, personne ne comprend vraiment ce qu'elles sont. En 2002, un jeune mathématicien néerlandais, Sander Zwegers, montre enfin comment elles s'insèrent dans une théorie plus vaste. On découvre ensuite qu'elles servent à décrire, en physique, l'entropie des trous noirs. Ramanujan, mourant, couché à Kumbakonam, avait trouvé des objets dont la physique aurait besoin un siècle plus tard.

On se demande toujours comment il faisait. Ramanujan lui-même disait que la déesse lui montrait les formules. Hardy, athée, pensait qu'il voyait les mathématiques comme d'autres voient des paysages, par un mélange d'intuition, de calcul acharné sur des exemples, et d'une mémoire prodigieuse des nombres. Littlewood disait que chaque entier positif était pour lui un ami personnel.

Trois choses à garder.

La première est la place de l'intuition. Ramanujan voyait juste avant de savoir pourquoi. Hardy, lui, savait prouver ce qu'il voyait. Il a fallu les deux. Dans tout travail créatif, l'intuition et la rigueur ne sont pas ennemies : l'une trouve, l'autre vérifie, et l'une sans l'autre se perd.

La deuxième est ce que coûte un système qui ne reconnaît qu'une seule forme d'intelligence. Ramanujan a échoué à tous ses examens. Il aurait pu mourir commis de bureau, ses cahiers jetés après lui. Il a fallu un hasard, une lettre, un homme qui accepte de lire jusqu'au bout la lettre d'un inconnu. Combien de Ramanujan n'ont pas eu leur Hardy ?

La troisième est la beauté. Hardy disait que les mathématiques n'ont pas de place durable pour la laideur. Ramanujan cherchait des formules belles, symétriques, surprenantes, comme on cherche une image ou une phrase. Il savait qu'elles étaient vraies parce qu'elles étaient belles. Ce n'est pas une preuve. C'est souvent un bon début.
`,
};
export default book;
