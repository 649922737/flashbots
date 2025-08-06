import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
import { providers } from "ethers";
export declare class RSS3 extends Base {
    private _recipient;
    private _RSS3ClaimContract;
    private _RSS3ERC20Contract;
    private _sender;
    constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _RSS3ClaimAddress: string, _RSS3TokenAddress: string);
    description(): Promise<string>;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
}
