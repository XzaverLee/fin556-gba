// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./XZToken.sol";

contract Crowdsale {
    XZToken public token;
    uint256 public rate;
    event TokensPurchased(address buyer, uint256 amount);

    constructor(address tokenAddress, uint256 rate_) {
        rate = rate_;
        token = XZToken(tokenAddress);
    }

    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 amount = msg.value * rate;
        token.mint(msg.sender, amount);
        emit TokensPurchased(msg.sender, amount);
    }
}