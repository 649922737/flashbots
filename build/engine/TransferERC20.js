"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferERC20 = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const Base_1 = require("./Base");
const abi_1 = require("../abi");
class TransferERC20 extends Base_1.Base {
    constructor(provider, sender, recipient, _tokenAddress) {
        super();
        if (!utils_1.isAddress(sender))
            throw new Error("Bad Address");
        if (!utils_1.isAddress(recipient))
            throw new Error("Bad Address");
        this._sender = sender;
        this._recipient = recipient;
        this._tokenContract = new ethers_1.Contract(_tokenAddress, abi_1.ERC20_ABI, provider);
    }
    async description() {
        return "Transfer ERC20 balance " + (await this.getTokenBalance(this._sender)).toString() + " @ " + this._tokenContract.address + " from " + this._sender + " to " + this._recipient;
    }
    async getSponsoredTransactions() {
        const tokenBalance = await this.getTokenBalance(this._sender);
        if (tokenBalance.eq(0)) {
            throw new Error(`No Token Balance: ${this._sender} does not have any balance of ${this._tokenContract.address}`);
        }
        return [{
                ...await this._tokenContract.populateTransaction.transfer(this._recipient, tokenBalance), chainId: 1, gasLimit: 70000
            }];
    }
    async getTokenBalance(tokenHolder) {
        return (await this._tokenContract.functions.balanceOf(tokenHolder))[0];
    }
}
exports.TransferERC20 = TransferERC20;
//# sourceMappingURL=TransferERC20.js.map