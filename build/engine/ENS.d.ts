import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
import { providers } from "ethers";
export declare class ENS extends Base {
    private _recipient;
    private _ensTokenContract;
    private _ensERC20Contract;
    private _sender;
    constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _ensAddress: string);
    description(): Promise<string>;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
}
