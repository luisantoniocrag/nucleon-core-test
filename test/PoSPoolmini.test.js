const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = hre;

describe("PoSPoolmini", async function () {
  async function deployPoSPoolminiFixture() {
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

    const MockCoreBridge = await ethers.getContractFactory(
      "MockCoreBridge_multipool"
    );
    const bridge = await MockCoreBridge.deploy();

    await staking.deployed();
    await posRegister.deployed();
    await bridge.deployed();

    /// Contract Deployment
    const PoSPoolmini = await ethers.getContractFactory("PoSPoolminiDebug");
    const pool = await PoSPoolmini.deploy(staking.address, posRegister.address);
    await pool.deployed();
    return {
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

  async function initializePoSPoolminiFixture() {
    const deploy = await deployPoSPoolminiFixture();
    const { pool } = deploy;

    //initialize pool
    const initialize = await pool.initialize();
    await initialize.wait();

    return {...deploy};
  }

  async function registeredPoolPoSPoolminiFixture() {
    const poolInitialized = await initializePoSPoolminiFixture();
    const { pool, IDENTIFIER, blsPubKey, vrfPubKey, blsPubKeyProof,  ONE_VOTE_CFX, bridge} = poolInitialized;
    //register pool with 1000 CFX
    await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
      value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
    });

    //initialize and set bridge
    await bridge.initialize(pool.address);
    await pool._setbridges(bridge.address, bridge.address, bridge.address);

    return {...poolInitialized};
  }

  describe("Initialize()", async () => {
    it("should initializate contract", async () => {
      const expextedPoolName = "Nucleon Conflux Pos Pool 01";
      const { pool } = await deployPoSPoolminiFixture();
      const initialize = await pool.initialize();
      await initialize.wait();
      expect(await pool.poolName()).to.be.equal(expextedPoolName);
    });

    it("should not initializate contract", async () => {
      const { pool } = await deployPoSPoolminiFixture();
      await expect(pool.initialize("not valid data")).to.eventually.rejected;
      //state should not be updated
      expect(await pool.poolName()).to.be.equal("");
    });
  });

  describe("register()", async function () {
    it("should register poos pool", async () => {
      const {
        pool,
        IDENTIFIER,
        ONE_VOTE_CFX,
        blsPubKey,
        vrfPubKey,
        blsPubKeyProof,
      } = await deployPoSPoolminiFixture();

      //initializate
      await pool.initialize();

      //register pool with 1000 CFX
      await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
        value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
      });
      const poolSummary = await pool.poolSummary();

      expect(await pool._poolRegisted()).to.be.equal(true);
      expect(Number(poolSummary.totalvotes)).to.equal(1);
      expect(Number(poolSummary.claimedInterest)).to.equal(0);
    });

    it("should not register a pool", async () => {
      const { pool, blsPubKey, vrfPubKey, blsPubKeyProof } =
        await deployPoSPoolminiFixture();

      //initializate
      await pool.initialize();

      //try to call register() with error type of data
      await expect(
        pool.register(1, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
          value: ethers.utils.parseEther(`${10000}`),
        })
      ).to.eventually.rejected;

      //state should not be updated
      const poolSummary = await pool.poolSummary();
      expect(await pool._poolRegisted()).to.be.equal(false);
      expect(Number(poolSummary.totalvotes)).to.equal(0);
      expect(Number(poolSummary.claimedInterest)).to.equal(0);
    });
  });

  describe("increaseState()", async function () {
    it("should increase staking amount", async () => {
      const {pool, ONE_VOTE_CFX,bridge, accounts} = await registeredPoolPoSPoolminiFixture();

      //check that the pool is already registered
      expect(await pool._poolRegisted()).to.be.equal(true);

      //check votes is equal to 1 = only the first deposit until now
      let poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("1");

      //deposit 1 votes by user 1
      await bridge.connect(accounts[1]).campounds(1, {
        value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
      });

      //deposit 7 votes by user 2
      await bridge.connect(accounts[2]).campounds(7, {
        value: ethers.utils.parseEther(`${7 * ONE_VOTE_CFX}`),
      });

      await bridge.connect(accounts[3]).campounds(5, {
        value: ethers.utils.parseEther(`${5 * ONE_VOTE_CFX}`),
      });
      poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("14");
    });

    it("should not increase amount", async () => {
      const {pool, ONE_VOTE_CFX,bridge, accounts} = await registeredPoolPoSPoolminiFixture();

      //check that the pool is already registered
      expect(await pool._poolRegisted()).to.be.equal(true);

      //check votes is equal to 1 = only the first deposit until now
      let poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("1");

      //call with string param
      await expect(
        bridge.connect(accounts[1]).campounds("2", {
          value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
        })
      ).to.eventually.rejected;

      //call with diferent value and votePower
      await expect(
        bridge.connect(accounts[2]).campounds(3, {
          value: ethers.utils.parseEther(`${7 * ONE_VOTE_CFX}`),
        })
      ).to.eventually.rejected;

      poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("1");
    });
  });

  describe("decreaseStake()", async function () {
    it("should decrease staking amount", async () => {
      const {pool, ONE_VOTE_CFX,bridge, accounts} = await registeredPoolPoSPoolminiFixture();
      //check that the pool is already registered
      expect(await pool._poolRegisted()).to.be.equal(true);

      //check that the pool is already registered
      expect(await pool._poolRegisted()).to.be.equal(true);

      //check votes is equal to 1 = only the first deposit until now
      let poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("1");

      //deposit 1 votes by user 1
      await bridge.connect(accounts[1]).campounds(1, {
        value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
      });

      //deposit 7 votes by user 2
      await bridge.connect(accounts[2]).campounds(7, {
        value: ethers.utils.parseEther(`${7 * ONE_VOTE_CFX}`),
      });

      await bridge.connect(accounts[3]).campounds(5, {
        value: ethers.utils.parseEther(`${5 * ONE_VOTE_CFX}`),
      });
      poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("14");

      //decrease 1 by user 1
      await bridge.connect(accounts[1]).handleUnstake(1);

      //decrease 2 by user 2
      await bridge.connect(accounts[2]).handleUnstake(2);

      //decrease 4 by user 3
      await bridge.connect(accounts[3]).handleUnstake(4);

      poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("7");
    });

    it('should not decrease staking amount', async () => {
      const {pool, ONE_VOTE_CFX,bridge, accounts} = await registeredPoolPoSPoolminiFixture();
      //check that the pool is already registered
      expect(await pool._poolRegisted()).to.be.equal(true);

      //check that the pool is already registered
      expect(await pool._poolRegisted()).to.be.equal(true);

      //check votes is equal to 1 = only the first deposit until now
      let poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("1");

      //deposit 1 votes by user 1
      await bridge.connect(accounts[1]).campounds(1, {
        value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
      });

      //deposit 7 votes by user 2
      await bridge.connect(accounts[2]).campounds(7, {
        value: ethers.utils.parseEther(`${7 * ONE_VOTE_CFX}`),
      });

      await bridge.connect(accounts[3]).campounds(5, {
        value: ethers.utils.parseEther(`${5 * ONE_VOTE_CFX}`),
      });
      poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("14");

      //unstake amount greather amount that has been staked
      await expect(
        bridge.connect(accounts[1]).handleUnstake(20)
      ).to.eventually.rejected;

      //string instead of uint64
      await expect(
        bridge.connect(accounts[3]).handleUnstake("a")
      ).to.eventually.rejected;

      //uint64[] instead of uint64
      await expect(
        bridge.connect(accounts[3]).handleUnstake([4, 3, 2, 1])
      ).to.eventually.rejected;

      poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("14");
    });

  });

  describe("poolSummary()", async function() {
    it('should return pool summary', async () => {
      const { pool } = await registeredPoolPoSPoolminiFixture();
      const poolSummary = await pool.poolSummary();
      const { totalvotes, locking, locked, unlocking, unlocked, unclaimedInterests, claimedInterest } = poolSummary;
      
      expect(String(totalvotes)).to.be.equal("1")
      expect(String(locking)).to.be.equal("1")
      expect(String(locked)).to.be.equal("0")
      expect(String(unlocking)).to.be.equal("0")
      expect(String(unlocked)).to.be.equal("0")
      expect(String(unclaimedInterests)).to.be.equal("0")
      expect(String(claimedInterest)).to.be.equal("0")
    });

    it('should not return pool summary', async () => {
      const { pool } = await registeredPoolPoSPoolminiFixture();
      //call with parameter|
      await expect(pool.poolSummary(2)).to.eventually.rejected;
    });
  });

 describe("getInQueue()", async function() {
  it('should return balance in queue', async () => {
    const { pool, bridge, accounts, ONE_VOTE_CFX } = await registeredPoolPoSPoolminiFixture();
    //check that the pool is already registered
    expect(await pool._poolRegisted()).to.be.equal(true);

    const votes = 1;

    //deposit from user 3
    await bridge.connect(accounts[3]).campounds(1, {
      value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
    });

    const getInQueue = await pool.getInQueue();
    //getInQueue[1] because the getInQueue[0] is the initial register in queue
    const {votePower, endBlock} = getInQueue[1];
    
    expect(String(votePower)).to.be.equal(`${votes}`);
    expect(Number(endBlock)).to.be.greaterThan(0);

  });

  it('should not return balance in queue', async () => {
    const { pool, bridge, accounts, ONE_VOTE_CFX } = await registeredPoolPoSPoolminiFixture();
    //check that the pool is already registered
    expect(await pool._poolRegisted()).to.be.equal(true);

    const votes = 1;

    //deposit from user 3
    await bridge.connect(accounts[3]).campounds(1, {
      value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
    });
    
    //call with parameters
    await expect(pool.getInQueue(1, "0x0")).to.eventually.rejected;
  });
 });

 describe("getOutQueue()", async function () {
  it('should return balance out queue', async () => {
    const { pool, bridge, accounts, ONE_VOTE_CFX } = await registeredPoolPoSPoolminiFixture();
    //check that the pool is already registered
    expect(await pool._poolRegisted()).to.be.equal(true);

    const votes = 2;

    //deposit from user 2
    await bridge.connect(accounts[2]).campounds(votes, {
      value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
    });

    //withdraw stake amount from the user 2
    await bridge.connect(accounts[2]).handleUnstake(2);

    let getOutQueue = await pool.getOutQueue();
    
    // is getOutQueue[0] because is the first outQueue
    expect(String(getOutQueue[0].votePower)).to.be.equal(String(votes));
    expect(Number(getOutQueue[0].endBlock)).to.be.greaterThan(0);

    // deposit and withdraw from user 1
    await bridge.connect(accounts[1]).campounds(1, {
      value: ethers.utils.parseEther(`${1 * ONE_VOTE_CFX}`),
    });
    await bridge.connect(accounts[1]).handleUnstake(1);

    getOutQueue = await pool.getOutQueue();

    //check prev getOutQueue is the same
    expect(String(getOutQueue[0].votePower)).to.be.equal(String(votes));
    expect(Number(getOutQueue[0].endBlock)).to.be.greaterThan(0);

    // is getOutQueue[1] because is the second outQueue
    expect(String(getOutQueue[1].votePower)).to.be.equal(String(1));
    expect(Number(getOutQueue[1].endBlock)).to.be.greaterThan(0);
  });
  it('should not return balance out queue', async () => {
    const { pool, bridge, accounts, ONE_VOTE_CFX } = await registeredPoolPoSPoolminiFixture();
    //check that the pool is already registered
    expect(await pool._poolRegisted()).to.be.equal(true);

    const votes = 2;

    //deposit from user 2
    await bridge.connect(accounts[2]).campounds(votes, {
      value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
    });

    //withdraw stake amount from the user 2
    await bridge.connect(accounts[2]).handleUnstake(2);

    //call a bad parameter
    await expect(pool.getOutQueue({amount:"2"})).to.eventually.rejected;
  });
 });
});
