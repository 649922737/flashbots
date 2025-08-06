"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blur = void 0;
const Base_1 = require("./Base");
const utils_1 = require("ethers/lib/utils");
const ethers_1 = require("ethers");
const abi_1 = require("../abi");
const BlurERC20Contract = '0x5283d291dbcf85356a21ba090e6db59121208b44';
class Blur extends Base_1.Base {
    constructor(provider, sender, recipient) {
        super();
        if (!utils_1.isAddress(recipient))
            throw new Error("Bad recipient Address");
        if (!utils_1.isAddress(sender))
            throw new Error("Bad sender Address");
        this._sender = sender;
        this._recipient = recipient;
        this._BLURERC20Contract = new ethers_1.Contract(BlurERC20Contract, abi_1.ERC20_ABI, provider);
    }
    async description() {
        return `claim BLUR from ${this._sender}, and transfer to ${this._recipient}`;
    }
    async getSponsoredTransactions() {
        // get this url after click button "open care packages for $BLUR" at https://blur.io/airdrop page, example: 
        const url = "https://airdrop.blur.foundation/?data=eyJ0eG4iOnsidG8iOiIweGYyZDE1YzBhODk0MjhjOTI1MWQ3MWEwZTI5YjM5ZmYxZTg2YmNlMjUiLCJkYXRhIjoiMHgzZDEzZjg3NDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDQ5ZTUzZmIzZDViZjE1MzJmZWJhZDg4YTE5NzllMzNhOTQ4NDRkMWQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDFmMDM5ZjVlOTRmODA3ZjUwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA2MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTFkMjQxMjc3ODRlYTZiNDA3YjkwZWZmMWQ0ZDYzZGQxN2E2NGMzY2I1YmY5M2ZhNzdlMmJjZGMwMmMwMDlmMGQ2MzUyMTQxNGMyZDkyYzk1NTQ2MzJhZDNiOTVhNjViYzhjZGEwMWYzODRmMmU2NjMyNDYxYjY1ZTliNWMxMjA2MDc0YWFlNWI2ZTgyNDkxMDJiZWEyMjY5MmM4ZjE0YTEyNWYwOTBiNzU5YjA4MzQyZTE0ZDRiMDZiYjE1NDQwZjZmZWE4OTFiMTZjNzZiMDdjODBkMzM4Zjg1ZTQ2YWI0MzJjNzQ4ZDM3YWZmNjZiMmQ1MGI3MDY3NDIxODEyZjM5MWNjNDQ3NzBkMDA3NmI3MzJhZTA1N2JkMDc1NWQwNjU5OTdlMWI4NDcxMjg3ZDdmOGQ0OGZmZTE1MzA1ZGEyNmZhMWYzZTA4Mjk0ZmM0ZTA1OGMxYWVkYzM2NzQzOTZmMzBiMTIzMzNhMjFhZDI5MTc3NTliN2IxZWI2OTJjZmJiNTg1N2M0OTY2OTJkODVjYjBiYzIxY2E5ZTY1YmVlYjdmNzFhZDE4ODY1NjJkMzYxOGRlNWQwODVhYjRjZWYzY2ZmNTk5ZWJhZTAwOTk0NmFmNjcyNmI5YjI4NjA4NjliMGE1Y2RmODhkMzYxOTRjNDFmYTJiN2RmNDk1ZWI0ZTQ2ODA0YmQxNjJhZDE1NzY0MzQ0Mzg2NGQyMDg4NDM0ZDI5MjU5NmY4MjczMzkzNzJlZTk1MmNhYmRjZDVlNGY4NDFhYzYwYmY0NzJiNWFhNTU4MzI1OWQxYjE5NjUwOWRkMDNjYzJkZjNjMjAyYzBlNmRjNjQ3ZmRhNTNhMWZlZWRlYjhiYWQ5M2E3OTEwMTNiOGUxM2RmMWVkZDc3M2FlYWE0YjMyYjhiYmZiYjJhYTFiNTMxZWI2NTk0MGJkNTdiYTc3ZmZjNmRkZWFmYzFmNmJhNTdmMzYyMmVmNmZiOWVjNzM1ZDc0NTJkZTIyMjc3ZmFlNGVmYWE5MTI1NGI1MWU5ZmFkM2VkODEwNWMwZGE1NGE5NjYzMTU5NzEyMWZmMGZiYWQ3MTA5OWQ5NmQzMDk0NDFlZGVhZGMwZjk0MDUyMDkyYmM2NmM2OWNlNzc5NGIzNzFmN2VkNDQ4OTE4ZDEwN2YyMGE3M2Y4MTU2MjQ5YzcxN2ZmZTE0MzNkM2NlMmVjMGEwN2E4NDI0NDU3OTM3N2ZlM2YyM2ZlMzg3MjEyYWU2OTUyZjMyNGJjMjg4YTY0OGFiODkzNTZkN2RmYmJhNmZjNDYyMzY5NDNkNmNhZmRiNmIwZTk5YjM1ZWVmOWJjZjZhMjkwNGM2NTRiY2FlM2E5OGJlMWRmZmU2MDliYzNmYTk5OTA0Yzg3N2Q5MWE3NzZhM2U0NTg0MDhlOTE3YTAwZmQ1OTBiMDZkYmQ4MjE5YTE3YzNiOGIwMSIsInZhbHVlIjp7InR5cGUiOiJCaWdOdW1iZXIiLCJoZXgiOiIweDAwIn19LCJibHVyIjoiMzUuNzU2ODgxMDk4ODk0NzciLCJhZGRyZXNzIjoiMHg0OUU1M0ZiM2Q1YmYxNTMyZkVCQUQ4OGExOTc5RTMzQTk0ODQ0ZDFkIiwidW5jb21tb24iOjYsInJhcmUiOjAsImxlZ2VuZGFyeSI6MCwibXl0aGljYWwiOjAsImlzQ3JlYXRvciI6ZmFsc2UsImlzU3BlY2lhbCI6ZmFsc2UsImJlc3RGbGlwQ29sbGVjdGlvbk5hbWUiOiIiLCJiZXN0RmxpcENvbGxlY3Rpb25BZGRyZXNzIjoiIiwiYmVzdEZsaXBUb2tlbklkIjoiIiwiYmVzdEZsaXBQcm9maXQiOjAsImJlc3RGbGlwSGVsZEluU2Vjb25kcyI6MCwidG9wVm9sdW1lQ29sbGVjdGlvbk5hbWUiOiIiLCJ0b3BWb2x1bWVDb2xsZWN0aW9uQWRkcmVzcyI6IjB4NTdjN2I4NjZjZTg0MTU5YjFlMTdhMjJlZDc4ZTQ2ZjAxYzU1ODgyZSIsInRvcFZvbHVtZUFtb3VudCI6MC4yNiwidG9wQ291bnRDb2xsZWN0aW9uTmFtZSI6IiIsInRvcENvdW50Q29sbGVjdGlvbkFkZHJlc3MiOiIweDU3YzdiODY2Y2U4NDE1OWIxZTE3YTIyZWQ3OGU0NmYwMWM1NTg4MmUiLCJ0b3BDb3VudEFtb3VudCI6MiwidG90YWxCdXlWb2x1bWUiOjAsInRvdGFsU2VsbFZvbHVtZSI6MjguNzk4NDR9";
        // const url = ""
        const inputData = JSON.parse(Buffer.from(url.split('=')[1], 'base64').toString());
        const to = inputData.txn.to;
        const data = inputData.txn.data;
        const amount = ethers_1.ethers.utils.parseEther(parseFloat(inputData.blur).toString());
        const claimTx = {
            to,
            data,
            chainId: 1,
            gasLimit: 111111
        };
        const tranferTx = {
            ...await this._BLURERC20Contract.populateTransaction.transfer(this._recipient, amount), chainId: 1, gasLimit: 58000
        };
        return [claimTx, tranferTx];
    }
}
exports.Blur = Blur;
//# sourceMappingURL=BLUR.js.map