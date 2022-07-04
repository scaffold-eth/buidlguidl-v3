const withTM = require("next-transpile-modules")(["eth-hooks"]); // pass the modules you would like to see transpiled

module.exports = withTM({
  webpack5: true,
  webpack: config => {
    config.resolve.fallback = { fs: false };

    return config;
  },
});
// module.exports = {
//   webpack5: true,
//   webpack: config => {
//     config.resolve.fallback = { fs: false };
//
//     return config;
//   },
//
// };
