export const SreChallengeInfo = {
  "simple-nft-example": {
    id: 0,
    branchName: "challenge-0-simple-nft",
    label: "🚩 Challenge 0: 🎟 Simple NFT Example",
    disabled: false,
    description:
      "🎫 Create a simple NFT to learn basics of 🏗 scaffold-eth. You'll use 👷‍♀️ HardHat to compile and deploy smart contracts. Then, you'll use a template React app full of important Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with friends! 🚀",
    previewImage: "assets/0.png",
    dependencies: [],
  },
  "decentralized-staking": {
    id: 1,
    branchName: "challenge-1-decentralized-staking",
    label: "🚩 Challenge 1: 🥩 Decentralized Staking App ",
    disabled: false,
    description:
      "🦸 A superpower of Ethereum is allowing you, the builder, to create a simple set of rules that an adversarial group of players can use to work together. In this challenge, you create a decentralized application where users can coordinate a group funding effort. The users only have to trust the code.",
    previewImage: "assets/1.png",
    dependencies: [],
  },
  "token-vendor": {
    id: 2,
    branchName: "challenge-2-token-vendor",
    label: "🚩 Challenge 2: 🏵 Token Vendor",
    disabled: false,
    description:
      '🤖 Smart contracts are kind of like "always on" vending machines that anyone can access. Let\'s make a decentralized, digital currency (an ERC20 token). Then, let\'s build an unstoppable vending machine that will buy and sell the currency. We\'ll learn about the "approve" pattern for ERC20s and how contract to contract interactions work.',
    previewImage: "assets/2.png",
    dependencies: [],
  },
  "minimum-viable-exchange": {
    id: 3,
    branchName: "",
    label: "🚩 Challenge 3: ⚖️ Build a DEX",
    disabled: false,
    description:
      "💵 Build an exchange that swaps ETH to tokens and tokens to ETH. 💰 This is possible because the smart contract holds reserves of both assets and has a price function based on the ratio of the reserves. Liquidity providers are issued a token that represents their share of the reserves and fees...",
    previewImage: "assets/4.png",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor"],
    externalLink: {
      link: "https://t.me/+q4WzoxX88nwzZmQx",
      claim: "Join the ⚖️ DEX builder study group",
    },
  },
  "buidl-guidl": {
    id: 4,
    branchName: "",
    label: "🚩 Challenge 4: 🏰️ BG 🏤 Bazaar",
    disabled: false,
    description:
      "Now you are a member of BuidlGuidl Bazaar!!! – The Bazaar is a place to show off your builds and meet other builders. Start crafting your Web3 portfolio by submitting your DEX build.",
    previewImage: "assets/bg.png",
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor"],
    externalLink: {
      link: "https://bazaar.buidlguidl.com/",
      claim: "Join the 🏰️ BG 🏤 Bazaar",
    },
  },
  "learn-multisig": {
    id: 5,
    branchName: "challenge-3-multi-sig",
    label: "🚩 Challenge 5: 👛 Multisig Wallet",
    disabled: false,
    description:
      '👩‍👩‍👧‍👧 Using a smart contract as a wallet we can secure assets by requiring multiple accounts to "vote" on transactions. The contract will keep track of transactions in an array of structs and owners will confirm or reject each one. Any transaction with enough confirmations can "execute".',
    previewImage: "assets/3.png",
    // Challenge locked until the builder completed these challenges
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor"],
    // Once the dependencies are completed, lock the challenge until
    // "lockedTimestamp" minutes have elapsed
    lockedTimestamp: 1440,
    // This will make the challenge to link to the externalLink, instead of the challenge detail view.
    externalLink: {
      link: "https://t.me/+zKllN8OlGuxmYzFh",
      claim: "Join the 👛 Multisig Build cohort",
    },
  },
  "nft-cohort": {
    id: 6,
    branchName: "challenge-5-svg-nft-cohort",
    label: "🚩 Challenge 6: 🎁 SVG NFT 🎫 Building Cohort",
    disabled: false,
    description:
      "🧙 Tinker around with cutting edge smart contracts that render SVGs in Solidity. 🧫 We quickly discovered that the render function needs to be public... 🤔 This allows NFTs that own other NFTs to render their stash. Just wait until you see an Optimistic Loogie and a Fancy Loogie swimming around in the same Loogie Tank!",
    previewImage: "assets/nfts.png",
    // Challenge locked until the builder completed these challenges
    dependencies: ["simple-nft-example", "decentralized-staking", "token-vendor"],
    // Once the dependencies are completed, lock the challenge until
    // "lockedTimestamp" minutes have is elapsed
    lockedTimestamp: 1440,
    // This will make the challenge to link to the externalLink, instead of the challenge detail view.
    externalLink: {
      link: "https://t.me/+mUeITJ5u7Ig0ZWJh",
      claim: "Join the 🎁 SVG NFT 🎫 Building Cohort",
    },
  },
  "learn-oracles": {
    id: 7,
    branchName: "challenge-4-oracle",
    label: "🚩 Challenge 7: 🔮 Oracles",
    disabled: true,
    description:
      "🛰 Off-chain information can be critical for on-chain logic but it's complicated! 🎲 Random numbers are also tricky on a deterministic public blockchain... ",
    previewImage: "assets/soon.png",
    dependencies: [
      "simple-nft-example",
      "decentralized-staking",
      "token-vendor",
      "learn-multisig",
      "minimum-viable-exchange",
    ],
  },
};
