import React, { useState, useEffect } from 'react';
import { useEthereum } from '../context/Ethereumcontext';
import { parseEther } from 'ethers';
import './CreateUniversityCampaignForm.css';

const CreateUniversityCampaignForm = () => {
  const { contract, account } = useEthereum();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    durationDays: '30', // Added duration in days instead of deadline
    beneficiary: '', // Added beneficiary field
    image: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Set default beneficiary to the connected account
  useEffect(() => {
    if (account) {
      setFormData(prev => ({...prev, beneficiary: account}));
    }
  }, [account]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.target || parseFloat(formData.target) <= 0)
      errors.target = 'Target amount must be greater than 0';
    if (!formData.durationDays || parseInt(formData.durationDays) <= 0)
      errors.durationDays = 'Duration must be at least 1 day';
    if (!formData.beneficiary || !formData.beneficiary.startsWith('0x'))
      errors.beneficiary = 'Valid beneficiary address is required';
    if (!formData.image || !formData.image.startsWith('http'))
      errors.image = 'Valid image URL is required';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!contract || !account) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage('');

      // Convert target to Wei
      const targetAmount = parseEther(formData.target);
      
      // Calculate duration in days (as a number, not BigInt)
      const durationDays = parseInt(formData.durationDays);
      
      console.log("Attempting to create campaign with parameters:", {
        title: formData.title,
        description: formData.description,
        goal: targetAmount.toString(),
        durationDays: durationDays,
        beneficiary: formData.beneficiary,
        imageURL: formData.image
      });

      // Call the contract with the correct parameters according to the smart contract function
      const transaction = await contract.createCampaign(
        formData.title,
        formData.description,
        targetAmount,
        durationDays,
        formData.beneficiary,
        formData.image
      );

      await transaction.wait();

      setLoading(false);
      setSuccessMessage('University campaign created successfully!');
      setFormData({
        title: '',
        description: '',
        target: '',
        durationDays: '30',
        beneficiary: account || '',
        image: '',
      });
    } catch (error) {
      setLoading(false);
      console.error('Error creating university campaign:', error);
      
      let errorMessage = 'Error creating campaign: ';
      
      // Handle specific error types
      if (error.message.includes('user rejected')) {
        errorMessage += 'Transaction was rejected by user.';
      } else if (error.message.includes('INVALID_ARGUMENT') || error.message.includes('no matching fragment')) {
        errorMessage += 'Contract requires different parameter types. Check the console for details.';
        
        // Try to determine the correct contract interface
        try {
          const fragment = contract.interface.getFunction('createCampaign');
          console.log("Expected parameter types:", fragment.inputs.map(i => `${i.name}: ${i.type}`));
        } catch (e) {
          console.error("Failed to get function signature:", e);
        }
      } else {
        errorMessage += error.message.split('(')[0]; // Just show the first part of the error
      }
      
      alert(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="campaign-form">
      <h2 className="form-title">Create a University Campaign</h2>

      {/* Title */}
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'error' : ''}
          placeholder="e.g. Scholarship Fund for CS Students"
          required
        />
        {errors.title && <p className="error-text">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? 'error' : ''}
          placeholder="Describe the purpose of this campaign"
          required
        ></textarea>
        {errors.description && <p className="error-text">{errors.description}</p>}
      </div>

      {/* Target Amount */}
      <div className="form-group">
        <label htmlFor="target">Target Amount (ETH)</label>
        <input
          type="number"
          name="target"
          id="target"
          min="0.01"
          step="0.01"
          value={formData.target}
          onChange={handleChange}
          className={errors.target ? 'error' : ''}
          placeholder="e.g. 5"
          required
        />
        {errors.target && <p className="error-text">{errors.target}</p>}
      </div>

      {/* Duration in Days (replaces Deadline) */}
      <div className="form-group">
        <label htmlFor="durationDays">Duration (Days)</label>
        <input
          type="number"
          name="durationDays"
          id="durationDays"
          min="1"
          value={formData.durationDays}
          onChange={handleChange}
          className={errors.durationDays ? 'error' : ''}
          placeholder="e.g. 30"
          required
        />
        {errors.durationDays && <p className="error-text">{errors.durationDays}</p>}
      </div>

      {/* Beneficiary Address */}
      <div className="form-group">
        <label htmlFor="beneficiary">Beneficiary Address</label>
        <input
          type="text"
          name="beneficiary"
          id="beneficiary"
          value={formData.beneficiary}
          onChange={handleChange}
          className={errors.beneficiary ? 'error' : ''}
          placeholder="0x..."
          required
        />
        {errors.beneficiary && <p className="error-text">{errors.beneficiary}</p>}
      </div>

      {/* Image URL */}
      <div className="form-group">
        <label htmlFor="image">Image URL</label>
        <input
          type="url"
          name="image"
          id="image"
          value={formData.image}
          onChange={handleChange}
          className={errors.image ? 'error' : ''}
          placeholder="e.g. https://example.com/campaign.jpg"
          required
        />
        {errors.image && <p className="error-text">{errors.image}</p>}
      </div>

      {/* Image Preview */}
      {formData.image && (
        <div className="form-group image-preview">
          <img src={formData.image} alt="Campaign Preview" />
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className={`submit-button ${loading ? 'disabled' : ''}`}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Campaign'}
      </button>

      {/* Success Message */}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </form>
  );
};

export default CreateUniversityCampaignForm;