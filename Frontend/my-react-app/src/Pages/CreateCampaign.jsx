import React from 'react';
import CreateCampaignForm from '../components/CreateCampaignForm';
import './CreateCampaign.css';

const CreateCampaign = () => {
  return (
    <div className="create-campaign-page">
      <div className="campaign-creation-container">
        <header className="creation-header">
          <div className="header-content">
            <h1 className="header-title">Launch Academic Campaign</h1>
            <p className="header-subtitle">
              Create a transparent, blockchain-based fundraising campaign for university initiatives
            </p>
          </div>
        </header>

        <main className="creation-main">
          <div className="form-container-wrapper">
            <div className="form-card">
              <div className="form-card-header">
                <h2 className="form-card-title">
                  <span className="form-step-indicator">Step 1/1</span>
                  Campaign Configuration
                </h2>
                <p className="form-card-subtitle">
                  All fields are required and will be permanently stored on the blockchain
                </p>
              </div>
              
              <div className="form-card-body">
                <CreateCampaignForm />
              </div>
            </div>
          </div>
        </main>

        <footer className="creation-footer">
          <div className="footer-content">
            <div className="disclaimer-box">
              <p className="disclaimer-text">
                <strong>Blockchain Notice:</strong> All campaign creations require Ethereum gas fees. 
                Submitted data cannot be modified after blockchain confirmation.
              </p>
            </div>
            <div className="security-info">
              <span className="security-tag">🔒 Secured by Ethereum Blockchain</span>
              <span className="network-info">Current Network: Mainnet</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CreateCampaign;