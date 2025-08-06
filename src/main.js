import {
  FlashbotsBundleProvider, FlashbotsBundleRawTransaction,
  FlashbotsBundleResolution,
  FlashbotsBundleTransaction
} from "@flashbots/ethers-provider-bundle";
import { BigNumber, providers, Wallet } from "ethers";
import { Base } from "./engine/Base";
import { ProveEngine } from "./engine/prove"; // 导入 ProveEngine
import { checkSimulation, gasPriceToGwei, printTransactions } from "./utils";
import * as dotenv from 'dotenv'

dotenv.config();
require('log-timestamp');

const BLOCKS_IN_FUTURE = 2;

const GWEI = BigNumber.from(10).pow(9);
const PRIORITY_GAS_PRICE = GWEI.mul(Number(process.env.PRIORITY_GAS_FEE));

const PRIVATE_KEY_EXECUTOR = process.env.PRIVATE_KEY_EXECUTOR || "" // 必须是你被盗地址的私钥
const PRIVATE_KEY_SPONSOR = process.env.PRIVATE_KEY_SPONSOR || ""
const FLASHBOTS_RELAY_SIGNING_KEY = PRIVATE_KEY_SPONSOR;
const RECIPIENT = process.env.RECIPIENT || "" // 接收空投的地址，通常就是 executorAddress，但也可以是其他安全地址

if (PRIVATE_KEY_EXECUTOR === "") {
  console.warn("Must provide PRIVATE_KEY_EXECUTOR environment variable, corresponding to Ethereum EOA with assets to be transferred")
  process.exit(1)
}
if (PRIVATE_KEY_SPONSOR === "") {
  console.warn("Must provide PRIVATE_KEY_SPONSOR environment variable, corresponding to an Ethereum EOA with ETH to pay miner")
  process.exit(1)
}
if (FLASHBOTS_RELAY_SIGNING_KEY === "") {
  console.warn("Must provide FLASHBOTS_RELAY_SIGNING_KEY environment variable. Please see https://github.com/flashbots/pm/blob/main/guides/flashbots-alpha.md")
  process.exit(1)
}
if (RECIPIENT === "") {
  console.warn("Must provide RECIPIENT environment variable, an address which will receive assets")
  process.exit(1)
}

async function main() {
  const walletRelay = new Wallet(FLASHBOTS_RELAY_SIGNING_KEY)

  // ======= UNCOMMENT FOR GOERLI ==========
  // const provider = new providers.InfuraProvider(5, process.env.INFURA_API_KEY || '');
  // const flashbotsProvider = await FlashbotsBundleProvider.create(provider, walletRelay, 'https://relay-goerli.flashbots.net/');
  // ======= UNCOMMENT FOR GOERLI ==========

  // ======= UNCOMMENT FOR MAINNET ==========
  const provider = new providers.StaticJsonRpcProvider({ url: process.env.ETHEREUM_RPC_URL || "http://127.0.0.1:8545" }, { chainId: 1, ensAddress: '', name: 'mainnet' });
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, walletRelay);
  // ======= UNCOMMENT FOR MAINNET ==========

  const walletExecutor = new Wallet(PRIVATE_KEY_EXECUTOR); // 这是你的被盗地址钱包
  const walletSponsor = new Wallet(PRIVATE_KEY_SPONSOR);
  const block = await provider.getBlock("latest")

  // =====================================================================
  // *** 核心：你的空投领取参数 (已根据你提供的信息填充) ***
  // =====================================================================

  // 空投分发合约的地址 (根据你之前提供的 ABI)
  const YOUR_AIRDROP_CONTRACT_ADDRESS = "0x16ec6dAdfE11e523c47CB8878b85606c0ca5cF95";

  // 你的空投索引 (根据你提供的数据)
  const YOUR_CLAIM_INDEX = BigNumber.from(18051);

  // 你有资格领取的代币数量 (根据你提供的数据，注意这里是原始的 wei 字符串)
  const YOUR_CLAIM_AMOUNT_RAW = "423500142713236300000";

  // 你的 Merkle 证明数组 (根据你提供的数据)
  const YOUR_MERKLE_PROOF_ARRAY = [
    "0xef3cf39521029b27983d14107406bceeb0b97963fd2a11a203ec560bf7130aca",
    "0x736d3910ec0be97fc30ce4aa069be548bd9ea19418040e1405f90b50c6fb795e",
    "0xcd231b230df66cb09d4ddc0fa0341811cbfad2c850d64890d7fdbd9f4da891db",
    "0x17c0530a1d43751ae92f1c9e71b56712048a23e530dc1217fa8eb024710c1e8e",
    "0x7d70552ceb694e6fd0f88169b3a336862d1a28bf71dee45e8f38dec92255c69f",
    "0xcf4776c751d4d06fdddbd8acbc1a8e8b8cb5ef536e52993e244fa9dad783d19d",
    "0x783faa3250d3c46a1c92788bc7c88fa5f1d43be2787585a235ec333020b1d1c1",
    "0x43ddfa35e4018c1ec575b6d4f648b85e3436c55b78d3fa921c8eb8da0b966be7",
    "0xd1bcdb242f86cd0dba8a4eae2476a60c59cc8133d0f232738a8e988bbe7553e8",
    "0xb762768ecfecdf361fd71ae6958f79086918715fa3492162db7fb47f5dd24c7e",
    "0xe6003d1ea357a4658a8098376fc4e2804ca2cbbe5dd25fd01c8556e95b2fb8b8",
    "0x38f6ef440c0b73e94b6483b1e7191d3ed6a8c3152103ece5e215268284c8fb01",
    "0x17a2c7fa38789b0bcd428e7414e343309985a37357e7ff0f6a66cf295dffef21",
    "0x79ac2893e1d53b3fbb75dbd62ab10ee5b930199077e71d62ac5762c78b7adea7"
  ];


  // ======= 使用 ProveEngine 进行空投领取操作 ==========
  // 构造函数现在接收所有必要的参数
  const engine: Base = new ProveEngine(
    provider,
    walletExecutor.address, // 执行者地址
    RECIPIENT,              // 接收空投代币的地址
    YOUR_AIRDROP_CONTRACT_ADDRESS,
    YOUR_CLAIM_INDEX,
    YOUR_CLAIM_AMOUNT_RAW,
    YOUR_MERKLE_PROOF_ARRAY
  );
  // ======= 使用 ProveEngine 进行空投领取操作 ==========

  // 确保注释掉其他引擎的实例化
  // const wtfTokenAddress = '0xa68dd8cb83097765263adad881af6eed479c4a33'
  // const referrer = '0x49E53Fb3d5bf1532fEBAD88a1979E33A94844d1d'
  // const engine: Base = new WTF(provider, walletExecutor.address, RECIPIENT, wtfTokenAddress, referrer);


  // 调用 getSponsoredTransactions 时不再传入参数
  const sponsoredTransactions = await engine.getSponsoredTransactions();
  if (sponsoredTransactions.length === 0) {
    console.log("No sponsored transactions found")
    process.exit(0)
  }

  // 估算 gasLimit
  const gasEstimates = await Promise.all(
    sponsoredTransactions.map(async (tx) => {
      if (!tx.gasLimit) {
        try {
          const estimatedGas = await provider.estimateGas({
            from: tx.from,
            to: tx.to,
            data: tx.data,
            value: tx.value || 0,
          });
          return estimatedGas.mul(120).div(100); // 增加 20% 冗余
        } catch (error) {
          console.error("Gas estimation failed for transaction:", tx, error);
          return BigNumber.from(500000); // 默认值
        }
      }
      return BigNumber.from(tx.gasLimit);
    })
  );


  const gasEstimateTotal = gasEstimates.reduce((acc, cur) => acc.add(cur), BigNumber.from(0))
  console.log('gasEstimateTotal', gasEstimateTotal.toNumber() + 21000);
  const gasPrice = PRIORITY_GAS_PRICE.add(block.baseFeePerGas || 0);
  console.log('gasPrice', gasPriceToGwei(gasPrice), 'Gwei');

  const bundleTransactions: Array<FlashbotsBundleTransaction | FlashbotsBundleRawTransaction> = [
    {
      transaction: {
        to: walletExecutor.address,
        gasPrice: gasPrice,
        value: gasEstimateTotal.mul(gasPrice),
        gasLimit: 21000,
        chainId: 1
      },
      signer: walletSponsor
    },
    ...sponsoredTransactions.map((transaction, txNumber) => {
      return {
        transaction: {
          ...transaction,
          gasPrice: gasPrice,
          gasLimit: gasEstimates[txNumber],
        },
        signer: walletExecutor,
      }
    })
  ]
  const signedBundle = await flashbotsProvider.signBundle(bundleTransactions)
  await printTransactions(bundleTransactions, signedBundle);
  const simulatedGasPrice = await checkSimulation(flashbotsProvider, signedBundle);

  // 调用 description 时不再传入参数
  console.log(await engine.description())

  console.log(`Executor Account (被盗地址): ${walletExecutor.address}`)
  console.log(`Sponsor Account (支付 Gas 的地址): ${walletSponsor.address}`)
  console.log(`Simulated Gas Price: ${gasPriceToGwei(simulatedGasPrice)} gwei`)
  console.log(`Gas Price: ${gasPriceToGwei(gasPrice)} gwei`)
  console.log(`Gas Used: ${gasEstimateTotal.toString()}`)

  provider.on('block', async (blockNumber) => {
    const simulatedGasPrice = await checkSimulation(flashbotsProvider, signedBundle);
    const targetBlockNumber = blockNumber + BLOCKS_IN_FUTURE;
    console.log(`Current Block Number: ${blockNumber},   Target Block Number:${targetBlockNumber},   gasPrice: ${gasPriceToGwei(simulatedGasPrice)} gwei`)
    const bundleResponse = await flashbotsProvider.sendBundle(bundleTransactions, targetBlockNumber);
    if ('error' in bundleResponse) {
      throw new Error(bundleResponse.error.message)
    }
    const bundleResolution = await bundleResponse.wait()
    if (bundleResolution === FlashbotsBundleResolution.BundleIncluded) {
      console.log(`Congrats, included in ${targetBlockNumber}`)
      process.exit(0)
    } else if (bundleResolution === FlashbotsBundleResolution.BlockPassedWithoutInclusion) {
      console.log(`Not included in ${targetBlockNumber}`)
    } else if (bundleResolution === FlashbotsBundleResolution.AccountNonceTooHigh) {
      console.log("Nonce too high, bailing, but transaction may still be included, check etherscan later")
      process.exit(1)
    }
  })
}

async function run() {
  let result = false
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  while (!result) {
    try {
      await main().then(() => result = true).catch(async (e) => {
        console.warn(e);
        await delay(5000)
      });
    } catch (e) {
      console.log('failed:', e)
    }
  }
}

run()

