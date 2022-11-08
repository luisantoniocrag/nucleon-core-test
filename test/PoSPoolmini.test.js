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
      const {
        accounts,
        pool,
        bridge,
        ONE_VOTE_CFX,
        IDENTIFIER,
        blsPubKey,
        vrfPubKey,
        blsPubKeyProof,
      } = await deployPoSPoolminiFixture();

      //initializate
      await pool.initialize();
      await bridge.initialize(pool.address);
      await pool._setbridges(bridge.address, bridge.address, bridge.address);

      //register pool
      await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
        value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
      });
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
      const {
        accounts,
        pool,
        bridge,
        ONE_VOTE_CFX,
        IDENTIFIER,
        blsPubKey,
        vrfPubKey,
        blsPubKeyProof,
      } = await deployPoSPoolminiFixture();

      //initializate
      await pool.initialize();
      await bridge.initialize(pool.address);
      await pool._setbridges(bridge.address, bridge.address, bridge.address);

      //register pool
      await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
        value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
      });
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
      const {
        accounts,
        pool,
        bridge,
        ONE_VOTE_CFX,
        IDENTIFIER,
        blsPubKey,
        vrfPubKey,
        blsPubKeyProof,
      } = await deployPoSPoolminiFixture();

      //initializate
      await pool.initialize();
      await bridge.initialize(pool.address);
      await pool._setbridges(bridge.address, bridge.address, bridge.address);

      //register pool
      await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
        value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
      });
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

  });
});
