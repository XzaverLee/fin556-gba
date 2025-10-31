const { ethers } = require("hardhat");
const addresses = require("./addresses.json");
const UniswapV2Factory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");
const UniswapV2Router02 = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const UniswapV2Pair = require("@uniswap/v2-core/build/UniswapV2Pair.json");

async function main() {
    console.log("Adding liquidity...");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // Get Tokens
    const tokenA = await ethers.getContractAt(
        "XZToken",
        addresses.token0
    );
    // const tokenB = addresses.weth9;

    // Check if Pair exists, if not return error
    factory = new ethers.Contract(addresses.factory, UniswapV2Factory.abi, deployer);
    const tokenB = new ethers.Contract(addresses.weth9, WETH9.abi, deployer);
    const pairAddress = await factory.getPair(
        await tokenA.getAddress(),
        await tokenB.getAddress()
    );
    if (pairAddress === ethers.ZeroAddress) {
        console.error("Error: Pair does not exist. Deploy the pair first.");
        return;
    }

    console.log("Pair address:", pairAddress);

    // Approve Tokens
    const amountA = ethers.parseUnits("100", "ether");
    const amountB = ethers.parseUnits("0.1", "ether");
    let tx = await tokenA.approve(addresses.router, amountA);
    await tx.wait();
    await tokenB.deposit({
        value: amountB
    })
    tx = await tokenB.approve(addresses.router, amountB);
    await tx.wait();

    // Add Liquidity
    const router = new ethers.Contract(addresses.router, UniswapV2Router02.abi, deployer);
    const block = await ethers.provider.getBlock();
    const timestamp = block.timestamp + 600;
    tx = await router.addLiquidity(
        addresses.token0,
        addresses.weth9,
        amountA,
        amountB,
        0,
        0,
        deployer.address,
        timestamp
    );
    await tx.wait();
    console.log("Liquidity added.");

    //Get Pair
    const pair = new ethers.Contract(pairAddress, UniswapV2Pair.abi, deployer);

    //Check LP balance
    const lpBalance = await pair.balanceOf(deployer.address);
    console.log(
        `LP Balance of ${deployer.address}:`,
        ethers.formatUnits(lpBalance, 18)
    );

    //Check reserves
    const reserves = await pair.getReserves();
    const [reserves0, reserves1] =
        (await tokenA.getAddress()) < (await tokenB.getAddress())
            ? [reserves[0], reserves[1]]
            : [reserves[1], reserves[0]];

    console.log(
        `Reserves: ${ethers.formatUnits(
            reserves0,
            18
        )} / ${ethers.formatUnits(reserves1, 18)}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});