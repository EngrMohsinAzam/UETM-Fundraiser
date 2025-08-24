import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEthereum } from '../context/Ethereumcontext';
import './Navbar.css';

const Navbar = () => {
  const { account, connectWallet } = useEthereum();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          <div className="brand__logo">
            <svg className="logo__icon" viewBox="0 0 32 32">
              <path d="M16 2C8.28 2 2 8.28 2 16s6.28 14 14 14 14-6.28 14-14S23.72 2 16 2zm-1 24.95v-3c-3.34 0-6.18-2.12-7.24-5.03l2.84-1.22c.66 1.78 2.37 3.06 4.4 3.06 2.48 0 4.5-2.02 4.5-4.5s-2.02-4.5-4.5-4.5c-2.03 0-3.74 1.28-4.4 3.06l-2.84-1.22C8.82 11.12 11.66 9 15 9v-3c6.07 0 11 4.93 11 11s-4.93 11-11 11z"/>
            </svg>
          </div>
          <span className="brand__text">UETM Fundraiser</span>
        </Link>

        <div 
          className={`navbar__menu ${mobileMenuOpen ? 'active' : ''}`} 
          ref={menuRef}
        >
          <div className="menu__items">
            <Link
              to="/"
              className={`menu__link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/create"
              className={`menu__link ${location.pathname === '/create' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Campaign
            </Link>
          </div>

          <div className="wallet__section">
            {account ? (
              <div className="wallet__badge">
                <div className="status__indicator"></div>
                <span className="wallet__address">
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </span>
                <div className="wallet__tooltip">Wallet Connected</div>
              </div>
            ) : (
              <button 
                className="connect__button" 
                onClick={handleConnectWallet}
                aria-label="Connect Wallet"
              >
                <span>Connect Wallet</span>
                <div className="button__hover"></div>
              </button>
            )}
          </div>
        </div>

        <button 
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger__line"></span>
          <span className="hamburger__line"></span>
          <span className="hamburger__line"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;