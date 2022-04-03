const { expect, assert } = require("chai");
const { providers } = require("ethers");
// const { Signer } = require("ethers");
const { ethers } = require("hardhat");
const Governance = artifacts.require("Governance");
const truffleAssert = require('truffle-assertions');

describe("Governance user uploads poll result", function () {
  let governance, balance, owner;
  let domain, types, value;

  before(async function () {
      [addr1] = await ethers.getSigners();

      owner = await new ethers.Wallet.createRandom();
      admin = await new ethers.Wallet.createRandom();

      let Governance = await ethers.getContractFactory("Governance");  
      governance = await Governance.deploy(owner.address);

      domain = {
        name: 'MoviecoinGovernance',
        version: '1',
        chainId: 31337,
        verifyingContract: governance.address
      };
  
      // The named list of all type definitions
      types = {
        voteUpload: [
          {name: "to", type: "address"},
          {name: "pollId", type: "string"},
          {name: "pollResult", type: "string"}
          ]
      };
  
      // The data to sign
      value = {
        to: addr1.address,
        pollId: '1',
        pollResult: 'ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr'
      };
  });

  it('has correct owner', async () => {
    const theowner = await governance.owner();
    //Checks the owner of the governance smart contract
    assert.equal(theowner, owner.address);
  })

  // it("Transfer ownership", async() =>{
  //   await governance.connect(owner).transferOwnership(theOwner.address);
  //   let ownerAddress = await governance.owner();
  //   //renounced ownsership of the smart contract
  //   assert.equal(ownerAddress, theOwner.address);
  // })

  it("Should set poll using owner signature", async function () {

    let signature = await owner._signTypedData(domain, types, value);
    let signature_admin = await admin._signTypedData(domain, types, value);

    console.log("owner =", owner.address);
    console.log("admin =", admin.address);
    console.log("addr1 =", addr1.address);

    console.log("signature", signature);

    //setting poll hash by user with correct signature
    await truffleAssert.passes( governance.connect(addr1).setPollResult("1","ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr",signature));

    try{
    await truffleAssert.reverts(governance.connect(addr1).setPollResult("1","ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr",0xff));
    }catch(error){
      expect(error.message).to.equal("VM Exception while processing transaction: reverted with custom error 'SignatureNotVerified()'");
    }
    // cant use admin signature here
    await truffleAssert.reverts(governance.connect(addr1).setPollResult("1","ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr",signature_admin));

    
    value = {
      to: addr1.address,
      pollId: '2',
      pollResult: 'ipfs://abcd2'
  };

  let signature2 = await owner._signTypedData(domain, types, value);

  value = {
      to: addr1.address,
      pollId: '3',
      pollResult: 'ipfs://abcd3'
  };

  let signature3 = await owner._signTypedData(domain, types, value);

  value = {
      to: addr1.address,
      pollId: '4',
      pollResult: 'ipfs://abcd4'
  };

  let signature4 = await owner._signTypedData(domain, types, value);

  try{
  await governance.connect(addr1).multiSetPollResult(["2","3","4"],["ipfs://abcd2","ipfs://abcd3","ipfs://abcd4"],[signature2,signature3]);
  }catch(error){
    expect(error.message).to.equal("VM Exception while processing transaction: reverted with custom error 'LengthMismatch()'");
  }
  await truffleAssert.passes( governance.connect(addr1).multiSetPollResult(["2","3","4"],["ipfs://abcd2","ipfs://abcd3","ipfs://abcd4"],[signature2,signature3,signature4]));

    //setting poll hash by the owner, without signature
    // await truffleAssert.passes(governance.connect(owner).setPollResultOwnerOrAdmin("1","ipfs://QmTrTBeiicFgcQVHy4nLjBtLVd3TMwZF8GChLMcWDE9wNr"));
  });
});