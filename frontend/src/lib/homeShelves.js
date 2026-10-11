import { IoHeart, IoPeople, IoSparkles, IoCalendar, IoLibrary, IoChatbubbles, IoInformationCircle, IoMail, IoHelpCircle } from "react-icons/io5";

// Pages proposables comme "rangées" en bas de l'accueil Big Picture.
export const PAGE_CATALOG = [
  { key: "soutien", label: "Soutenir", route: "/soutien", kanji: "愛", Icon: IoHeart },
  { key: "membres", label: "Membres", route: "/membres", kanji: "仲", Icon: IoPeople },
  { key: "nouveautes", label: "Nouveautés", route: "/nouveautes", kanji: "新", Icon: IoSparkles },
  { key: "planning", label: "Planning", route: "/planning", kanji: "暦", Icon: IoCalendar },
  { key: "bibliotheque", label: "Bibliothèque", route: "/bibliotheque", kanji: "蔵", Icon: IoLibrary },
  { key: "salon", label: "Salon", route: "/salon", kanji: "話", Icon: IoChatbubbles },
  { key: "a-propos", label: "À propos", route: "/a-propos", kanji: "識", Icon: IoInformationCircle },
  { key: "contact", label: "Contact", route: "/contact", kanji: "信", Icon: IoMail },
  { key: "tutoriel", label: "Tutoriel", route: "/tutoriel", kanji: "導", Icon: IoHelpCircle },
];

export const pageByKey = Object.fromEntries(PAGE_CATALOG.map((p) => [p.key, p]));
