import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Replace with the path to your compiled ABI
import UniversityFundraiserABI from '../contract/UniversityFundraiser.json';

// Replace with your deployed contract address
const CONTRACT_ADDRESS = '0xB2eaC72BbDFc5493C37B5E7e39f7C501562d25B5';

const EthereumContext = createContext();

export const EthereumProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const init = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const signer = await browserProvider.getSigner();
        setSigner(signer);

        const userAddress = await signer.getAddress();
        setAccount(userAddress);

        const fundraiserContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          UniversityFundraiserABI.abi,
          signer
        );
        setContract(fundraiserContract);
      } catch (error) {
        console.error('Ethereum connection error:', error);
      }
    } else {
      console.warn('MetaMask is not installed.');
    }
  };

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => init());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => init());
      }
    };
  }, []);

  return (
    <EthereumContext.Provider value={{ provider, signer, account, contract }}>
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => useContext(EthereumContext);
