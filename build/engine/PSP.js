"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PSP = void 0;
const Base_1 = require("./Base");
const utils_1 = require("ethers/lib/utils");
const ethers_1 = require("ethers");
const merkle_1 = __importDefault(require("./merkle"));
const abi_1 = require("../abi");
const PSPCLAIM_ABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "token_",
                type: "address"
            },
            {
                internalType: "bytes32",
                name: "merkleRoot_",
                type: "bytes32"
            }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "index",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "address",
                name: "account",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "Claimed",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "index",
                type: "uint256"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
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
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "index",
                type: "uint256"
            }
        ],
        name: "isClaimed",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "merkleRoot",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "token",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    }
];
class PSP extends Base_1.Base {
    constructor(provider, sender, recipient, _pspClaimAddress, _pspTokenAddress) {
        super();
        if (!utils_1.isAddress(recipient))
            throw new Error("Bad recipient Address");
        if (!utils_1.isAddress(sender))
            throw new Error("Bad sender Address");
        this._sender = sender;
        this._recipient = recipient;
        this._pspClaimContract = new ethers_1.Contract(_pspClaimAddress, PSPCLAIM_ABI, provider);
        this._pspERC20Contract = new ethers_1.Contract(_pspTokenAddress, abi_1.ERC20_ABI, provider);
    }
    async description() {
        return `claim psp from ${this._sender}, and transfer to ${this._recipient}`;
    }
    async getSponsoredTransactions() {
        const merkle = merkle_1.default.getProofParaswap('./airdrops/paraswap', this._sender);
        const _merkleRoot = await this._pspClaimContract.merkleRoot();
        if (_merkleRoot !== merkle[0]) {
            return Promise.reject(new Error('contract merkleRoot is not equal to tree root'));
        }
        const { index, amount, proof } = merkle[1];
        return [
            { ...await this._pspClaimContract.populateTransaction.claim(index, this._sender, amount, proof), chainId: 1, gasLimit: 90000 },
            { ...await this._pspERC20Contract.populateTransaction.transfer(this._recipient, amount), chainId: 1, gasLimit: 100000 }
        ];
    }
}
exports.PSP = PSP;
//# sourceMappingURL=PSP.js.map