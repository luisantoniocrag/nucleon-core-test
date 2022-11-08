//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IPoSPoolmini {
    function increaseStake(uint64 votePower) external payable;
    function decreaseStake(uint64 votePower) external;
}