import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from '../context/Ethereumcontext';
import './CampaignCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const CampaignCard = ({ campaign, onUpdate }) => {
  const { contract, account } = useEthereum();
  const [donationAmount, setDonationAmount] = useState('');
  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isEnded, setIsEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = Number(campaign.deadline);
      const secondsLeft = deadline - now;

      if (secondsLeft <= 0 || campaign.isClosed) {
        setIsEnded(true);
        setRemainingTime({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(secondsLeft / (60 * 60 * 24));
      const hours = Math.floor((secondsLeft % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((secondsLeft % (60 * 60)) / 60);

      setRemainingTime({ days, hours, minutes });
      setIsEnded(false);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [campaign.deadline, campaign.isClosed]);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!contract || !account) return alert('Connect your wallet first.');
    if (!donationAmount || parseFloat(donationAmount) <= 0)
      return alert('Enter a valid donation amount.');

    try {
      setIsLoading(true);
      const tx = await contract.donate(campaign.id, {
        value: ethers.parseEther(donationAmount),
      });
      await tx.wait();
      alert('Donation successful!');
      setDonationAmount('');
      onUpdate();
    } catch (err) {
      console.error(err);
      alert(`Donation failed: ${err.reason || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = Math.min(
    (Number(campaign.raised) / Number(campaign.goal)) * 100,
    100
  );

  const formatDescription = (desc) => {
    if (!showFullDescription && desc.length > 100) {
      return desc.substring(0, 100) + '...';
    }
    return desc;
  };

  return (
    <div className="campaign-card">
      <div className="campaign-image-wrapper">
        <img src={campaign.imageURL} alt={campaign.title} className="campaign-image" />
        <div className={`status-badge ${isEnded ? 'ended' : 'active'}`}>
          {isEnded ? 'Ended' : 'Active'}
        </div>
      </div>

      <div className="campaign-content">
        <h2 className="campaign-title">{campaign.title}</h2>

        <div className="campaign-stats">
          <div className="stat-item">
            <div className="stat-value">{ethers.formatEther(campaign.raised)} ETH</div>
            <div className="stat-label">Raised</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{ethers.formatEther(campaign.goal)} ETH</div>
            <div className="stat-label">Goal</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{progressPercentage.toFixed(1)}%</div>
            <div className="stat-label">Funded</div>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="time-remaining">
          {!isEnded ? (
            <div className="time-blocks">
              <div className="time-block">
                <span className="time-value">{remainingTime.days}</span>
                <span className="time-label">days</span>
              </div>
              <div className="time-block">
                <span className="time-value">{remainingTime.hours}</span>
                <span className="time-label">hrs</span>
              </div>
              <div className="time-block">
                <span className="time-value">{remainingTime.minutes}</span>
                <span className="time-label">min</span>
              </div>
            </div>
          ) : (
            <div className="campaign-ended">Campaign Ended</div>
          )}
        </div>

        <div className="creator-info">
          <div className="creator-icon">
            {campaign.creator ? campaign.creator.substring(0, 2) : 'CR'}
          </div>
          <span className="creator-text">
            by {campaign.creator
              ? `${campaign.creator.substring(0, 6)}...${campaign.creator.slice(-4)}`
              : 'Anonymous'}
          </span>
        </div>

        <div className="campaign-description">
          {formatDescription(campaign.description)}
          {campaign.description.length > 100 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="toggle-description"
            >
              {showFullDescription ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>

      <div className="campaign-footer">
        {!isEnded ? (
          <form onSubmit={handleDonate} className="donation-form">
            <div className="donation-input-wrapper">
              <input
                type="number"
                step="0.001"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="0.001"
              />
              <span className="eth-label">ETH</span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`donate-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Donate'}
            </button>
          </form>
        ) : (
          <div className="ended-actions">
            {Number(campaign.raised) >= Number(campaign.goal) ? (
              <div className="success-message">Funding goal reached!</div>
            ) : (
              <div className="failed-message">Goal not reached</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;