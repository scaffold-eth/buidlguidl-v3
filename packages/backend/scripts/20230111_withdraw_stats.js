/**
 * Generates a CSV with yearly withdraw stats.
 */

const fs = require("fs");
const db = require("../services/db/db");
// Need a JS object (key = date (MM/DD/YYYY), value = ETH/USD Price
const { ethUsdPriceData } = require("./data/ethUsdPriceData2022");

const exportFilepath = "./2022withdraws.csv";

const main = async () => {
  const allUsers = await db.findAllUsers();
  const allUsersIndexed = allUsers.reduce((finalObject, user) => {
    return {
      ...finalObject,
      [user.id]: user,
    };
  }, {});

  const epochStart2022 = 1641042000000;
  const epochFinish2022 = 1672578000000;
  const withdrawEvents = await db.findEventsWhere({ conditions: { type: "stream.withdraw" } });

  const events2022 = withdrawEvents.filter(
    withdrawEvent => withdrawEvent.timestamp >= epochStart2022 && withdrawEvent.timestamp <= epochFinish2022,
  );

  fs.writeFileSync(exportFilepath, "ens,userAddress,streamAddress,date,amountETH,ETHPrice,amountUSD\n");
  events2022.forEach(withdrawEvent => {
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
      // 4. Withdraw Date
      date,
      // 5. Amount
      amount,
      // 6. ETH Price
      ethUsdPriceData[date],
      // 6. USD Value
      (ethUsdPriceData[date] * amount).toFixed(2),
    ];

    fs.appendFileSync(exportFilepath, row.join(","));
    fs.appendFileSync(exportFilepath, "\n");
  });
};

main();
