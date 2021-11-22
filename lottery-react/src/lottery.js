import web3 from "./web3";
import { deployedContractAccount, abi } from "./secrets";

export default new web3.eth.Contract(abi, deployedContractAccount);
