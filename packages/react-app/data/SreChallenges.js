export const SreChallengeInfo = {
  "simple-nft-example": {
    id: 0,
  },
  "decentralized-staking": {
    id: 1,
  },
  "token-vendor": {
    id: 2,
  },
  "dice-game": {
    id: 3,
  },
  "minimum-viable-exchange": {
    id: 4,
  },
  "state-channels": {
    id: 5,
  },
  "buidl-guidl": {
    id: 6,
  },
  "learn-multisig": {
    id: 7,
  },
  "nft-cohort": {
    id: 8,
  },
};

const githubChallengesRepoBaseRawUrl = {
  js: "https://raw.githubusercontent.com/scaffold-eth/scaffold-eth-challenges",
  ts: "https://raw.githubusercontent.com/scaffold-eth/scaffold-eth-typescript-challenges",
};

export const getGithubChallengeReadmeUrl = (challengeId, version) =>
  `${githubChallengesRepoBaseRawUrl[version]}/${challengeInfo[challengeId].branchName}/README.md`;
