import React, { useEffect, useMemo, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  BarChart2,
  Briefcase,
  FileText,
  Save,
  Settings as SettingsIcon,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';

import DashboardTab from './src/components/tabs/DashboardTab';
import ServicesTab from './src/components/tabs/ServicesTab';
import ChargesTab from './src/components/tabs/ChargesTab';
import AnalysisTab from './src/components/tabs/AnalysisTab';
import PricingTab from './src/components/tabs/PricingTab';
import SettingsTab from './src/components/tabs/SettingsTab';
import TabButton from './src/components/common/TabButton';
import StatusToast from './src/components/common/StatusToast';
import LoadingScreen from './src/components/common/LoadingScreen';
import useForecastCalculations from './src/hooks/useForecastCalculations';
import firebaseConfig from './src/config/firebase';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createId = () => crypto.randomUUID();

const App = () => {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [forecastId, setForecastId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openAccordion, setOpenAccordion] = useState(null);
  const [scenario, setScenario] = useState('realist');

  const [projectName, setProjectName] = useState('Prévisionnel Mensuel');
  const [services, setServices] = useState(() => [
    {
      id: createId(),
      name: 'Perspective intérieure',
      quantity: 10,
      unitPrice: 450,
      hoursSpent: 3,
      subcontractingCost: 0,
      realizedBy: 'Moi-même',
    },
    {
      id: createId(),
      name: 'Vidéo 3D (30s)',
      quantity: 2,
      unitPrice: 2500,
      hoursSpent: 16,
      subcontractingCost: 500,
      realizedBy: 'Moi-même',
    },
  ]);
  const [fixedCharges, setFixedCharges] = useState(() => [
    { id: createId(), name: 'Loyer Bureau', amount: 1200, frequency: 'monthly' },
    { id: createId(), name: 'Abonnements logiciels', amount: 3000, frequency: 'annual' },
  ]);
  const [improvementExpenses, setImprovementExpenses] = useState(() => [
    { id: createId(), name: "Achat matériel", amount: 250, included: true },
  ]);
  const [salaries, setSalaries] = useState(() => [
    { id: createId(), name: 'Moi-même', grossSalary: 3000 },
  ]);
  const [competitors, setCompetitors] = useState(() => [
    { id: createId(), name: 'Studio 3D Pro', serviceName: 'Perspective intérieure', price: 420 },
    { id: createId(), name: 'Concurrent B', serviceName: 'Vidéo 3D (30s)', price: 2800 },
    { id: createId(), name: 'Image Arch', serviceName: 'Perspective intérieure', price: 480 },
  ]);

  const [taxRate, setTaxRate] = useState(25);
  const [targetMargin, setTargetMargin] = useState(40);
  const [targetNetProfit, setTargetNetProfit] = useState(2000);
  const [pricingStrategyWeight, setPricingStrategyWeight] = useState(0.5);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [configurableServices, setConfigurableServices] = useState(() => [
    { id: createId(), name: 'Perspective intérieure' },
    { id: createId(), name: 'Perspective extérieure' },
    { id: createId(), name: 'Vidéo 3D (30s)' },
    { id: createId(), name: 'Visite immersive' },
  ]);
  const [users, setUsers] = useState(() => [
    { id: createId(), name: 'Moi-même', weeklyHours: 35 },
    { id: createId(), name: 'Collaborateur 1', weeklyHours: 35 },
  ]);

  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentForecasts, setRecentForecasts] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('forecastId');
    if (sharedId) {
      setForecastId(sharedId);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          const credentials = await signInAnonymously(auth);
          setUserId(credentials.user.uid);
        } catch (error) {
          console.error('Auth Error:', error);
          showStatus('Impossible de vous connecter à Firebase', 'error');
        }
      }
      setIsAuthReady(true);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !userId || !forecastId) {
      return;
    }

    const forecastRef = doc(db, 'forecasts', forecastId);
    const unsubscribe = onSnapshot(forecastRef, (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const data = snapshot.data();
      setProjectName(data.projectName || 'Prévisionnel');
      setServices(data.services || []);
      setFixedCharges(data.fixedCharges || []);
      setSalaries(data.salaries || []);
      setCompetitors(data.competitors || []);
      setTaxRate(data.taxRate ?? 25);
      setTargetMargin(data.targetMargin ?? 40);
      setTargetNetProfit(data.targetNetProfit ?? 2000);
      setPricingStrategyWeight(
        data.pricingStrategyWeight !== undefined ? data.pricingStrategyWeight : 0.5,
      );
      setHourlyRate(data.hourlyRate ?? 50);
      setConfigurableServices(data.configurableServices || []);
      setImprovementExpenses(data.improvementExpenses || []);
      setUsers(data.users || []);
      setScenario('realist');
      showStatus('Données synchronisées', 'info');
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, forecastId]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const fetchRecentForecasts = async () => {
      try {
        const forecastsQuery = query(
          collection(db, 'forecasts'),
          where('ownerId', '==', userId),
          orderBy('updatedAt', 'desc'),
          limit(5),
        );
        const snapshot = await getDocs(forecastsQuery);
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          name: docSnap.data().projectName || `Prévisionnel ${docSnap.id.slice(0, 5)}`,
        }));
        setRecentForecasts(items);
      } catch (error) {
        console.error('fetchRecentForecasts error', error);
      }
    };
    fetchRecentForecasts();
  }, [userId, forecastId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = new URL(window.location.href);
    if (forecastId) {
      url.searchParams.set('forecastId', forecastId);
    } else {
      url.searchParams.delete('forecastId');
    }
    window.history.replaceState({}, '', url.toString());
  }, [forecastId]);

  const showStatus = (title, type = 'info', description) => {
    setStatus({ title, description, type });
  };

  const dismissStatus = () => setStatus(null);

  const handleSelectChange = (setter, id, field, value) => {
    setter((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    setScenario('realist');
  };

  const handleBooleanChange = (setter, id, field, value) => {
    setter((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    setScenario('realist');
  };

  const handleNumberChange = (setter, id, field, rawValue, constraints = {}) => {
    if (rawValue === '') {
      showStatus("Le champ ne peut pas être vide", 'warning');
      return;
    }
    let value = Number(rawValue);
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      showStatus('Veuillez saisir une valeur numérique valide', 'error');
      return;
    }
    if (constraints.integer) {
      value = Math.round(value);
    }
    if (constraints.min !== undefined && value < constraints.min) {
      showStatus(`La valeur doit être supérieure ou égale à ${constraints.min}`, 'error');
      return;
    }
    if (constraints.max !== undefined && value > constraints.max) {
      showStatus(`La valeur doit être inférieure ou égale à ${constraints.max}`, 'error');
      return;
    }
    setter((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    setScenario('realist');
  };

  const addItem = (setter, newItem) => {
    setter((prev) => [...prev, { id: createId(), ...newItem }]);
    setScenario('realist');
  };

  const removeItem = (setter, id) => {
    setter((prev) => prev.filter((item) => item.id !== id));
    setScenario('realist');
  };

  const saveForecast = async () => {
    if (!userId) {
      showStatus('Authentification requise pour sauvegarder', 'warning');
      return;
    }
    showStatus('Sauvegarde en cours…', 'info');
    const payload = {
      projectName,
      services,
      fixedCharges,
      salaries,
      competitors,
      taxRate,
      targetMargin,
      targetNetProfit,
      pricingStrategyWeight,
      hourlyRate,
      configurableServices,
      improvementExpenses,
      users,
      ownerId: userId,
      updatedAt: serverTimestamp(),
    };
    try {
      if (forecastId) {
        await setDoc(doc(db, 'forecasts', forecastId), payload, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'forecasts'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setForecastId(docRef.id);
      }
      showStatus('Prévisionnel sauvegardé', 'success');
    } catch (error) {
      console.error('saveForecast error', error);
      showStatus('Échec de la sauvegarde', 'error', "Vérifiez votre connexion réseau puis réessayez.");
    }
  };

  const handleCopyForecastId = async () => {
    if (!forecastId) {
      return;
    }
    try {
      await navigator?.clipboard?.writeText(forecastId);
      showStatus('ID copié dans le presse-papiers', 'success');
    } catch (error) {
      showStatus("Impossible de copier l'ID automatiquement", 'warning', 'Copiez-le manuellement.');
    }
  };

  const handleSelectRecentForecast = (id) => {
    if (!id) {
      return;
    }
    setForecastId(id);
    setActiveTab('dashboard');
    showStatus('Chargement du prévisionnel sélectionné…', 'info');
  };

  const { displayServices, calculations, userPerformance, strategicPricing } = useForecastCalculations({
    services,
    scenario,
    fixedCharges,
    improvementExpenses,
    salaries,
    hourlyRate,
    taxRate,
    targetNetProfit,
    configurableServices,
    competitors,
    users,
    pricingStrategyWeight,
  });

  const tabs = useMemo(
    () => [
      { id: 'dashboard', label: 'Tableau de Bord', icon: <BarChart2 size={16} /> },
      { id: 'analysis', label: 'Analyse', icon: <TrendingUp size={16} /> },
      { id: 'pricing', label: 'Tarification', icon: <SlidersHorizontal size={16} /> },
      { id: 'services', label: 'Nos prestations', icon: <Briefcase size={16} /> },
      { id: 'charges', label: 'Charges & Dépenses', icon: <FileText size={16} /> },
      { id: 'settings', label: 'Réglages', icon: <SettingsIcon size={16} /> },
    ],
    [],
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">Prévisionnel Financier 3D</h1>
            <span className="text-xs text-gray-500">Utilisateur : {userId}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              className="w-full sm:w-40 bg-gray-100 border-gray-300 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ID Prévisionnel"
              value={forecastId || ''}
              onChange={(event) => setForecastId(event.target.value || null)}
            />
            <button
              onClick={saveForecast}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
            >
              <Save size={16} />
              <span className="hidden md:inline">Sauvegarder</span>
            </button>
          </div>
        </div>
        <nav className="container mx-auto px-6 border-t">
          <div className="flex space-x-4 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                label={tab.label}
                icon={tab.icon}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-8 pb-16">
        <input
          type="text"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className="text-3xl font-bold bg-transparent border-b-2 border-transparent focus:border-gray-300 outline-none w-full md:w-auto mb-6"
        />

        {activeTab === 'dashboard' && (
          <DashboardTab
            scenario={scenario}
            onScenarioChange={setScenario}
            calculations={calculations}
            displayServices={displayServices}
            userPerformance={userPerformance}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisTab
            services={services}
            hourlyRate={hourlyRate}
            targetMargin={targetMargin}
            onTargetMarginChange={(value) => {
              if (value === '') {
                showStatus('La marge cible ne peut pas être vide', 'warning');
                return;
              }
              const numericValue = Number(value);
              if (Number.isNaN(numericValue)) {
                showStatus('Veuillez saisir une marge valide', 'error');
                return;
              }
              setTargetMargin(Math.min(100, Math.max(0, numericValue)));
              setScenario('realist');
            }}
            configurableServices={configurableServices}
            competitors={competitors}
            openAccordion={openAccordion}
            onToggleAccordion={(id) => setOpenAccordion(openAccordion === id ? null : id)}
            onCompetitorChange={(id, field, value, constraints) =>
              field === 'price'
                ? handleNumberChange(setCompetitors, id, field, value, { min: 0, ...constraints })
                : handleSelectChange(setCompetitors, id, field, value)
            }
            onRemoveCompetitor={(id) => removeItem(setCompetitors, id)}
            onAddCompetitor={(service) =>
              addItem(setCompetitors, { name: 'Nouveau Concurrent', serviceName: service.name, price: 0 })
            }
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTab
            calculations={calculations}
            strategicPricing={strategicPricing}
            targetNetProfit={targetNetProfit}
            pricingStrategyWeight={pricingStrategyWeight}
            onPricingStrategyChange={(value) => {
              setPricingStrategyWeight(value);
              setScenario('realist');
            }}
          />
        )}

        {activeTab === 'services' && (
          <ServicesTab
            services={services}
            configurableServices={configurableServices}
            users={users}
            onSelectChange={(id, field, value) => handleSelectChange(setServices, id, field, value)}
            onNumberChange={(id, field, value, constraints) =>
              handleNumberChange(setServices, id, field, value, constraints)
            }
            onRemove={(id) => removeItem(setServices, id)}
            onAdd={() =>
              addItem(setServices, {
                name: '',
                quantity: 1,
                unitPrice: 0,
                hoursSpent: 1,
                subcontractingCost: 0,
                realizedBy: users[0]?.name || '',
              })
            }
          />
        )}

        {activeTab === 'charges' && (
          <ChargesTab
            fixedCharges={fixedCharges}
            onChargeChange={(id, field, value, constraints) =>
              field === 'amount'
                ? handleNumberChange(setFixedCharges, id, field, value, { min: 0, ...constraints })
                : handleSelectChange(setFixedCharges, id, field, value)
            }
            onAddCharge={() => addItem(setFixedCharges, { name: 'Nouvelle charge', amount: 100, frequency: 'monthly' })}
            onRemoveCharge={(id) => removeItem(setFixedCharges, id)}
            improvementExpenses={improvementExpenses}
            onImprovementChange={(id, field, value, constraints) => {
              if (field === 'included') {
                handleBooleanChange(setImprovementExpenses, id, field, value);
              } else {
                handleNumberChange(setImprovementExpenses, id, field, value, { min: 0, ...constraints });
              }
            }}
            onAddImprovement={() => addItem(setImprovementExpenses, { name: 'Nouvelle dépense', amount: 50, included: true })}
            onRemoveImprovement={(id) => removeItem(setImprovementExpenses, id)}
            salaries={salaries}
            users={users}
            onSalaryChange={(id, field, value, constraints) =>
              field === 'grossSalary'
                ? handleNumberChange(setSalaries, id, field, value, { min: 0, ...constraints })
                : handleSelectChange(setSalaries, id, field, value)
            }
            onAddSalary={() => addItem(setSalaries, { name: users[0]?.name || '', grossSalary: 2000 })}
            onRemoveSalary={(id) => removeItem(setSalaries, id)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            hourlyRate={hourlyRate}
            onHourlyRateChange={(value) => {
              setHourlyRate(Math.max(0, Number(value) || 0));
              setScenario('realist');
            }}
            targetNetProfit={targetNetProfit}
            onTargetNetProfitChange={(value) => {
              setTargetNetProfit(Math.max(0, Number(value) || 0));
              setScenario('realist');
            }}
            taxRate={taxRate}
            onTaxRateChange={(value) => {
              setTaxRate(Math.min(100, Math.max(0, Number(value) || 0)));
              setScenario('realist');
            }}
            configurableServices={configurableServices}
            onConfigServiceChange={(id, field, value) => handleSelectChange(setConfigurableServices, id, field, value)}
            onAddConfigService={() => addItem(setConfigurableServices, { name: 'Nouveau type de service' })}
            onRemoveConfigService={(id) => removeItem(setConfigurableServices, id)}
            users={users}
            onUserChange={(id, field, value, constraints) =>
              field === 'weeklyHours'
                ? handleNumberChange(setUsers, id, field, value, { min: 0, max: 80, ...constraints })
                : handleSelectChange(setUsers, id, field, value)
            }
            onAddUser={() => addItem(setUsers, { name: 'Nouvel utilisateur', weeklyHours: 35 })}
            onRemoveUser={(id) => removeItem(setUsers, id)}
            forecastId={forecastId}
            onCopyForecastId={handleCopyForecastId}
            recentForecasts={recentForecasts}
            onSelectRecentForecast={handleSelectRecentForecast}
          />
        )}
      </main>

      <StatusToast status={status} onDismiss={dismissStatus} />
    </div>
  );
};

export default App;
