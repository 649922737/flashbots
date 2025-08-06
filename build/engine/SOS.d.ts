import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
import { providers } from "ethers";
export declare class SOS extends Base {
    private _recipient;
    private _sosClaimContract;
    private _sosERC20Contract;
    private _sender;
    constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _sosTokenAddress: string);
    description(): Promise<string>;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
}
