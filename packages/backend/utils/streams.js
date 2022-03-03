require("dotenv").config();
const ethers = require("ethers");
const fs = require("fs");

const ABI_PATH = "./abi/SimpleStream.json";
const SIMPLE_STREAM_ABI = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));

/**
 * Retrieve a list of deposit/withdraw events for the given `streamAddress`.
 *
 * @param provider A connected ethersjs provider
 * @param streamAddress Stream for which events will be received
 * @param fromBlock Begin searching from this block number
 * @param toBlock Search up to this block number
 * @return {Promise<{balance: string, streamAddress, events: {type: string, payload: object}[]}>}
 */
const getStreamEvents = async (provider, streamAddress, fromBlock, toBlock) => {
  const streamContract = new ethers.Contract(streamAddress, SIMPLE_STREAM_ABI, provider);
  const withdrawFilter = streamContract.filters.Withdraw();
  withdrawFilter.fromBlock = fromBlock;
  withdrawFilter.toBlock = toBlock;
  const withdrawLogs = await provider.getLogs(withdrawFilter);
  const depositFilter = streamContract.filters.Deposit();
  depositFilter.fromBlock = fromBlock;
  depositFilter.toBlock = toBlock;
  const depositLogs = await provider.getLogs(depositFilter);

  const withdrawEvents = await Promise.all(
    withdrawLogs.map(async log => {
      const data = streamContract.interface.parseLog(log);
      const block = await provider.getBlock(log.blockNumber);
      return {
        type: "stream.withdraw",
        timestamp: block.timestamp,
        payload: {
          to: data.args.to,
          amount: ethers.utils.formatEther(data.args.amount),
          reason: data.args.reason,
          block: log.blockNumber,
          tx: log.transactionHash,
        },
      };
    }),
  );
  const depositEvents = await Promise.all(
    depositLogs.map(async log => {
      const data = streamContract.interface.parseLog(log);
      const block = await provider.getBlock(log.blockNumber);
      return {
        type: "stream.deposit",
        timestamp: block.timestamp,
        payload: {
          from: data.args.from,
          amount: ethers.utils.formatEther(data.args.amount),
          reason: data.args.reason,
          block: log.blockNumber,
          tx: log.transactionHash,
        },
      };
    }),
  );

  return {
    streamAddress,
    lastBlock: toBlock,
    balance: ethers.utils.formatEther(await provider.getBalance(streamAddress)),
    events: [...withdrawEvents, ...depositEvents],
  };
};

// const processStreamEvents = async () => {
//   const provider = new ethers.providers.StaticJsonRpcProvider(process.env.RPC_URL);
//   const streams = db.findAllStreams();
//
//   const currentBlock = await provider.getBlockNumber();
//
//   streams.forEach(stream => {
//     getStreamEvents(provider, stream.streamAddress, stream.lastIndexedBlock, currentBlock).then(result => {
//       console.log(JSON.stringify(result, null, 2));
//       console.log(`Stream ${stream.streamAddress} updated to ${currentBlock}`);
//     });
//   });
// };
//


module.exports = {
  getStreamEvents
};
