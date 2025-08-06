import { TransactionRequest } from "@ethersproject/abstract-provider";
import { providers } from "ethers";
import { Base } from "./Base";
export declare class Kahiru extends Base {
    private _sender;
    private _recipient;
    private _KahiruStakingContract;
    private _KahiruNFTContract;
    constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string);
    description(): Promise<string>;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
}
