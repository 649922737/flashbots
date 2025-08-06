import { FlashbotsBundleProvider, FlashbotsBundleRawTransaction, FlashbotsBundleTransaction } from "@flashbots/ethers-provider-bundle";
import { BigNumber, providers } from "ethers";
export declare const ETHER: BigNumber;
export declare const GWEI: BigNumber;
export declare function gasPriceToGwei(gasPrice: BigNumber): string;
export declare function checkSimulation(flashbotsProvider: FlashbotsBundleProvider, signedBundle: Array<string>, sponsorAddress: string, provider: providers.StaticJsonRpcProvider): Promise<BigNumber>;
export declare function printTransactions(bundleTransactions: Array<FlashbotsBundleTransaction | FlashbotsBundleRawTransaction>, signedBundle: Array<string>): Promise<void>;
