"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ProveEngine = void 0;
// engine/prove.ts
var ethers_1 = require("ethers");
var Base_1 = require("./Base"); // 导入 Base 抽象类
/**
 * 用户提供的空投合约 ABI，包含 claim 函数和相关视图函数。
 */
var AIRDROP_CONTRACT_ABI = [
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
 * 完全适配用户提供的 Base 抽象类。
 */
var ProveEngine = /** @class */ (function (_super) {
    __extends(ProveEngine, _super);
    /**
     * @param provider - ethers.js provider。
     * @param executorAddress - 将签署和执行交易的地址（你的钱包地址）。
     * @param recipientAddress - 接收空投代币的地址（通常就是 executorAddress）。
     * @param airdropContractAddress - 空投分发合约的地址。
     * @param claimIndex - 你在空投列表中的索引。
     * @param claimAmountRaw - 你有资格领取的代币数量（原始 wei 字符串）。
     * @param merkleProof - 用于验证你资格的 Merkle 证明数组。
     */
    function ProveEngine(provider, executorAddress, recipientAddress, airdropContractAddress, claimIndex, claimAmountRaw, merkleProof) {
        var _this = _super.call(this) || this;
        _this.tokenDecimals = 18; // 默认 18，将从空投合约关联的代币合约中更新
        _this._provider = provider;
        _this._executorAddress = executorAddress;
        _this._recipientAddress = recipientAddress;
        _this._airdropContractAddress = airdropContractAddress;
        _this._claimIndex = claimIndex;
        _this._claimAmountRaw = claimAmountRaw;
        _this._merkleProof = merkleProof;
        // 使用存储的 provider 和合约地址初始化合约实例
        _this.airdropContract = new ethers_1.Contract(_this._airdropContractAddress, AIRDROP_CONTRACT_ABI, _this._provider);
        // 尝试获取空投代币的小数位，以便在描述中正确显示金额
        _this.initializeTokenDecimals();
        return _this;
    }
    /**
     * 尝试从空投合约关联的代币合约中获取小数位。
     * 这是为了在描述中正确显示金额，不影响 claim 交易本身。
     */
    ProveEngine.prototype.initializeTokenDecimals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, tokenContract, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.airdropContract.token()];
                    case 1:
                        tokenAddress = _b.sent();
                        tokenContract = new ethers_1.Contract(tokenAddress, ["function decimals() view returns (uint8)", "function name() view returns (string)", "function symbol() view returns (string)"], this._provider);
                        _a = this;
                        return [4 /*yield*/, tokenContract.decimals()];
                    case 2:
                        _a.tokenDecimals = _b.sent();
                        console.log("ProveEngine: \u7A7A\u6295\u4EE3\u5E01\u5C0F\u6570\u4F4D\u8BBE\u7F6E\u4E3A " + this.tokenDecimals);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.warn("ProveEngine: \u65E0\u6CD5\u83B7\u53D6\u7A7A\u6295\u4EE3\u5E01\u7684\u5C0F\u6570\u4F4D\u3002\u4F7F\u7528\u9ED8\u8BA4\u503C 18\u3002\u9519\u8BEF\uFF1A", error_1);
                        this.tokenDecimals = 18;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成调用空投合约 claim 函数的填充后交易。
     * 此方法不接受任何参数，因为它使用构造函数中存储的属性。
     * @returns 一个 Promise，解析为 TransactionRequest 对象数组。
     */
    ProveEngine.prototype.getSponsoredTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transactions, parsedClaimAmount, claimTx, transactionRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // 确保小数位已加载，但这主要影响 description，不直接影响 claim 交易的参数
                    return [4 /*yield*/, this.initializeTokenDecimals()];
                    case 1:
                        // 确保小数位已加载，但这主要影响 description，不直接影响 claim 交易的参数
                        _a.sent();
                        transactions = [];
                        parsedClaimAmount = ethers_1.BigNumber.from(this._claimAmountRaw);
                        return [4 /*yield*/, this.airdropContract.populateTransaction.claim(this._claimIndex, this._executorAddress, // claim 函数的 account 参数通常是领取者自己的地址
                            parsedClaimAmount, this._merkleProof)];
                    case 2:
                        claimTx = _a.sent();
                        transactionRequest = __assign(__assign({}, claimTx), { from: this._executorAddress });
                        console.log("ProveEngine: \u51C6\u5907\u4E86\u9886\u53D6\u7A7A\u6295\u7684\u4EA4\u6613\uFF0C\u7D22\u5F15: " + this._claimIndex.toString() + ", \u539F\u59CB\u91D1\u989D: " + this._claimAmountRaw);
                        return [2 /*return*/, [transactionRequest]];
                }
            });
        });
    };
    /**
     * 提供当前空投领取操作的描述。
     * 此方法不接受任何参数，因为它使用构造函数中存储的属性。
     * @returns 一个 Promise，解析为字符串描述。
     */
    ProveEngine.prototype.description = function () {
        return __awaiter(this, void 0, void 0, function () {
            var airdropContract, tokenAddress, e_1, tokenName, tokenSymbol, tokenDecimals, tokenContract, error_2, isClaimed, endTime, currentTime, humanReadableAmount, description;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        airdropContract = new ethers_1.Contract(this._airdropContractAddress, AIRDROP_CONTRACT_ABI, this._provider);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, airdropContract.token()];
                    case 2:
                        tokenAddress = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.warn('ProveEngine: 无法获取代币地址，可能是合约没有 token() 方法或网络错误。');
                        return [3 /*break*/, 4];
                    case 4:
                        tokenName = "未知代币";
                        tokenSymbol = "UNKNOWN";
                        tokenDecimals = 18;
                        if (!tokenAddress) return [3 /*break*/, 10];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 9, , 10]);
                        tokenContract = new ethers_1.Contract(tokenAddress, ["function name() view returns (string)", "function symbol() view returns (string)", "function decimals() view returns (uint8)"], this._provider);
                        return [4 /*yield*/, tokenContract.name()];
                    case 6:
                        tokenName = _a.sent();
                        return [4 /*yield*/, tokenContract.symbol()];
                    case 7:
                        tokenSymbol = _a.sent();
                        return [4 /*yield*/, tokenContract.decimals()];
                    case 8:
                        tokenDecimals = _a.sent(); // 获取小数位用于描述
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _a.sent();
                        console.warn("ProveEngine: \u65E0\u6CD5\u83B7\u53D6\u7A7A\u6295\u4EE3\u5E01\u540D\u79F0\u3001\u7B26\u53F7\u6216\u5C0F\u6570\u4F4D\u3002\u9519\u8BEF\uFF1A", error_2);
                        return [3 /*break*/, 10];
                    case 10: return [4 /*yield*/, airdropContract.isClaimed(this._claimIndex)];
                    case 11:
                        isClaimed = _a.sent();
                        return [4 /*yield*/, airdropContract.endTime()];
                    case 12:
                        endTime = _a.sent();
                        currentTime = Math.floor(Date.now() / 1000);
                        humanReadableAmount = ethers_1.BigNumber.from(this._claimAmountRaw).div(ethers_1.BigNumber.from(10).pow(tokenDecimals)).toString();
                        description = "\u6B63\u5728\u5C1D\u8BD5\u901A\u8FC7\u7A7A\u6295\u5408\u7EA6 (" + this._airdropContractAddress + ") \u9886\u53D6 " + humanReadableAmount + " " + tokenSymbol + " (" + tokenName + ") \u4EE3\u5E01\u3002";
                        description += "\n\u9886\u53D6\u8005\u8D26\u6237: " + this._executorAddress;
                        description += "\n\u7A7A\u6295\u7D22\u5F15: " + this._claimIndex.toString();
                        description += "\n\u662F\u5426\u5DF2\u9886\u53D6: " + (isClaimed ? '是' : '否');
                        description += "\n\u9886\u53D6\u622A\u6B62\u65F6\u95F4: " + new Date(endTime.toNumber() * 1000).toLocaleString();
                        if (isClaimed) {
                            description += "\n\u8B66\u544A\uFF1A\u6B64\u7A7A\u6295\u5DF2\u88AB\u6807\u8BB0\u4E3A\u5DF2\u9886\u53D6\uFF0C\u4EA4\u6613\u53EF\u80FD\u4F1A\u5931\u8D25\u3002";
                        }
                        if (currentTime > endTime.toNumber()) {
                            description += "\n\u8B66\u544A\uFF1A\u9886\u53D6\u7A97\u53E3\u5DF2\u7ED3\u675F\uFF0C\u4EA4\u6613\u53EF\u80FD\u4F1A\u5931\u8D25\u3002";
                        }
                        return [2 /*return*/, description];
                }
            });
        });
    };
    return ProveEngine;
}(Base_1.Base));
exports.ProveEngine = ProveEngine;
;
