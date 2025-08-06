"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSS3 = void 0;
const Base_1 = require("./Base");
const utils_1 = require("ethers/lib/utils");
const ethers_1 = require("ethers");
const abi_1 = require("../abi");
const RSS3CLAIM_ABI = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "index",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            },
            {
                internalType: "bytes32[]",
                name: "merkleProof",
                type: "bytes32[]"
            }
        ],
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
];
class RSS3 extends Base_1.Base {
    constructor(provider, sender, recipient, _RSS3ClaimAddress, _RSS3TokenAddress) {
        super();
        if (!utils_1.isAddress(recipient))
            throw new Error("Bad recipient Address");
        if (!utils_1.isAddress(sender))
            throw new Error("Bad sender Address");
        this._sender = sender;
        this._recipient = recipient;
        this._RSS3ClaimContract = new ethers_1.Contract(_RSS3ClaimAddress, RSS3CLAIM_ABI, provider);
        this._RSS3ERC20Contract = new ethers_1.Contract(_RSS3TokenAddress, abi_1.ERC20_ABI, provider);
    }
    async description() {
        return `claim RSS3 from ${this._sender}, and transfer to ${this._recipient}`;
    }
    async getSponsoredTransactions() {
        const response = await utils_1.fetchJson(`https://airdrop-backend.rss3.events/check/${this._sender}`);
        const index = response.index;
        const amount = response.earnings;
        const proof = response.proof;
        return [
            { ...await this._RSS3ClaimContract.populateTransaction.claim(index, amount, proof), chainId: 1, gasLimit: 76599 },
            { ...await this._RSS3ERC20Contract.populateTransaction.transfer(this._recipient, amount), chainId: 1, gasLimit: 60000 }
        ];
    }
}
exports.RSS3 = RSS3;
//# sourceMappingURL=RSS3.js.map