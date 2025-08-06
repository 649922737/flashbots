import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
import { providers } from "ethers";
export declare class FORT extends Base {
    private _recipient;
    private _FORTClaimContract;
    private _FORTERC20Contract;
    private _sender;
    constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _FORTClaimAddress: string, _FORTTokenAddress: string);
    description(): Promise<string>;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
}
