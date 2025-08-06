"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferERC1155 = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const Base_1 = require("./Base");
const ERC1155_ABI = [{
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256[]",
                name: "ids",
                type: "uint256[]"
            },
            {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]"
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes"
            }
        ],
        name: "safeBatchTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }];
class TransferERC1155 extends Base_1.Base {
    constructor(provider, sender, recipient, _tokenAddress, tokenIds, amounts) {
        super();
        if (!utils_1.isAddress(sender))
            throw new Error("Bad Address");
        if (!utils_1.isAddress(recipient))
            throw new Error("Bad Address");
        this._sender = sender;
        this._recipient = recipient;
        this._tokenContract = new ethers_1.Contract(_tokenAddress, ERC1155_ABI, provider);
        this._tokenIds = tokenIds;
        this._amounts = amounts;
    }
    async description() {
        return `Transfer ${this._amounts.join('/')} ERC1155 ${this._tokenContract.address} ${this._tokenIds.join('/')} tokens from ${this._sender} to ${this._recipient}`;
    }
    async getSponsoredTransactions() {
        return [{
                ...await this._tokenContract.populateTransaction.safeBatchTransferFrom(this._sender, this._recipient, this._tokenIds, this._amounts, "0x00"),
                gasLimit: 50000 * this._amounts.length,
            }];
    }
}
exports.TransferERC1155 = TransferERC1155;
//# sourceMappingURL=TransferERC1155.js.map