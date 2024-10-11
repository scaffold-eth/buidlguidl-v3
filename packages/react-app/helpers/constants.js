export const SRE_CHALLENGE_SUBMISSION_STATUS = {
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  SUBMITTED: "SUBMITTED",
};

export const BUILD_TYPES = {
  dapp: "SE-2 DApp",
  extension: "SE-2 Extension",
  challenge: "SRE Challenge",
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

export const BATCH_BUILDER_STATUS = {
  CANDIDATE: "candidate",
  GRADUATE: "graduate",
};

export const BATCH_STATUS = {
  CLOSED: "closed",
  OPEN: "open",
};
