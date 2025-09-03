const withTM = require("next-transpile-modules")(["eth-hooks"]); // pass the modules you would like to see transpiled

module.exports = withTM({
  webpack5: true,
  webpack: config => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  async redirects() {
    return [
      {
        source: "/builds",
        destination: "https://speedrunethereum.com/builds",
        permanent: true,
      },
    ];
  },
});
