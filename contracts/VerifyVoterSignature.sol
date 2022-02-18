
// SPDX-License-Identifier: None
pragma solidity ^0.8.10;
import './ECDSA.sol';

contract VerifyVoter {
    using ECDSA for bytes32;

    bytes32 private constant VOTE_TYPEHASH =
    keccak256("vote(address voter,unt256 pollId,uint256 choice)");

    bytes32 private DOMAIN_SEPARATOR;


    constructor(){

        uint256 chainId;
        assembly {
        chainId := chainid()
        }
        
        DOMAIN_SEPARATOR = keccak256(
        abi.encode(
            keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
            ),
            keccak256(bytes("MoviecoinGovernance")),
            keccak256(bytes("1")),
            chainId,
            address(this)
        )
        );
    }


    function verifyVoter(address voter, uint256 pollId, uint256 choice, bytes calldata signature) view external {
        
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(VOTE_TYPEHASH, voter, pollId, choice))
            )
        );

        address signer = digest.recover(signature);
        require(signer != address(0) && signer == voter,"Invalid signature");

    }
}