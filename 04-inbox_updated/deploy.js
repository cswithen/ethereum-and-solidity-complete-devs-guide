const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const { abi, evm } = require("./compile");
const { mnemonicKey, infuraLink } = require("./secrets");

const provider = new HDWalletProvider(mnemonicKey, infuraLink);

const web3 = new Web3(provider);

// note the function declaration is only to be able to use the async/await, and not traditional promise syntax
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object, arguments: ["Hi there!"] })
    .send({ gas: "1000000", from: accounts[0] });

  console.log("Contract deployed to", result.options.address);
  provider.engine.stop();
};

deploy();
