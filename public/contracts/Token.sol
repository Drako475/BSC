// SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.1.0/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {
    uint256 public token_transfer_count = 0;
    
    constructor () ERC20("DOGE-COIN", "DOG"){
        _mint(msg.sender, 10000 ether);
    }
    
    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
    
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override
    {
        token_transfer_count += 1;
    }
}