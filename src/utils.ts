// src/utils.ts

import { FlashbotsBundleProvider, FlashbotsBundleRawTransaction, FlashbotsBundleTransaction, SimulationResponse, SimulationResponseSuccess } from "@flashbots/ethers-provider-bundle"; 
import { BigNumber, providers, utils, Wallet } from "ethers";

export const ETHER = BigNumber.from(10).pow(18);
export const GWEI = BigNumber.from(10).pow(9);

export function gasPriceToGwei(gasPrice: BigNumber): string {
  return utils.formatUnits(gasPrice, "gwei");
}

export async function checkSimulation(
  flashbotsProvider: FlashbotsBundleProvider,
  signedBundle: Array<string>,
  sponsorAddress: string,
  provider: providers.StaticJsonRpcProvider
): Promise<BigNumber> {
  console.log("[诊断日志] 正在调用 Flashbots 模拟器...");
  let simulation: SimulationResponse; 
  const latestBlockNumber = await provider.getBlockNumber();
  const targetBlock = latestBlockNumber + 1;
  console.log(`[诊断日志] 模拟目标区块: ${targetBlock}`);

  try {
    simulation = await flashbotsProvider.simulate(signedBundle, targetBlock);
  } catch (e: any) {
    console.error(`[模拟器错误] 调用 Flashbots 模拟器失败:`, e);
    throw new Error(`Flashbots 模拟器调用失败: ${e.message || e.toString()}`);
  }

  if ('error' in simulation) {
    const errorResponse = simulation as { error: { code: number; message: string; } }; 
    
    console.error("[模拟器错误] 模拟失败，原始错误响应:");
    console.error(errorResponse);
    
    console.error(`[模拟器错误] 错误码: ${errorResponse.error.code}`);
    console.error(`[模拟器错误] 错误信息: ${errorResponse.error.message}`);
    
    // 如果模拟器报告余额不足，提供更详细的诊断信息
    if (errorResponse.error.message.includes("insufficient funds for gas * price + value")) {
      const match = errorResponse.error.message.match(/have (\d+) want (\d+)/);
      if (match) {
        const simulatedHave = BigNumber.from(match[1]);
        const simulatedWant = BigNumber.from(match[2]);
        console.error(`[诊断] Flashbots 模拟器报告余额不足。`);
        console.error(`[诊断] 模拟器内部状态: 某个账户有 ${utils.formatEther(simulatedHave)} ETH，但需要 ${utils.formatEther(simulatedWant)} ETH。`);
        
        try {
          const actualSponsorBalance = await provider.getBalance(sponsorAddress);
          console.log(`[诊断] 赞助者账户 (${sponsorAddress}) 的实际链上余额为: ${utils.formatEther(actualSponsorBalance)} ETH`);

          if (actualSponsorBalance.lt(simulatedWant)) {
            console.error(`[诊断结论] 赞助者账户实际余额也低于所需金额。请充值。`);
          } else {
            console.warn(`[诊断结论] 赞助者账户实际余额充足，但模拟器报告余额不足。这可能是 Flashbots 缓存延迟导致。`);
            console.warn(`[诊断建议] 请等待几分钟后重试，或检查代理设置。`);
          }
        } catch (balanceError: any) {
          console.error(`[诊断] 无法获取赞助者账户实际余额进行对比：`, balanceError);
        }
      }
    }
    
    throw new Error(`模拟失败: ${errorResponse.error.message}`);
  } else {
    // 模拟成功的分支
    const successSimulation = simulation as SimulationResponseSuccess;

    if (successSimulation.coinbaseDiff.eq(0)) {
      throw new Error("捆绑包未支付矿工费用 (coinbase)。");
    }

    const gasUsed = successSimulation.results.reduce(
      (acc: number, txSimulation: any) => acc + txSimulation.gasUsed,
      0
    );

    if (gasUsed === 0) {
        throw new Error("模拟的 Gas 使用量为零，无法计算 Gas Price。");
    }

    const gasPrice = successSimulation.coinbaseDiff.div(BigNumber.from(gasUsed));
    console.log(`[模拟器] 模拟成功，计算出的 Gas Price: ${gasPriceToGwei(gasPrice)} Gwei`);
    return gasPrice;
  }
}

export async function printTransactions(
  bundleTransactions: Array<FlashbotsBundleTransaction | FlashbotsBundleRawTransaction>, 
  signedBundle: Array<string>
): Promise<void> {
  console.log("--------------------------------");
  console.log(
    (
      await Promise.all(
        bundleTransactions.map(
          async (bundleTx, index) => {
            const tx = 'signedTransaction' in bundleTx ? utils.parseTransaction(bundleTx.signedTransaction) : bundleTx.transaction
            const from = 'signer' in bundleTx ? await bundleTx.signer.getAddress() : tx.from
            return `TX #${index}: ${from} => ${tx.to} : ${tx.data}`
          })
      )
    ).join("\n")
  );

  console.log("--------------------------------");
  console.log(
    (
      await Promise.all(
        signedBundle.map(async (signedTx, index) => `TX #${index}: ${signedTx}`)
      )
    ).join("\n")
  );

  console.log("--------------------------------");
}
