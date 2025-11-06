const addresses = require("./addresses.json");
const UniswapV2Factory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");
const { ethers } = require("hardhat");


async function main() {
    console.log("Removing Liquidity...");
    const withdrawAmt = "3" // put amount in string or "All" to remove all liquidity
    
    const [ signer ] = await ethers.getSigners();
    console.log("Withdrawer address:", signer.address);

    const factory = new ethers.Contract(
        addresses.factory, 
        UniswapV2Factory.abi, 
        signer
    );

    const Token = await ethers.getContractAt(
        "XZToken2",
        addresses.token0
    );

    const WETHToken = new ethers.Contract(
        addresses.weth9,
        WETH9.abi,
        signer
    );
    
    const pairAddress = await factory.getPair(
        addresses.token0,
        addresses.weth9
    );
    if (pairAddress === ethers.ZeroAddress) {
        console.error("Error: Pair does not exist. Deploy the pair first, or ensure the addresses are correct.");
        return;
    }

    console.log("Pair address:", pairAddress);

    const uniswap = new ethers.Contract(
        pairAddress,
        [
            `function balanceOf(address owner) view returns (uint256)`,
            `function decimals() view returns (uint8)`,
            `function approve(address spender, uint256 amount) returns (bool)`,
            `function getReserves() view returns(uint112 reserve0,uint112 reserve1,uint32)`,
            `function totalSupply() view returns(uint256)`,
            `function token0() view returns (address)`
        ],
        signer
    );

    const uniswapbalwei = await uniswap.balanceOf(signer.address);
    const uniswapDecimal = await uniswap.decimals();
    let withdrawAmtWei;
    if (withdrawAmt === "All") {
        withdrawAmtWei = uniswapbalwei;
    } else {
        withdrawAmtWei = ethers.parseUnits(withdrawAmt, uniswapDecimal);
    };
    const uniswapbal = ethers.formatUnits(uniswapbalwei, uniswapDecimal);

    console.log("Uniswap Balance:", uniswapbal);
    if (uniswapbal < withdrawAmt) {
        console.error("Error: withdraw amount exceeds leftover Balance.");
        return;
    }
    const approveTx = await uniswap.approve(
        addresses.router,
        withdrawAmtWei,
    );

    console.log("Approval Tx Hash:", approveTx.hash)
    await approveTx.wait();
    console.log("Router successfully approved to spend LP Tokens.");

    const {reserve0, reserve1} = await uniswap.getReserves();
    const token0Addr = await uniswap.token0();
    if (token0Addr === addresses.token0) {
        TokenReserve = reserve0;
        WETHReserve = reserve1;
    } else {
        TokenReserve = reserve1;
        WETHReserve = reserve0;
    }

    console.log("Token Reserves:", TokenReserve);
    console.log("WETH Reserves:", WETHReserve);

    const totalSupply = await uniswap.totalSupply();

    const expectedToken = (withdrawAmtWei * TokenReserve) / totalSupply;
    const expectedETH = (withdrawAmtWei * WETHReserve) / totalSupply;

    const slippage = 9900n;
    const amountTokenMin = (expectedToken * slippage) / 10000n;
    const amountETHMin = (expectedETH * slippage) / 10000n;

    console.log("Minimum Token:", amountTokenMin);
    console.log("Minimum ETH:", amountETHMin);

    const ts = (await signer.provider.getBlock()).timestamp + 1000;
    
    const router = new ethers.Contract(
        addresses.router,
        ["function removeLiquidityETH(address token,uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) external returns (uint256 amountToken, uint256 amountETH)"],
        signer
    );
    const removeLiquidityTx = await router.removeLiquidityETH(
        addresses.token0,
        withdrawAmtWei,
        amountTokenMin,
        amountETHMin,
        signer.address,
        ts
    );

    console.log("Remove Liquidity TX Hash:", removeLiquidityTx.hash);
    await removeLiquidityTx.wait();
    console.log("Liquidity removed successful!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});