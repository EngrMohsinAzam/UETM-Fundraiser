// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UniversityFundraiser {
    struct Campaign {
        uint256 id;
        string title;
        string description;
        uint256 goal;
        uint256 deadline;
        address payable beneficiary;
        uint256 raised;
        string imageURL;
        bool isClosed;
        address creator;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations;

    event CampaignCreated(
        uint256 indexed campaignId,
        address creator,
        string imageURL
    );
    event DonationMade(uint256 indexed campaignId, address donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address donor, uint256 amount);

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _durationDays,
        address payable _beneficiary,
        string memory _imageURL
    ) public {
        require(bytes(_title).length > 0, "Title is required");
        require(bytes(_description).length > 0, "Description is required");
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationDays > 0, "Duration must be at least 1 day");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(bytes(_imageURL).length > 0, "Image URL is required");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            title: _title,
            description: _description,
            goal: _goal,
            deadline: block.timestamp + (_durationDays * 1 days),
            beneficiary: _beneficiary,
            raised: 0,
            imageURL: _imageURL,
            isClosed: false,
            creator: msg.sender
        });

        emit CampaignCreated(campaignCount, msg.sender, _imageURL);
    }

    function donate(uint256 _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(!campaign.isClosed, "Campaign is closed");
        require(msg.value > 0, "Donation amount must be greater than 0");

        campaign.raised += msg.value;
        donations[_campaignId][msg.sender] += msg.value;

        emit DonationMade(_campaignId, msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.beneficiary, "Not authorized");
        require(block.timestamp >= campaign.deadline, "Campaign not ended");
        require(campaign.raised >= campaign.goal, "Goal not reached");
        require(!campaign.isClosed, "Funds already withdrawn");

        campaign.isClosed = true;
        (bool sent, ) = campaign.beneficiary.call{value: campaign.raised}("");
        require(sent, "Withdrawal failed");

        emit FundsWithdrawn(_campaignId, campaign.raised);
    }

    function claimRefund(uint256 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign not ended");
        require(campaign.raised < campaign.goal, "Goal was met");
        require(donations[_campaignId][msg.sender] > 0, "No donation to refund");

        uint256 amount = donations[_campaignId][msg.sender];
        donations[_campaignId][msg.sender] = 0;
        
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Refund failed");

        emit RefundIssued(_campaignId, msg.sender, amount);
    }

    function getCampaignDetails(uint256 _campaignId) public view returns (
        string memory title,
        string memory description,
        uint256 goal,
        uint256 deadline,
        uint256 raised,
        string memory imageURL,
        bool isClosed,
        address creator
    ) {
        Campaign memory campaign = campaigns[_campaignId];
        return (
            campaign.title,
            campaign.description,
            campaign.goal,
            campaign.deadline,
            campaign.raised,
            campaign.imageURL,
            campaign.isClosed,
            campaign.creator
        );
    }

    function getTimeRemaining(uint256 _campaignId) public view returns (uint256) {
        Campaign memory campaign = campaigns[_campaignId];
        if (block.timestamp >= campaign.deadline) return 0;
        return campaign.deadline - block.timestamp;
    }

    function getCampaignCount() public view returns (uint256) {
        return campaignCount;
    }
}