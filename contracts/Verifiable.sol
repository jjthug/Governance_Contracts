// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

/* Signature Verification

How to Sign and Verify
# Signing
1. Create message to sign
2. Hash the message
3. Sign the hash (off chain, keep your private key secret)

# Verify
1. Recreate hash from the original message
2. Recover signer from signature and hash
3. Compare recovered signer to claimed signer
*/
contract Verifiable {

    /**
    @param _to : The address to which the signature will be provided
    @param _pollId : The id of the poll
    @param pollResult : The content identifier provided by ipfs (hash), this will be packed in a message to be hashed along with _to
    @return theHash : The 32 bytes hash of the message by packing _to and ipfsHash
    To create the hash of the message packed as "_to and ipfsHash"
    */
    function getMessageHash(
        address _to,
        uint256 _pollId,
        string memory pollResult
    ) public pure returns (bytes32 theHash) {
        return keccak256(abi.encodePacked(_to, _pollId, pollResult));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
       return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    /**
    @param _signer : The address which is claimed to have provided the signature to _to address
    @param _to : The address to which the signature is claimed to be provided
    @param pollResult : The content identifier provided by ipfs (hash)
    @param signature : The claimed signature of the hash of the message signed by the signer
    @return success : Boolean value true will be returned if the signer retrieved fro signature is equal to the claimed signer
    To verify if the claimed signer is the right signer from the signature
    */
    function verify(
        address _signer,
        address _to,
        uint256 _pollId,
        string memory pollResult,
        bytes memory signature
    ) public pure returns (bool success) {
        bytes32 messageHash = getMessageHash(_to, _pollId, pollResult);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }

    /**
    @param _ethSignedMessageHash : The address to which the signature will be provided
    @param _signature : The content identifier provided by ipfs (hash), this will be packed in a message to be hashed along with _to
    @return signer : The address of the signer recovered from the signature and signed message hash
    To recover the signer of the signature from the signed message hash _ethSignedMessageHash
    */
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address signer)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    /**
    @param sig : The content identifier provided by ipfs (hash), this will be packed in a message to be hashed along with _to
    @return r : The first 32 bytes, after the length prefix
    @return s : The second 32 bytes
    @return v : The final byte (first byte of the next 32 bytes)
    To split the signature sig into r, s, v components
    */
    function splitSignature(bytes memory sig)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}