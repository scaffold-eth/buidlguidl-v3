pragma solidity >=0.8.4;
//SPDX-License-Identifier: MIT

interface ISimpleStream {
  function streamDeposit(string memory reason) external payable;
}

contract StreamMultiFunder {
  address public buidlGuidl = 0x97843608a00e2bbc75ab0C1911387E002565DEDE;
  address public austinGriffith = 0x34aA3F359A9D614239015126635CE7732c18fDF3;

  event MultiFundStreams(address indexed sender, address[] streams, uint256[] amounts, string[] reasons);

  function fundStreams(address[] memory streams, uint256[] memory amounts, string[] memory reasons) public payable {
    require(streams.length > 0,"No streams");
    require(msg.value > 0.001 ether, "Not worth the gas");
    require(streams.length == amounts.length,"different length");
    require(streams.length == reasons.length,"different length");

    for(uint8 i = 0; i < streams.length; i++) {
        ISimpleStream thisStream = ISimpleStream(streams[i]);
        thisStream.streamDeposit{value: amounts[i]}(reasons[i]);
    }

    emit MultiFundStreams(msg.sender, streams, amounts, reasons);
  }

  function austinCanCleanUpDust() public {
    require(msg.sender == austinGriffith,"Not Austin");
    (bool sent,) = buidlGuidl.call{value: address(this).balance}("");
    require(sent, "Failed to send Ether");
  }
}
