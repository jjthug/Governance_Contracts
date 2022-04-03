// SPDX-License-Identifier: None
pragma solidity ^0.8.10;
import "./ECDSA.sol";

error InvalidSignature();

contract Verifiable {
    using ECDSA for bytes32;

    bytes32 private DOMAIN_SEPARATOR;
    bytes32 private constant VOTE_UPLOAD_TYPEHASH =
        keccak256("voteUpload(address to,string pollId,string pollResult)");

    constructor() {

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

    function verify(address signerToBeMatched, address to, string calldata pollId, string calldata pollResult, bytes calldata signature) public view returns(bool success){

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(VOTE_UPLOAD_TYPEHASH, to, keccak256(abi.encodePacked(pollId)), keccak256(abi.encodePacked(pollResult))))
            )
        );

        address signer = digest.recover(signature);
        if(signer == address(0) || signer != signerToBeMatched) revert InvalidSignature();

        return true;
    }    
}