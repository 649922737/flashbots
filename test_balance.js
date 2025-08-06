// src/checkBalance.ts

import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { BigNumber, providers, Wallet } from "ethers";
import { ConnectionInfo } from "@ethersproject/web";
import * as dotenv from 'dotenv';
import fetch from "node-fetch";
const { HttpsProxyAgent } = require('https-proxy-agent');

dotenv.config();
require('log-timestamp');

const GWEI = BigNumber.from(10).pow(9);
const PROXY_URL = process.env.PROXY_URL || "http://127.0.0.1:7890"; // 默认使用 http 协议
const PRIVATE_KEY_SPONSOR = process.env.PRIVATE_KEY_SPONSOR || "";
const PRIVATE_KEY_EXECUTOR = process.env.PRIVATE_KEY_EXECUTOR || "";
const FLASHBOTS_RELAY_SIGNING_KEY = PRIVATE_KEY_SPONSOR;

if (PRIVATE_KEY_EXECUTOR === "" || PRIVATE_KEY_SPONSOR === "" || FLASHBOTS_RELAY_SIGNING_KEY === "") {
    console.warn("Please set environment variables: PRIVATE_KEY_EXECUTOR, PRIVATE_KEY_SPONSOR, FLASHBOTS_RELAY_SIGNING_KEY");
    process.exit(1);
}

async function main() {
    // 配置代理
    const proxyAgent = new HttpsProxyAgent(PROXY_URL);
    const customFetch = (url: string, options: any) => {
        console.log(`[诊断日志] Custom Fetch: 通过代理 ${PROXY_URL} 请求 URL: ${url}`);
        return fetch(url, { ...options, agent: proxyAgent });
    };

    const provider = new providers.StaticJsonRpcProvider(
        {
            url: process.env.ETHEREUM_RPC_URL || "https://rpc.ankr.com/eth",
            fetch: customFetch
        } as ConnectionInfo,
        { chainId: 1, ensAddress: '', name: 'mainnet' }
    );

    const walletRelay = new Wallet(FLASHBOTS_RELAY_SIGNING_KEY);
    const walletExecutor = new Wallet(PRIVATE_KEY_EXECUTOR);
    const walletSponsor = new Wallet(PRIVATE_KEY_SPONSOR);

    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, walletRelay);

    try {
        const block = await provider.getBlock("latest");
        if (!block) {
            console.error("Failed to get latest block.");
            return;
        }

        console.log(`--- 当前区块信息 ---`);
        console.log(`最新区块号: ${block.number}`);
        console.log(`Base Fee Per Gas: ${block.baseFeePerGas?.div(GWEI).toString()} Gwei`);
        console.log(`Executor 地址: ${walletExecutor.address}`);
        console.log(`Sponsor 地址: ${walletSponsor.address}`);
        console.log(`---------------------`);

        // 获取并打印当前余额
        const executorBalanceBefore = await provider.getBalance(walletExecutor.address);
        console.log(`模拟前 Executor 余额: ${executorBalanceBefore.toString()} wei`);

        // 构造一个简单的模拟交易
        const gasPrice = (block.baseFeePerGas || BigNumber.from(0)).add(BigNumber.from(1).mul(GWEI));
        const fakeTx = {
            transaction: {
                to: walletExecutor.address,
                gasPrice: gasPrice,
                value: BigNumber.from(1), // 发送 1 wei 的小额交易
                gasLimit: 21000,
                chainId: 1
            },
            signer: walletSponsor
        };

        const bundleTransactions = [fakeTx];

        // 签名捆绑包
        const signedBundle = await flashbotsProvider.signBundle(bundleTransactions);

        // 使用 eth_callBundle 进行模拟
        console.log(`\n--- 正在模拟交易... ---`);
        const simulationResult = await flashbotsProvider.simulate(signedBundle, block.number);

        if ('error' in simulationResult) {
            console.error("模拟失败:", simulationResult.error.message);
            return;
        }
        
        // 打印模拟结果
        console.log("模拟成功!");
        console.log(`交易 Gas 使用: ${simulationResult.results[0].gasUsed}`);
        
        // 打印模拟后的余额
        console.log("模拟后的状态:");
        console.log(simulationResult.results);

        // Flashbots 模拟器的 `simulate` 函数不会直接返回模拟后的余额，它会返回一个 `results` 数组，
        // 你需要通过分析 `balanceChanges` 来计算。
        // 为了方便，这里我们直接查询下一个区块的余额（Flashbots 模拟器通常会返回下一个区块状态）。
        const executorBalanceAfter = await provider.getBalance(walletExecutor.address, block.number + 1);
        console.log(`模拟后 Executor 余额 (理论上): ${executorBalanceAfter.toString()} wei`);
        
    } catch (e) {
        console.error("捕获到错误:", e);
    }
}

main();
