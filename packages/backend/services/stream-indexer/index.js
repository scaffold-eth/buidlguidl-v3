require("dotenv").config();
const ethers = require("ethers");
const db = require("../db/db");

const SIMPLE_STREAM_ABI = [
  {
    inputs: [
      { internalType: "address payable", name: "_toAddress", type: "address" },
      { internalType: "uint256", name: "_cap", type: "uint256" },
      { internalType: "uint256", name: "_frequency", type: "uint256" },
      { internalType: "bool", name: "_startsFull", type: "bool" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "string", name: "reason", type: "string" },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "string", name: "reason", type: "string" },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "cap",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "frequency",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "last",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "streamBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "reason", type: "string" }],
    name: "streamDeposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "reason", type: "string" },
    ],
    name: "streamWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "toAddress",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

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
        payload: {
          to: data.args.to,
          amount: ethers.utils.formatEther(data.args.amount),
          reason: data.args.reason,
          block: log.blockNumber,
          timestamp: block.timestamp,
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
        payload: {
          from: data.args.from,
          amount: ethers.utils.formatEther(data.args.amount),
          reason: data.args.reason,
          block: log.blockNumber,
          timestamp: block.timestamp,
          tx: log.transactionHash,
        },
      };
    }),
  );

  return {
    streamAddress,
    balance: ethers.utils.formatEther(await provider.getBalance(streamAddress)),
    events: [...withdrawEvents, ...depositEvents],
  };
};

const processStreamEvents = async () => {
  const provider = new ethers.providers.StaticJsonRpcProvider(process.env.RPC_URL);
  const streams = db.findAllStreams();

  const currentBlock = await provider.getBlockNumber();

  streams.forEach(stream => {
    getStreamEvents(provider, stream.streamAddress, stream.lastIndexedBlock, currentBlock).then(result => {
      console.log(JSON.stringify(result, null, 2));
      console.log(`Stream ${stream.streamAddress} updated to ${currentBlock}`);
    });
  });
};

processStreamEvents().then(() => {});
