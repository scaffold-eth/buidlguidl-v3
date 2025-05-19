require("dotenv").config();
const db = require("../services/db/db");

/**
 * Middleware that adds to the request the address sent in the headers.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.NextFunction} next
 */
const withAddress = (req, res, next) => {
  const { address } = req.headers;
  req.address = address;

  // TODO maybe return a 400 if the address is undefined
  next();
};

/**
 * Middleware to validate role-gated requests.
 *
 * @param role string
 */
const withRole = role => {
  return (req, res, next) => {
    withAddress(req, res, async () => {
      const user = await db.findUserByAddress(req.address);

      if (user.data.disabled) {
        // :)
        return res.sendStatus(200);
      }

      // ToDo. Role utils: hasBuilderRoles or atLeastBuilder, etc.
      // For now, bypassing admin
      if (!user.exists || (user.data.role !== "admin" && user.data.role !== role)) {
        return res.status(401).send(`Not a ${role}`);
      }
      next();
    });
  };
};

/**
 * Middleware to validate API requests with API keys.
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.NextFunction} next
 */
const withApiKey = (req, res, next) => {
  const { apikey } = req.headers;

  if (apikey !== process.env.API_KEY) {
    return res.status(401).send("Wrong API KEY");
  }

  next();
};

/**
 * Middleware to disable write operations and return read-only mode message
 */
const readOnlyMode = (req, res, next) => {
  res.status(503).json({
    error: "BG3.5 backend is in read-only mode",
    message: "Due to SRE migration, the backend is in read-only mode for most of its operations.",
  });
};

module.exports = {
  withAddress,
  withRole,
  withApiKey,
  readOnlyMode,
};
