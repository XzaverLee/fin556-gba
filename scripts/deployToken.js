const { ethers } = require("hardhat");
async function main() {
    // Get the first signer/account to deploy the contract
    const signer = (await ethers.getSigners())[0];
    console.log(`Using account: ${await signer.getAddress()}`);

    // Deploy the XZToken contract
    const factory = await ethers.getContractFactory(
        "XZToken"
    );
    const Token = await factory.deploy(
        ethers.parseUnits("1", "ether"),
        signer.address
    );
    await Token.waitForDeployment();
    TokenAddress = await Token.getAddress();
    console.log(`XZToken deployed to: ${TokenAddress}`);

    // Check gas usage
    const deploymentTx = Token.deploymentTransaction();
    const receipt = await ethers.provider.getTransactionReceipt(
        deploymentTx.hash
    );
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    console.log(
        `Gas price: ${ethers.formatUnits(
            deploymentTx.gasPrice,
            "gwei"
        )} gwei`
    );
    const totalCost = receipt.gasUsed * deploymentTx.gasPrice;
    console.log(
        `Total deployment cost: ${ethers.formatEther(totalCost)} ETH`
    );
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});