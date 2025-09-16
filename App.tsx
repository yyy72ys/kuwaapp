// FIX: Corrected the React import statement which had a syntax error.
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { IndividualDetail } from './components/IndividualDetail';
import { useMockData } from './hooks/useMockData';
import type { Individual } from './types';
import { CsvImportModal } from './components/CsvImportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicProfile } from './components/PublicProfile';
import { UpgradeModal } from './components/UpgradeModal';

type View = 'user' | 'admin';

const App: React.FC = () => {
  const { individuals, addIndividual, updateIndividual, addPhotoToIndividual, userPlan, upgradePlan } = useMockData();
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [publicProfile, setPublicProfile] = useState<Individual | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('user');

  useEffect(() => {
    if (selectedIndividual) {
      const updatedIndividual = individuals.find(ind => ind.id === selectedIndividual.id);
      if (updatedIndividual && JSON.stringify(updatedIndividual) !== JSON.stringify(selectedIndividual)) {
        setSelectedIndividual(updatedIndividual);
      }
    }
  }, [individuals, selectedIndividual]);
  
  const handleSelectIndividual = useCallback((individual: Individual) => {
    setSelectedIndividual(individual);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedIndividual(null);
    setPublicProfile(null);
  }, []);

  const handleOpenImportModal = useCallback(() => {
    setImportModalOpen(true);
  }, []);

  const handleCloseImportModal = useCallback(() => {
    setImportModalOpen(false);
  }, []);
  
  const handleOpenUpgradeModal = useCallback(() => {
    setUpgradeModalOpen(true);
  }, []);

  const handleCloseUpgradeModal = useCallback(() => {
    setUpgradeModalOpen(false);
  }, []);
  
  const handleUpgrade = useCallback(() => {
    upgradePlan();
    setUpgradeModalOpen(false);
  }, [upgradePlan]);

  const handleNavigate = useCallback((view: View) => {
    setSelectedIndividual(null);
    setPublicProfile(null);
    setCurrentView(view);
  }, []);

  const handleViewPublicProfile = useCallback((individual: Individual) => {
    setPublicProfile(individual);
  }, []);

  if (publicProfile) {
    return <PublicProfile individual={publicProfile} onBack={handleBackToDashboard} />;
  }

  const UserView = () => {
    if (selectedIndividual) {
      return <IndividualDetail 
        individual={selectedIndividual} 
        onBack={handleBackToDashboard}
        onAddPhoto={(photoUrl) => addPhotoToIndividual(selectedIndividual.id, photoUrl)}
        onViewPublicProfile={handleViewPublicProfile}
      />;
    }
    return <Dashboard 
        individuals={individuals} 
        onSelectIndividual={handleSelectIndividual}
        userPlan={userPlan}
        onUpgradeClick={handleOpenUpgradeModal}
    />;
  };

  return (
    <Layout 
      onImportClick={handleOpenImportModal}
      onNavigate={handleNavigate}
      currentView={currentView}
    >
      {currentView === 'user' ? <UserView /> : <AdminDashboard />}
      {isImportModalOpen && <CsvImportModal onClose={handleCloseImportModal} />}
      {isUpgradeModalOpen && <UpgradeModal onClose={handleCloseUpgradeModal} onUpgrade={handleUpgrade} />}
    </Layout>
  );
};

export default App;