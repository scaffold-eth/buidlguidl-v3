import TelegramIcon from "../components/icons/TelegramIcon";
import TwitterIcon from "../components/icons/TwitterIcon";
import DiscordIcon from "../components/icons/DiscordIcon";
import GithubIcon from "../components/icons/GithubIcon";
import EmailIcon from "../components/icons/EmailIcon";
import IntagramIcon from "../components/icons/IntagramIcon";
import EthIcon from "../components/icons/EthIcon";
import WebsiteIcon from "../components/icons/WebsiteIcon";

export const socials = {
  telegram: {
    label: "Telegram",
    placeholder: "Your Telegram handle without the @",
    icon: TelegramIcon,
    getLink: value => `https://telegram.me/${value}`,
    weight: 0,
  },
  telegramJoinLink: {
    label: "TelegramJoinLink",
    placeholder: "Join telegram group link",
    icon: TelegramIcon,
    getLink: value => `${value}`,
    weight: 1,
  },
  twitter: {
    label: "Twitter",
    placeholder: "Your Twitter username without the @",
    icon: TwitterIcon,
    getLink: value => `https://twitter.com/${value}`,
    weight: 2,
  },
  discord: {
    label: "Discord",
    placeholder: "Your Discord username#id",
    icon: DiscordIcon,
    getLink: _ => null,
    weight: 3,
    validator: "discord",
  },
  github: {
    label: "GitHub",
    placeholder: "Your GitHub username",
    icon: GithubIcon,
    getLink: value => `https://github.com/${value}`,
    weight: 4,
  },
  email: {
    label: "E-mail",
    placeholder: "Your e-mail address",
    icon: EmailIcon,
    getLink: value => `mailto:${value}`,
    weight: 5,
    validator: "email",
  },
  instagram: {
    label: "Instagram",
    placeholder: "Your Instagram handle without the @",
    icon: IntagramIcon,
    getLink: value => `https://instagram.com/${value}`,
    weight: 6,
  },
  etherscan: {
    label: "Etherscan",
    placeholder: "Your Etherscan address",
    icon: EthIcon,
    getLink: value => `https://etherscan.io/address/${value}`,
    weight: 7,
  },
  etherscanOP: {
    label: "EtherscanOP",
    placeholder: "Your EtherscanOP address",
    icon: EthIcon,
    getLink: value => `https://optimistic.etherscan.io/address/${value}`,
    weight: 8,
  },
  website: {
    label: "Website",
    placeholder: "Your website URL",
    icon: WebsiteIcon,
    getLink: value => `https://batch${value}.buidlguidl.com`,
    weight: 9,
  },
};

export const bySocialWeight = (socialEntry1, socialEntry2) =>
  socials[socialEntry1[0]].weight - socials[socialEntry2[0]].weight;
