import { providers, BigNumber } from "ethers";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
export declare class TransferERC721 extends Base {
    private _provider;
    private _executorAddress;
    private _recipientAddress;
    private _tokenAddress;
    private _tokenIds;
    constructor(provider: providers.StaticJsonRpcProvider, executorAddress: string, recipientAddress: string, tokenAddress: string, tokenIds: BigNumber[]);
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
    description(): Promise<string>;
}
