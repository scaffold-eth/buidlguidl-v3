const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");

const router = express.Router();

router.get("/posts", async (req, res) => {
  try {
    const response = await axios.get("https://buidlguidl.substack.com/feed");
    const xml = response.data;
    const parser = new xml2js.Parser();

    parser.parseString(xml, (err, result) => {
      if (err) {
        console.error("Failed to parse blog feed:", err);
        res.status(500).json({ error: "Failed to parse blog feed" });
      } else {
        const posts = result.rss.channel[0].item.map(item => ({
          title: item.title[0],
          description: item.description[0],
          link: item.link[0],
          pubDate: item.pubDate[0],
          imageUrl: item.enclosure ? item.enclosure[0].$.url : null
        }));

        res.status(200).json(posts.slice(0, 3)); // Return the last 3 posts
      }
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
