require("dotenv").config();
const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getSignMessageForId } = require("./utils/sign");

const buildersRoutes = require("./routes/builders");
const buildsRoutes = require("./routes/builds");
const eventsRoutes = require("./routes/events");
const streamsRoutes = require("./routes/streams");
const ensRoutes = require("./routes/ens");
const apiRoutes = require("./routes/api");
const cohortRoutes = require("./routes/cohorts");
const notificationsRoutes = require("./routes/notifications");

const app = express();

app.use(cors());
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/builders", buildersRoutes);
app.use("/builds", buildsRoutes);
app.use("/latest-events", eventsRoutes);
app.use("/streams", streamsRoutes);
app.use("/ens", ensRoutes);
app.use("/api", apiRoutes);
app.use("/cohorts", cohortRoutes);
app.use("/notifications", notificationsRoutes);

app.get("/healthcheck", (_, res) => {
  res.status(200).send("ok");
});

app.get("/sign-message", async (req, res) => {
  const messageId = req.query.messageId;
  const options = req.query;

  // necessary to cast into JSON otherwise it is a string and verifySignature fails (because the objects are different)
  const transformedObject = {
    ...options,
    batch: (() => {
      if (!options.batch) return undefined;

      // Parse if batch is a string
      const parsedBatch = typeof options.batch === "string" ? JSON.parse(options.batch) : options.batch;

      // Create a new object and include only defined properties
      const resultBatch = {};
      if (parsedBatch.number !== undefined) {
        resultBatch.number = parsedBatch.number;
      }
      if (parsedBatch.status !== undefined) {
        resultBatch.status = parsedBatch.status;
      }

      // Return resultBatch only if it has properties, otherwise return undefined
      return Object.keys(resultBatch).length > 0 ? resultBatch : undefined;
    })(),
  };

  console.log("in here", transformedObject);

  console.log("/sign-message", messageId);
  res.status(200).send(await getSignMessageForId(messageId, transformedObject));
});

// If nothing processed the request, return 404
app.use((req, res) => {
  console.log(`Request to ${req.path} resulted in 404`);
  res.status(404).json({ error: "not found" });
});

const PORT = process.env.PORT || 49832;

if (process.env.NODE_ENV !== "test") {
  if (fs.existsSync("server.key") && fs.existsSync("server.cert")) {
    https
      .createServer(
        {
          key: fs.readFileSync("server.key"),
          cert: fs.readFileSync("server.cert"),
        },
        app,
      )
      .listen(PORT, () => {
        console.log(`HTTPS Listening: ${PORT}`);
      });
  } else {
    const server = app.listen(PORT, () => {
      console.log("HTTP Listening on port:", server.address().port);
    });
  }
}

module.exports = app; // INFO: needed for testing
