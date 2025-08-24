import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useEthereum } from '../context/Ethereumcontext';
import DonateModal from './DonateModal';
import { ethers } from 'ethers';
import './CampaignList.css';
import { FaEthereum } from 'react-icons/fa';

/**
 * CampaignList Component
 * 
 * Displays a grid of fundraising campaigns with filtering, sorting, and donation functionality.
 * Manages campaign data fetching, state management, and user interactions.
 * 
 * @returns {JSX.Element} Rendered campaign list component
 */
const CampaignList = () => {
  // Context and state
  const { contract, account, isConnected } = useEthereum();
  
  // Campaign data state
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Filter and sort state
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track which campaign descriptions are expanded
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  /**
   * Toggles expanded description state for a campaign
   * 
   * @param {string} campaignId - ID of the campaign to toggle
   */
  const toggleDescription = useCallback((campaignId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  }, []);

  /**
   * Formats campaign data from blockchain response
   * 
   * @param {Object} details - Raw campaign details from contract
   * @param {number} id - Campaign ID
   * @returns {Object} Formatted campaign data object
   */
  const formatCampaignData = useCallback((details, id) => {
    const deadlineTimestamp = Number(details.deadline);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = deadlineTimestamp > currentTime ? 
      deadlineTimestamp - currentTime : 0;
    
    const raisedAmount = BigInt(details.raised);
    const goalAmount = BigInt(details.goal);
    const progressPercentage = goalAmount > 0 ? 
      Number((raisedAmount * 100n) / goalAmount) : 0;
    
    const isClosed = details.isClosed;
    const isExpired = deadlineTimestamp < currentTime;
    const isFullyFunded = progressPercentage >= 100;
    const isUrgent = timeRemaining > 0 && timeRemaining / 86400 <= 3;
    const creationDate = new Date(deadlineTimestamp * 1000 - (30 * 86400 * 1000)); // Assuming 30-day campaigns
        
    return {
      id: id.toString(),
      title: details.title,
      description: details.description,
      goal: details.goal.toString(),
      deadline: new Date(deadlineTimestamp * 1000).toLocaleDateString(),
      deadlineTimestamp,
      image: details.imageURL,
      raised: details.raised.toString(),
      creator: details.creator,
      isClosed,
      isExpired,
      isFullyFunded,
      isUrgent,
      progress: progressPercentage,
      timeRemaining: Math.floor(timeRemaining / 86400), // in days
      creationDate,
      canWithdraw: account && 
        account.toLowerCase() === details.creator.toLowerCase() && 
        (isExpired || isFullyFunded) && 
        !isClosed
    };
  }, [account]);

  /**
   * Fetches campaign data from blockchain
   */
  const fetchCampaigns = useCallback(async () => {
    if (!contract) {
      setIsLoading(false);
      setError("Contract not initialized");
      return;
    }

    try {
      setIsLoading(true);
      
      // Get campaign count using the correct method from contract
      const campaignCount = await contract.getCampaignCount();
      const count = parseInt(campaignCount.toString());
      
      const campaignData = [];
      const fetchPromises = [];
      
      // Start from 1 instead of 0 as per contract implementation
      for (let i = 1; i <= count; i++) {
        // Create a promise for each campaign fetch
        const fetchPromise = contract.getCampaignDetails(i)
          .then(details => {
            const formattedCampaign = formatCampaignData(details, i);
            campaignData.push(formattedCampaign);
          })
          .catch(innerError => {
            console.warn(`Error fetching campaign ${i}:`, innerError);
          });
          
        fetchPromises.push(fetchPromise);
      }
      
      // Wait for all fetches to complete
      await Promise.allSettled(fetchPromises);
      
      setCampaigns(campaignData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError("Failed to load campaigns. Please check your wallet connection.");
    } finally {
      setIsLoading(false);
    }
  }, [contract, formatCampaignData]);

  /**
   * Handles donation button click
   * 
   * @param {Object} campaign - Selected campaign data
   */
  const handleDonate = useCallback((campaign) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (campaign.isClosed || campaign.isExpired) {
      alert("This campaign is no longer accepting donations");
      return;
    }
    
    setSelectedCampaign(campaign);
  }, [account]);

  /**
   * Handles campaign withdraw action
   * 
   * @param {Object} campaign - Campaign to withdraw funds from
   */
  const handleWithdraw = useCallback(async (campaign) => {
    if (!account || !contract) return;
    
    try {
      const tx = await contract.withdrawFunds(campaign.id);
      await tx.wait();
      alert("Funds withdrawn successfully!");
      fetchCampaigns();
    } catch (error) {
      console.error("Withdraw error:", error);
      alert(`Failed to withdraw: ${error.reason || error.message}`);
    }
  }, [account, contract, fetchCampaigns]);

  /**
   * Gets appropriate status badge for campaign
   * 
   * @param {Object} campaign - Campaign data
   * @returns {JSX.Element|null} Status badge element or null
   */
  const getStatusBadge = useCallback((campaign) => {
    if (campaign.isClosed) {
      return <div className="campaign-badge closed">Closed</div>;
    } else if (campaign.isExpired) {
      return <div className="campaign-badge expired">Expired</div>;
    } else if (campaign.isFullyFunded) {
      return <div className="campaign-badge funded">Fully Funded</div>;
    } else if (campaign.isUrgent) {
      return <div className="campaign-badge urgent">Urgent</div>;
    }
    return null;
  }, []);

  /**
   * Renders campaign description with show more/less toggle
   * 
   * @param {Object} campaign - Campaign data
   * @returns {JSX.Element} Rendered description
   */
  const renderDescription = useCallback((campaign) => {
    const isExpanded = expandedDescriptions[campaign.id] || false;
    const maxLength = 80;
    const shouldTruncate = campaign.description.length > maxLength && !isExpanded;
    
    return (
      <div className="campaign-description-container">
        <p className={`campaign-description ${isExpanded ? 'expanded' : ''}`}>
          {shouldTruncate 
            ? `${campaign.description.substring(0, maxLength)}...` 
            : campaign.description}
        </p>
        {campaign.description.length > maxLength && (
          <button 
            className="show-more-button"
            onClick={() => toggleDescription(campaign.id)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    );
  }, [expandedDescriptions, toggleDescription]);

  // Fetch campaigns on initial load
  useEffect(() => {
    if (contract) {
      fetchCampaigns();
    }
  }, [contract, fetchCampaigns]);

  // Refresh campaigns periodically or when account changes
  useEffect(() => {
    if (contract && account) {
      fetchCampaigns();
      
      // Refresh campaigns periodically
      const intervalId = setInterval(() => {
        fetchCampaigns();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(intervalId);
    }
  }, [account, contract, fetchCampaigns]);

  /**
   * Filter campaigns based on user selection
   */
  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.title.toLowerCase().includes(searchLower) || 
        campaign.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter(campaign => 
          !campaign.isClosed && !campaign.isExpired);
        break;
      case 'urgent':
        filtered = filtered.filter(campaign => campaign.isUrgent);
        break;
      case 'funded':
        filtered = filtered.filter(campaign => campaign.isFullyFunded);
        break;
      case 'expired':
        filtered = filtered.filter(campaign => 
          campaign.isExpired || campaign.isClosed);
        break;
      case 'my-campaigns':
        filtered = filtered.filter(campaign => 
          account && campaign.creator.toLowerCase() === account.toLowerCase());
        break;
      default:
        // 'all' - no filtering needed
        break;
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'most-funded':
        filtered.sort((a, b) => BigInt(b.raised) - BigInt(a.raised));
        break;
      case 'ending-soon':
        filtered.sort((a, b) => {
          // Put expired campaigns at the end
          if (a.isExpired && !b.isExpired) return 1;
          if (!a.isExpired && b.isExpired) return -1;
          return a.deadlineTimestamp - b.deadlineTimestamp;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => b.creationDate - a.creationDate);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.creationDate - b.creationDate);
        break;
      default:
        // Default to newest
        filtered.sort((a, b) => b.creationDate - a.creationDate);
    }
    
    return filtered;
  }, [campaigns, filter, sortBy, searchTerm, account]);

  // Loading state
  if (isLoading && campaigns.length === 0) {
    return (
      <div className="campaign-list-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && campaigns.length === 0) {
    return (
      <div className="campaign-list-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCampaigns} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (campaigns.length === 0) {
    return (
      <div className="campaign-list-container">
        <div className="no-campaigns">
          <p>No active campaigns found. Be the first to create one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-container full-width">
      {/* Filters and controls */}
      <div className="campaign-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="urgent">Urgent</option>
            <option value="funded">Fully Funded</option>
            <option value="expired">Ended</option>
            {account && <option value="my-campaigns">My Campaigns</option>}
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-funded">Most Funded</option>
            <option value="ending-soon">Ending Soon</option>
          </select>
        </div>
        
        {lastUpdated && (
          <div className="refresh-info">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <button onClick={fetchCampaigns} className="refresh-button">
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Filtered results summary */}
      <div className="results-summary">
        <p>
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
          {filter !== 'all' && ` (filtered by: ${filter.replace('-', ' ')})`}
        </p>
      </div>

      {/* Empty state for filtered results */}
      {filteredCampaigns.length === 0 && (
        <div className="no-results">
          <p>No campaigns match your current filters.</p>
          <button onClick={() => { setFilter('all'); setSearchTerm(''); }} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      )}

      {/* Campaign grid */}
      <div className="campaign-grid">
        {filteredCampaigns.map((campaign) => (
          <div 
            key={campaign.id} 
            className={`campaign-card ${
              campaign.isClosed ? 'closed' : 
              campaign.isExpired ? 'expired' : 
              campaign.isFullyFunded ? 'funded' : 
              campaign.isUrgent ? 'urgent' : ''
            }`}
          >
            <div className="campaign-image-container">
              <img 
                src={campaign.image} 
                alt={campaign.title} 
                className="campaign-image"
                onError={(e) => {
                  e.target.src = '/placeholder-campaign.png'; // Fallback image
                  e.target.onerror = null;
                }}
              />
              {getStatusBadge(campaign)}
            </div>
            
            <div className="campaign-content">
              <h3 className="campaign-title" title={campaign.title}>
                {campaign.title.length > 40 ? `${campaign.title.substring(0, 40)}...` : campaign.title}
              </h3>
              
              <div className="campaign-creator">
                <span className="creator-badge" title={`Created by: ${campaign.creator}`}>
                  {campaign.creator.substring(0, 6)}...{campaign.creator.slice(-4)}
                </span>
              </div>
              
              {renderDescription(campaign)}
              
              <div className="campaign-metrics">
                <div className="campaign-progress-bar">
                  <div 
                    className="campaign-progress-fill" 
                    style={{width: `${Math.min(campaign.progress, 100)}%`}}
                    aria-valuenow={campaign.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    role="progressbar"
                  ></div>
                </div>
                <div className="campaign-percentage">{campaign.progress.toFixed(1)}%</div>
              </div>
              
              <div className="campaign-stats">
                <div className="campaign-stat">
                  <span className="stat-value">{ethers.formatEther(campaign.raised)} ETH</span>
                  <span className="stat-label">of {ethers.formatEther(campaign.goal)} ETH</span>
                </div>
                <div className="campaign-stat">
                  <span className="stat-value">
                    {campaign.timeRemaining > 0 ? campaign.timeRemaining : '0'}
                  </span>
                  <span className="stat-label">days left</span>
                </div>
              </div>
              
              <div className="campaign-actions">
                {/* Donate button - shown for active campaigns */}
                {!campaign.isClosed && !campaign.isExpired && (
                  <button
                    className="donate-button"
                    onClick={() => handleDonate(campaign)}
                  >
                    <FaEthereum className='donate'/>
                    Donate Now
                  </button>
                )}
                
                {/* Status indicator for closed/expired campaigns */}
                {(campaign.isClosed || campaign.isExpired) && (
                  <div className="campaign-status">
                    {campaign.isClosed ? 'Campaign Closed' : 'Campaign Expired'}
                    {campaign.isFullyFunded && ' - Goal Reached!'}
                  </div>
                )}
                
                {/* Withdraw button - shown for campaign creator */}
                {campaign.canWithdraw && campaign.isFullyFunded && (
                  <button 
                    className="withdraw-button"
                    onClick={() => handleWithdraw(campaign)}
                  >
                    Withdraw Funds
                  </button>
                )}
                
                {/* Failed campaign indicator */}
                {campaign.canWithdraw && !campaign.isFullyFunded && (
                  <button 
                    className="failed-button"
                    onClick={() => handleWithdraw(campaign)}
                  >
                    Close Failed Campaign
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button - for future pagination */}
      {filteredCampaigns.length >= 12 && (
        <div className="load-more-container">
          <button className="load-more-button">
            Load More Campaigns
          </button>
        </div>
      )}

      {/* Donation modal */}
      {selectedCampaign && (
        <DonateModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          contract={contract}
          refreshCampaigns={fetchCampaigns}
        />
      )}
    </div>
  );
};

export default CampaignList;