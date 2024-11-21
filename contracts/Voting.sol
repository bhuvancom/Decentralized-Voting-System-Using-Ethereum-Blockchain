pragma solidity ^0.5.15;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }
    constructor() public {}

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;
    // New mapping to store unique candidate identifiers
    mapping(string => bool) private candidateExistsMapping;
    uint public countCandidates;
    uint256 public votingEnd;
    uint256 public votingStart;
    bool private isVotingEnabled;
    function enableVoting() public {
        isVotingEnabled = true;
    }

    function disableVoting() public {
        isVotingEnabled = false;
    }

    function addCandidate(
        string memory name,
        string memory party
    ) public returns (uint) {
        require(!isVotingEnabled, "Voting started, can not alter state.");
        // Create a unique key based on name and party
        string memory key = string(abi.encodePacked(name, party));
        // Check if the candidate already exists
        require(
            !candidateExistsMapping[key],
            "Candidate with this name and party already exists."
        );

        // Update the candidate existence mapping
        candidateExistsMapping[key] = true;

        countCandidates++;
        candidates[countCandidates] = Candidate(
            countCandidates,
            name,
            party,
            0
        );
        return countCandidates;
    }

    function vote(uint candidateID) public {
        require(isVotingEnabled);
        require((votingStart <= now) && (votingEnd > now));

        require(candidateID > 0 && candidateID <= countCandidates);

        require(!voters[msg.sender]);

        voters[msg.sender] = true;

        candidates[candidateID].voteCount++;
    }

    function checkVote() public view returns (bool) {
        return voters[msg.sender];
    }

    function getCountCandidates() public view returns (uint) {
        return countCandidates;
    }
    function getVotingState() public view returns (bool) {
        return isVotingEnabled;
    }

    function getCandidate(
        uint candidateID
    ) public view returns (uint, string memory, string memory, uint) {
        return (
            candidateID,
            candidates[candidateID].name,
            candidates[candidateID].party,
            candidates[candidateID].voteCount
        );
    }

    function setDates(uint256 _startDate, uint256 _endDate) public {
        require(!isVotingEnabled, "Voting started, can not alter state.");
        require(
            (votingEnd == 0) &&
                (votingStart == 0) &&
                (_startDate + 1000000 > now) &&
                (_endDate > _startDate)
        );
        votingEnd = _endDate;
        votingStart = _startDate;
    }

    function getDates() public view returns (uint256, uint256) {
        return (votingStart, votingEnd);
    }
}
