import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
import { providers } from "ethers";
export declare class WTF extends Base {
    private _recipient;
    private _WTFClaimContract;
    private _sender;
    private _referrer;
    constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _WTFTokenAddress: string, referrer: string);
    description(): Promise<string>;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
}
