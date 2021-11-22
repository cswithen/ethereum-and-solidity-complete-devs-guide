const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: accounts[0], value: web3.utils.toWei("0.02", "ether") });

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    assert.equal(
      accounts[0],
      players[0],
      `expected ${accounts[0]} but recieved ${players[0]} instead`
    );
    assert.equal(
      1,
      players.length,
      `expeceted 1 but got ${players.length} instead`
    );
  });

  it("allows multiple accounts to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: accounts[0], value: web3.utils.toWei("0.02", "ether") });

    await lottery.methods
      .enter()
      .send({ from: accounts[1], value: web3.utils.toWei("0.02", "ether") });

    await lottery.methods
      .enter()
      .send({ from: accounts[2], value: web3.utils.toWei("0.02", "ether") });

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    assert.equal(
      accounts[0],
      players[0],
      `expected ${accounts[0]} but recieved ${players[0]} instead`
    );

    assert.equal(
      accounts[1],
      players[1],
      `expected ${accounts[1]} but recieved ${players[1]} instead`
    );

    assert.equal(
      accounts[2],
      players[2],
      `expected ${accounts[2]} but recieved ${players[2]} instead`
    );
    assert.equal(
      3,
      players.length,
      `expeceted 3 but got ${players.length} instead`
    );
  });

  it("requires a minimum amount of ether to enter", async () => {
    let executed;
    try {
      await lottery.methods.enter().send({ from: accounts[0], value: "200" });
      executed = "player added";
    } catch (error) {
      executed = "player not added";
    }

    assert.equal("player not added", executed);
  });

  it("only manager can call pickWinner", async () => {
    let exectuted;
    try {
      await lottery.methods.pickWinner().send({ from: accounts[1] });
      executed = "successful call";
    } catch (error) {
      exectuted = "unsuccessful call";
    }

    assert.equal("unsuccessful call", exectuted);
  });

  it("sends money to the winner and resets the players array", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei("1.8", "ether"));
  });
});
