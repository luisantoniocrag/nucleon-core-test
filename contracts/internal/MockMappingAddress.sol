//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./CrossSpaceCall.sol";

contract MockMappedAddress {

    address coreAddress;

    constructor(address _address) {
        // set origin
        coreAddress = _address;
    }

    function transferEVM(bytes20 to) external payable returns (bytes memory output) {
        bool success;
        (success, output) = address(to).call{value: msg.value}("");
        require(success, "CFX Transfer Failed");
    }

    function callEVM(bytes20 to, bytes calldata data) external payable returns (bytes memory output) {
        bool success;
        (success, output) = address(to).call{value: msg.value}(data);
        require(success, string(output));
    }

    function staticCallEVM(bytes20 to, bytes calldata data) external payable returns (bytes memory output) {
        bool success;
        (success, output) = address(to).staticcall(data);
        require(success, string(output));
    }

    function withdraw(uint value) external {
        // This is a function used to mock the execution of withdrawFromMapped
        // and should not be used in production environment
        // so we do not add permission check here
        bool success;
        require(address(this).balance >= value, "No enough balance in mapped address");
        // address ori = MockCrossSpaceCall(msg.sender).getMockReverseMapped(bytes20(address(this)));
        (success, ) = coreAddress.call{value: value}("");
        require(success, "CFX Transfer Failed");
    }
    receive() external payable {}
}
