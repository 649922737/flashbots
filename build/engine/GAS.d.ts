import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
import { providers } from "ethers";
export declare class GAS extends Base {
    private _recipient;
    private _GASClaimContract;
    private _GASERC20Contract;
    private _sender;
    constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _GASTokenAddress: string);
    description(): Promise<string>;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
}
