/**
 * Import BGv2 data into the database.
 */

const db = require("../services/db/db");
const { BUILDERS } = require("./data/builders_bgv2");

BUILDERS.forEach(async builder => {
  const dbBuilder = await db.findUserByAddress(builder.address);

  if (dbBuilder.exists && builder.role && builder.role !== "inactive") {
    db.updateUser(builder.address, {
      ens: builder.name,
      function: builder.role,
      stream: {
        streamAddress: builder.streamAddress,
      },
    });
  }
});
