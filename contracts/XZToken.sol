// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XZToken is ERC20, Ownable {
    constructor(
        uint256 initialSupply,
        address owner
    ) ERC20("XZToken", "XLZD") Ownable(owner) {
        transferOwnership(owner);
        _mint(owner, initialSupply);
    } 
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount); 
    }
}