const hre = require("hardhat");
const { expect, util } = require("chai");
const { ethers } = hre;
const { parseEther } = require("ethers/lib/utils");

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

    /// CrossSpaceCall Deployment

    const [owner, ] = await ethers.getSigners();

    const MockMappedAddress = await ethers.getContractFactory("MockMappedAddress")
    const MappedAddress = await MockMappedAddress.deploy(owner.address)

    const MockCrossSpaceCall = await ethers.getContractFactory("MockCrossSpaceCall")
    const CrossSpaceCall = await MockCrossSpaceCall.deploy()

    await MappedAddress.deployed()
    await CrossSpaceCall.deployed()

    await CrossSpaceCall.setMockMapped(owner.address, MappedAddress.address)

    await CrossSpaceCall.transferEVM(MappedAddress.address, {value: 1000})

    await CrossSpaceCall.withdrawFromMapped(1000)


    /// ExchangeRoom Deployment

    const Exchangeroom = await ethers.getContractFactory("Exchangeroom");
    const exchangeroom = await Exchangeroom.deploy();
    await exchangeroom.deployed();
    
    return {
      MappedAddress,
      CrossSpaceCall,
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
          const { bridge, CrossSpaceCall} = await deployCoreBridgeFixture();  
          await expect(bridge.initialize(CrossSpaceCall.address)).to.not.be.reverted;  
        });
        
        it("should NOT initialize twice", async () => {
          const { bridge, CrossSpaceCall} = await deployCoreBridgeFixture();
          await expect(bridge.initialize(CrossSpaceCall.address)).to.not.be.reverted;              
          await expect(bridge.initialize(CrossSpaceCall.address)).to.eventually.rejectedWith("Initializable: contract is already initialized"); 
        });
    });

    describe("_addPoolAddress() Tests", async () => {
      
      it("_addPoolAddress should work and emit event", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();


        await expect( bridge._addPoolAddress(accounts[0].address) ).to.not.be.reverted;  


        await expect( bridge._addPoolAddress(accounts[0].address) ).to.emit(bridge, 'AddPoolAddress');  

      });

      it("_addPoolAddress should revert if parameter is zeroAdd", async () => {
          
        const { bridge } = await deployCoreBridgeFixture();


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
          
        const {
          exchangeroom,
          xcfx,
          accounts,
          pool,
          bridge,
          IDENTIFIER,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          CrossSpaceCall,
          MappedAddress
        } = await deployCoreBridgeFixture();
  
        const amount = parseEther(`1000`);

        //initializate
        await pool.initialize();
        await bridge.initialize(CrossSpaceCall.address);
        await pool._setbridges(bridge.address, bridge.address, bridge.address);
  
        //register pool
        await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
          value: amount,
        });
        //check that the pool is already registered
        expect(await pool._poolRegisted()).to.be.equal(true);
  
        //check votes is equal to 1 = only the first deposit until now
        let poolSummary = await pool.poolSummary();
        expect(String(poolSummary.totalvotes)).to.be.equal("1");

        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(bridge.address);
        await xcfx.addMinter(exchangeroom.address);
        await xcfx.addMinter(MappedAddress.address);
        await xcfx.addMinter(CrossSpaceCall.address);

        await bridge._settrustedtrigers(accounts[0].address, true) ;  
        await bridge._settrustedtrigers(bridge.address, true) ;  
        await bridge._settrustedtrigers(pool.address, true) ;  
        await bridge._addPoolAddress(pool.address) ;  
        await bridge._seteSpaceExroomAddress(exchangeroom.address) ;  
        await bridge._seteSpacexCFXAddress(xcfx.address) ;  
        await bridge._seteSpacebridgeAddress(bridge.address) ;  
        await bridge._setCfxCountOfOneVote(1) ;  

        await CrossSpaceCall.setMockMapped(accounts[0].address, MappedAddress.address);
        await CrossSpaceCall.setMockMapped(bridge.address, MappedAddress.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });      
        await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        await exchangeroom._setminexchangelimits(1);
        await exchangeroom._setLockPeriod(0,0);
        await exchangeroom.setlockedvotes(parseEther(`1`));
        await exchangeroom._setStorageaddr(accounts[0].address);
        await exchangeroom._setstorageBridge(accounts[0].address);
        await exchangeroom._setBridge(bridge.address); 
        await exchangeroom._setCoreExchange(MappedAddress.address); 
        const tx = accounts[0].sendTransaction({
          to: MappedAddress.address,
          value: parseEther(`100000`),
        });
        await expect(tx).to.not.be.reverted;

        await bridge.syncALLwork() ;  

        await expect(bridge._setPoolUserShareRatio(0)).to.be.reverted;  
        await expect(bridge._setPoolUserShareRatio(100)).to.not.be.reverted;   
        await expect(bridge._changePoolAddress(accounts[0].address,accounts[0].address)).to.not.be.reverted;    

        await expect( bridge.syncALLwork() ).to.not.be.reverted;  

        await expect( bridge._clearTheStates() ).to.not.be.reverted;  
        await expect( bridge.connect(accounts[1])._setCfxCountOfOneVote(1)).to.be.reverted;  
        await expect( bridge.connect(accounts[1])._setPoolUserShareRatio(1)).to.be.reverted;  
        await expect( bridge.connect(accounts[1])._clearTheStates()).to.be.reverted;
      });

      it("syncAllwork should as expected when totalVotes is zero", async () => {

        const {
          exchangeroom,
          xcfx,
          accounts,
          pool,
          bridge,
          CrossSpaceCall,
          MappedAddress
        } = await deployCoreBridgeFixture();
  
        const amount = parseEther(`1000`);

        //initializate
        await pool.initialize();
        await bridge.initialize(CrossSpaceCall.address);
        await pool._setbridges(bridge.address, bridge.address, bridge.address);

        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(bridge.address);
        await xcfx.addMinter(exchangeroom.address);
        await xcfx.addMinter(MappedAddress.address);
        await xcfx.addMinter(CrossSpaceCall.address);

        await bridge._settrustedtrigers(accounts[0].address, true) ;  
        await bridge._settrustedtrigers(bridge.address, true) ;  
        await bridge._settrustedtrigers(pool.address, true) ;  
        await bridge._addPoolAddress(pool.address) ;  
        await bridge._seteSpaceExroomAddress(exchangeroom.address) ;  
        await bridge._seteSpacexCFXAddress(xcfx.address) ;  
        await bridge._seteSpacebridgeAddress(bridge.address) ;  
        await bridge._setCfxCountOfOneVote(1) ;  

        await CrossSpaceCall.setMockMapped(accounts[0].address, MappedAddress.address);
        await CrossSpaceCall.setMockMapped(bridge.address, MappedAddress.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });      
        await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        await exchangeroom._setminexchangelimits(1);
        await exchangeroom._setLockPeriod(0,0);
        await exchangeroom.setlockedvotes(parseEther(`1`));
        await exchangeroom._setStorageaddr(accounts[0].address);
        await exchangeroom._setstorageBridge(accounts[0].address);
        await exchangeroom._setBridge(bridge.address); 
        await exchangeroom._setCoreExchange(MappedAddress.address); 
        const tx = accounts[0].sendTransaction({
          to: MappedAddress.address,
          value: parseEther(`100000`),
        });
        await expect(tx).to.not.be.reverted;

        const response = await bridge.syncALLwork();

        await expect(bridge._setPoolUserShareRatio(0)).to.be.reverted;  
        await expect(bridge._setPoolUserShareRatio(100)).to.not.be.reverted;   
        await expect(bridge._changePoolAddress(accounts[0].address,accounts[0].address)).to.not.be.reverted;    

        await expect( bridge.syncALLwork() ).to.not.be.reverted;  

        await expect( bridge._clearTheStates() ).to.not.be.reverted;  
        await expect( bridge.connect(accounts[1])._setCfxCountOfOneVote(1)).to.be.reverted;  
        await expect( bridge.connect(accounts[1])._setPoolUserShareRatio(1)).to.be.reverted;  
        await expect( bridge.connect(accounts[1])._clearTheStates()).to.be.reverted;  

      });

      it("syncAllwork should be revert if is called from not trusted triger", async () => {
        const {
          bridge,
          accounts
        } = await deployCoreBridgeFixture();
        await expect(bridge.connect(accounts[2]).syncALLwork()).to.eventually.rejectedWith("trigers must be trusted")
      }); 

      it("syncALLwork should revert", async () => {
          
        const { bridge, accounts} = await deployCoreBridgeFixture();

        await expect( bridge.connect(accounts[3]).syncALLwork()).to.be.reverted;  
        await expect( bridge.syncALLwork() ).to.be.reverted;  
      });
      
      it("syncALLwork should work as expected when votePower is zero", async () => {
          
        const {
          exchangeroom,
          xcfx,
          accounts,
          pool,
          bridge,
          IDENTIFIER,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          CrossSpaceCall,
          MappedAddress,
        } = await deployCoreBridgeFixture();
  
        const amount = parseEther(`1000`);

        //initializate
        await pool.initialize();
        await bridge.initialize(CrossSpaceCall.address);
        await pool._setbridges(bridge.address, bridge.address, bridge.address);
  
        //register pool
        await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
          value: amount,
        });
        //check that the pool is already registered
        expect(await pool._poolRegisted()).to.be.equal(true);
  
        //check votes is equal to 1 = only the first deposit until now
        let poolSummary = await pool.poolSummary();
        expect(String(poolSummary.totalvotes)).to.be.equal("1");

        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(bridge.address);
        await xcfx.addMinter(exchangeroom.address);
        await xcfx.addMinter(MappedAddress.address);
        await xcfx.addMinter(CrossSpaceCall.address);

        await bridge._settrustedtrigers(accounts[0].address, true) ;  
        await bridge._settrustedtrigers(bridge.address, true) ;  
        await bridge._settrustedtrigers(pool.address, true) ;  
        await bridge._addPoolAddress(pool.address) ;  
        await bridge._seteSpaceExroomAddress(exchangeroom.address) ;  
        await bridge._seteSpacexCFXAddress(xcfx.address) ;  
        await bridge._seteSpacebridgeAddress(bridge.address) ;  
        await bridge._setCfxCountOfOneVote(1000) ;  

        await CrossSpaceCall.setMockMapped(accounts[0].address, MappedAddress.address);
        await CrossSpaceCall.setMockMapped(bridge.address, MappedAddress.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });      
        await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        await exchangeroom._setminexchangelimits(1);
        await exchangeroom._setLockPeriod(0,0);
        await exchangeroom.setlockedvotes(parseEther(`1`));
        await exchangeroom._setStorageaddr(accounts[0].address);
        await exchangeroom._setstorageBridge(accounts[0].address);
        await exchangeroom._setBridge(bridge.address); 
        await exchangeroom._setCoreExchange(MappedAddress.address);

        const tx = accounts[0].sendTransaction({
          to: MappedAddress.address,
          value: parseEther(`100000`),
        });
        await expect(tx).to.not.be.reverted;

        //send 1 CFX to the pool
        await expect(accounts[0].sendTransaction({
          to: pool.address,
          value: parseEther(`1`),
        })).to.not.be.reverted;

        await bridge.syncALLwork()
      });

      it("syncALLwork should work as expected when votePower is greater than zero", async () => {
          
        const {
          exchangeroom,
          xcfx,
          accounts,
          pool,
          bridge,
          IDENTIFIER,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          CrossSpaceCall,
          MappedAddress,
        } = await deployCoreBridgeFixture();
  
        const amount = parseEther(`1000`);

        //initializate
        await pool.initialize();
        await bridge.initialize(CrossSpaceCall.address);
        await pool._setbridges(bridge.address, bridge.address, bridge.address);
  
        //register pool
        await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
          value: amount,
        });
        //check that the pool is already registered
        expect(await pool._poolRegisted()).to.be.equal(true);
  
        //check votes is equal to 1 = only the first deposit until now
        let poolSummary = await pool.poolSummary();
        expect(String(poolSummary.totalvotes)).to.be.equal("1");

        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(bridge.address);
        await xcfx.addMinter(exchangeroom.address);
        await xcfx.addMinter(MappedAddress.address);
        await xcfx.addMinter(CrossSpaceCall.address);

        await bridge._settrustedtrigers(accounts[0].address, true) ;  
        await bridge._settrustedtrigers(bridge.address, true) ;  
        await bridge._settrustedtrigers(pool.address, true) ;  
        await bridge._addPoolAddress(pool.address) ;  
        await bridge._seteSpaceExroomAddress(exchangeroom.address) ;  
        await bridge._seteSpacexCFXAddress(xcfx.address) ;  
        await bridge._seteSpacebridgeAddress(bridge.address) ;  
        await bridge._setCfxCountOfOneVote(1000) ;  

        await CrossSpaceCall.setMockMapped(accounts[0].address, MappedAddress.address);
        await CrossSpaceCall.setMockMapped(bridge.address, MappedAddress.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });      
        await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        await exchangeroom._setminexchangelimits(1);
        await exchangeroom._setLockPeriod(0,0);
        await exchangeroom.setlockedvotes(parseEther(`1`));
        await exchangeroom._setStorageaddr(accounts[0].address);
        await exchangeroom._setstorageBridge(accounts[0].address);
        await exchangeroom._setBridge(bridge.address); 
        await exchangeroom._setCoreExchange(MappedAddress.address);

        const tx = accounts[0].sendTransaction({
          to: MappedAddress.address,
          value: parseEther(`100000`),
        });
        await expect(tx).to.not.be.reverted;

        //send 1 CFX to the pool
        await expect(accounts[0].sendTransaction({
          to: pool.address,
          value: parseEther(`2000`),
        })).to.not.be.reverted;

        await bridge.syncALLwork()
      });

      it("syncALLwork should work as expected when xCFX is burn 1 CFX", async () => {
        const {
          exchangeroom,
          xcfx,
          accounts,
          pool,
          bridge,
          IDENTIFIER,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          CrossSpaceCall,
          MappedAddress,
        } = await deployCoreBridgeFixture();
  
        const amount = parseEther(`1000`);

        //initializate
        await pool.initialize();
        await bridge.initialize(CrossSpaceCall.address);
        await pool._setbridges(bridge.address, bridge.address, bridge.address);
  
        //register pool
        await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
          value: amount,
        });
        //check that the pool is already registered
        expect(await pool._poolRegisted()).to.be.equal(true);
  
        //check votes is equal to 1 = only the first deposit until now
        let poolSummary = await pool.poolSummary();
        expect(String(poolSummary.totalvotes)).to.be.equal("1");

        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(bridge.address);
        await xcfx.addMinter(exchangeroom.address);
        await xcfx.addMinter(MappedAddress.address);
        await xcfx.addMinter(CrossSpaceCall.address);

        await bridge._settrustedtrigers(accounts[0].address, true) ;  
        await bridge._settrustedtrigers(bridge.address, true) ;  
        await bridge._settrustedtrigers(pool.address, true) ;  
        await bridge._addPoolAddress(pool.address) ;  
        await bridge._seteSpaceExroomAddress(exchangeroom.address) ;  
        await bridge._seteSpacexCFXAddress(xcfx.address) ;  
        await bridge._seteSpacebridgeAddress(bridge.address) ;  
        await bridge._setCfxCountOfOneVote(1000) ;  

        await CrossSpaceCall.setMockMapped(accounts[0].address, MappedAddress.address);
        await CrossSpaceCall.setMockMapped(bridge.address, MappedAddress.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });      
        await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        await exchangeroom._setminexchangelimits(1);
        await exchangeroom._setLockPeriod(0,0);
        await exchangeroom.setlockedvotes(parseEther(`1`));
        await exchangeroom._setStorageaddr(accounts[0].address);
        await exchangeroom._setstorageBridge(accounts[0].address);
        await exchangeroom._setBridge(bridge.address); 
        await exchangeroom._setCoreExchange(MappedAddress.address);

        const tx = accounts[0].sendTransaction({
          to: MappedAddress.address,
          value: parseEther(`100000`),
        });
        await expect(tx).to.not.be.reverted;

        //send 1 CFX to the pool
        await expect(accounts[0].sendTransaction({
          to: pool.address,
          value: parseEther(`2000`),
        })).to.not.be.reverted;

        await expect(exchangeroom.CFX_exchange_XCFX({value: parseEther(`1`)})).to.not.be.reverted;
        await expect(exchangeroom.XCFX_burn(parseEther(`1`))).to.not.be.reverted;

        await expect(bridge.syncALLwork()).to.not.be.reverted;
      });

      it("syncALLwork should work as expected when xCFX is burn 2000 CFX", async () => {
        const {
          exchangeroom,
          xcfx,
          accounts,
          pool,
          bridge,
          IDENTIFIER,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          CrossSpaceCall,
          MappedAddress,
        } = await deployCoreBridgeFixture();
  
        const amount = parseEther(`1000`);

        //initializate
        await pool.initialize();
        await bridge.initialize(CrossSpaceCall.address);
        await pool._setbridges(bridge.address, bridge.address, bridge.address);
  
        //register pool
        await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
          value: amount,
        });
        //check that the pool is already registered
        expect(await pool._poolRegisted()).to.be.equal(true);
  
        //check votes is equal to 1 = only the first deposit until now
        let poolSummary = await pool.poolSummary();
        expect(String(poolSummary.totalvotes)).to.be.equal("1");

        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(bridge.address);
        await xcfx.addMinter(exchangeroom.address);
        await xcfx.addMinter(MappedAddress.address);
        await xcfx.addMinter(CrossSpaceCall.address);

        await bridge._settrustedtrigers(accounts[0].address, true) ;  
        await bridge._settrustedtrigers(bridge.address, true) ;  
        await bridge._settrustedtrigers(pool.address, true) ;  
        await bridge._addPoolAddress(pool.address) ;  
        await bridge._seteSpaceExroomAddress(exchangeroom.address) ;  
        await bridge._seteSpacexCFXAddress(xcfx.address) ;  
        await bridge._seteSpacebridgeAddress(bridge.address) ;  
        await bridge._setCfxCountOfOneVote(1000) ;  

        await CrossSpaceCall.setMockMapped(accounts[0].address, MappedAddress.address);
        await CrossSpaceCall.setMockMapped(bridge.address, MappedAddress.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });      
        await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        await exchangeroom._setminexchangelimits(1);
        await exchangeroom._setLockPeriod(0,0);
        await exchangeroom.setlockedvotes(parseEther(`1`));
        await exchangeroom._setStorageaddr(accounts[0].address);
        await exchangeroom._setstorageBridge(accounts[0].address);
        await exchangeroom._setBridge(bridge.address); 
        await exchangeroom._setCoreExchange(MappedAddress.address);

        const tx = accounts[0].sendTransaction({
          to: MappedAddress.address,
          value: parseEther(`100000`),
        });
        await expect(tx).to.not.be.reverted;

        //send 1 CFX to the pool
        await expect(accounts[0].sendTransaction({
          to: pool.address,
          value: parseEther(`2000`),
        })).to.not.be.reverted;

        await expect(exchangeroom.CFX_exchange_XCFX({value: parseEther(`2000`)})).to.not.be.reverted;
        await expect(exchangeroom.XCFX_burn(parseEther(`2000`))).to.not.be.reverted;

        await expect(bridge.syncALLwork()).to.not.be.reverted;
      });
    });

    describe("fallback() Test", async () => {

      it("fallback should work", async function () {
        const { bridge , accounts } = await deployCoreBridgeFixture();

        expect  (await bridge.fallback({ value: 1})).to.not.be.reverted;
        
        const tx = accounts[0].sendTransaction({
          to: bridge.address,
          data: "0x1234",
        });
        
        await expect(tx).to.not.be.reverted;
        await expect(bridge.fallback()).to.not.be.reverted;

      });

    });

 
  });

});
