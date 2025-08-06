"use strict";
// src/engine/TransferERC721.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferERC721 = void 0;
const ethers_1 = require("ethers");
const Base_1 = require("./Base");
/**
 * 这是一个 ERC721 转账引擎的示例。
 * 请根据你的实际 ERC721 合约 ABI 进行修改。
 */
const ERC721_ABI = [
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function ownerOf(uint256 tokenId) view returns (address)"
];
class TransferERC721 extends Base_1.Base {
    constructor(provider, executorAddress, recipientAddress, tokenAddress, tokenIds // 确保构造函数接收的是 BigNumber 数组
    ) {
        super();
        this._provider = provider;
        this._executorAddress = executorAddress;
        this._recipientAddress = recipientAddress;
        this._tokenAddress = tokenAddress;
        this._tokenIds = tokenIds;
    }
    async getSponsoredTransactions() {
        const erc721Contract = new ethers_1.Contract(this._tokenAddress, ERC721_ABI, this._provider);
        const transactions = [];
        // 使用 Promise.all 来并行处理所有转账交易
        const populatedTxs = await Promise.all(this._tokenIds.map(async (tokenId) => {
            // 检查当前钱包是否为 NFT 的所有者
            const owner = await erc721Contract.ownerOf(tokenId);
            if (owner.toLowerCase() !== this._executorAddress.toLowerCase()) {
                console.warn(`警告: 地址 ${this._executorAddress} 不是 tokenId ${tokenId} 的所有者，将跳过此交易。`);
                return null; // 返回 null，稍后过滤掉
            }
            // 填充 safeTransferFrom 交易
            const tx = await erc721Contract.populateTransaction.safeTransferFrom(this._executorAddress, this._recipientAddress, tokenId);
            return {
                ...tx,
                from: this._executorAddress,
            };
        }));
        // 过滤掉那些因为所有权不匹配而返回 null 的交易
        return populatedTxs.filter(tx => tx !== null);
    }
    async description() {
        const erc721Contract = new ethers_1.Contract(this._tokenAddress, ERC721_ABI, this._provider);
        let tokenSymbol = "NFT";
        try {
            const name = await erc721Contract.name();
            const symbol = await erc721Contract.symbol();
            tokenSymbol = `${name} (${symbol})`;
        }
        catch (e) {
            // 忽略错误，如果合约没有 name() 或 symbol() 函数
        }
        const tokenIdsStr = this._tokenIds.map(id => id.toString()).join(', ');
        return `正在尝试将 ${this._tokenIds.length} 个 ${tokenSymbol} (${this._tokenAddress}) 从账户 ${this._executorAddress} 转账到 ${this._recipientAddress}。Token ID(s): ${tokenIdsStr}`;
    }
}
exports.TransferERC721 = TransferERC721;
//# sourceMappingURL=TransferERC721.js.map