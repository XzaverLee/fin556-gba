const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("XZToken2", function () {
    let token;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("XZToken2");
        token = await Token.deploy(1000, owner.address);
    });

    it("Owner should mint new tokens", async function () {
        await token.mint(addr1.address, 500);
        const addr1Balance = await token.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(500n);
    });

    it("Non-owner should not mint new tokens", async function () {
        await expect(token.connect(addr1).mint(addr2.address, 500))
            .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
            .withArgs(addr1.address);
    });        
});