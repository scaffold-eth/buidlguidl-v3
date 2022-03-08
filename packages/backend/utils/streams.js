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
  const lastContract = Number(ethers.utils.formatUnits(await streamContract.last(), 0));
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
        timestamp: block.timestamp * 1000,
        payload: {
          userAddress: data.args.to,
          amount: ethers.utils.formatEther(data.args.amount),
          reason: data.args.reason,
          block: log.blockNumber,
          tx: log.transactionHash,
          streamAddress,
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
        timestamp: block.timestamp * 1000,
        payload: {
          userAddress: data.args.from,
          amount: ethers.utils.formatEther(data.args.amount),
          reason: data.args.reason,
          block: log.blockNumber,
          tx: log.transactionHash,
          streamAddress,
        },
      };
    }),
  );

  return {
    streamAddress,
    lastContract,
    lastBlock: toBlock,
    balance: ethers.utils.formatEther(await provider.getBalance(streamAddress)),
    events: [...withdrawEvents, ...depositEvents],
  };
};

module.exports = {
  getStreamEvents,
};
