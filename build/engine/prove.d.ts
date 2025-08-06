import { providers, BigNumber } from "ethers";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
/**
 * ProveEngine 类，用于生成 Flashbots 交易以调用空投合约的 claim 函数。
 */
export declare class ProveEngine extends Base {
    private airdropContract;
    private tokenDecimals;
    private _provider;
    private _executorAddress;
    private _recipientAddress;
    private _airdropContractAddress;
    private _claimIndex;
    private _claimAmountRaw;
    private _merkleProof;
    constructor(provider: providers.StaticJsonRpcProvider, executorAddress: string, recipientAddress: string, airdropContractAddress: string, claimIndex: BigNumber, claimAmountRaw: string, merkleProof: string[]);
    private initializeTokenDecimals;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
    description(): Promise<string>;
}
