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


    describe("_settrustedtrigers() Tests", async () => {
      
      it("_settrustedtrigers should revert with Can not be Zero adress", async () => {
        
        const { bridge} = await deployCoreBridgeFixture();


        await expect( bridge._settrustedtrigers(zeroAddress, true) ).to.be.revertedWith("Can not be Zero adress");  

      });

      it("_settrustedtrigers should revert", async () => {
        
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect ( bridge.connect(accounts[1])._settrustedtrigers(accounts[1].address, true) ).to.be.reverted;  

      });
    

            
      it("_settrustedtrigers should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._settrustedtrigers(accounts[0].address, true) ).to.not.be.reverted;  


        await expect( bridge._settrustedtrigers(accounts[0].address, true) ).to.emit(bridge, 'Settrustedtrigers');  

      });

    });

    describe("initialize() Tests", async () => {
      
        it("initialize should not revert", async () => {
          
          const { bridge} = await deployCoreBridgeFixture();
  
  
          await expect( bridge.initialize() ).to.not.be.reverted;  
  
        });
  
      
    });

    describe("_addPoolAddress() Tests", async () => {
      
      it("_addPoolAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._addPoolAddress(accounts[0].address) ).to.not.be.reverted;  


        await expect( bridge._addPoolAddress(accounts[0].address) ).to.emit(bridge, 'AddPoolAddress');  

      });

      it("_addPoolAddress should revert if parameter is zeroAdd", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._addPoolAddress(zeroAddress) ).to.be.revertedWith('Can not be Zero adress');  


      });

      it("_addPoolAddress should revert if called by not owner", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge.connect(accounts[2])._addPoolAddress(accounts[0].address) ).to.be.reverted;  


      });
    
    });

    describe("_changePoolAddress() Tests", async () => {
      
      it("_changePoolAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._changePoolAddress(accounts[1].address, accounts[2].address) ).to.not.be.reverted;  


        await expect( bridge._changePoolAddress(accounts[1].address, accounts[2].address) ).to.emit(bridge, 'ChangePoolAddress');  

        await bridge._addPoolAddress(accounts[1].address) ;

        await expect( bridge._changePoolAddress(accounts[1].address, accounts[2].address) ).to.emit(bridge, 'ChangePoolAddress');  



      });

      it("_changePoolAddress should revert if parameter is zeroAdd", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._changePoolAddress(accounts[1].address,zeroAddress) ).to.be.revertedWith('Can not be Zero adress');  


      });

      it("_changePoolAddress should revert if called by not owner", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge.connect(accounts[2])._changePoolAddress(accounts[1].address, accounts[2].address) ).to.be.reverted;  


      });


      it("_changePoolAddress should not revert if address is the same", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._changePoolAddress(accounts[1].address, accounts[1].address) ).to.not.be.reverted;  


      });
    
    });

    describe("_delePoolAddress() Tests", async () => {
      
      it("_delePoolAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._delePoolAddress(accounts[1].address) ).to.not.be.reverted;  

        await bridge._addPoolAddress(accounts[1].address) ;
        
        await expect( bridge._delePoolAddress(accounts[2].address) ).to.emit(bridge, 'DelePoolAddress');  

        await expect( bridge._delePoolAddress(accounts[1].address) ).to.emit(bridge, 'DelePoolAddress');  

      });

      it("_delePoolAddress should revert if called by not owner", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge.connect(accounts[2])._delePoolAddress(accounts[1].address) ).to.be.reverted;  


      });

      
    
    });

    describe("_seteSpaceExroomAddress() Tests", async () => {
      
      it("_seteSpaceExroomAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._seteSpaceExroomAddress(accounts[0].address) ).to.not.be.reverted;  


        await expect( bridge._seteSpaceExroomAddress(accounts[0].address) ).to.emit(bridge, 'SeteSpaceExroomAddress');  

      });

      it("_seteSpaceExroomAddress should revert if parameter is zeroAdd", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._seteSpaceExroomAddress(zeroAddress) ).to.be.revertedWith('Can not be Zero adress');  


      });

      it("_seteSpaceExroomAddress should revert if called by not owner", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge.connect(accounts[2])._seteSpaceExroomAddress(accounts[0].address) ).to.be.reverted;  


      });
    
    });

    describe("_seteSpacexCFXAddress() Tests", async () => {
      
      it("_seteSpacexCFXAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._seteSpacexCFXAddress(accounts[0].address) ).to.not.be.reverted;  


        await expect( bridge._seteSpacexCFXAddress(accounts[0].address) ).to.emit(bridge, 'SeteSpacexCFXAddress');  

      });

      it("_seteSpacexCFXAddress should revert if parameter is zeroAdd", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._seteSpacexCFXAddress(zeroAddress) ).to.be.revertedWith('Can not be Zero adress');  


      });

      it("_seteSpacexCFXAddress should revert if called by not owner", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge.connect(accounts[2])._seteSpacexCFXAddress(accounts[0].address) ).to.be.reverted;  


      });
    });

    describe("_seteSpacebridgeAddress() Tests", async () => {
      
      it("_seteSpacebridgeAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._seteSpacebridgeAddress(accounts[0].address) ).to.not.be.reverted;  


        await expect( bridge._seteSpacebridgeAddress(accounts[0].address) ).to.emit(bridge, 'SeteSpacebridgeAddress');  

      });

      it("_seteSpacebridgeAddress should revert if parameter is zeroAdd", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._seteSpacebridgeAddress(zeroAddress) ).to.be.revertedWith('Can not be Zero adress');  


      });

      it("_seteSpacebridgeAddress should revert if called by not owner", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge.connect(accounts[2])._seteSpacebridgeAddress(accounts[0].address) ).to.be.reverted;  


      });
    
    });


    describe("_seteServicetreasuryAddress() Tests", async () => {
      

      it("_seteServicetreasuryAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._seteServicetreasuryAddress(accounts[0].address) ).to.not.be.reverted;  


        await expect( bridge._seteServicetreasuryAddress(accounts[0].address) ).to.emit(bridge, 'SeteServicetreasuryAddress');  

      });

      it("_seteServicetreasuryAddress should revert if parameter is zeroAdd", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._seteServicetreasuryAddress(zeroAddress) ).to.be.revertedWith('Can not be Zero adress');  


      });

      it("_seteServicetreasuryAddress should revert if called by not owner", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge.connect(accounts[2])._seteServicetreasuryAddress(accounts[0].address) ).to.be.reverted;  


      });
    
    });

    describe("_setCfxCountOfOneVote() Tests", async () => {
      
      it("_setCfxCountOfOneVote should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._setCfxCountOfOneVote(1)).to.not.be.reverted;  


        await expect( bridge._setCfxCountOfOneVote(1)).to.emit(bridge, 'SetCfxCountOfOneVote');  

      });
    
    });

    describe("_setPoolUserShareRatio() Tests", async () => {
      
      it("_setPoolUserShareRatio should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._setPoolUserShareRatio(1)).to.not.be.reverted;  


        await expect( bridge._setPoolUserShareRatio(1)).to.emit(bridge, 'SetPoolUserShareRatio');  

      });
    
    
    });

    describe("getPoolAddress() Tests", async () => {
      
      it("getPoolAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge.getPoolAddress()).to.not.be.reverted;  


      });
    
    });

    describe("_clearTheStates() Tests", async () => {
      
      it("_clearTheStates should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._clearTheStates()).to.not.be.reverted;  
        await expect( bridge._clearTheStates()).to.emit(bridge, 'ClearTheStates');  



      });
    
    });


    describe("syncALLwork() Tests", async () => {
      
      it("syncALLwork should work", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();

        await bridge._settrustedtrigers(accounts[0].address, true) ;  
        
        let triggerState = await bridge.gettrigerstate(accounts[0].address);

        console.log("gettrigerstate returned " + triggerState);

        await expect( bridge.syncALLwork()).to.be.reverted;  

      //  let infos = await bridge.connect(accounts[0]).syncALLwork();

      //  console.log('infos is ' + infos);




      });

      it("syncALLwork should revert", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();

        await expect( bridge.connect(accounts[3]).syncALLwork()).to.be.reverted;  

      });
    
    });





 
  });

});
