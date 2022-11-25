const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = hre;
const { parseEther } = require("ethers/lib/utils");
const { BigNumber } = require("ethers");


const testAddress = "0x1d6A7511E50840efB7E04DFcAef3DAE3a5C7428F"
const zeroAddress = "0x0000000000000000000000000000000000000000"


describe("Exchangeroom", async function () {
  async function deployExchangeroomFixture() {
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

    const MockXCFX = await ethers.getContractFactory("XCFXDebug");
    const xcfx = await MockXCFX.deploy();

    /// CoreBridge Deployment

    const MockCoreBridge = await ethers.getContractFactory(
      "CoreBridge_multipool"
    );
    const bridge = await MockCoreBridge.deploy();

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

  describe('Tests for each function', async function () {

    describe("getBridge() Tests", async () => {
      
      it("getBridge should return Zero Address", async () => {
        
        const { exchangeroom } = await deployExchangeroomFixture();

        let getBridge = await exchangeroom.getBridge()

          await expect(
              (
                  getBridge
                  ).toString()
          ).to.equal(zeroAddress);

      });
      
    });

    describe("getLockPeriod() Tests", async () => {
      
      it('getLockPeriod should return Zero Address', async function () {
          
        const { exchangeroom } = await deployExchangeroomFixture();

        let getLockPeriod = await exchangeroom.getLockPeriod();

          await expect(
              (
                  getLockPeriod
                  ).toString()
          ).to.equal("0,0");

      }); 
    });

    describe("getSettings() Tests", async () => {
      
      
      it('getSettings should return Zero', async function () {
        const { exchangeroom } = await deployExchangeroomFixture();
        let settings = await exchangeroom.getSettings()

          expect((await exchangeroom.getSettings()).toString()).to.equal(",0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000000");


      });

    });

    describe("espacebalanceof() Tests", async () => {
      
      it('espacebalanceof should return Zero', async function () {
        const { exchangeroom } = await deployExchangeroomFixture();
        let balance = await exchangeroom.espacebalanceof(testAddress)

          expect((await exchangeroom.espacebalanceof(testAddress)).toString()).to.equal('0');
    

      });



    });

    describe("Summary() Tests", async () => {
      
      

      it('Summary should return Zero', async function () {
        const { exchangeroom } = await deployExchangeroomFixture();
        let summary = await exchangeroom.Summary()

      //   console.log("Summary is: " + summary);

          expect((await exchangeroom.Summary()).toString()).to.equal('0,0,0,0,0');
  

      });
      


    });

    describe("userSummary() Tests", async () => {
      it('userSummary should return Zero', async function () {
        const { exchangeroom } = await deployExchangeroomFixture();
        let userSummary = await exchangeroom.userSummary(testAddress)

      //    console.log("userSummary is: " + userSummary);

          expect((await exchangeroom.userSummary(testAddress)).toString()).to.equal('0,0');
    

      });
      


    });

    describe("CFX_burn_estim() Tests", async () => {
            
      it('CFX_burn_estim should return Zero', async function () {
        const { exchangeroom } = await deployExchangeroomFixture();
        let XCFX_burn_estim = await exchangeroom.XCFX_burn_estim(0)

      //    console.log("XCFX_burn_estim " + XCFX_burn_estim);
      await exchangeroom.XCFX_burn_estim(1);
      expect((await exchangeroom.XCFX_burn_estim(0)).toString()).to.equal('0,1');
  
      });
      


    });

    describe("collectOutqueuesFinishedVotes() Tests", async () => {
      
      
      it('collectOutqueuesFinishedVotes should return [object Object]', async function () {
        const { exchangeroom } = await deployExchangeroomFixture();
        let collectOutqueuesFinishedVotes = await exchangeroom.collectOutqueuesFinishedVotes()

      //    console.log("collectOutqueuesFinishedVotes " + collectOutqueuesFinishedVotes);

          expect((await exchangeroom.collectOutqueuesFinishedVotes()).toString()).to.equal('[object Object]');
      
      });


    });

    describe("userOutQueue() Tests", async () => {
      
      it('userOutQueue should be empty', async function () {
        const { exchangeroom } = await deployExchangeroomFixture();
        let userOutQueue = await exchangeroom.userOutQueue(testAddress)

      //    console.log("userOutQueue " + userOutQueue);

          expect((await exchangeroom.userOutQueue(testAddress)).toString()).to.equal('');

      }); 


    });

    describe("getBridge() Tests", async () => {
      
     
      it('getBridge should return zero Address', async function () {
        const { exchangeroom } = await deployExchangeroomFixture();
        let getBridge = await exchangeroom.getBridge()

      //    console.log("getBridge " + getBridge);

          expect((await exchangeroom.getBridge()).toString()).to.equal(zeroAddress);

      });
 


    });

    describe("CFX_exchange_estim() Tests", async () => {
      
      it('CFX_exchange_estim should return 1', async function () {

        const { exchangeroom , accounts } = await deployExchangeroomFixture();



        await exchangeroom._setBridge(accounts[2].address);

        await expect(exchangeroom.connect(accounts[2]).setxCFXValue(1)).to.not.be.reverted;     

        let CFX_exchange_estim = await exchangeroom.CFX_exchange_estim(1)

   //     console.log("CFX_exchange_estim " + CFX_exchange_estim);

        expect( await exchangeroom.CFX_exchange_estim(1)).to.equal(parseEther("1"))

      });


    });

    describe("XCFX_burn() Tests", async () => {
      
      it(`XCFX_burn should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
            exchangeroom.XCFX_burn(0)
        ).to.be.reverted;  
      });

      it(`XCFX_burn should be reverted with 1`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
         await expect(
              exchangeroom.XCFX_burn(1)
          ).to.be.reverted;  
      });

      it('it should NOT burn xCFX tokens if there is not enough CFX balances in the contract', async () => {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        
        const amount = parseEther(`1000`);
        
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
          
        await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        
        await exchangeroom._setminexchangelimits(parseEther(`1`));

        //get 1000 xCFX
        await expect (exchangeroom.connect(accounts[2]).CFX_exchange_XCFX({value : parseEther(`1000`)})).to.not.be.reverted;

        //mint 1000 xCFX to account 2 from a minter
        await xcfx.connect(accounts[0]).mintWithoutAffectTotalSupply(accounts[2].address, parseEther(`2000`));

        //try to burn 2000 xCFX from account 2
        await expect(exchangeroom.connect(accounts[2]).XCFX_burn(parseEther(`3000`))).to.eventually.rejectedWith("Exceed exchange limit");
      });

      it ('should not burn XCFX if queue is greather than 35', async () => {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        
        const amount = parseEther(`1000`);
        
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
          
        await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        
        await exchangeroom._setminexchangelimits(parseEther(`1`));

        //repeat 36 times
        for (let i = 0; i < 35; i++) {
          await exchangeroom.CFX_exchange_XCFX({value : parseEther(`10`)});
          await exchangeroom.XCFX_burn(parseEther(`10`));

          process.stdout.write(
            `\r increasing queue to: ${i + 1}/35`
          );
        }
        await expect(exchangeroom.XCFX_burn(parseEther(`10`))).to.eventually.rejectedWith("TOO long queues!");
      });

      it(`XCFX_burn should work`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        
        const amount = parseEther(`1000`);
        
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
          
        await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        
        await exchangeroom._setminexchangelimits(parseEther(`1`));

        await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`20`)})).to.not.be.reverted;

        await expect (exchangeroom.XCFX_burn(parseEther(`0.5`))).to.be.reverted;
        await expect (exchangeroom.XCFX_burn(parseEther(`100000`))).to.be.reverted;
        await expect (exchangeroom.XCFX_burn(parseEther(`10`))).to.not.be.reverted;           
      });

    });

    describe("getback_CFX() Tests", async () => {
      
      it(`getback_CFX should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
         await expect(
              exchangeroom.getback_CFX(0)
          ).to.be.reverted;   
      });

      it(`it should NOT execute if internal transactions is not success`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        
        const amount = parseEther(`1000`);
        
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);
        await expect(exchangeroom.initialize(xcfx.address, amount, { value: 0 })).to.be.reverted;       
        await expect(exchangeroom.initialize(zeroAddress, amount, { value: amount })).to.be.reverted;       

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
           
        await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        
        await exchangeroom._setminexchangelimits(1);

        //set mockBridge non-payable
        const BridgeMockNonPayabe = await ethers.getContractFactory("MockCoreBridge_multipool_nonPayable");
        const bridgeMockNonPayable = await BridgeMockNonPayabe.deploy();
        await bridgeMockNonPayable.deployed();

        //get 20 xCFx from coreBridgeMock contract (non-payable contract)
        await expect (
          bridgeMockNonPayable.Exchangeroom_exchangeBalances(exchangeroom.address,{value : parseEther(`20`)})
        ).to.not.be.reverted;
        
        //check bridge contract has 20 xCFX 
        expect((Number(await xcfx.balanceOf(bridgeMockNonPayable.address)))).to.be.equal(20e18);

        await exchangeroom._setLockPeriod(0,0);

        await expect(bridgeMockNonPayable.Exchangeroom_getback_CFX(exchangeroom.address,0)).to.eventually.rejectedWith("CFX Transfer Failed");
      });

      it(`it should NOT execute if try to withdraw more than unlocked funds`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        
        const amount = parseEther(`1000`);
        
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);
        await expect(exchangeroom.initialize(xcfx.address, amount, { value: 0 })).to.be.reverted;       
        await expect(exchangeroom.initialize(zeroAddress, amount, { value: amount })).to.be.reverted;       

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
           
        await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        
        await exchangeroom._setminexchangelimits(1);
        
        //deposit by exchanging 20 CFX
        await expect (exchangeroom.connect(accounts[1]).CFX_exchange_XCFX({value : parseEther(`200`)})).to.not.be.reverted;
        //deposit by exchanging another 20 CFX to avoid first required
        await expect (exchangeroom.connect(accounts[2]).CFX_exchange_XCFX({value : parseEther(`20`)})).to.not.be.reverted;

        //send 10 xCFX to account 1 TEST FUNCTION
        await xcfx.mintWithoutAffectTotalSupply(accounts[1].address, parseEther(`10`));

        await exchangeroom._setLockPeriod(0,0);


        await exchangeroom.connect(accounts[1]).XCFX_burn(parseEther(`200`));

        await expect(exchangeroom.connect(accounts[1]).getback_CFX(parseEther(`201`))).to.eventually.rejectedWith("your Unlocked CFX is not enough")
      });

      it(`getback_CFX should work`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        
        const amount = parseEther(`1000`);
        
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);
        await expect(exchangeroom.initialize(xcfx.address, amount, { value: 0 })).to.be.reverted;       
        await expect(exchangeroom.initialize(zeroAddress, amount, { value: amount })).to.be.reverted;       

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
           
        await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        
        await exchangeroom._setminexchangelimits(1);

        await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`20`)})).to.not.be.reverted;

        await exchangeroom._setLockPeriod(0,0);

        await expect (exchangeroom.XCFX_burn(parseEther(`10`))).to.not.be.reverted;
        await expect (exchangeroom.getback_CFX(parseEther(`1000000`))).to.be.reverted;
        await expect (exchangeroom.getback_CFX(parseEther(`21`))).to.be.reverted;
        await expect (exchangeroom.getback_CFX(parseEther(`10`))).to.eventually.emit("WithdrawStake");

        await xcfx.addTokens(accounts[0].address,parseEther(`10000000`));
        await expect (exchangeroom.getback_CFX(parseEther(`1000000`))).to.be.reverted;
      });

    });

    describe("_setLockPeriod() Tests", async () => {
      
      it(`_setLockPeriod should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
              exchangeroom.connect(accounts[2])._setLockPeriod(0,0)
          ).to.be.reverted;    
      });

      it(`_setLockPeriod should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
            exchangeroom.connect(accounts[0])._setLockPeriod(0,0)
        ).to.not.be.reverted;    

        await expect(
          exchangeroom.connect(accounts[0])._setLockPeriod(0,0)
        ).to.emit(exchangeroom,"SetLockPeriod");    
      
    });

    });

    describe("_setminexchangelimits() Tests", async () => {
      
      it(`_setminexchangelimits should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
         await expect(
              exchangeroom.connect(accounts[2])._setminexchangelimits(0)
          ).to.be.reverted;  
      });


    });

    describe("_setPoolName() Tests", async () => {
      
      it(`_setPoolName should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
         await expect(
              exchangeroom.connect(accounts[2])._setPoolName("Test Name")
          ).to.be.reverted;   
      });

      it(`_setPoolName should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
              exchangeroom.connect(accounts[0])._setPoolName("Test Name")
          ).to.not.be.reverted;   
      });

      await expect(
        exchangeroom._setPoolName("Test Name")
      ).to.emit(exchangeroom,"SetPoolName"); 

    });

    describe("_setBridge() Tests", async () => {
      
      it(`_setBridge should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
         await expect(
              exchangeroom.connect(accounts[2])._setBridge(zeroAddress)
          ).to.be.reverted;      

          await expect(
              exchangeroom.connect(accounts[0])._setBridge(zeroAddress)
          ).to.be.reverted;    
      });

      it(`_setBridge should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
              exchangeroom.connect(accounts[0])._setBridge(accounts[0].address)
          ).to.not.be.reverted; 
          
          await expect(
              exchangeroom.connect(accounts[0])._setBridge(accounts[0].address)
          ).to.emit(exchangeroom,"SetBridge"); 
          

      });

    });

    describe("_setCoreExchange() Tests", async () => {
      
      it(`_setCoreExchange should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();

          await expect(
              exchangeroom.connect(accounts[2])._setCoreExchange(zeroAddress)
          ).to.be.reverted;   
          
          await expect(
              exchangeroom.connect(accounts[0])._setCoreExchange(zeroAddress)
          ).to.be.reverted; 


      });

      it(`_setCoreExchange should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await expect(
              exchangeroom.connect(accounts[0])._setCoreExchange(accounts[0].address)
          ).to.not.be.reverted;   

          await expect(
            exchangeroom._setCoreExchange(accounts[0].address)
          ).to.emit(exchangeroom,"SetCoreExchange"); 
      });


    });

    describe("_setStorageaddr() Tests", async () => {

      it(`_setStorageaddr should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await expect(
              exchangeroom.connect(accounts[2])._setStorageaddr(zeroAddress)
          ).to.be.reverted;    

          await expect(
              exchangeroom.connect(accounts[0])._setStorageaddr(zeroAddress)
          ).to.be.reverted; 

      });
      
      it(`_setStorageaddr should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
              exchangeroom.connect(accounts[0])._setStorageaddr(accounts[0].address)
          ).to.not.be.reverted;    

          await expect(
            exchangeroom._setStorageaddr(accounts[0].address)
          ).to.emit(exchangeroom,"SetStorageaddr"); 
      });

      


    });

    describe("_setXCFXaddr() Tests", async () => {
      
      it(`_setXCFXaddr should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await expect(
              exchangeroom.connect(accounts[2])._setXCFXaddr(zeroAddress)
          ).to.be.reverted;     

          await expect(
              exchangeroom.connect(accounts[0])._setXCFXaddr(zeroAddress)
          ).to.be.reverted; 

      });

      it(`_setXCFXaddr should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
              exchangeroom.connect(accounts[0])._setXCFXaddr(xcfx.address)
          ).to.not.be.reverted;     
      });

    });

    describe("handleCFXexchangeXCFX() Tests", async () => {
      
      it(`handleCFXexchangeXCFX should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await expect(
              exchangeroom.connect(accounts[2]).handleCFXexchangeXCFX()
          ).to.be.reverted;    
      });

      it(`handleCFXexchangeXCFX should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();  
          await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
          
          await expect(
              exchangeroom.connect(accounts[1]).handleCFXexchangeXCFX({ value: 50 })
          ).to.be.reverted;  
      });

      it("it should NOT handle exchange xCFX if internal transaction is not success", async () => {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();

        await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
    
        const amount = parseEther(`1000`);

        await expect(await accounts[0].sendTransaction({to: exchangeroom.address, value: amount}))
        .to.changeEtherBalance(exchangeroom.address, amount);

        await expect(await accounts[0].sendTransaction({to: accounts[1].address, value: amount}))
        .to.changeEtherBalance(accounts[1].address, amount);

        await xcfx.connect(accounts[0]).addMinter(accounts[0].address);

        await xcfx.connect(accounts[0]).addTokens(accounts[0].address, amount);

        await xcfx.connect(accounts[0]).transfer(exchangeroom.address, amount);
      
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);

        await xcfx.addTokens(exchangeroom.address,amount);
        await xcfx.addTokens(accounts[0].address,amount);
        
        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
            
        await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
        await exchangeroom._setXCFXaddr(xcfx.address);
        
        await exchangeroom._setminexchangelimits(1);
        await exchangeroom._setLockPeriod(0,0);
        await exchangeroom.setlockedvotes(parseEther(`2000`));

        await exchangeroom._setStorageaddr(accounts[0].address);
        await exchangeroom._setstorageBridge(accounts[0].address);

        await exchangeroom.setxCFXValue(parseEther(`1`));

        await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`20`)})).to.not.be.reverted;

        await expect (exchangeroom.XCFX_burn(parseEther(`10`))).to.not.be.reverted;

        await expect (exchangeroom.getback_CFX(parseEther(`10`))).to.not.be.reverted;

        await exchangeroom._setCoreExchange(accounts[0].address);   
        
        await expect(
            exchangeroom.handleCFXexchangeXCFX({from: accounts[0].address, value: 0})
        ).to.be.reverted;   

        //non-payable bridge
        const MockBridgeNonPayable = await ethers.getContractFactory("MockCoreBridge_multipool_nonPayable");
        const mockBridgeNonPayable = await MockBridgeNonPayable.deploy();
        await mockBridgeNonPayable.deployed();

        // set Bridge to non payable bridge
        await exchangeroom.connect(accounts[0])._setBridge(mockBridgeNonPayable.address);

        await expect(mockBridgeNonPayable.Exchangeroom_handleCFXexchangeXCFX(exchangeroom.address, {value: 1})).to.eventually.rejectedWith("CFX Transfer Failed");
      }); 

      it("handleCFXexchangeXCFX should work", async function () {
          const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();

          await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
      
          const amount = parseEther(`1000`);

          await expect(await accounts[0].sendTransaction({to: exchangeroom.address, value: amount}))
          .to.changeEtherBalance(exchangeroom.address, amount);

          await expect(await accounts[0].sendTransaction({to: accounts[1].address, value: amount}))
          .to.changeEtherBalance(accounts[1].address, amount);

          await xcfx.connect(accounts[0]).addMinter(accounts[0].address);

          await xcfx.connect(accounts[0]).addTokens(accounts[0].address, amount);

          await xcfx.connect(accounts[0]).transfer(exchangeroom.address, amount);
        
          await xcfx.addMinter(accounts[0].address);
          await xcfx.addMinter(exchangeroom.address);

          await xcfx.addTokens(exchangeroom.address,amount);
          await xcfx.addTokens(accounts[0].address,amount);
          
          await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
              
          await exchangeroom.connect(accounts[0])._setBridge(accounts[0].address);
          await exchangeroom._setXCFXaddr(xcfx.address);
          
          await exchangeroom._setminexchangelimits(1);
          await exchangeroom._setLockPeriod(0,0);
          await exchangeroom.setlockedvotes(parseEther(`2000`));

          await exchangeroom._setStorageaddr(accounts[0].address);
          await exchangeroom._setstorageBridge(accounts[0].address);

          await exchangeroom.setxCFXValue(parseEther(`1`));

          await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`20`)})).to.not.be.reverted;

          await expect (exchangeroom.XCFX_burn(parseEther(`10`))).to.not.be.reverted;

          await expect (exchangeroom.getback_CFX(parseEther(`10`))).to.not.be.reverted;
  
          await exchangeroom._setCoreExchange(accounts[0].address);   
          
          await expect(
              exchangeroom.handleCFXexchangeXCFX({from: accounts[0].address, value: 0})
          ).to.be.reverted;   

          await exchangeroom.handleCFXexchangeXCFX({from: accounts[0].address, value: 1});

          await exchangeroom._setCoreExchange(accounts[1].address);   
    
          await exchangeroom.handleCFXexchangeXCFX({from: accounts[0].address, value: 1});
      });
    });

    describe("handlexCFXadd() Tests", async () => {
      
      
      it(`handlexCFXadd should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await expect(
              exchangeroom.connect(accounts[2]).handlexCFXadd()
          ).to.be.reverted;  
      });

      it(`handlexCFXadd should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
          
          await expect(
              exchangeroom.connect(accounts[1]).handlexCFXadd()
          ).to.not.be.reverted;  
          
          await expect(
            exchangeroom.connect(accounts[1]).handlexCFXadd()
          ).to.emit(exchangeroom,"HandlexCFXadd");

      });

      

    });

    describe("handleUnstake() Tests", async () => {
      
      it(`handleUnstake should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await expect(
              exchangeroom.connect(accounts[2]).handleUnstake()
          ).to.be.reverted;     
      });


      it(`handleUnstake should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
          
          await expect(
              exchangeroom.connect(accounts[1]).handleUnstake()
          ).to.not.be.reverted;  
          
          await expect(
            exchangeroom.connect(accounts[1]).handleUnstake()
          ).to.emit(exchangeroom,"HandleUnstake");


      });

    });

    describe("setxCFXValue() Tests", async () => {
      
      it(`setxCFXValue should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await expect(
              exchangeroom.connect(accounts[2]).setxCFXValue(1)
          ).to.be.reverted;     
      });

      it(`setxCFXValue should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);

          await expect(
              exchangeroom.connect(accounts[1]).setxCFXValue(1)
          ).to.not.be.reverted;     
      });


    });

    describe("setlockedvotes() Tests", async () => {
      
      it(`setlockedvotes should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
              exchangeroom.connect(accounts[2]).setlockedvotes(1)
          ).to.be.reverted;  
      });

      it(`setlockedvotes should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture(); 
          await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
          
          await expect(
              exchangeroom.connect(accounts[1]).setlockedvotes(1)
          ).to.not.be.reverted;  

          await expect(
            exchangeroom.connect(accounts[1]).setlockedvotes(1)
          ).to.emit(exchangeroom,"Setlockedvotes");
      });


    });

    describe("initialize() Tests", async () => {
      
      it(`initialize should be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          const amount = parseEther(`1000`);

          await expect(
              exchangeroom.connect(accounts[0]).initialize(xcfx.address, amount,{ value: amount })
          ).to.be.reverted;
      });
      

      it(`initialize should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
            
        const amount = parseEther(`1000`);
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
           
      });

      it("should NOT initialize twice", async () => {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
            
        const amount = parseEther(`1000`);
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });   

        await expect(exchangeroom.initialize(xcfx.address, amount, { value: amount })).to.be.revertedWith("Initializable: contract is already initialized");
      });

    });

    describe("CFX_exchange_XCFX() Tests", async () => {
      
      it("CFX_exchange_XCFX should revert", async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
          const amount = parseEther(`10`);

        await expect (exchangeroom.connect(accounts[1]).CFX_exchange_XCFX({value : amount})).to.be.reverted;
          

      });

      it("CFX_exchange_XCFX should work", async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        
        const amount = parseEther(`1000`);
        
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
           
          
        await exchangeroom.connect(accounts[0])._setBridge(accounts[1].address);
        await exchangeroom._setXCFXaddr(xcfx.address);


        await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`10`)})).to.not.be.reverted;
        await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`1000`)})).to.not.be.reverted;
        await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`0`)})).to.be.reverted;
        
      });

      it("CFX_exchange_XCFX should revert if internal transfer fails", async () => {
        const { exchangeroom , accounts, xcfx, pool } = await deployExchangeroomFixture();
        
        const amount = parseEther(`1000`);
        
        await xcfx.addMinter(accounts[0].address);
        await xcfx.addMinter(exchangeroom.address);

        await exchangeroom.initialize(xcfx.address, amount, { value: amount });       
        
        const MockCoreBridge = await ethers.getContractFactory(
          "MockCoreBridge_multipool_nonPayable"
        );
        const bridge = await MockCoreBridge.deploy();  
        await bridge.deployed();
        await bridge.initialize(pool.address);
          
        await exchangeroom.connect(accounts[0])._setBridge(bridge.address);
        await exchangeroom._setXCFXaddr(xcfx.address);

        await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`10`)})).to.eventually.rejectedWith("CFX Transfer Failed");
        await expect (exchangeroom.CFX_exchange_XCFX({value : parseEther(`1000`)})).to.eventually.rejectedWith("CFX Transfer Failed");
      });
    });

    describe("_setminexchangelimits() Tests", async () => {

      it(`_setminexchangelimits should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
              exchangeroom.connect(accounts[0])._setminexchangelimits(0)
          ).to.not.be.reverted;  
      });


    });

    describe("_setstorageBridge() Tests", async () => {

      it(`_setstorageBridge should not be reverted`, async function () {
        const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();
        await expect(
              exchangeroom.connect(accounts[0])._setstorageBridge(accounts[0].address)
          ).to.not.be.reverted;    

          await expect(
              exchangeroom.connect(accounts[2])._setstorageBridge(accounts[0].address)
          ).to.be.reverted;  

          await expect(
              exchangeroom.connect(accounts[0])._setstorageBridge(zeroAddress)
          ).to.be.reverted;    
      });

      


    });

    describe("fallback Test", async () => {

        it("fallback should work", async function () {
          const { exchangeroom , accounts, xcfx } = await deployExchangeroomFixture();

          expect  (await exchangeroom.fallback({ value: 1})).to.not.be.reverted;
          
          const tx = accounts[0].sendTransaction({
            to: exchangeroom.address,
            data: "0x1234",
          });
          
          await expect(tx).to.not.be.reverted;
          await expect(exchangeroom.fallback()).to.not.be.reverted;

        });

    });
  });
});
