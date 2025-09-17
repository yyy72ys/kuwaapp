// FIX: Corrected the React import statement which had a syntax error.
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { IndividualDetail } from './components/IndividualDetail';
import { useMockData } from './hooks/useMockData';
import type { Individual, User } from './types';
import { CsvImportModal } from './components/CsvImportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicProfile } from './components/PublicProfile';
import { UpgradeModal } from './components/UpgradeModal';
import { AddIndividualModal } from './components/AddIndividualModal';

type View = 'user' | 'admin';

const PLAN_LIMITS = {
    free: 5,
    pro: Infinity,
}

const App: React.FC = () => {
  const { 
    individuals, addIndividual, updateIndividual, addPhotoToIndividual, userPlan, upgradePlan,
    users, importJobs, exportJobs, toggleUserStatus, retryImportJob, retryExportJob
  } = useMockData();
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [publicProfile, setPublicProfile] = useState<Individual | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [isAddIndividualModalOpen, setAddIndividualModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('user');
  const [impersonatingUser, setImpersonatingUser] = useState<{ email: string } | null>(null);
  const [individualToCopy, setIndividualToCopy] = useState<Individual | null>(null);

  const atLimit = userPlan === 'free' && individuals.length >= PLAN_LIMITS.free;

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

  const handleOpenAddIndividualModal = useCallback(() => {
    setIndividualToCopy(null);
    setAddIndividualModalOpen(true);
  }, []);
  
  const handleCloseAddIndividualModal = useCallback(() => {
    setAddIndividualModalOpen(false);
    setIndividualToCopy(null);
  }, []);

  const handleAddIndividual = useCallback((newIndividual: Omit<Individual, 'id' | 'photos' | 'measurements'>) => {
    addIndividual(newIndividual);
    handleCloseAddIndividualModal();
  }, [addIndividual, handleCloseAddIndividualModal]);
  
  const handleUpgrade = useCallback(() => {
    upgradePlan();
    setUpgradeModalOpen(false);
  }, [upgradePlan]);
  
  const handleCopyToNew = useCallback((individual: Individual) => {
    setIndividualToCopy(individual);
    setAddIndividualModalOpen(true);
  }, []);


  const handleNavigate = useCallback((view: View) => {
    setSelectedIndividual(null);
    setPublicProfile(null);
    setCurrentView(view);
    if(view === 'admin') {
      setImpersonatingUser(null); // Stop impersonating when navigating to admin manually
    }
  }, []);

  const handleViewPublicProfile = useCallback((individual: Individual) => {
    setPublicProfile(individual);
  }, []);

  const handleImpersonate = useCallback((user: User) => {
    if(window.confirm(`${user.email} としてアプリケーションを表示しますか？`)) {
        setImpersonatingUser({ email: user.email });
        setCurrentView('user');
        setSelectedIndividual(null);
        setPublicProfile(null);
    }
  }, []);

  const handleStopImpersonating = useCallback(() => {
    setImpersonatingUser(null);
    setCurrentView('admin');
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
        userPlan={userPlan}
        onUpgradeClick={handleOpenUpgradeModal}
        onCopyToNew={handleCopyToNew}
        atLimit={atLimit}
      />;
    }
    return <Dashboard 
        individuals={individuals} 
        onSelectIndividual={handleSelectIndividual}
        userPlan={userPlan}
        onUpgradeClick={handleOpenUpgradeModal}
        onAddIndividualClick={handleOpenAddIndividualModal}
    />;
  };

  return (
    <Layout 
      onImportClick={handleOpenImportModal}
      onNavigate={handleNavigate}
      currentView={currentView}
      impersonatingUser={impersonatingUser}
      onStopImpersonating={handleStopImpersonating}
    >
      {currentView === 'user' ? <UserView /> : <AdminDashboard 
        users={users}
        importJobs={importJobs}
        exportJobs={exportJobs}
        onImpersonate={handleImpersonate}
        onToggleUserStatus={toggleUserStatus}
        onRetryJob={retryImportJob}
        onRetryExportJob={retryExportJob}
        />}
      {isImportModalOpen && <CsvImportModal onClose={handleCloseImportModal} />}
      {isUpgradeModalOpen && <UpgradeModal onClose={handleCloseUpgradeModal} onUpgrade={handleUpgrade} />}
      {isAddIndividualModalOpen && <AddIndividualModal onClose={handleCloseAddIndividualModal} onAdd={handleAddIndividual} individuals={individuals} initialData={individualToCopy} />}
    </Layout>
  );
};

export default App;