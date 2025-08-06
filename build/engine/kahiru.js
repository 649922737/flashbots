"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kahiru = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const Base_1 = require("./Base");
const KahiruStakingContract = '0x6DffB6415c96EC393Bf018fB824934d7b5B637a0'; // stakeNFT
const KahiruNFTContract = '0x0326b0688d9869a19388312Df6805d1D72AaB7bC'; // NFT
const STAKING_ABI = [{ "inputs": [{ "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
const NFT_ABI = [
    { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];
class Kahiru extends Base_1.Base {
    constructor(provider, sender, recipient) {
        super();
        if (!utils_1.isAddress(recipient))
            throw new Error("Bad recipient Address");
        if (!utils_1.isAddress(sender))
            throw new Error("Bad sender Address");
        this._sender = sender;
        this._recipient = recipient;
        this._KahiruStakingContract = new ethers_1.Contract(KahiruStakingContract, STAKING_ABI, provider);
        this._KahiruNFTContract = new ethers_1.Contract(KahiruNFTContract, NFT_ABI, provider);
    }
    async description() {
        return `From ${this._sender}, unstake from ${KahiruStakingContract}, get Kahiru ${KahiruNFTContract}, and transfer to ${this._recipient}`;
    }
    async getSponsoredTransactions() {
        const tokenIds = ['1', '2']; // change to your token id
        const batchTransaction = [];
        batchTransaction.push({ ...await this._KahiruStakingContract.populateTransaction.unstake(tokenIds), chainId: 1, gasLimit: 114865 });
        tokenIds.forEach(async (tokenId) => {
            batchTransaction.push({
                ...await this._KahiruNFTContract.populateTransaction.transferFrom(this._sender, this._recipient, tokenId), chainId: 1, gasLimit: 70000
            });
        });
        return batchTransaction;
    }
}
exports.Kahiru = Kahiru;
//# sourceMappingURL=kahiru.js.map