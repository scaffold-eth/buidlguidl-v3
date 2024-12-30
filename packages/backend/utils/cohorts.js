require("dotenv").config();
const ethers = require("ethers");
const db = require("../services/db/db");

const COHORT_STREAM_ABI = require("../abi/CohortStream.json");

/**
 * Retrieve a list of withdraw/addBuilder/UpdateBuilder events + data for the given cohort
 *
 * @param provider A connected ethersjs provider
 * @param cohort cohort info for which events will be received
 * @param fromBlock Begin searching from this block number
 * @param toBlock Search up to this block number
 * @return {Promise<{balance: string, streamAddress, events: {type: string, payload: object}[]}>}
 */
const getCohortStreamData = async (provider, cohort, fromBlock = 0, toBlock) => {
  try {
    const cohortStreamAddress = cohort.id;
    const cohortContract = new ethers.Contract(cohortStreamAddress, COHORT_STREAM_ABI, provider);

    // Events
    // Withdraw
    const withdrawFilter = cohortContract.filters.Withdraw();
    withdrawFilter.fromBlock = fromBlock;
    withdrawFilter.toBlock = toBlock;
    const withdrawLogs = await provider.getLogs(withdrawFilter);

    const withdrawEvents = await Promise.all(
      withdrawLogs.map(async log => {
        const data = cohortContract.interface.parseLog(log);
        const block = await provider.getBlock(log.blockNumber);
        return {
          type: "cohort.withdraw",
          timestamp: block.timestamp * 1000,
          payload: {
            userAddress: data.args.to,
            amount: ethers.utils.formatEther(data.args.amount),
            reason: data.args.reason,
            block: log.blockNumber,
            tx: log.transactionHash,
            streamAddress: cohortStreamAddress,
            cohortName: cohort.name,
          },
        };
      }),
    );

    // AddBuilder
    const addBuilderFilter = cohortContract.filters.AddBuilder();
    addBuilderFilter.fromBlock = fromBlock;
    addBuilderFilter.toBlock = toBlock;
    const addBuilderLogs = await provider.getLogs(addBuilderFilter);

    const newBuilders = await Promise.all(
      addBuilderLogs.map(async log => {
        const data = cohortContract.interface.parseLog(log);
        const block = await provider.getBlock(log.blockNumber);
        return {
          userAddress: data.args.to,
          timestamp: block.timestamp * 1000,
          amount: ethers.utils.formatEther(data.args.amount),
        };
      }),
    );

    // UpdateBuilder
    const updateBuilderFilter = cohortContract.filters.UpdateBuilder();
    updateBuilderFilter.fromBlock = fromBlock;
    updateBuilderFilter.toBlock = toBlock;
    const updateBuilderLogs = await provider.getLogs(updateBuilderFilter);

    const updatedBuilders = await Promise.all(
      updateBuilderLogs.map(async log => {
        const data = cohortContract.interface.parseLog(log);
        const block = await provider.getBlock(log.blockNumber);
        return {
          userAddress: data.args.to,
          timestamp: block.timestamp * 1000,
          amount: ethers.utils.formatEther(data.args.amount),
        };
      }),
    );

    return {
      cohortStreamAddress,
      lastBlock: toBlock,
      balance: ethers.utils.formatEther(await provider.getBalance(cohortStreamAddress)),
      withdrawEvents,
      newBuilders,
      updatedBuilders,
    };
  } catch (error) {
    console.error(`Error fetching cohort stream data for ${cohort.name}:`, error);
    throw error;
  }
};

const updateCohorts = async () => {
  const mainnetProvider = new ethers.providers.StaticJsonRpcProvider(process.env.RPC_URL);
  const optimismProvider = new ethers.providers.StaticJsonRpcProvider(process.env.OP_RPC_URL);
  const currentBlockMainnet = await mainnetProvider.getBlockNumber();
  const currentBlockOp = await optimismProvider.getBlockNumber();
  const cohorts = await db.findAllCohorts();
  let updated = 0;

  const updates = cohorts.map(async cohort => {
    const fromBlock = cohort.lastIndexedBlock ?? 0;
    const provider = cohort.chainId === 1 ? mainnetProvider : optimismProvider;
    const currentBlock = cohort.chainId === 1 ? currentBlockMainnet : currentBlockOp;

    console.log("Checking cohort", cohort.name, cohort.id, fromBlock, currentBlock);
    return [await getCohortStreamData(provider, cohort, fromBlock + 1, currentBlock), cohort];
  });

  return Promise.allSettled(updates)
    .then(async results => {
      await Promise.all(
        results.map(async (result) => {
          if (result.status === 'fulfilled') {
            console.log("Updating cohort", result.value[1].name, JSON.stringify(result.value[0]));
            const [cohortUpdate, cohort] = result.value;
            await db.updateCohortData(cohort, cohortUpdate);
            updated += 1;
          } else {
            console.error('Error updating cohort:', result.reason);
          }
        })
      );
      return updated;
    })
    .catch(e => {
      console.error("Error found when updating Cohorts Data", e);
      throw new Error(e);
    });
};

module.exports = {
  getCohortStreamEvents: getCohortStreamData,
  updateCohorts,
};
