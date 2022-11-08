const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = hre;
const { parseEther } = require("ethers/lib/utils");


const testAddress = "0x1d6A7511E50840efB7E04DFcAef3DAE3a5C7428F"
const zeroAddress = "0x0000000000000000000000000000000000000000"

describe("CoreBridge", async function () {
  async function deployCoreBridgeFixture() {
    const IDENTIFIER =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const ONE_VOTE_CFX = 1000;

    const blsPubKeyProof = ["0x00", "0x00"];
    const blsPubKey = "0x00";
    const vrfPubKey = "0x00";
    const accounts = await ethers.getSigners();

    /// Mock Deployment
    const MockStaking = await ethers.getContractFactory("MockStaking");
    const staking = await MockStaking.deploy();

    const MockPoSRegister = await ethers.getContractFactory("MockPoSRegister");
    const posRegister = await MockPoSRegister.deploy();

    /// xcfx Deployment

    const MockXCFX = await ethers.getContractFactory("XCFX");
    const xcfx = await MockXCFX.deploy();

    /// CoreBridge Deployment

    const CoreBridge = await ethers.getContractFactory("CoreBridge_multipool");
    const bridge = await CoreBridge.deploy();

    await staking.deployed();
    await posRegister.deployed();
    await bridge.deployed();

    /// Contract Deployment
    const PoSPoolmini = await ethers.getContractFactory("PoSPoolminiDebug");
    const pool = await PoSPoolmini.deploy(staking.address, posRegister.address);
    await pool.deployed();



    const Exchangeroom = await ethers.getContractFactory("Exchangeroom");
    const exchangeroom = await Exchangeroom.deploy();
    await exchangeroom.deployed();
    
    return {
      exchangeroom,
      xcfx,
      accounts,
      pool,
      bridge,
      IDENTIFIER,
      ONE_VOTE_CFX,
      blsPubKeyProof,
      blsPubKey,
      vrfPubKey,
    };

  }
  describe('CoreBridge Tests', async function () {

    describe("gettrigerstate() Tests", async () => {
      
      it("gettrigerstate should return true", async () => {
        
        const { exchangeroom , bridge, accounts} = await deployCoreBridgeFixture();

        await bridge._settrustedtrigers(accounts[0].address, true);

        let triggerState = await bridge.gettrigerstate(accounts[0].address);

          //   console.log("gettrigerstate returned " + triggerState);

             expect ( await bridge.gettrigerstate(accounts[1].address) ).to.be.equal(false);


      });

      it("gettrigerstate should return false", async () => {
        
        const { exchangeroom , bridge, accounts} = await deployCoreBridgeFixture();

        let triggerState = await bridge.gettrigerstate(accounts[1].address);

          expect ( await bridge.gettrigerstate(accounts[1].address) ).to.be.equal(false);

      });
      
    });






  });

 
});
