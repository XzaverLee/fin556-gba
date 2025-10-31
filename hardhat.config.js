require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
module.exports = {
    solidity: "0.8.20",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: process.env.FIN556_MNEMONIC,
            },
        },
        hoodi: {
            chainId: 560048,
            url: process.env.FIN556_ALCHEMY_URL,
            accounts: {
                mnemonic: process.env.FIN556_MNEMONIC,
            },
        },
        hardhat: {
            accounts: {
                mnemonic: process.env.FIN556_MNEMONIC,
            },
        },
    },
    etherscan: {
        apiKey: {
            hoodi: process.env.apiKey,
        }
    }
};
