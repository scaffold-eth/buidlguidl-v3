const TG_CHANNELS = {
  general: {
    name: "BG General Chat",
    emoji: "💬",
    link: process.env.TELEGRAM_GENERAL_CHAT ?? "",
  },
  video: {
    name: "BG Project Showoff",
    emoji: "🎥",
    link: process.env.TELEGRAM_VIDEO_CHAT ?? "",
  },
  champions: {
    name: "BG Champion's Circle",
    emoji: "🏆",
    link: process.env.TELEGRAM_CHAMPIONS_CHAT ?? "",
  },
};

export const getTelegramAccessForBuilder = builder => {
  const accessTo = [TG_CHANNELS.general, TG_CHANNELS.video];

  if (builder?.stream?.streamAddress) {
    accessTo.push(TG_CHANNELS.champions);
  }

  return accessTo;
};
