//SPDX-License-Identifier: BUSL-1.1
// Licensor:            X-Dao.
// Licensed Work:       NUCLEON 1.0

pragma solidity 0.8.2;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./IPoSPoolmini.sol";
import "../eSpace/Exchangeroom.sol";

///This contract is use as a mock contract. only Test contract functions. 
contract MockCoreBridge_multipool_nonPayable is Ownable, Initializable {
  using SafeMath for uint256;

  IPoSPoolmini private POOL;

  function initialize(address poolAddress) public initializer{
    POOL = IPoSPoolmini(poolAddress);
  }

  function campounds(uint64 votePower) public payable {
    POOL.increaseStake{value: msg.value}(votePower);
  }

  function handleUnstake(uint64 votePower) public {
    POOL.decreaseStake(votePower);
  }

  function withdrawVotes() public {
    POOL.withdrawStake();
  }

  function claimInterests() public {
    POOL.claimAllInterest();
  }

  function Exchangeroom_exchangeBalances(address _address) public payable returns(uint256) {
    return Exchangeroom(payable(_address)).CFX_exchange_XCFX{value: msg.value}();
  }

  function Exchangeroom_getback_CFX(address _address, uint256 _amount) public {
    Exchangeroom(payable(_address)).getback_CFX(_amount);
  }

  function Exchangeroom_handleCFXexchangeXCFX(address _address) public payable returns(uint256) {
    return Exchangeroom(payable(_address)).handleCFXexchangeXCFX{value: msg.value}();
  }
  
}