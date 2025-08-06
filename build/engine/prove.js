"use strict";
// src/engine/prove.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProveEngine = void 0;
const ethers_1 = require("ethers");
const Base_1 = require("./Base"); // 导入 Base 抽象类
/**
 * 用户提供的空投合约 ABI，包含 claim 函数和相关视图函数。
 */
const AIRDROP_CONTRACT_ABI = [
    { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "bytes32", "name": "_merkleRoot", "type": "bytes32" }, { "internalType": "uint256", "name": "_endTime", "type": "uint256" }, { "internalType": "address", "name": "_owner", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [], "name": "AlreadyClaimed", "type": "error" },
    { "inputs": [], "name": "ClaimWindowFinished", "type": "error" },
    { "inputs": [], "name": "EndTimeInPast", "type": "error" },
    { "inputs": [], "name": "EnforcedPause", "type": "error" },
    { "inputs": [], "name": "ExpectedPause", "type": "error" },
    { "inputs": [], "name": "InvalidProof", "type": "error" },
    { "inputs": [], "name": "NoWithdrawDuringClaim", "type": "error" },
    { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" },
    { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "SafeERC20FailedOperation", "type": "error" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Claimed", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" },
    { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }, { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes32[]", "name": "merkleProof", "type": "bytes32[]" }], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "endTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "isClaimed", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "merkleRoot", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "token", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];
/**
 * ProveEngine 类，用于生成 Flashbots 交易以调用空投合约的 claim 函数。
 */
class ProveEngine extends Base_1.Base {
    constructor(provider, executorAddress, recipientAddress, airdropContractAddress, claimIndex, claimAmountRaw, merkleProof) {
        super();
        this.tokenDecimals = 18; // 默认 18，将从空投合约关联的代币合约中更新
        this._provider = provider;
        this._executorAddress = executorAddress;
        this._recipientAddress = recipientAddress;
        this._airdropContractAddress = airdropContractAddress;
        this._claimIndex = claimIndex;
        this._claimAmountRaw = claimAmountRaw;
        this._merkleProof = merkleProof;
        this.airdropContract = new ethers_1.Contract(this._airdropContractAddress, AIRDROP_CONTRACT_ABI, this._provider);
        this.initializeTokenDecimals();
    }
    async initializeTokenDecimals() {
        try {
            const tokenAddress = await this.airdropContract.token();
            const tokenContract = new ethers_1.Contract(tokenAddress, ["function decimals() view returns (uint8)", "function name() view returns (string)", "function symbol() view returns (string)"], this._provider);
            this.tokenDecimals = await tokenContract.decimals();
            console.log(`ProveEngine: 空投代币小数位设置为 ${this.tokenDecimals}`);
        }
        catch (error) {
            console.warn(`ProveEngine: 无法获取空投代币的小数位。使用默认值 18。错误：`, error);
            this.tokenDecimals = 18;
        }
    }
    async getSponsoredTransactions() {
        await this.initializeTokenDecimals();
        const transactions = [];
        const parsedClaimAmount = ethers_1.BigNumber.from(this._claimAmountRaw);
        // 修复：在传入合约之前，手动验证和格式化 Merkle 证明数组
        // 确保每个元素都是一个有效的 32 字节哈希
        const verifiedMerkleProof = this._merkleProof.map(proof => {
            // 使用 ethers.utils.arrayify 验证和转换字符串为字节数组
            const bytesProof = ethers_1.utils.arrayify(proof);
            // 如果长度不为 32，会抛出错误
            if (bytesProof.length !== 32) {
                throw new Error(`Merkle Proof 元素长度不正确: ${proof}`);
            }
            return bytesProof;
        });
        const claimTx = await this.airdropContract.populateTransaction.claim(this._claimIndex, this._executorAddress, parsedClaimAmount, verifiedMerkleProof // 使用经过格式化的 Merkle Proof
        );
        const transactionRequest = {
            ...claimTx,
            from: this._executorAddress,
        };
        console.log(`ProveEngine: 准备了领取空投的交易，索引: ${this._claimIndex.toString()}, 原始金额: ${this._claimAmountRaw}`);
        return [transactionRequest];
    }
    async description() {
        const airdropContract = new ethers_1.Contract(this._airdropContractAddress, AIRDROP_CONTRACT_ABI, this._provider);
        let tokenAddress;
        try {
            tokenAddress = await airdropContract.token();
        }
        catch (e) {
            console.warn('ProveEngine: 无法获取代币地址，可能是合约没有 token() 方法或网络错误。');
        }
        let tokenName = "未知代币";
        let tokenSymbol = "UNKNOWN";
        let tokenDecimals = 18;
        if (tokenAddress) {
            try {
                const tokenContract = new ethers_1.Contract(tokenAddress, ["function name() view returns (string)", "function symbol() view returns (string)", "function decimals() view returns (uint8)"], this._provider);
                tokenName = await tokenContract.name();
                tokenSymbol = await tokenContract.symbol();
                tokenDecimals = await tokenContract.decimals();
            }
            catch (error) {
                console.warn(`ProveEngine: 无法获取空投代币名称、符号或小数位。错误：`, error);
            }
        }
        const isClaimed = await airdropContract.isClaimed(this._claimIndex);
        const endTime = await airdropContract.endTime();
        const currentTime = Math.floor(Date.now() / 1000);
        const humanReadableAmount = ethers_1.BigNumber.from(this._claimAmountRaw).div(ethers_1.BigNumber.from(10).pow(tokenDecimals)).toString();
        let description = `正在尝试通过空投合约 (${this._airdropContractAddress}) 领取 ${humanReadableAmount} ${tokenSymbol} (${tokenName}) 代币。`;
        description += `\n领取者账户: ${this._executorAddress}`;
        description += `\n空投索引: ${this._claimIndex.toString()}`;
        description += `\n是否已领取: ${isClaimed ? '是' : '否'}`;
        description += `\n领取截止时间: ${new Date(endTime.toNumber() * 1000).toLocaleString()}`;
        if (isClaimed) {
            description += `\n警告：此空投已被标记为已领取，交易可能会失败。`;
        }
        if (currentTime > endTime.toNumber()) {
            description += `\n警告：领取窗口已结束，交易可能会失败。`;
        }
        return description;
    }
}
exports.ProveEngine = ProveEngine;
//# sourceMappingURL=prove.js.map