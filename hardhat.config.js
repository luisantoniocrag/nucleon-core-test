const fs = require("fs")
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-conflux");
require('solidity-coverage');

const privateKey = fs.readFileSync(".secret").toString().trim();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {version: "0.8.9"},
      {version: "0.8.2"},
    ]
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        initialIndex: 0,
        path: "m/44'/60'/0'/0",
        count: 5,
        accountsBalance: "100000000000000000000000000",
        passphrase: ""
      }
    },
    confluxTestnet: {
      url: "https://test.confluxrpc.com",
      chainId: 1,
      accounts: [privateKey]
    }
  }
};
