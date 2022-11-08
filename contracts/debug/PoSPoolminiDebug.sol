//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../PoSPoolmini.sol";
import "../internal/IStaking.sol";
import "../internal/IPoSRegister.sol";
import "../VotePowerQueue.sol";

/// This use mock contracts to replace the real PoS contracts.
/// Which enable developer test it in ethereum
contract PoSPoolminiDebug is PoSPoolmini {
  
  IStaking private STAKING;
  IPoSRegister private POS_REGISTER;

  constructor(address _stakingAddress, address _posRegisterAddress) {
    STAKING = IStaking(_stakingAddress);
    POS_REGISTER = IPoSRegister(_posRegisterAddress);
  }

  function _stakingDeposit(uint256 _amount) internal override {
    STAKING.deposit{value: _amount}(_amount);
  }

  function _stakingWithdraw(uint256 _amount) internal override {
    STAKING.withdraw(_amount);
  }

  function _posRegisterRegister(
    bytes32 indentifier,
    uint64 votePower,
    bytes calldata blsPubKey,
    bytes calldata vrfPubKey,
    bytes[2] calldata blsPubKeyProof
  ) internal override {
    POS_REGISTER.register(indentifier, votePower, blsPubKey, vrfPubKey, blsPubKeyProof);
  }

  function _posRegisterIncreaseStake(uint64 votePower) internal override {
    POS_REGISTER.increaseStake(votePower);
  }

  function _posRegisterRetire(uint64 votePower) internal override {
    POS_REGISTER.retire(votePower);
  }
}