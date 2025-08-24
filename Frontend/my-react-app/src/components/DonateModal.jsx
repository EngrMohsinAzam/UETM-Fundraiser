import React, { useState } from 'react';
import { useEthereum } from '../context/Ethereumcontext';
import { parseEther } from 'ethers';
import './DonateModal.css';

const DonateModal = ({ campaign, onClose }) => {
  const { contract } = useEthereum();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleDonate = async () => {
    if (!contract || !amount || parseFloat(amount) <= 0) return;
    
    try {
      setLoading(true);
      // Call the donate function with the campaign ID and send ETH
      const tx = await contract.donate(campaign.id, {
        value: parseEther(amount)
      });
      await tx.wait();
      setLoading(false);
      alert('Donation successful!');
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Donation failed.');
    }
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2 className="modal-title">Donate to {campaign.title}</h2>
        <input
          type="number"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="modal-input"
          min="0.01"
          step="0.01"
        />
        <div className="modal-buttons">
          <button className="modal-btn cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="modal-btn donate" onClick={handleDonate} disabled={loading}>
            {loading ? 'Processing...' : 'Donate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;