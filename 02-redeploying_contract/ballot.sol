pragma solidity ^0.4.17;

contract Inbox {
    string public message;

    function Inbox(string initialMessage) public {
        message = initialMessage;
    }

    function setMessage(string newMessage) public {
        message = newMessage;
    }

    // removed getMessage function because the compiler automatically creates getVariable function with the name of the variable without us having to do it.
}
