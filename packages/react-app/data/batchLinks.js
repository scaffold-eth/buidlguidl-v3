import TelegramIcon from "../components/icons/TelegramIcon";
import GithubIcon from "../components/icons/GithubIcon";
import EthIcon from "../components/icons/EthIcon";
import WebsiteIcon from "../components/icons/WebsiteIcon";

export const batchLinks = {
  telegramJoinLink: {
    label: "TelegramJoinLink",
    placeholder: "Join telegram group link",
    icon: TelegramIcon,
    getLink: value => `${value}`,
    weight: 1,
  },
  github: {
    label: "GitHub",
    placeholder: "Your GitHub username",
    icon: GithubIcon,
    getLink: value => `https://github.com/${value}`,
    weight: 4,
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
