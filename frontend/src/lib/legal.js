// Identité de l'éditeur et paramètres légaux : LE SEUL ENDROIT À MODIFIER.
// Un champ vide ("") s'affiche « À COMPLÉTER » en surbrillance sur les pages légales.
export const LEGAL = {
  editeur: "Brichel-Paul Louzala",
  statut: "entrepreneur individuel (EI)",
  marque: "Station Nexus",
  adresse: "18 Square Lulli, 94500 Champigny-sur-Marne, France",
  siren: "851 984 690",
  siret: "851 984 690 00012",
  rcs: "RCS de Créteil",
  ape: "5911C (production de films pour le cinéma)",
  tva_num: "FR08851984690",
  // "franchise" → « TVA non applicable, art. 293 B du CGI » · "assujetti" → prix TTC, TVA incluse · "" → à compléter
  tva_regime: "",
  directeur: "Brichel-Paul Louzala",
  email: "louzalabrichel@gmail.com", // email de contact affiché publiquement
  email_rgpd: "louzalabrichel@gmail.com", // email pour les demandes liées aux données personnelles
  telephone: "",
  mediateur_nom: "",
  mediateur_adresse: "",
  mediateur_site: "",
  hebergeur_nom: "Emergent Labs Inc.",
  hebergeur_adresse: "505 Montgomery St, Suite 1100, San Francisco, CA 94111, États-Unis",
  hebergeur_tel: "+1 415 632 9171",
  hebergeur_stockage: "Google Cloud (Google LLC) et MongoDB Atlas (MongoDB, Inc.), aux États-Unis",
  mesure_audience: "", // à compléter après réponse d'Emergent sur son script de statistiques
  age_min: "15",
  maj: "11 novembre 2026",
  version: "2026-11-11",
};

export const tvaOf = (v) =>
  v.tva_regime === "franchise" ? "TVA non applicable, art. 293 B du CGI"
  : v.tva_regime === "assujetti" ? "Prix TTC, TVA française incluse" : "";

// Champs modifiables dans Paramètres → Admin → Informations légales (ils remplacent les valeurs ci-dessus)
export const LEGAL_FIELDS = [
  ["editeur", "Nom de l'éditeur"], ["statut", "Statut"], ["adresse", "Adresse du siège"], ["siren", "SIREN"], ["siret", "SIRET"],
  ["rcs", "Immatriculation (RCS)"], ["ape", "Code APE"], ["tva_num", "N° de TVA intracommunautaire"], ["tva_regime", "Régime de TVA", "tva"],
  ["directeur", "Directeur de la publication"], ["email", "Email de contact public"], ["email_rgpd", "Email données personnelles"], ["telephone", "Téléphone"],
  ["mediateur_nom", "Médiateur de la consommation (nom)"], ["mediateur_adresse", "Médiateur (adresse)"], ["mediateur_site", "Médiateur (site web)"],
  ["hebergeur_nom", "Hébergeur"], ["hebergeur_adresse", "Adresse de l'hébergeur"], ["hebergeur_tel", "Téléphone de l'hébergeur"], ["hebergeur_stockage", "Stockage des données"],
  ["mesure_audience", "Mesure d'audience (phrase affichée)", "long"],
];

export const LEGAL_LABELS = {
  email: "email de contact", email_rgpd: "email pour les données personnelles", telephone: "téléphone",
  mediateur_nom: "nom du médiateur de la consommation", mediateur_adresse: "adresse du médiateur", mediateur_site: "site du médiateur",
  tva_mention: "régime de TVA (franchise art. 293 B ou TVA applicable)", mesure_audience: "mesure d'audience (en attente de la réponse d'Emergent)",
};
