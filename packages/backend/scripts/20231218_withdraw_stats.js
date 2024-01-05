/**
 * Generates a CSV with yearly withdraw stats.
 */

const fs = require("fs");
const db = require("../services/db/db");
// Need a JS object (key = date (MM/DD/YYYY), value = ETH/USD Price
const { ethUsdPriceData } = require("./data/ethUsdPriceData2023");

const exportFilepath = "./2023withdraws.csv";

const main = async () => {
  const allUsers = await db.findAllUsers();
  const allUsersIndexed = allUsers.reduce((finalObject, user) => {
    return {
      ...finalObject,
      [user.id]: user,
    };
  }, {});

  const epochStart2023 = 1672578000000;
  const epochFinish2023 = 1704114000000;
  const withdrawEvents = await db.findEventsWhere({ conditions: { type: "stream.withdraw" } });
  const withdrawCohortsEvents = await db.findEventsWhere({ conditions: { type: "cohort.withdraw" } });

  // Append the withdrawCohortsEvents to the withdrawEvents array, using concat
  const allEvents = withdrawEvents.concat(withdrawCohortsEvents);
  const events2023 = allEvents.filter(
    withdrawEvent => withdrawEvent.timestamp >= epochStart2023 && withdrawEvent.timestamp <= epochFinish2023,
  );

  fs.writeFileSync(exportFilepath, "ens,userAddress,streamAddress,cohort,date,amountETH,ETHPrice,amountUSD\n");
  events2023.forEach(withdrawEvent => {
    const builderAddress = withdrawEvent.payload.userAddress;
    const date = new Date(withdrawEvent.timestamp).toLocaleDateString("en-US");
    const amount = withdrawEvent.payload.amount;
    const row = [
      // 1. Builder ENS
      allUsersIndexed[builderAddress]?.ens ?? "-",
      // 2. Builder Address
      builderAddress,
      // 3. Stream Address
      withdrawEvent.payload.streamAddress,
      // 4. Cohort
      withdrawEvent.payload.cohortName ?? "-",
      // 5. Withdraw Date
      date,
      // 6. Amount
      amount,
      // 7. ETH Price
      ethUsdPriceData[date],
      // 8. USD Value
      (ethUsdPriceData[date] * amount).toFixed(2),
    ];

    fs.appendFileSync(exportFilepath, row.join(","));
    fs.appendFileSync(exportFilepath, "\n");
  });
};

main();
