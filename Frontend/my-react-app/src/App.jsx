import React from 'react';
import { EthereumProvider } from './context/Ethereumcontext';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Pages/Home';
import CreateCampaign from './Pages/CreateCampaign';
import CampaignDetails from './Pages/CampaignDetails';
import Navbar from './components/Navbar';

function App() {
  return (
    <EthereumProvider>
      <Router>
        {/* Navbar */}
        <Navbar />
        {/* Main content */}
        <main className="">
          <div className="">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="">
                    <Home />
                  </div>
                }
              />
              <Route
                path="/create"
                element={
                  <div className="">
                    <CreateCampaign />
                  </div>
                }
              />
              <Route
                path="/campaign/:id"
                element={
                  <div className="">
                    <CampaignDetails />
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
      </Router>
    </EthereumProvider>
  );
}

export default App;
