/**
 * Add builds references into users.builds
 */

const db = require("../services/db/db");

const main = async () => {
  const allBuilders = await db.findAllUsers();

  allBuilders.forEach(async builder => {
    console.log("Fetching builds for ", builder.id);
    const builderBuilds = await db.findBuilderBuilds(builder.id);

    const buildsRefs = await builderBuilds.map(build => ({
      id: build.id,
      submittedTimestamp: build.submittedTimestamp,
    }));

    if (buildsRefs.length) {
      console.log("saving", buildsRefs);
      await db.updateUser(builder.id, { builds: buildsRefs });
    }
  });
};

main();
