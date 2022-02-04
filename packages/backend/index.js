require("dotenv").config();
const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./services/db");
const { withAddress } = require("./middlewares/auth");
const { getSignMessageForId, verifySignature } = require("./utils/sign");
const { EVENT_TYPES, createEvent } = require("./utils/events");

const buildersRoutes = require("./routes/builders");
const buildsRoutes = require("./routes/builds");
const eventsRoutes = require("./routes/events");

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/builders", buildersRoutes);
app.use("/builds", buildsRoutes);
app.use("/events", eventsRoutes);

app.get("/sign-message", (req, res) => {
  const messageId = req.query.messageId;
  const options = req.query;

  console.log("/sign-message", messageId);
  res.status(200).send(getSignMessageForId(messageId, options));
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
