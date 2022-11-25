//SPDX-License-Identifier: Unlicense
// Licensor:            X-Dao.
// Licensed Work:       NUCLEON 1.0

pragma solidity 0.8.2;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "../ICrossSpaceCall.sol";
import "../IExchange.sol";
import "../eSpace/CoreBridge_multipool.sol";

/// This use mock contracts to replace the real CoreBridge_multipool.
/// Which enable developer test it in ethereum
/// DON'T USE IT IN PRODUCTION

contract CoreBridge_multipoolDebug is CoreBridge_multipool {
    
    function _claimInterests() public returns(uint256) {
        return claimInterests();
    }

    function _campounds() public returns(uint256,uint256) {
        return campounds();
    }
    
    function _handleUnstake() public returns(uint256,uint256){
        return handleUnstake();
    }

    function _handleLockedvotesSUM() public returns(uint256) {
        return handleLockedvotesSUM();
    }

    function _handleLockedvotesSUMTest() public returns(uint256) {
        return handleLockedvotesSUM();
    }

    function _SyncValue() public returns(uint256,uint256,uint256) {
        return SyncValue();
    }

    function _withdrawVotes() public returns (uint256, uint256) {
        return withdrawVotes();
    }
}