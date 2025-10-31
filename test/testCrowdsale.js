const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdsale", function () {
    let token;
    let crowdsale;
    let owner;
    let addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy Token contract
        const Token = await ethers.getContractFactory(
            "XZToken"
        );
        token = await Token.deploy(1000, owner.address);
        await token.waitForDeployment();

        // Deploy Crowdsale contract
        const Crowdsale = await ethers.getContractFactory("Crowdsale");
        crowdsale = await Crowdsale.deploy(await token.getAddress(), 1000); // 1000 tokens per wei
        await crowdsale.waitForDeployment();

        // Transfer token ownership to crowdsale contract
        await token.transferOwnership(await crowdsale.getAddress());
    });

    it("Should allow users to buy tokens", async function () {
        await crowdsale
            .connect(addr1)
            .buyTokens({ value: ethers.parseEther("1.0") });
        const addr1Balance = await token.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(ethers.parseEther("1.0") * 1000n);
    });

    it("Should emit TokensPurchased event", async function () {
        await expect(
            crowdsale
                .connect(addr1)
                .buyTokens({ value: ethers.parseEther("1.0") })
        )
            .to.emit(crowdsale, "TokensPurchased")
            .withArgs(addr1.address, ethers.parseEther("1.0") * 1000n);
    });
});