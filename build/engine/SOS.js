"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOS = void 0;
const Base_1 = require("./Base");
const utils_1 = require("ethers/lib/utils");
const ethers_1 = require("ethers");
const abi_1 = require("../abi");
const SOSCLAIM_ABI = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amountV",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "r",
                type: "bytes32"
            },
            {
                internalType: "bytes32",
                name: "s",
                type: "bytes32"
            }
        ],
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
];
class SOS extends Base_1.Base {
    constructor(provider, sender, recipient, _sosTokenAddress) {
        super();
        if (!utils_1.isAddress(recipient))
            throw new Error("Bad recipient Address");
        if (!utils_1.isAddress(sender))
            throw new Error("Bad sender Address");
        this._sender = sender;
        this._recipient = recipient;
        this._sosClaimContract = new ethers_1.Contract(_sosTokenAddress, SOSCLAIM_ABI, provider);
        this._sosERC20Contract = new ethers_1.Contract(_sosTokenAddress, abi_1.ERC20_ABI, provider);
    }
    async description() {
        return `claim SOS from ${this._sender}, and transfer to ${this._recipient}`;
    }
    async getSponsoredTransactions() {
        // you can open broswer to https://api.theopendao.com/api/opendao/claim/[Fill Your Address] 
        // get total_share, v, r, s and fill below
        //
        // such as for my address https://api.theopendao.com/api/opendao/claim/0x49E53Fb3d5bf1532fEBAD88a1979E33A94844d1d
        // const total_share = "41429244.5055"
        // const v = "12664759760331458874453076485325239921451404572804478121060178750865498554368"
        // const r = "0xe57fcd80afe2701a3469c0411080595ee77a8315481589b0494981f06b6e7cdd"
        // const s = "0x7a716d2e99812e791fd17afcbffe92c1980e25f68ea2519ec21d845ed672a7e8"
        const total_share = "";
        const v = "";
        const r = "";
        const s = "";
        return [
            { ...await this._sosClaimContract.populateTransaction.claim(v, r, s), chainId: 1, gasLimit: 60000 },
            { ...await this._sosERC20Contract.populateTransaction.transfer(this._recipient, utils_1.parseUnits(total_share, 'ether')), chainId: 1, gasLimit: 100000 }
        ];
    }
}
exports.SOS = SOS;
//# sourceMappingURL=SOS.js.map