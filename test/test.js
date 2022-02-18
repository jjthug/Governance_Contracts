const { expect, assert } = require("chai");
const { Signer } = require("ethers");
const { ethers } = require("hardhat");
const Governance = artifacts.require("Governance");
const truffleAssert = require('truffle-assertions');

describe("Governance", function () {
  let token, balance, theOwner;

  before(async function () {
      accounts = await web3.eth.getAccounts();
      [theOwner] = await ethers.getSigners();
      governance = await Governance.new(theOwner.address);
  });

  it('has correct owner', async () => {
    const owner = await governance._owner();
    //Checks the owner of the governance smart contract
    assert.equal(owner, theOwner.address);
  })

  it("Should set poll", async function () {
    let hash;

    hash = await governance.getMessageHash(accounts[1],1,'ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr');
    let bytesDataHash = ethers.utils.arrayify(hash);
    let signature = await theOwner.signMessage(bytesDataHash);

    //setting poll hash by user with correct signature
    await truffleAssert.passes( governance.setPollResult(1,"ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr",signature, {from: accounts[1]}));

    //Invalid signature
    await truffleAssert.reverts(governance.setPollResult(1,"ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr",0xff, {from: accounts[1]}));

    //setting poll hash by the owner, without signature
    await truffleAssert.passes(governance.setPollResultOwner(1,"ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr", {from: theOwner.address}));

  });

  it("Should get poll hash", async function () {
    let res = await governance.getPollResult(1, {from: accounts[5]});
    //Asserts hash of the corresponding poll
    assert.equal(res, "ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr");

  });

  it("Should multi set poll", async function () {

    let hash1,hash2,hash3;
    await governance.getMessageHash(accounts[2],2,"982452459").then(res =>{
      hash1 = res;
    });

    await governance.getMessageHash(accounts[2],3,"gdeg546456").then(res =>{
      hash2 = res;
    });

    await governance.getMessageHash(accounts[2],4,"eg13423fd").then(res =>{
      hash3 = res;
    });

    let signature1, signature2, signature3;

    let bytesDataHash1 = ethers.utils.arrayify(hash1);
    let bytesDataHash2 = ethers.utils.arrayify(hash2);
    let bytesDataHash3 = ethers.utils.arrayify(hash3);

    signature1 = await theOwner.signMessage(bytesDataHash1);
    signature2 = await theOwner.signMessage(bytesDataHash2);
    signature3 = await theOwner.signMessage(bytesDataHash3);

    //multi set poll hash by a non-owner user
    await truffleAssert.passes(governance.multiSetPollResult([2,3,4], ["982452459", "gdeg546456", "eg13423fd"], [signature1,signature2,signature3],{from: accounts[2]}));
    //multi set poll hash by a non-owner user with incorrect signature
    await truffleAssert.reverts(governance.multiSetPollResult([2,3,4], ["982452459", "ghdeg546456", "eg13423fd"], [signature1,signature2,signature3],{from: accounts[2]}));
    //multi set poll hash by owner
    await truffleAssert.passes(governance.multiSetPollResultOwner([2,3,4], ["982452459", "ghdeg546456", "eg13423fd"], {from: theOwner.address}));

  });

  it('changes owner', async()=>{
    await truffleAssert.reverts( governance.transferOwnership(accounts[7], {from:accounts[1]}));
    await governance.transferOwnership(accounts[7], {from:theOwner.address});
    let owner = await governance.owner();
    //Assert the owner has changed
    assert.equal(owner, accounts[7]);
  })

  it("is verifiable", async() =>{
    let hash;
    await governance.getMessageHash(accounts[6],1,"ipfs hash").then(res =>{
      hash = res;
    });

    let bytesDataHash = ethers.utils.arrayify(hash);

    let signed = await theOwner.signMessage(bytesDataHash);

    let val = await governance.verify(theOwner.address, accounts[6], 1,"ipfs hash", signed );
    //Verification of signature works
    assert.equal(val,true);
  })

  it("Renounce ownership", async() =>{
    await governance.renounceOwnership({from: accounts[7]});
    let owner = await governance.owner();
    //renounced ownsership of the smart contract
    assert.equal(owner, 0);
  })
});