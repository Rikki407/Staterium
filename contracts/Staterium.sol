pragma solidity ^0.4.24;
contract Staterium {
    address owner;
    constructor () public {
        owner = msg.sender;
        
    //Dummy matches 
        Matches[10] = Match(1, 10, 100, 101, 10, 40, 5, 50);
        Matches[11] = Match(1, 11, 102, 103, 10, 40, 5, 50);
        Matches[12] = Match(1, 12, 104, 105, 10, 40, 5, 50);
        Matches[13] = Match(1, 13, 106, 107, 10, 40, 5, 50);
    }
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    
    function storeETH() payable public {}

    struct Match{
        uint256 _waveID;
        uint256 _matchID;
        uint256 _tagA;
        uint256 _tagB;
        uint256 minStake; // in ether
        uint256 maxStake; // in ether
        uint256 endTime; // in minuites
        uint256 threshold; // in ether
        mapping( address => uint256 ) StakedTag;
        mapping( address => uint256 ) StakedAmount;  
    }
    
   
    mapping( uint256 => Match) public Matches; // _matchID => Match
    
    mapping( uint256 => uint256[] ) public Wave; // _waveID => tags[]
   
    //Owner Functions
    function createWave(uint256 _waveID, uint256[] _tags) public onlyOwner {
        Wave[_waveID] = _tags;
    }
    function createMatch(uint256 _waveID, uint256 _matchID, uint256 _endTime, uint256 _tagA, uint256 _tagB, uint256 _minStake, uint256 _maxStake, uint256 _threshold) public onlyOwner {
        Matches[_matchID] = Match(_waveID, _matchID,  _tagA,  _tagB,  _minStake,  _maxStake, _endTime,  _threshold);
    }
   
    //Player Functions
   
    function stake(uint256 _tag, uint256 _waveID, uint256 _matchID) payable public returns(uint256){
        require(Matches[_matchID]._waveID == _waveID && _waveID!=0);
        uint256 oneEth = 1 ether;
        uint256 _maxStake = Matches[_matchID].maxStake*oneEth;
        uint256 _minStake = Matches[_matchID].minStake*oneEth;
        require(msg.value <= _maxStake  && msg.value  >= _minStake );
            
        Matches[_matchID].StakedTag[msg.sender] = _tag;
        Matches[_matchID].StakedAmount[msg.sender] = msg.value;
    }
   
    function unstake(uint256 _waveID, uint256 _matchID) public  {
        require(Matches[_matchID]._waveID == _waveID && _waveID!=0);
        msg.sender.transfer(Matches[_matchID].StakedAmount[msg.sender]);
    }
    function () public payable{}

}