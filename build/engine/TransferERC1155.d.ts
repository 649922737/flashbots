import { providers } from "ethers";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
export declare class TransferERC1155 extends Base {
    private _sender;
    private _recipient;
    private _tokenContract;
    private _tokenIds;
    private _amounts;
    constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _tokenAddress: string, tokenIds: number[] | string[], amounts: number[]);
    description(): Promise<string>;
    getSponsoredTransactions(): Promise<Array<TransactionRequest>>;
}
