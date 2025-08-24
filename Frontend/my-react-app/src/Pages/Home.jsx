import React, { useEffect, useState } from 'react';
import CampaignList from '../components/CampaignList';
import './Home.css';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page">
      <div className="home-container">
        {}

        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="campaign-list-container">
            <CampaignList />
          </div>
        )}
      </div>
      
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-section about-section">
            <h3>About Us</h3>
            <p>We connect innovative university projects with passionate supporters to make ideas come to life.</p>
          </div>
          
          <div className="footer-section links-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/how-it-works">How It Works</a></li>
              <li><a href="http://localhost:5173/create">Create Campaign</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
          
          <div className="footer-section social-section">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="https://www.facebook.com/share/182mDiHjS8/" className="social-icon facebook"></a>
              <a href="https://github.com/EngrMohsinAzam" className="social-icon twitter"></a>
              <a href="#" className="social-icon instagram"></a>
              <a href="http://www.linkedin.com/in/mohsin-yazamb745a5292" className="social-icon linkedin"></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} University Campaigns. All rights reserved.</p>
          <div className="footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;