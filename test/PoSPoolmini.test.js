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

    return { ...deploy };
  }

  async function registeredPoolPoSPoolminiFixture() {
    const poolInitialized = await initializePoSPoolminiFixture();
    const {
      pool,
      IDENTIFIER,
      blsPubKey,
      vrfPubKey,
      blsPubKeyProof,
      ONE_VOTE_CFX,
      bridge,
    } = poolInitialized;
    //register pool with 1000 CFX
    await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
      value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
    });

    //initialize and set bridge
    await bridge.initialize(pool.address);
    await pool._setbridges(bridge.address, bridge.address, bridge.address);

    return { ...poolInitialized };
  }

  describe("Initialize()", async () => {
    it("should initializate contract", async () => {
      const ONE_DAY_BLOCK_COUNT = 2 * 3600 * 24;
      const expectedValues = {
        poolName: "Nucleon Conflux Pos Pool 01",
        poolLockPeriodIn: ONE_DAY_BLOCK_COUNT * 14,
        poolLockPeriodOut: ONE_DAY_BLOCK_COUNT * 1 + 12520,
      };
      const { pool } = await deployPoSPoolminiFixture();
      const initialize = await pool.initialize();
      await initialize.wait();

      //check expected initial values
      expect(await pool.poolName()).to.be.equal(expectedValues.poolName);
      expect(String(await pool._poolLockPeriod_in())).to.be.equal(
        expectedValues.poolLockPeriodIn.toString()
      );
      expect(String(await pool._poolLockPeriod_out())).to.be.equal(
        expectedValues.poolLockPeriodOut.toString()
      );
    });

    describe("should not initializate contract", function () {
      it("not allow double initialization", async () => {
        //pool already initialized
        const { pool } = await initializePoSPoolminiFixture();
        await expect(pool.initialize()).to.eventually.rejectedWith(
          "Initializable: contract is already initialized'"
        );
      });

      it("not allow initialization with non-valid parameters", async () => {
        const { pool } = await deployPoSPoolminiFixture();

        await expect(pool.initialize("non-valid-data")).to.eventually.rejected;
        await expect(pool.initialize(0x000)).to.eventually.rejected;
        await expect(pool.initialize(111111111)).to.eventually.rejected;
        await expect(pool.initialize(["1", 2, "3", 4])).to.eventually.rejected;
        await expect(pool.initialize({ a: 1, b: 2 })).to.eventually.rejected;
      });
    });
  });

  describe("poolName()", async function () {
    it("should return pool name", async () => {
      const { pool } = await initializePoSPoolminiFixture();
      const expectedPoolName = "Nucleon Conflux Pos Pool 01";
      const poolName = await pool.poolName();
      expect(poolName).to.be.equal(expectedPoolName);
    });

    describe("should not return pool name", function () {
      it("should not return with non-valid parameters", async () => {
        const { pool } = await initializePoSPoolminiFixture();

        await expect(pool.poolName("non-valid-data")).to.eventually.rejected;
        await expect(pool.poolName(0x000)).to.eventually.rejected;
        await expect(pool.poolName(111111111)).to.eventually.rejected;
        await expect(pool.poolName(["1", 2, "3", 4])).to.eventually.rejected;
        await expect(pool.poolName({ a: 1, b: 2 })).to.eventually.rejected;
      });
    });
  });

  describe("_poolRegisted()", async function () {
    it("should return the pool is already register", async () => {
      const { pool } = await registeredPoolPoSPoolminiFixture();
      expect(String(await pool._poolRegisted())).to.be.equal("true");
    });

    it("should return the pool is not registered yet", async () => {
      const { pool } = await initializePoSPoolminiFixture();
      expect(String(await pool._poolRegisted())).to.be.equal("false");
    });

    describe("should not return if the pool is already register or not", function () {
      it("should not return with non-valid parameters", async () => {
        const { pool } = await initializePoSPoolminiFixture();

        await expect(pool._poolRegisted("non-valid-data")).to.eventually
          .rejected;
        await expect(pool._poolRegisted(0x000)).to.eventually.rejected;
        await expect(pool._poolRegisted(111111111)).to.eventually.rejected;
        await expect(pool._poolRegisted(["1", 2, "3", 4])).to.eventually
          .rejected;
        await expect(pool._poolRegisted({ a: 1, b: 2 })).to.eventually.rejected;
      });
    });
  });

  describe("_poolLockPeriod_in()", async function () {
    it("should return the lock in period", async () => {
      const ONE_DAY_BLOCK_COUNT = 2 * 3600 * 24;
      const initialPoolInLockPeriod = ONE_DAY_BLOCK_COUNT * 14;

      const { pool } = await registeredPoolPoSPoolminiFixture();
      expect(String(await pool._poolLockPeriod_in())).to.be.equal(
        initialPoolInLockPeriod.toString()
      );
    });

    describe("should not return the lock in period", function () {
      it("should not return if non-valid parameters", async () => {
        const { pool } = await registeredPoolPoSPoolminiFixture();

        await expect(pool._poolLockPeriod_in("non-valid-data")).to.eventually
          .rejected;
        await expect(pool._poolLockPeriod_in(0x000)).to.eventually.rejected;
        await expect(pool._poolLockPeriod_in(111111111)).to.eventually.rejected;
        await expect(pool._poolLockPeriod_in(["1", 2, "3", 4])).to.eventually
          .rejected;
        await expect(pool._poolLockPeriod_in({ a: 1, b: 2 })).to.eventually
          .rejected;
      });
    });
  });

  describe("_poolLockPeriod_out()", async function () {
    it("should return the lock out period", async () => {
      const ONE_DAY_BLOCK_COUNT = 2 * 3600 * 24;
      const initialPoolOutPeriod = ONE_DAY_BLOCK_COUNT * 1 + 12520;

      const { pool } = await initializePoSPoolminiFixture();
      expect(String(await pool._poolLockPeriod_out())).to.be.equal(
        initialPoolOutPeriod.toString()
      );
    });

    describe("should not return the lock out period", async () => {
      it("should not return if non-valid parameters", async () => {
        const { pool } = await registeredPoolPoSPoolminiFixture();

        await expect(pool._poolLockPeriod_out("non-valid-data")).to.eventually
          .rejected;
        await expect(pool._poolLockPeriod_out(0x000)).to.eventually.rejected;
        await expect(pool._poolLockPeriod_out(111111111)).to.eventually
          .rejected;
        await expect(pool._poolLockPeriod_out(["1", 2, "3", 4])).to.eventually
          .rejected;
        await expect(pool._poolLockPeriod_out({ a: 1, b: 2 })).to.eventually
          .rejected;
      });
    });
  });

  describe("register()", function () {
    it("should register pos pool", async () => {
      const {
        pool,
        IDENTIFIER,
        ONE_VOTE_CFX,
        blsPubKey,
        vrfPubKey,
        blsPubKeyProof,
      } = await initializePoSPoolminiFixture();
      const votes = 1;

      //register pool with 1000 CFX
      await pool.register(
        IDENTIFIER,
        votes,
        blsPubKey,
        vrfPubKey,
        blsPubKeyProof,
        {
          value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
        }
      );
      const poolSummary = await pool.poolSummary();

      expect(await pool._poolRegisted()).to.be.equal(true);
      expect(String(poolSummary.totalvotes)).to.equal(votes.toString());
      expect(String(poolSummary.claimedInterest)).to.equal("0");
    });

    describe("should not register a pos pool", function () {
      it("should not register a pos pool twice", async () => {
        const {
          pool,
          IDENTIFIER,
          ONE_VOTE_CFX,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
        } = await initializePoSPoolminiFixture();
        const votes = 1;

        //register pool with 1000 CFX
        await pool.register(
          IDENTIFIER,
          votes,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          {
            value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
          }
        );
        const poolSummary = await pool.poolSummary();

        expect(await pool._poolRegisted()).to.be.equal(true);
        expect(String(poolSummary.totalvotes)).to.equal(votes.toString());
        expect(String(poolSummary.claimedInterest)).to.equal("0");

        await expect(
          pool.register(
            IDENTIFIER,
            votes,
            blsPubKey,
            vrfPubKey,
            blsPubKeyProof,
            {
              value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
            }
          )
        ).to.eventually.rejectedWith("Pool is already registed");
      });
      it("should not register if caller is not the owner contract", async () => {
        const {
          pool,
          IDENTIFIER,
          ONE_VOTE_CFX,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          accounts,
        } = await initializePoSPoolminiFixture();
        const votes = 1;

        //try register from a no owner contract address
        await expect(
          pool
            .connect(accounts[1])
            .register(IDENTIFIER, votes, blsPubKey, vrfPubKey, blsPubKeyProof, {
              value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
            })
        ).to.eventually.rejectedWith("Ownable: caller is not the owner");
      });
      it("should not register if bad data is passed as parameter", async () => {
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
      it("should not register if votes is less than 1 or msg.value is less than 1000 CFX", async () => {
        const { pool, blsPubKey, vrfPubKey, blsPubKeyProof, IDENTIFIER } =
          await deployPoSPoolminiFixture();

        await expect(
          pool.register(IDENTIFIER, 0, blsPubKey, vrfPubKey, blsPubKeyProof, {
            value: ethers.utils.parseEther(`${1000}`),
          })
        ).to.eventually.rejectedWith("votePower should be 1");
        await expect(
          pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
            value: ethers.utils.parseEther(`${10}`),
          })
        ).to.eventually.rejectedWith("msg.value should be 1000 CFX");
      });
    });
  });

  describe("_setbridges", async function () {
    it("should set bridge addresses", async () => {
      const {
        pool,
        bridge,
        accounts,
        ONE_VOTE_CFX,
        IDENTIFIER,
        blsPubKey,
        vrfPubKey,
        blsPubKeyProof,
      } = await initializePoSPoolminiFixture();

      //register pool with 1000 CFX
      await pool.register(IDENTIFIER, 1, blsPubKey, vrfPubKey, blsPubKeyProof, {
        value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
      });

      //initialize bridge contract
      await bridge.initialize(pool.address);

      //set bridge contracts
      const setBridgeAddresses = await pool._setbridges(
        bridge.address,
        bridge.address,
        bridge.address
      );
      await setBridgeAddresses.wait();

      //_setbridges should emit 'Setbridges' event
      
      //call function that only bridge can call
      await bridge.connect(accounts[2]).campounds(10, {
        value: ethers.utils.parseEther(`${10 * ONE_VOTE_CFX}`),
      });
      await bridge.connect(accounts[3]).campounds(8, {
        value: ethers.utils.parseEther(`${8 * ONE_VOTE_CFX}`),
      });
      const poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("19");
    });

    describe("should not set bridge addresses", function () {
      it("should not allow register bridge addresses from non-owner account", async () => {
        const { pool, IDENTIFIER, blsPubKey, vrfPubKey, blsPubKeyProof, ONE_VOTE_CFX, bridge, accounts } = await initializePoSPoolminiFixture();

        //register pool with 1000 CFX
        await pool.register(
          IDENTIFIER,
          1,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          {
            value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
          }
        );

        //initialize bridge contract by contract owner
        await bridge.initialize(pool.address);

        //set bridge contracts by a non-contract owner account
        await expect(pool.connect(accounts[1])._setbridges(
          bridge.address,
          bridge.address,
          bridge.address
        )).to.eventually.rejectedWith("Ownable: caller is not the owner");
      });
      it("should not allow register bridge addresses as non-valid address", async () => {
        const { pool, IDENTIFIER, blsPubKey, vrfPubKey, blsPubKeyProof, ONE_VOTE_CFX, bridge, accounts } = await initializePoSPoolminiFixture();
        const noValidAddress = "0x0"

        //register pool with 1000 CFX
        await pool.register(
          IDENTIFIER,
          1,
          blsPubKey,
          vrfPubKey,
          blsPubKeyProof,
          {
            value: ethers.utils.parseEther(`${ONE_VOTE_CFX}`),
          }
        );

        //initialize bridge contract from the contract owner
        await bridge.initialize(pool.address);

        //set bridge contracts from the owner account but with an invalid address
        await expect(pool._setbridges(
          noValidAddress,
          noValidAddress,
          noValidAddress
        )).to.eventually.rejectedWith("xd")
      });
      it("should not allow register bridge addresses with invalid parameters", async () => {});
    });
  });

  describe("_setLockPeriod()", async function () {
    it("should update the lock period", async () => {
      const { pool, accounts } = await initializePoSPoolminiFixture();
      const intialLockInPeriod = 2419200;
      const initialLockOutPeriod = 185320;
      const newLockInPeriod = 1000000;
      const newLockOutPeriod = 1000000;

      //check prev lock in/out period
      expect(String(await pool._poolLockPeriod_in())).to.be.equal(
        String(intialLockInPeriod)
      );
      expect(String(await pool._poolLockPeriod_out())).to.be.equal(
        String(initialLockOutPeriod)
      );

      //update lock in/out period from owner account
      await pool
        .connect(accounts[0])
        ._setLockPeriod(newLockInPeriod, newLockOutPeriod);

      //check new lock in/out period
      expect(String(await pool._poolLockPeriod_in())).to.be.equal(
        String(newLockInPeriod)
      );
      expect(String(await pool._poolLockPeriod_out())).to.be.equal(
        String(newLockOutPeriod)
      );
    });
  });

  describe("_setCfxCountOfOneVote()", async function () {
    it("should set a new cfx count of one vote", async () => {
      const { pool, accounts } = await initializePoSPoolminiFixture();

      //update CFX_COUNT_OF_ONE_VOTE and CFX_VALUE_OF_ONE_VOTE from owner address call
      let call = await pool.connect(accounts[0])._setCfxCountOfOneVote(2000);
      call = await call.wait();

      //check if correct event is triggered
      expect(call.events[0].event).to.be.equal("SetCfxCountOfOneVote");
    });
  });

  describe("_setPoolName()", async () => {
    it("should update the pool name", async () => {
      const { pool, accounts } = await initializePoSPoolminiFixture();
      const initialName = "Nucleon Conflux Pos Pool 01";
      const newName = "New Pool Name";

      //check prev pool name
      expect(await pool.poolName()).to.be.equal(initialName);

      //update pool name from owner account
      await pool.connect(accounts[0])._setPoolName(newName);

      //check new pool name
      expect(await pool.poolName()).to.be.equal(newName);
    });
  });

  describe("increaseState()", async function () {
    it("should increase staking amount", async () => {
      const { pool, ONE_VOTE_CFX, bridge, accounts } =
        await registeredPoolPoSPoolminiFixture();

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
      const { pool, ONE_VOTE_CFX, bridge, accounts } =
        await registeredPoolPoSPoolminiFixture();

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
      const { pool, ONE_VOTE_CFX, bridge, accounts } =
        await registeredPoolPoSPoolminiFixture();
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

    it("should not decrease staking amount", async () => {
      const { pool, ONE_VOTE_CFX, bridge, accounts } =
        await registeredPoolPoSPoolminiFixture();
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
      await expect(bridge.connect(accounts[1]).handleUnstake(20)).to.eventually
        .rejected;

      //string instead of uint64
      await expect(bridge.connect(accounts[3]).handleUnstake("a")).to.eventually
        .rejected;

      //uint64[] instead of uint64
      await expect(bridge.connect(accounts[3]).handleUnstake([4, 3, 2, 1])).to
        .eventually.rejected;

      poolSummary = await pool.poolSummary();
      expect(String(poolSummary.totalvotes)).to.be.equal("14");
    });
  });

  describe("withdrawStake()", function () {
    it("should withdraw staked founds", async () => {
      const { bridge, ONE_VOTE_CFX, accounts } =
        await registeredPoolPoSPoolminiFixture();

      //stake
      await bridge.connect(accounts[1]).campounds(1, {
        value: ethers.utils.parseEther(`${1 * ONE_VOTE_CFX}`),
      });
      //unstake
      await bridge.connect(accounts[1]).handleUnstake(1);

      //withdraw
      await bridge.connect(accounts[1]).withdrawVotes();
    });
  });

  describe("claimAllInterest()", function () {
    it("should claim all interest", async () => {
      const { bridge, ONE_VOTE_CFX, accounts } =
        await registeredPoolPoSPoolminiFixture();

      //stake
      await bridge.connect(accounts[1]).campounds(1, {
        value: ethers.utils.parseEther(`${1 * ONE_VOTE_CFX}`),
      });

      //claim interest
      await expect(
        bridge.connect(accounts[1]).claimInterests()
      ).to.eventually.rejectedWith("No claimable interest");
    });
  });

  describe("poolSummary()", async function () {
    it("should return pool summary", async () => {
      const { pool } = await registeredPoolPoSPoolminiFixture();
      const poolSummary = await pool.poolSummary();
      const {
        totalvotes,
        locking,
        locked,
        unlocking,
        unlocked,
        unclaimedInterests,
        claimedInterest,
      } = poolSummary;

      expect(String(totalvotes)).to.be.equal("1");
      expect(String(locking)).to.be.equal("1");
      expect(String(locked)).to.be.equal("0");
      expect(String(unlocking)).to.be.equal("0");
      expect(String(unlocked)).to.be.equal("0");
      expect(String(unclaimedInterests)).to.be.equal("0");
      expect(String(claimedInterest)).to.be.equal("0");
    });

    it("should not return pool summary", async () => {
      const { pool } = await registeredPoolPoSPoolminiFixture();
      //call with parameter|
      await expect(pool.poolSummary(2)).to.eventually.rejected;
    });
  });

  describe("getInQueue()", async function () {
    it("should return balance in queue", async () => {
      const { pool, bridge, accounts, ONE_VOTE_CFX } =
        await registeredPoolPoSPoolminiFixture();
      //check that the pool is already registered
      expect(await pool._poolRegisted()).to.be.equal(true);

      const votes = 1;

      //deposit from user 3
      await bridge.connect(accounts[3]).campounds(1, {
        value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
      });

      const getInQueue = await pool.getInQueue();
      //getInQueue[1] because the getInQueue[0] is the initial register in queue
      const { votePower, endBlock } = getInQueue[1];

      expect(String(votePower)).to.be.equal(`${votes}`);
      expect(Number(endBlock)).to.be.greaterThan(0);
    });

    it("should not return balance in queue", async () => {
      const { pool, bridge, accounts, ONE_VOTE_CFX } =
        await registeredPoolPoSPoolminiFixture();
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
    it("should return balance out queue", async () => {
      const { pool, bridge, accounts, ONE_VOTE_CFX } =
        await registeredPoolPoSPoolminiFixture();
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
    it("should not return balance out queue", async () => {
      const { pool, bridge, accounts, ONE_VOTE_CFX } =
        await registeredPoolPoSPoolminiFixture();
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
      await expect(pool.getOutQueue({ amount: "2" })).to.eventually.rejected;
    });
  });

  describe("getOutQueueFast()", async function () {
    it("should return balance out queue fast", async () => {
      const { pool, bridge, accounts, ONE_VOTE_CFX } =
        await registeredPoolPoSPoolminiFixture();
      //check that the pool is already registered
      expect(await pool._poolRegisted()).to.be.equal(true);

      const votes = 2;

      //deposit from user 2
      await bridge.connect(accounts[1]).campounds(votes, {
        value: ethers.utils.parseEther(`${votes * ONE_VOTE_CFX}`),
      });

      //withdraw stake amount from the user 1
      await bridge.connect(accounts[1]).handleUnstake(2);

      let getOutQueueFast = await pool.getOutQueueFast();
      // is getOutQueueFast[0] because is the first outQueue
      //expect(String(getOutQueueFast[0].votePower)).to.be.equal(String(votes));
      //expect(Number(getOutQueueFast[0].endBlock)).to.be.greaterThan(0);

      // deposit and withdraw from user 2
      await bridge.connect(accounts[2]).campounds(1, {
        value: ethers.utils.parseEther(`${1 * ONE_VOTE_CFX}`),
      });
      await bridge.connect(accounts[2]).handleUnstake(1);

      getOutQueueFast = await pool.getOutQueueFast();

      expect(getOutQueueFast.length).to.be.equal(0);
    });
  });

  describe("temp_Interest()", async function () {
    it("should return temporal interest", async () => {
      const { pool } = await registeredPoolPoSPoolminiFixture();
      const tempInterest = await pool.temp_Interest();
      expect(String(tempInterest)).to.be.equal("0");
    });
  });

  describe("_reStake()", function () {
    it("should restake", async () => {
      const { pool, bridge, accounts, ONE_VOTE_CFX } =
        await registeredPoolPoSPoolminiFixture();

      //stake
      await bridge.connect(accounts[1]).campounds(1, {
        value: ethers.utils.parseEther(`${1 * ONE_VOTE_CFX}`),
      });
      //unstake
      await bridge.connect(accounts[1]).handleUnstake(1);

      //restake by admin
      await pool._reStake(1);
    });
  });

  describe("fallback()", function () {
    it("should call fallback with no recognized function signature and with non-empty calldata call", async () => {
      const { pool, accounts } = await initializePoSPoolminiFixture();
      let tx = await accounts[0].sendTransaction({
        to: pool.address,
        data: "0x00",
      });
      tx = await tx.wait();
      expect(parseInt(tx.blockHash, 16)).to.be.greaterThan(0);
    });
  });
});
