"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORT = void 0;
const Base_1 = require("./Base");
const utils_1 = require("ethers/lib/utils");
const ethers_1 = require("ethers");
const abi_1 = require("../abi");
const FORTCLAIM_ABI = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_index",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
            {
                internalType: "bytes32[]",
                name: "_proof",
                type: "bytes32[]"
            }
        ],
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
];
class FORT extends Base_1.Base {
    constructor(provider, sender, recipient, _FORTClaimAddress, _FORTTokenAddress) {
        super();
        if (!utils_1.isAddress(recipient))
            throw new Error("Bad recipient Address");
        if (!utils_1.isAddress(sender))
            throw new Error("Bad sender Address");
        this._sender = sender;
        this._recipient = recipient;
        this._FORTClaimContract = new ethers_1.Contract(_FORTClaimAddress, FORTCLAIM_ABI, provider);
        this._FORTERC20Contract = new ethers_1.Contract(_FORTTokenAddress, abi_1.ERC20_ABI, provider);
    }
    async description() {
        return `claim FORT from ${this._sender}, and transfer to ${this._recipient}`;
    }
    async getSponsoredTransactions() {
        let response;
        try {
            response = await utils_1.fetchJson(`https://airdrop-api.forta.network/proof?address=${this._sender}`);
        }
        catch (error) {
            console.warn('This address is not eligible for the FORT token airdrop.');
            return [];
        }
        const index = response.index;
        const amount = response.amount;
        const proof = response.proof;
        return [
            { ...await this._FORTClaimContract.populateTransaction.claim(index, amount, proof), chainId: 1, gasLimit: 130000 },
            { ...await this._FORTERC20Contract.populateTransaction.transfer(this._recipient, amount), chainId: 1, gasLimit: 60000 }
        ];
    }
}
exports.FORT = FORT;
//# sourceMappingURL=FORT.js.map