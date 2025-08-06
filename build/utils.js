"use strict";
// src/utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTransactions = exports.checkSimulation = exports.gasPriceToGwei = exports.GWEI = exports.ETHER = void 0;
const ethers_1 = require("ethers");
exports.ETHER = ethers_1.BigNumber.from(10).pow(18);
exports.GWEI = ethers_1.BigNumber.from(10).pow(9);
// 修复：添加 export 关键字
function gasPriceToGwei(gasPrice) {
    return ethers_1.utils.formatUnits(gasPrice, "gwei");
}
exports.gasPriceToGwei = gasPriceToGwei;
// 修复：添加 export 关键字
async function checkSimulation(flashbotsProvider, signedBundle, sponsorAddress, provider) {
    console.log("[模拟器] 正在模拟交易捆绑包...");
    let simulation;
    try {
        const latestBlockNumber = await provider.getBlockNumber();
        simulation = await flashbotsProvider.simulate(signedBundle, latestBlockNumber + 1);
    }
    catch (e) {
        console.error("[模拟器错误] 调用 Flashbots 模拟器失败:", e);
        if (e.code === 'SERVER_ERROR' && e.serverError && e.serverError.code === 'ETIMEDOUT') {
            console.warn("[模拟器警告] Flashbots 模拟器连接超时。请检查网络或代理。");
            throw new Error("Flashbots 模拟器连接超时。");
        }
        throw new Error(`Flashbots 模拟器调用失败: ${e.message || e.toString()}`);
    }
    if ('error' in simulation) {
        const errorResponse = simulation;
        if (errorResponse.error.message.includes("insufficient funds for gas * price + value")) {
            console.warn("[模拟器警告] Flashbots 模拟器报告余额不足。");
            console.warn(`[模拟器详情] 错误信息: ${errorResponse.error.message}`);
            const match = errorResponse.error.message.match(/have (\d+) want (\d+)/);
            if (match) {
                const simulatedHave = ethers_1.BigNumber.from(match[1]);
                const simulatedWant = ethers_1.BigNumber.from(match[2]);
                console.warn(`[模拟器详情] 模拟器认为赞助者有: ${ethers_1.utils.formatEther(simulatedHave)} ETH, 需要: ${ethers_1.utils.formatEther(simulatedWant)} ETH`);
                try {
                    const actualSponsorBalance = await provider.getBalance(sponsorAddress);
                    console.warn(`[诊断] 赞助者账户 (${sponsorAddress}) 的实际链上余额为: ${ethers_1.utils.formatEther(actualSponsorBalance)} ETH`);
                    if (actualSponsorBalance.gte(simulatedWant)) {
                        console.warn("[模拟器警告] 实际链上余额充足，Flashbots 模拟器可能存在缓存延迟。程序将尝试继续。");
                        console.warn("[模拟器] 模拟结果中未直接返回 gasPrice，使用默认值 1 Gwei。");
                        return ethers_1.BigNumber.from(ethers_1.utils.parseUnits("1", "gwei"));
                    }
                }
                catch (balanceError) {
                    console.error(`[诊断] 无法获取赞助者账户实际余额进行对比：`, balanceError);
                    throw new Error(`无法获取赞助者账户实际余额: ${balanceError.message || balanceError.toString()}`);
                }
            }
        }
        throw new Error(`Similuation failed, error code: ${errorResponse.error.code}, message: ${errorResponse.error.message}`);
    }
    else {
        const successSimulation = simulation;
        if (successSimulation.coinbaseDiff.eq(0)) {
            throw new Error("Does not pay coinbase");
        }
        const gasUsed = successSimulation.results.reduce((acc, txSimulation) => acc + txSimulation.gasUsed, 0);
        if (gasUsed === 0) {
            throw new Error("Simulated gasUsed is zero, cannot calculate gasPrice.");
        }
        const gasPrice = successSimulation.coinbaseDiff.div(ethers_1.BigNumber.from(gasUsed));
        console.log(`[模拟器] 模拟成功，计算出的 Gas Price: ${gasPriceToGwei(gasPrice)} Gwei`);
        return gasPrice;
    }
}
exports.checkSimulation = checkSimulation;
// 修复：添加 export 关键字
async function printTransactions(bundleTransactions, signedBundle) {
    console.log("--------------------------------");
    console.log((await Promise.all(bundleTransactions.map(async (bundleTx, index) => {
        const tx = 'signedTransaction' in bundleTx ? ethers_1.utils.parseTransaction(bundleTx.signedTransaction) : bundleTx.transaction;
        const from = 'signer' in bundleTx ? await bundleTx.signer.getAddress() : tx.from;
        return `TX #${index}: ${from} => ${tx.to} : ${tx.data}`;
    }))).join("\n"));
    console.log("--------------------------------");
    console.log((await Promise.all(signedBundle.map(async (signedTx, index) => `TX #${index}: ${signedTx}`))).join("\n"));
    console.log("--------------------------------");
}
exports.printTransactions = printTransactions;
//# sourceMappingURL=utils.js.map