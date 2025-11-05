const { ethers } = require("hardhat");
require("dotenv").config();
let crowdsaleAddress = process.env.CROWDSALE_ADDRESS;

async function main() {
    if (!crowdsaleAddress) {
        throw new Error(
            "Please export CROWDSALE_ADDRESS environment variable."
        );
    }

    // Get the first signer/account to buy the tokens
    const signer = (await ethers.getSigners())[0];
    console.log(
        `Purchasing tokens with account: ${await signer.getAddress()}`
    );

    // Get the Crowdsale contract
    const crowdsale = await ethers.getContractAt(
        "Crowdsale",
        crowdsaleAddress,
        signer
    );
    console.log(`CrowdSale contract: ${crowdsaleAddress}`);

    // Buy tokens
    const ethAmount = ethers.parseEther("0.1"); // 0.1 ether worth of tokens
    const tx = await crowdsale.buyTokens({
    value: ethAmount,
    });
    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();

    // Check balance
    const tokenAddr = await crowdsale.token();
    const token = await ethers.getContractAt(
        "XZToken2",
        tokenAddr
    );
    const balance = await token.balanceOf(signer.getAddress());
    console.log(`Token address: ${tokenAddr}`);
    console.log(
        `Tokens purchased: ${ethers.formatUnits(balance, 18)} XLZD2`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});