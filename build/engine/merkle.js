"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const merkletreejs_1 = require("merkletreejs");
const keccak256_1 = __importDefault(require("keccak256"));
const ethers_1 = require("ethers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function hashLeaf([address, entry]) {
    return ethers_1.ethers.utils.solidityKeccak256(['address', 'uint256'], [address, entry.balance]);
}
class ShardedMerkleTree {
    constructor(fetcher, shardNybbles, root, total) {
        this.fetcher = fetcher;
        this.shardNybbles = shardNybbles;
        this.root = root;
        this.total = total;
        this.shards = {};
        this.trees = {};
    }
    getProof(address) {
        const shardid = address.slice(2, 2 + this.shardNybbles).toLowerCase();
        let shard = this.shards[shardid];
        if (shard === undefined) {
            shard = this.shards[shardid] = this.fetcher(shardid);
            const leaves = Object.entries(shard.entries).map(hashLeaf);
            this.trees[shardid] = new merkletreejs_1.MerkleTree(leaves, keccak256_1.default, { sort: true });
        }
        const entry = shard.entries[address];
        const leaf = hashLeaf([address, entry]);
        const proof = this.trees[shardid].getProof(leaf).map((entry) => '0x' + entry.data.toString('hex'));
        return [entry, proof.concat(shard.proof)];
    }
    static fromFiles(directory) {
        const { root, shardNybbles, total } = JSON.parse(fs.readFileSync(path.join(directory, 'root.json'), { encoding: 'utf-8' }));
        return new ShardedMerkleTree((shard) => {
            return JSON.parse(fs.readFileSync(path.join(directory, `${shard}.json`), { encoding: 'utf-8' }));
        }, shardNybbles, root, ethers_1.ethers.BigNumber.from(total));
    }
    static getProofParaswap(directory, address) {
        const { merkleRoot, tokenTotal, claims } = JSON.parse(fs.readFileSync(path.join(directory, 'root.json'), { encoding: 'utf-8' }));
        return [merkleRoot, claims[address]];
    }
}
exports.default = ShardedMerkleTree;
//# sourceMappingURL=merkle.js.map