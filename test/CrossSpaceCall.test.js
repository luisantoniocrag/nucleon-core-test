const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = hre;
const { parseEther } = require("ethers/lib/utils");

describe("MockCrossSpaceCall Tests", async function() {
    it("should withdraw mapped balance", async () => {
        const [owner, ] = await ethers.getSigners();

        const MockMappedAddress = await ethers.getContractFactory("MockMappedAddress")
        const MappedAddress = await MockMappedAddress.deploy(owner.address)

        const MockCrossSpaceCall = await ethers.getContractFactory("MockCrossSpaceCall")
        const CrossSpaceCall = await MockCrossSpaceCall.deploy()

        await MappedAddress.deployed()
        await CrossSpaceCall.deployed()


        // Note: This is an extra step to create mapping between account and mapping address
        await CrossSpaceCall.setMockMapped(owner.address, MappedAddress.address)

        await CrossSpaceCall.transferEVM(MappedAddress.address, {value: 1000})

        await expect( await ethers.provider.getBalance(MappedAddress.address) ).to.be.equal(1000)

        await CrossSpaceCall.withdrawFromMapped(1000)

        await expect( await ethers.provider.getBalance(MappedAddress.address) ).to.be.equal(0)
    })

    it("should call evm success", async () => {
        const [owner, ] = await ethers.getSigners();

        const MockCrossSpaceCall = await ethers.getContractFactory("MockCrossSpaceCall")
        const CrossSpaceCall = await MockCrossSpaceCall.deploy()
        await CrossSpaceCall.deployed()

        const CrossSpaceCallDebug = await (await ethers.getContractFactory("CrossSpaceCallDebug")).deploy(CrossSpaceCall.address)
        await CrossSpaceCallDebug.deployed()

        // set a mapping address for CrossSpaceCallDebug
        const MockMappedAddress = await ethers.getContractFactory("MockMappedAddress")
        const MappedAddress = await MockMappedAddress.deploy(CrossSpaceCallDebug.address)
        await CrossSpaceCall.setMockMapped(CrossSpaceCallDebug.address, MappedAddress.address)

        await CrossSpaceCallDebug.testCallEVM()
    })
})
