import { ethers } from "ethers";
interface IEntry {
    past_tokens: ethers.BigNumber;
    future_tokens: ethers.BigNumber;
    longest_owned_name: string;
    last_expiring_name: string;
    balance: ethers.BigNumber;
    has_reverse_record: boolean;
}
interface ITree {
    index: number;
    amount: string;
    proof: string[];
    flags: {
        isSOCKS: boolean;
        isLP: boolean;
        isUser: boolean;
    };
}
declare class ShardedMerkleTree {
    private fetcher;
    private shardNybbles;
    root: string;
    private total;
    private shards;
    private trees;
    constructor(fetcher: any, shardNybbles: number, root: string, total: ethers.BigNumber);
    getProof(address: string): [IEntry | undefined, string[]];
    static fromFiles(directory: string): ShardedMerkleTree;
    static getProofParaswap(directory: string, address: string): [string, ITree];
}
export default ShardedMerkleTree;
