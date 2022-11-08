//SPDX-License-Identifier: BUSL-1.1
// Licensor:            X-Dao.
// Licensed Work:       NUCLEON 1.0

pragma solidity 0.8.2;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./IPoSPoolmini.sol";

///This contract is use as a mock contract. only Test contract functions. 
contract MockCoreBridge_multipool is Ownable, Initializable {
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

  fallback() external payable {}
  receive() external payable {}
  
}