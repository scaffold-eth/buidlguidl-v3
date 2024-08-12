export const SRE_CHALLENGE_SUBMISSION_STATUS = {
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  SUBMITTED: "SUBMITTED",
};

export const BUILD_TYPES = {
  dapp: "DApp",
  extension: "Extension",
  challenge: "Challenge",
  design: "Design",
  devrel: "DevRel",
  other: "Other",
};

export const USER_ROLES = {
  anonymous: "anonymous",
  builder: "builder",
  admin: "admin",
};

export const USER_FUNCTIONS = {
  cadets: { label: "Cadets", graphic: "cadets_thumb.jpeg", pluralLabel: "Cadets" },
  infantry: { label: "Infantry", graphic: "infantry_thumb.jpeg" },
  fullstack: { label: "Fullstack", graphic: "pikemen_thumb.png", pluralLabel: "Fullstack" },
  frontend: { label: "Frontend", graphic: "archer_thumb.png", pluralLabel: "Frontend" },
  artist: { label: "Artist", graphic: "warlock_thumb.png", pluralLabel: "Artists" },
  damageDealer: { label: "Damage Dealers", graphic: "knight_thumb.png", pluralLabel: "Damage Dealers" },
  support: { label: "Support", graphic: "monk_thumb.png", pluralLabel: "Support" },
  advisor: { label: "Advisor", graphic: "cleric_thumb.png", pluralLabel: "Advisors" },
};
