pragma solidity >=0.8.0;
//SPDX-License-Identifier: MIT

// custom errors to save gas
error UNAUTHORIZED_STREAM_OWNER();
error INVALID_WITHDRAWAL_AMOUNT();
error STREAM_DEPOSIT_LOW();


contract SimpleStream {

  event Withdraw( address indexed to, uint256 amount, string reason );
  event Deposit( address indexed from, uint256 amount, string reason );

  // immutable vars to save gas
  address payable immutable public toAddress;// = payable(0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1);
  uint256 public immutable cap;// = 0.5 ether;
  uint256 public immutable frequency;// 1296000 seconds == 2 weeks;
  uint256 public last;//stream starts empty (last = block.timestamp) or full (block.timestamp - frequency)

  constructor(address payable _toAddress, uint256 _cap, uint256 _frequency, bool _startsFull) {
    toAddress = _toAddress;
    cap = _cap;
    frequency = _frequency;
    if(_startsFull){
      last = block.timestamp - _frequency;
    }else{
      last = block.timestamp;
    }
  }

  function streamBalance() public view returns (uint256){
    if(block.timestamp-last > frequency){
      return cap;
    }
    return (cap * (block.timestamp-last)) / frequency;
  }

  function streamWithdraw(uint256 amount, string memory reason) public {
    if (msg.sender != toAddress) {
      revert UNAUTHORIZED_STREAM_OWNER();
    }
    uint256 totalAmountCanWithdraw = streamBalance();
    if (amount > totalAmountCanWithdraw) {
      revert INVALID_WITHDRAWAL_AMOUNT();
    }
    uint256 cappedLast = block.timestamp-frequency;
    if(last<cappedLast){
      last = cappedLast;
    }
    last = last + ((block.timestamp - last) * amount / totalAmountCanWithdraw);
    emit Withdraw( msg.sender, amount, reason );
    toAddress.transfer(amount);
  }

  function streamDeposit(string memory reason) public payable {
    if (msg.value < (cap /10)) {
      revert STREAM_DEPOSIT_LOW();
    }
    emit Deposit( msg.sender, msg.value, reason );
  }

  receive() external payable { streamDeposit(""); }
}
