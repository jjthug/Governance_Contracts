const { expect, assert } = require("chai");
const { providers } = require("ethers");
// const { Signer } = require("ethers");
const { ethers } = require("hardhat");
const Governance = artifacts.require("Governance");
const truffleAssert = require('truffle-assertions');

describe("Governance admin", function () {
  let governance, balance, theOwner, owner, Aowner;

  before(async function () {
      accounts = await web3.eth.getAccounts();
      [owner, admin, addr1] = await ethers.getSigners();

      let Governance = await ethers.getContractFactory("Governance");  
      governance = await Governance.deploy(owner.address);
  });

  it("should run admin functionality" ,async function () {

    await truffleAssert.passes(governance.connect(owner).multiSetPollResultOwnerOrAdmin([2,3,4], ["982452459", "ghdeg546456", "eg13423fd"]));

    try{
    await governance.connect(admin).multiSetPollResultOwnerOrAdmin([2,3,4], ["982452459", "ghdeg546456", "eg13423fd"]);
    }catch(error){
      expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner nor admin, or admin is unauthorized'");}

    await governance.connect(owner).setAdmin(admin.address);

    // Admin not authorized
    try{
    await governance.connect(admin).multiSetPollResultOwnerOrAdmin([2,3,4], ["982452459", "ghdeg546456", "eg13423fd"]);
    } catch(error){
        expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner nor admin, or admin is unauthorized'");
    } 

    await governance.connect(owner).setAdminAuthorization(true);

    await truffleAssert.passes( governance.connect(admin).multiSetPollResultOwnerOrAdmin([2,3,4], ["982452459", "ghdeg546456", "eg13423fd"]));
  })


  it("manages ownership", async()=>{

    await governance.transferOwnership(addr1.address);
    let currentOwner = await governance.owner();
    assert.equal(currentOwner, addr1.address);

    await governance.connect(addr1).renounceOwnership();
    currentOwner = await governance.owner();
    assert.equal(currentOwner, '0x0000000000000000000000000000000000000000');

  })
})