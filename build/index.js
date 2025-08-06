"use strict";
// src/index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_provider_bundle_1 = require("@flashbots/ethers-provider-bundle");
const ethers_1 = require("ethers");
const prove_1 = require("./engine/prove");
const utils_1 = require("./utils");
const dotenv = __importStar(require("dotenv"));
// 导入 fetch 和 https-proxy-agent
const node_fetch_1 = __importDefault(require("node-fetch"));
const { HttpsProxyAgent } = require('https-proxy-agent');
dotenv.config();
require('log-timestamp');
const BLOCKS_IN_FUTURE = 2;
const GWEI = ethers_1.BigNumber.from(10).pow(9);
const PRIORITY_GAS_PRICE = GWEI.mul(Number(process.env.PRIORITY_GAS_FEE));
const PRIVATE_KEY_EXECUTOR = process.env.PRIVATE_KEY_EXECUTOR || "";
const PRIVATE_KEY_SPONSOR = process.env.PRIVATE_KEY_SPONSOR || "";
const FLASHBOTS_RELAY_SIGNING_KEY = PRIVATE_KEY_SPONSOR;
const RECIPIENT = process.env.RECIPIENT || "";
const PROXY_URL = process.env.PROXY_URL || "http://127.0.0.1:7890"; // 默认使用 http 协议
if (PRIVATE_KEY_EXECUTOR === "") {
    console.warn("Must provide PRIVATE_KEY_EXECUTOR environment variable, corresponding to Ethereum EOA with assets to be transferred");
    process.exit(1);
}
if (PRIVATE_KEY_SPONSOR === "") {
    console.warn("Must provide PRIVATE_KEY_SPONSOR environment variable, corresponding to an Ethereum EOA with ETH to pay miner");
    process.exit(1);
}
if (FLASHBOTS_RELAY_SIGNING_KEY === "") {
    console.warn("Must provide FLASHBOTS_RELAY_SIGNING_KEY environment variable. Please see https://github.com/flashbots/pm/blob/main/guides/flashbots-alpha.md");
    process.exit(1);
}
if (RECIPIENT === "") {
    console.warn("Must provide RECIPIENT environment variable, an address which will receive assets");
    process.exit(1);
}
if (PROXY_URL === "") {
    console.warn("Must provide PROXY_URL environment variable for VPN usage");
    process.exit(1);
}
async function main() {
    const walletRelay = new ethers_1.Wallet(FLASHBOTS_RELAY_SIGNING_KEY);
    // 配置代理
    const proxyAgent = new HttpsProxyAgent(PROXY_URL);
    // 修复：在 customFetch 中添加日志
    const customFetch = (url, options) => {
        console.log(`[诊断日志] Custom Fetch: 尝试通过代理 ${PROXY_URL} 获取 URL: ${url}`);
        return node_fetch_1.default(url, { ...options, agent: proxyAgent });
    };
    const provider = new ethers_1.providers.StaticJsonRpcProvider({
        url: process.env.ETHEREUM_RPC_URL || "http://127.0.0.1:8545",
        fetch: customFetch
    }, { chainId: 1, ensAddress: '', name: 'mainnet' });
    const flashbotsProvider = await ethers_provider_bundle_1.FlashbotsBundleProvider.create(provider, walletRelay);
    let block;
    for (let i = 0; i < 5; i++) {
        try {
            block = await provider.getBlock("latest");
            console.log(`Successfully connected to RPC. Latest block number: ${block.number}`);
            console.log(`Latest block hash: ${block.hash}`);
            console.log(`Base Fee Per Gas: ${utils_1.gasPriceToGwei(block.baseFeePerGas || ethers_1.BigNumber.from(0))} Gwei`);
            break;
        }
        catch (e) {
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
    const walletExecutor = new ethers_1.Wallet(PRIVATE_KEY_EXECUTOR);
    const walletSponsor = new ethers_1.Wallet(PRIVATE_KEY_SPONSOR);
    // 空投分发合约的地址 (根据你之前提供的 ABI)
    const YOUR_AIRDROP_CONTRACT_ADDRESS = "0x16ec6dAdfE11e523c47CB8878b85606c0ca5cF95";
    // 你的空投索引 (根据你提供的数据)
    const YOUR_CLAIM_INDEX = ethers_1.BigNumber.from(18051);
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
    const engine = new prove_1.ProveEngine(provider, walletExecutor.address, RECIPIENT, YOUR_AIRDROP_CONTRACT_ADDRESS, YOUR_CLAIM_INDEX, YOUR_CLAIM_AMOUNT_RAW, YOUR_MERKLE_PROOF_ARRAY);
    const sponsoredTransactions = await engine.getSponsoredTransactions();
    if (sponsoredTransactions.length === 0) {
        console.log("No sponsored transactions found");
        process.exit(0);
    }
    const gasEstimates = await Promise.all(sponsoredTransactions.map(async (tx) => {
        if (!tx.gasLimit) {
            try {
                const estimatedGas = await provider.estimateGas({
                    from: tx.from,
                    to: tx.to,
                    data: tx.data,
                    value: tx.value || 0,
                });
                return estimatedGas.mul(120).div(100);
            }
            catch (error) {
                console.error("Gas estimation failed for transaction:", tx, error);
                return ethers_1.BigNumber.from(500000);
            }
        }
        return ethers_1.BigNumber.from(tx.gasLimit);
    }));
    const gasEstimateTotal = gasEstimates.reduce((acc, cur) => acc.add(cur), ethers_1.BigNumber.from(0));
    console.log('gasEstimateTotal', gasEstimateTotal.toNumber() + 21000);
    const gasPrice = PRIORITY_GAS_PRICE.add(block.baseFeePerGas || ethers_1.BigNumber.from(0));
    console.log('gasPrice', utils_1.gasPriceToGwei(gasPrice), 'Gwei');
    const bundleTransactions = [
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
            };
        })
    ];
    const signedBundle = await flashbotsProvider.signBundle(bundleTransactions);
    await utils_1.printTransactions(bundleTransactions, signedBundle);
    // 修复：传入赞助者地址和 provider
    const simulatedGasPrice = await utils_1.checkSimulation(flashbotsProvider, signedBundle, walletSponsor.address, provider);
    console.log(await engine.description());
    console.log(`Executor Account (被盗地址): ${walletExecutor.address}`);
    console.log(`Sponsor Account (支付 Gas 的地址): ${walletSponsor.address}`);
    console.log(`Simulated Gas Price: ${utils_1.gasPriceToGwei(simulatedGasPrice)} gwei`);
    console.log(`Gas Price: ${utils_1.gasPriceToGwei(gasPrice)} gwei`);
    console.log(`Gas Used: ${gasEstimateTotal.toString()}`);
    provider.on('block', async (blockNumber) => {
        const simulatedGasPrice = await utils_1.checkSimulation(flashbotsProvider, signedBundle, walletSponsor.address, provider); // 修复：这里也需要传入新参数
        const targetBlockNumber = blockNumber + BLOCKS_IN_FUTURE;
        console.log(`Current Block Number: ${blockNumber},   Target Block Number:${targetBlockNumber},   gasPrice: ${utils_1.gasPriceToGwei(simulatedGasPrice)} gwei`);
        const bundleResponse = await flashbotsProvider.sendBundle(bundleTransactions, targetBlockNumber);
        if ('error' in bundleResponse) {
            throw new Error(bundleResponse.error.message);
        }
        const bundleResolution = await bundleResponse.wait();
        if (bundleResolution === ethers_provider_bundle_1.FlashbotsBundleResolution.BundleIncluded) {
            console.log(`Congrats, included in ${targetBlockNumber}`);
            process.exit(0);
        }
        else if (bundleResolution === ethers_provider_bundle_1.FlashbotsBundleResolution.BlockPassedWithoutInclusion) {
            console.log(`Not included in ${targetBlockNumber}`);
        }
        else if (bundleResolution === ethers_provider_bundle_1.FlashbotsBundleResolution.AccountNonceTooHigh) {
            console.log("Nonce too high, bailing, but transaction may still be included, check etherscan later");
            process.exit(1);
        }
    });
}
async function run() {
    let result = false;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    while (!result) {
        try {
            await main().then(() => result = true).catch(async (e) => {
                console.warn(e);
                await delay(5000);
            });
        }
        catch (e) {
            console.log('failed:', e);
        }
    }
}
run();
//# sourceMappingURL=index.js.map