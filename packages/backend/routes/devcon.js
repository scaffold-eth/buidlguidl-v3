const express = require("express");
const { ethers } = require("ethers");
const db = require("../services/db/db");
const { verifySignature } = require("../utils/sign");

const router = express.Router();
const SRE_BACKEND = "https://scaffold-directory-dev.ew.r.appspot.com";

/**
 * Check if a builder is eligible for a Devcon voucher based on their status and creation date
 * Eligibility criteria:
 * 1. BG batch members created before end of August 2024 (type: batch)
 * 2. BG member created before end of August 2024 (type: builder)
 * 3. SRE builders with at least 3 challenges completed and joined before end of August 2024 (type: builder)
 */
async function checkEligibility(builderAddress) {
  const END_OF_AUGUST_2024 = 1725148799000;
  const builder = await db.findUserByAddress(builderAddress);

  if (builder?.data?.builderBatch && builder?.data?.creationTimestamp < END_OF_AUGUST_2024) {
    return { isEligible: true, type: "batch" };
  }

  if (builder.exists && builder?.data?.creationTimestamp < END_OF_AUGUST_2024) {
    return { isEligible: true, type: "builder" };
  } else {
    const response = await fetch(`${SRE_BACKEND}/builders/${builderAddress}`);

    if (response.status === 404) {
      return { isEligible: false };
    }

    if (response.status === 200) {
      const data = await response.json();
      const numberOfChallenges = Object.keys(data.challenges).length;
      if (numberOfChallenges >= 3 && data.creationTimestamp < END_OF_AUGUST_2024) {
        return { isEligible: true, type: "builder" };
      }
    }

    return { isEligible: false };
  }
}

router.get("/check-eligibility/:builderAddress", async (req, res) => {
  const builderAddress = req.params.builderAddress;
  console.log(`/check-eligibility/${builderAddress}`);
  const eligibility = await checkEligibility(builderAddress);
  res.status(200).json(eligibility);
});

// Anyone can claim a Devcon voucher (omitting the withAddress middleware), because of SRE claim
router.post("/claim", async (req, res) => {
  const neededBodyProps = ["builderAddress", "signature"];
  if (neededBodyProps.some(prop => req.body[prop] === undefined)) {
    res.status(400).send(`Missing required body property. Required: ${neededBodyProps.join(", ")}`);
    return;
  }

  const { builderAddress, signature } = req.body;
  console.log("POST /devcon/claim", builderAddress);

  if (!ethers.utils.isAddress(builderAddress)) {
    res.status(400).send("Invalid address");
    return;
  }

  const verifyOptions = {
    messageId: "devconVoucherClaim",
    address: builderAddress,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const eligibility = await checkEligibility(builderAddress);

  if (!eligibility.isEligible) {
    res.status(400).send("Not eligible for claiming a Devcon voucher");
    return;
  }

  try {
    const voucherData = await db.createOrGetDevconVoucherForBuilder(builderAddress, eligibility.type);
    res.status(200).json({ voucherData });
  } catch (error) {
    res.status(500).send(`Error: ${error?.message}`);
  }
});

module.exports = router;
