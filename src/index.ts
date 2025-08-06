// src/index.ts

import {
  FlashbotsBundleProvider, FlashbotsBundleRawTransaction,
  FlashbotsBundleResolution,
  FlashbotsBundleTransaction
} from "@flashbots/ethers-provider-bundle";
import { BigNumber, providers, Wallet, utils } from "ethers";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { ConnectionInfo } from "@ethersproject/web";
import { Base } from "./engine/Base";
import { ProveEngine } from "./engine/prove";
import { checkSimulation, gasPriceToGwei, printTransactions } from "./utils";
import * as dotenv from 'dotenv'

import fetch from "node-fetch";
const { HttpsProxyAgent } = require('https-proxy-agent');

dotenv.config();
require('log-timestamp');

const BLOCKS_IN_FUTURE = 2;

const GWEI = BigNumber.from(10).pow(9);
const PRIORITY_GAS_PRICE = GWEI.mul(Number(process.env.PRIORITY_GAS_FEE));

const PRIVATE_KEY_EXECUTOR = process.env.PRIVATE_KEY_EXECUTOR || ""
const PRIVATE_KEY_SPONSOR = process.env.PRIVATE_KEY_SPONSOR || ""
const FLASHBOTS_RELAY_SIGNING_KEY = PRIVATE_KEY_SPONSOR;
const RECIPIENT = process.env.RECIPIENT || ""
const PROXY_URL = process.env.PROXY_URL || "http://127.0.0.1:7890";


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
if (PROXY_URL === "") {
  console.warn("Must provide PROXY_URL environment variable for VPN usage")
  process.exit(1)
}

async function main() {
  const walletRelay = new Wallet(FLASHBOTS_RELAY_SIGNING_KEY)

  const proxyAgent = new HttpsProxyAgent(PROXY_URL);
  const customFetch = (url: string, options: any) => {
    console.log(`[诊断日志] Custom Fetch: 尝试通过代理 ${PROXY_URL} 获取 URL: ${url}`);
    return fetch(url, { ...options, agent: proxyAgent });
  };

  const provider = new providers.StaticJsonRpcProvider(
    {
      url: process.env.ETHEREUM_RPC_URL || "http://127.00.0.1:8545",
      fetch: customFetch
    } as ConnectionInfo,
    { chainId: 1, ensAddress: '', name: 'mainnet' }
  );

  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, walletRelay);

  let block;
  for (let i = 0; i < 5; i++) {
    try {
      block = await provider.getBlock("latest");
      console.log(`Successfully connected to RPC. Latest block number: ${block.number}`);
      console.log(`Latest block hash: ${block.hash}`);
      console.log(`Base Fee Per Gas: ${gasPriceToGwei(block.baseFeePerGas || BigNumber.from(0))} Gwei`);
      break;
    } catch (e) {
      console.error(`Failed to get block info, attempt ${i + 1}/5:`, e);
      if (i === 4) {
        console.error("Failed to get block info after multiple retries. Exiting.");
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!block) {
    return;
  }

  const walletExecutor = new Wallet(PRIVATE_KEY_EXECUTOR);
  const walletSponsor = new Wallet(PRIVATE_KEY_SPONSOR);

  const executorNonce = await provider.getTransactionCount(walletExecutor.address);
  const sponsorNonce = await provider.getTransactionCount(walletSponsor.address);
  
  console.log(`Executor Account Nonce: ${executorNonce}`);
  console.log(`Sponsor Account Nonce: ${sponsorNonce}`);

  const YOUR_AIRDROP_CONTRACT_ADDRESS = "0x16ec6dAdfE11e523c47CB8878b85606c0ca5cF95";
  const YOUR_CLAIM_INDEX = BigNumber.from(18051);
  const YOUR_CLAIM_AMOUNT_RAW = "423500142713236300000";
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

  const engine: Base = new ProveEngine(
    provider,
    walletExecutor.address,
    RECIPIENT,
    YOUR_AIRDROP_CONTRACT_ADDRESS,
    YOUR_CLAIM_INDEX,
    YOUR_CLAIM_AMOUNT_RAW,
    YOUR_MERKLE_PROOF_ARRAY
  );

  const sponsoredTransactions = await engine.getSponsoredTransactions();
  if (sponsoredTransactions.length === 0) {
    console.log("No sponsored transactions found")
    process.exit(0)
  }

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
          return estimatedGas.mul(120).div(100);
        } catch (error) {
          console.error("Gas estimation failed for transaction:", tx, error);
          return BigNumber.from(500000);
        }
      }
      return BigNumber.from(tx.gasLimit);
    })
  );

  const gasEstimateTotal = gasEstimates.reduce((acc, cur) => acc.add(cur), BigNumber.from(0))
  console.log('gasEstimateTotal', gasEstimateTotal.toNumber());
  const gasPrice = PRIORITY_GAS_PRICE.add(block.baseFeePerGas || BigNumber.from(0));
  console.log('gasPrice', gasPriceToGwei(gasPrice), 'Gwei');
  const minerTip = gasEstimateTotal.mul(gasPrice);

  const executorTransaction = sponsoredTransactions[0];
  const chainId = (await provider.getNetwork()).chainId;

  const bundleTransactions: Array<FlashbotsBundleTransaction | FlashbotsBundleRawTransaction> = [
    {
      transaction: {
        to: executorTransaction.to,
        from: executorTransaction.from,
        data: executorTransaction.data,
        value: executorTransaction.value || BigNumber.from(0),
        nonce: executorNonce,
        gasLimit: gasEstimates[0],
        chainId: chainId,
        type: 2,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: PRIORITY_GAS_PRICE,
      },
      signer: walletExecutor,
    },
    {
      transaction: {
        to: block.miner,
        value: minerTip,
        nonce: sponsorNonce,
        gasLimit: 21000,
        chainId: chainId,
        type: 2,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: PRIORITY_GAS_PRICE
      },
      signer: walletSponsor
    }
  ];

  const signedBundle = await flashbotsProvider.signBundle(bundleTransactions)
  
  // 关键修复：新增的日志打印 RLP 编码后的交易字符串
  console.log('--- RLP 编码交易字符串 ---');
  signedBundle.forEach((tx, index) => {
    console.log(`Transaction ${index + 1}: ${tx}`);
  });
  console.log('---------------------------');
  
  await printTransactions(bundleTransactions, signedBundle);
  
  const simulatedGasPrice = await checkSimulation(flashbotsProvider, signedBundle, walletSponsor.address, provider);

  console.log(await engine.description());
  console.log(`Executor Account (被盗地址): ${walletExecutor.address}`);
  console.log(`Sponsor Account (支付 Gas 的地址): ${walletSponsor.address}`);
  console.log(`Simulated Gas Price: ${gasPriceToGwei(simulatedGasPrice)} gwei`);
  console.log(`Gas Price: ${gasPriceToGwei(gasPrice)} gwei`);
  console.log(`Gas Used: ${gasEstimateTotal.toString()}`);
  console.log(`Total Miner Tip: ${utils.formatEther(minerTip)} ETH`);

  provider.on('block', async (blockNumber) => {
    const simulatedGasPrice = await checkSimulation(flashbotsProvider, signedBundle, walletSponsor.address, provider);
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

run();
