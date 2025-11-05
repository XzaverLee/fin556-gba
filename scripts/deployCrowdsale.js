const { ethers } = require("hardhat");
require("dotenv").config();

let TokenAddress = process.env.TOKEN_ADDRESS;

async function main() {
    if (!TokenAddress) {
        throw new Error(
            "Please get TOKEN_ADDRESS environment variable."
        );
    }

    // Deploy the Crowdsale contract
    const CrowdsaleFactory = await ethers.getContractFactory("Crowdsale");
    const crowdsale = await CrowdsaleFactory.deploy(
        TokenAddress,
        1000 // 1 ETH = 1000 XLZD
    );
    await crowdsale.waitForDeployment();
    crowdsaleAddress = await crowdsale.getAddress();
    console.log(`Crowdsale deployed to: ${crowdsaleAddress}`);

    // Transfer token ownership to the Crowdsale contract
    const Token = await ethers.getContractAt(
        "XZToken2",
        TokenAddress
    );
    const transferTx = await Token.transferOwnership(crowdsaleAddress);
    await transferTx.wait();
    console.log(
        `Transferred token ownership to Crowdsale at: ${crowdsaleAddress}`
    );
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});