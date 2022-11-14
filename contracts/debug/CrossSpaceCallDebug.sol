//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../internal/CrossSpaceCall.sol";
import "../XCFX.sol";

contract CrossSpaceCallDebug{
    MockCrossSpaceCall crossSpaceCall;
    XCFX tokenContract;

    constructor(address csc_addr){
        crossSpaceCall = MockCrossSpaceCall(csc_addr);
        XCFX c = new XCFX();
        tokenContract = c;
        c.addMinter(address(this));
    }

    function setToken(address target, uint value) public {
        if (tokenContract.balanceOf(target) > value) {
            tokenContract.burnTokens(target, tokenContract.balanceOf(target) - value);
        }
        else {
            tokenContract.addTokens(target, value - tokenContract.balanceOf(target));
        }
    }

    function testCallEVM() public returns (bytes memory output) {
        address mappedAddress = address(crossSpaceCall.getMockMapped(address(this)));
        this.setToken(mappedAddress, 1000);
        require(tokenContract.balanceOf(mappedAddress) == 1000, "set self token failed");
        // transfer back
        output = crossSpaceCall.callEVM(bytes20(address(tokenContract)), abi.encodeWithSignature("transfer(address,uint256)", address(this), 500));
        require(tokenContract.balanceOf(mappedAddress) == 500, string(output));
        // return output;
    }
}

