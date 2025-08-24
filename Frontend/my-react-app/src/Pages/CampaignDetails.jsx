import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEthereum } from '../context/Ethereumcontext';
import './CampaignDetails.css';

const CampaignDetails = () => {
  const { id } = useParams();
  const { contract, account } = useEthereum();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchCampaign = async () => {
    if (contract && id) {
      try {
        setLoading(true);
        setError(null);
        const data = await contract.getCampaignDetails(id);
        setCampaign({
          title: data.title,
          description: data.description,
          target: data.target,
          deadline: new Date(Number(data.deadline) * 1000),
          image: data.image,
          raised: data.amountRaised,
          creator: data.creator,
          id: id
        });
      } catch (err) {
        console.error('Failed to load campaign details:', err);
        setError('Failed to load campaign data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id, contract]);

  const calculateProgress = () => {
    if (!campaign) return 0;
    const target = Number(campaign.target);
    const raised = Number(campaign.raised);
    return (raised / target) * 100;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDonate = async () => {
    if (!donationAmount || isNaN(donationAmount) || parseFloat(donationAmount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }

    setDonating(true);
    setError(null);
    
    try {
      // Example donation logic - this would be replaced with actual contract interaction
      console.log(`Donating ${donationAmount} ETH to campaign ${id}`);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Donation successful
      setDonationSuccess(true);
      setDonationAmount('');
      
      // Refresh campaign data after donation
      await fetchCampaign();
    } catch (err) {
      console.error('Donation failed:', err);
      setError('Transaction failed. Please try again later.');
    } finally {
      setDonating(false);
    }
  };

  const daysRemaining = () => {
    if (!campaign) return 0;
    const now = new Date();
    const diffTime = campaign.deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="campaign-loading">
        <div className="loader"></div>
        <p>Loading campaign details...</p>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="campaign-error">
        <h2>⚠️ Error Loading Campaign</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">Return to Campaigns</Link>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="campaign-error">
        <h2>⚠️ Campaign Not Found</h2>
        <p>The campaign you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="back-link">Return to Campaigns</Link>
      </div>
    );
  }

  return (
    <div className="campaign-details-page">
      <div className="campaign-navigation">
        <Link to="/" className="back-button">
          ← Back to Campaigns
        </Link>
      </div>
      
      <div className="campaign-details-card">
        <div className="campaign-banner">
          <img src={campaign.image} alt={campaign.title} />
          <div className="overlay">
            <h1>{campaign.title}</h1>
            <div className="campaign-creator">
              Created by <span className="creator-address">{formatAddress(campaign.creator)}</span>
            </div>
          </div>
        </div>

        <div className="campaign-content">
          <div className="campaign-stats">
            <div className="stat-item">
              <span className="stat-value">{(Number(campaign.target) / 1e18).toFixed(2)} ETH</span>
              <span className="stat-label">Target</span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-value">{(Number(campaign.raised) / 1e18).toFixed(2)} ETH</span>
              <span className="stat-label">Raised</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{daysRemaining()}</span>
              <span className="stat-label">Days Left</span>
            </div>
          </div>

          <section className="progress-section">
            <div className="progress-label">
              <span>Campaign Progress</span>
              <span className="progress-percentage">{calculateProgress().toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(calculateProgress(), 100)}%` }}
              ></div>
            </div>
          </section>

          <section className="campaign-description">
            <h2>About This Campaign</h2>
            <p>{campaign.description}</p>
          </section>

          <div className="campaign-details-grid">
            <div className="details-info-card">
              <h3>Campaign Details</h3>
              <ul className="details-list">
                <li>
                  <span>Campaign ID:</span>
                  <span>{campaign.id}</span>
                </li>
                <li>
                  <span>Created by:</span>
                  <span className="address-value">{formatAddress(campaign.creator)}</span>
                </li>
                <li>
                  <span>Deadline:</span>
                  <span>{formatDate(campaign.deadline)}</span>
                </li>
                <li>
                  <span>Target Amount:</span>
                  <span>{(Number(campaign.target) / 1e18).toFixed(2)} ETH</span>
                </li>
                <li>
                  <span>Current Balance:</span>
                  <span>{(Number(campaign.raised) / 1e18).toFixed(2)} ETH</span>
                </li>
              </ul>
            </div>

            <div className="donation-form-card">
              <h3>Support This Campaign</h3>
              {donationSuccess && (
                <div className="donation-success-message">
                  Thank you for your donation! The campaign has been updated.
                </div>
              )}
              {error && <div className="donation-error-message">{error}</div>}
              
              <div className="donation-form">
                <div className="donation-input-group">
                  <label htmlFor="donation-amount">Donation Amount</label>
                  <div className="input-wrapper">
                    <input
                      id="donation-amount"
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={donating}
                    />
                    <span className="currency-label">ETH</span>
                  </div>
                </div>
                
                <button 
                  className={`donate-button ${donating ? 'loading' : ''}`}
                  onClick={handleDonate}
                  disabled={donating}
                >
                  {donating ? 'Processing...' : 'Donate Now'}
                </button>
                
                <div className="donation-info">
                  <p>Your donation will be processed securely through Ethereum blockchain.</p>
                  <p>All transactions are irreversible and transparent.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="campaign-footer">
          <div className="footer-content">
            <p>All donations are secured and verified by Ethereum blockchain technology.</p>
            <p>Campaign ends on {formatDate(campaign.deadline)}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CampaignDetails;