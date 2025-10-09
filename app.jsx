import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Trash2, Copy, BarChart2, DollarSign, Target, Save, FileText, Users, Settings, ArrowUp, ArrowDown, Minus, Info, ChevronDown, Briefcase, TrendingUp, SlidersHorizontal, Zap, ZapOff, ThumbsUp } from 'lucide-react';

// --- Configuration Firebase ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNYrIR0CzYFx6xsGoMHP8ikV2_kwgNVXk", // Remplacez par votre véritable API Key
  authDomain: "mon-previsionnel.firebaseapp.com",
  projectId: "mon-previsionnel",
  storageBucket: "mon-previsionnel.firebasestorage.app",
  messagingSenderId: "544408117489",
  appId: "1:544408117489:web:e1c0a23834b5ff310d8950",
  measurementId: "G-RXNDF63L2T"
};


// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Composants UI ---

const Tooltip = ({ text, children }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
    </div>
  </div>
);


const StatCard = ({ title, value, subtext, icon, color, smallText }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <Tooltip text={subtext}>
                <Info size={16} className="text-gray-400 cursor-pointer" />
            </Tooltip>
        </div>
        <div>
            <p className="text-gray-500 mt-3 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {smallText && <p className="text-xs text-gray-500 mt-1">{smallText}</p>}
        </div>
    </div>
);

const TabButton = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
);

const App = () => {
    // --- États de l'application ---
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [forecastId, setForecastId] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [openAccordion, setOpenAccordion] = useState(null);
    const [scenario, setScenario] = useState('realist'); // 'pessimist', 'realist', 'optimist'
    
    // Données du prévisionnel
    const [projectName, setProjectName] = useState("Prévisionnel Mensuel");
    const [services, setServices] = useState([
        { id: crypto.randomUUID(), name: "Perspective intérieure", quantity: 10, unitPrice: 450, hoursSpent: 3, subcontractingCost: 0, realizedBy: "Moi-même" },
        { id: crypto.randomUUID(), name: "Vidéo 3D (30s)", quantity: 2, unitPrice: 2500, hoursSpent: 16, subcontractingCost: 500, realizedBy: "Moi-même" },
    ]);
    const [fixedCharges, setFixedCharges] = useState([
        { id: crypto.randomUUID(), name: "Loyer Bureau", amount: 1200, frequency: 'monthly' },
        { id: crypto.randomUUID(), name: "Abonnements logiciels", amount: 3000, frequency: 'annual' },
    ]);
    const [improvementExpenses, setImprovementExpenses] = useState([
        { id: crypto.randomUUID(), name: "Achat matériel", amount: 250, included: true }
    ]);
    const [salaries, setSalaries] = useState([
        { id: crypto.randomUUID(), name: "Moi-même", grossSalary: 3000 },
    ]);
    const [competitors, setCompetitors] = useState([
        { id: crypto.randomUUID(), name: "Studio 3D Pro", serviceName: "Perspective intérieure", price: 420 },
        { id: crypto.randomUUID(), name: "Concurrent B", serviceName: "Vidéo 3D (30s)", price: 2800 },
        { id: crypto.randomUUID(), name: "Image Arch", serviceName: "Perspective intérieure", price: 480 },
    ]);
    
    // --- Réglages & Stratégie ---
    const [taxRate, setTaxRate] = useState(25); // Taux d'imposition
    const [targetMargin, setTargetMargin] = useState(40); 
    const [targetNetProfit, setTargetNetProfit] = useState(2000); 
    const [pricingStrategyWeight, setPricingStrategyWeight] = useState(0.5); 
    const [hourlyRate, setHourlyRate] = useState(50);
    const [configurableServices, setConfigurableServices] = useState([
        { id: crypto.randomUUID(), name: "Perspective intérieure" },
        { id: crypto.randomUUID(), name: "Perspective extérieure" },
        { id: crypto.randomUUID(), name: "Vidéo 3D (30s)" },
        { id: crypto.randomUUID(), name: "Visite immersive" },
    ]);
     const [users, setUsers] = useState([{ id: crypto.randomUUID(), name: 'Moi-même', weeklyHours: 35 }, {id: crypto.randomUUID(), name: 'Collaborateur 1', weeklyHours: 35}]);
    
    const [statusMessage, setStatusMessage] = useState("Prêt.");
    const [isLoading, setIsLoading] = useState(true);

    // --- Authentification et chargement ---
    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    await signInAnonymously(auth);
                } catch (error) { console.error("Auth Error:", error); }
            }
            setIsAuthReady(true);
            setIsLoading(false);
        });
    }, []);
    
    // --- Synchro Firestore ---
    useEffect(() => {
        if (!isAuthReady || !userId || !forecastId) return;
        const forecastRef = doc(db, "forecasts", forecastId);
        const unsubscribe = onSnapshot(forecastRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setProjectName(data.projectName || "Prévisionnel");
                setServices(data.services || []);
                setFixedCharges(data.fixedCharges || []);
                setSalaries(data.salaries || []);
                setCompetitors(data.competitors || []);
                setTaxRate(data.taxRate || 25);
                setTargetMargin(data.targetMargin || 40);
                setTargetNetProfit(data.targetNetProfit || 2000);
                setPricingStrategyWeight(data.pricingStrategyWeight !== undefined ? data.pricingStrategyWeight : 0.5);
                setHourlyRate(data.hourlyRate || 50);
                setConfigurableServices(data.configurableServices || []);
                setImprovementExpenses(data.improvementExpenses || []);
                setUsers(data.users || []);
                setStatusMessage("Données synchronisées en temps réel.");
                if(data.configurableServices && data.configurableServices.length > 0) {
                    setOpenAccordion(data.configurableServices[0].id);
                }
            }
        });
        return () => unsubscribe();
    }, [isAuthReady, userId, forecastId]);

    const displayServices = useMemo(() => {
        const multiplier = {
            pessimist: 0.8,
            realist: 1,
            optimist: 1.2
        }[scenario];

        return services.map(s => ({
            ...s,
            quantity: Math.round(s.quantity * multiplier)
        }));
    }, [services, scenario]);

    // --- Calculs Financiers Mensuels ---
    const calculations = useMemo(() => {
        const totalRevenue = displayServices.reduce((acc, s) => acc + (s.quantity * s.unitPrice), 0);
        
        const totalVariableCosts = displayServices.reduce((acc, s) => acc + s.quantity * (((s.hoursSpent || 0) * hourlyRate) + (s.subcontractingCost || 0)), 0);
        
        const totalMonthlyFixedCharges = fixedCharges.reduce((acc, c) => acc + (c.frequency === 'annual' ? c.amount / 12 : c.amount), 0);
        const totalImprovementExpenses = improvementExpenses
            .filter(e => e.included)
            .reduce((acc, e) => acc + (e.amount || 0), 0);

        const totalFixedAndOtherCharges = totalMonthlyFixedCharges + totalImprovementExpenses;

        const totalSalariesCost = salaries.reduce((acc, s) => acc + ((s.grossSalary || 0) * 1.42), 0); // Brut + 42% charges patronales

        const totalExpenses = totalVariableCosts + totalFixedAndOtherCharges + totalSalariesCost;

        const grossMargin = totalRevenue - totalVariableCosts;
        const preTaxProfit = totalRevenue - totalExpenses;
        
        const taxAmount = preTaxProfit > 0 ? preTaxProfit * (taxRate / 100) : 0;
        const afterTaxProfit = preTaxProfit - taxAmount;
        
        const breakEvenPoint = (totalFixedAndOtherCharges + totalSalariesCost) / ((grossMargin / totalRevenue) || 1);
        
        const profitability = totalRevenue > 0 ? (afterTaxProfit / totalRevenue) * 100 : 0;

        return { totalRevenue, totalVariableCosts, totalFixedCharges: totalFixedAndOtherCharges, totalSalariesCost, totalExpenses, grossMargin, preTaxProfit, afterTaxProfit, breakEvenPoint, profitability };
    }, [displayServices, fixedCharges, salaries, improvementExpenses, hourlyRate, taxRate]);

    const userPerformance = useMemo(() => {
        const performance = users.reduce((acc, user) => {
            acc[user.name] = { revenue: 0, hours: 0 };
            return acc;
        }, {});

        displayServices.forEach(service => {
            if (performance[service.realizedBy]) {
                performance[service.realizedBy].revenue += (service.quantity || 0) * (service.unitPrice || 0);
                performance[service.realizedBy].hours += (service.quantity || 0) * (service.hoursSpent || 0);
            }
        });

        return Object.entries(performance).map(([name, data]) => ({ 
            name, 
            ...data,
            averageHourlyRate: data.hours > 0 ? data.revenue / data.hours : 0,
        }));
    }, [displayServices, users]);
    
    const strategicPricing = useMemo(() => {
        const totalCostsToCover = (calculations.totalFixedCharges / (scenario === 'realist' ? 1 : {pessimist: 0.8, optimist: 1.2}[scenario])) + calculations.totalSalariesCost;
        const totalRevenueTarget = totalCostsToCover + targetNetProfit;
        const totalMonthlyHours = users.reduce((acc, user) => acc + ((user.weeklyHours || 0) * 4.33), 0);
        const costBasedGlobalHourlyRate = totalMonthlyHours > 0 ? totalRevenueTarget / totalMonthlyHours : 0;

        const results = configurableServices.map(configService => {
            const soldService = services.find(s => s.name === configService.name);
            const hoursSpent = soldService?.hoursSpent || 0;
            const subcontractingCost = soldService?.subcontractingCost || 0;

            const serviceCompetitors = competitors.filter(c => c.serviceName === configService.name);
            const marketPrice = serviceCompetitors.length > 0 ? serviceCompetitors.reduce((acc, c) => acc + c.price, 0) / serviceCompetitors.length : 0;

            const costBasedPrice = (hoursSpent * costBasedGlobalHourlyRate) + subcontractingCost;

            let suggestedPrice;
            if (marketPrice > 0) {
                suggestedPrice = (costBasedPrice * pricingStrategyWeight) + (marketPrice * (1 - pricingStrategyWeight));
            } else {
                suggestedPrice = costBasedPrice;
            }
            
            const effectiveHourlyRate = hoursSpent > 0 ? (suggestedPrice - subcontractingCost) / hoursSpent : 0;

            return { id: configService.id, name: configService.name, hoursSpent, marketPrice, costBasedPrice, suggestedPrice, effectiveHourlyRate };
        });

        return { results, costBasedGlobalHourlyRate, totalRevenueTarget };
    }, [configurableServices, services, competitors, calculations, targetNetProfit, users, pricingStrategyWeight, scenario]);

    // --- Sauvegarde ---
    const saveForecast = async () => {
        if (!userId) return;
        setStatusMessage("Sauvegarde...");
        const forecastData = { projectName, services, fixedCharges, salaries, competitors, taxRate, targetMargin, targetNetProfit, pricingStrategyWeight, hourlyRate, configurableServices, improvementExpenses, users, ownerId: userId, updatedAt: serverTimestamp() };
        try {
            if (forecastId) {
                await setDoc(doc(db, "forecasts", forecastId), forecastData, { merge: true });
            } else {
                const docRef = await addDoc(collection(db, "forecasts"), { ...forecastData, createdAt: serverTimestamp() });
                setForecastId(docRef.id);
            }
            setStatusMessage("Sauvegardé avec succès !");
        } catch (error) { setStatusMessage("Échec de la sauvegarde."); console.error(error); }
    };
    
    const handleGenericChange = (setter, id, field, value) => {
        setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        setScenario('realist');
    };
    const addGenericItem = (setter, newItem) => {
        setter(prev => [...prev, { id: crypto.randomUUID(), ...newItem }]);
        setScenario('realist');
    }
    const removeGenericItem = (setter, id) => {
        setter(prev => prev.filter(item => item.id !== id));
        setScenario('realist');
    }

    // --- Rendu des sections (onglets) ---
    
    const renderDashboard = () => (
        <>
            <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
                <h3 className="text-lg font-semibold mb-3">Scénarios de Prévision</h3>
                <div className="flex justify-center items-center gap-4">
                     <button onClick={() => setScenario('pessimist')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${scenario === 'pessimist' ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-100'}`}><ZapOff size={16}/> Pessimiste (-20%)</button>
                     <button onClick={() => setScenario('realist')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${scenario === 'realist' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}><Target size={16}/> Réaliste</button>
                     <button onClick={() => setScenario('optimist')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${scenario === 'optimist' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-100'}`}><Zap size={16}/> Optimiste (+20%)</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Chiffre d'Affaires Mensuel" value={`${(calculations.totalRevenue || 0).toFixed(0)} €`} subtext="Total des revenus générés par vos prestations sur le mois." icon={<DollarSign size={24} className="text-green-800" />} color="bg-green-100" />
                <StatCard title="Bénéfice Net (Après Impôt)" value={`${(calculations.afterTaxProfit || 0).toFixed(0)} €`} smallText={`Avant impôt (${taxRate}%): ${(calculations.preTaxProfit || 0).toFixed(0)} €`} subtext="Le bénéfice final après déduction de toutes les charges et de l'impôt sur les sociétés." icon={<ThumbsUp size={24} className="text-indigo-800" />} color="bg-indigo-100" />
                <StatCard title="Taux de Rentabilité" value={`${(calculations.profitability || 0).toFixed(1)} %`} subtext="Pourcentage du CA qui se transforme en bénéfice net final." icon={<Target size={24} className="text-yellow-800" />} color="bg-yellow-100" />
                <StatCard title="Point Mort Mensuel" value={`${(calculations.breakEvenPoint || 0).toFixed(0)} €`} subtext="Le CA minimum à atteindre pour couvrir toutes vos charges (hors impôt)." icon={<Copy size={24} className="text-red-800" />} color="bg-red-100" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <h3 className="text-lg font-semibold mb-4">Répartition du Chiffre d'Affaires</h3>
                    <div className="space-y-3">
                        {displayServices.map(s => {
                            const revenue = s.quantity * s.unitPrice;
                            const percentage = calculations.totalRevenue > 0 ? (revenue / calculations.totalRevenue * 100).toFixed(1) : 0;
                            return (
                                <div key={s.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{s.name} ({s.quantity})</span>
                                        <span>{revenue.toFixed(0)} € ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border">
                     <h3 className="text-lg font-semibold mb-4">Répartition des Dépenses</h3>
                      <div className="space-y-3">
                        {[
                            { name: 'Coûts Variables', value: calculations.totalVariableCosts, color: 'bg-red-500' },
                            { name: 'Charges & Dépenses', value: calculations.totalFixedCharges, color: 'bg-orange-500' },
                            { name: 'Salaires & Cotisations', value: calculations.totalSalariesCost, color: 'bg-yellow-500' },
                        ].map(item => {
                            const percentage = calculations.totalExpenses > 0 ? (item.value / (calculations.totalExpenses) * 100).toFixed(1) : 0;
                            return (
                                <div key={item.name}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{item.name}</span>
                                        <span>{item.value.toFixed(0)} € ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border">
                 <h3 className="text-lg font-semibold mb-4">Performance par Utilisateur</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                             <tr>
                                 <th className="px-4 py-3"><Tooltip text="Nom de l'utilisateur tel que défini dans les Réglages.">Utilisateur</Tooltip></th>
                                 <th className="px-4 py-3"><Tooltip text="Chiffre d'affaires total généré par les prestations assignées à cet utilisateur.">Chiffre d'Affaires</Tooltip></th>
                                 <th className="px-4 py-3"><Tooltip text="Nombre total d'heures passées par cet utilisateur sur les prestations qui lui sont assignées.">Temps Passé</Tooltip></th>
                                 <th className="px-4 py-3"><Tooltip text="Indicateur de performance clé : Chiffre d'Affaires / Temps Passé. Montre la valeur générée par heure de travail.">Taux Horaire Moyen Réel</Tooltip></th>
                             </tr>
                         </thead>
                         <tbody>
                            {userPerformance.map(user => (
                                <tr key={user.name} className="border-b">
                                    <td className="px-4 py-3 font-semibold">{user.name}</td>
                                    <td className="px-4 py-3">{user.revenue.toFixed(0)} €</td>
                                    <td className="px-4 py-3">{user.hours} h</td>
                                    <td className="px-4 py-3 font-bold text-blue-600">{user.averageHourlyRate.toFixed(2)} €/h</td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderServicesTab = () => (
        <div className="bg-white p-6 rounded-xl shadow-md border">
            <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg mb-4">Note : Toute modification dans ce tableau réinitialise la vue sur le scénario "Réaliste".</p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Nos Prestations Vendues (Mensuel)</h3>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-4 py-3">Prestation</th>
                            <th className="px-4 py-3">Réalisé par</th>
                            <th className="px-4 py-3">Qté</th>
                            <th className="px-4 py-3">Prix Unitaire (€)</th>
                            <th className="px-4 py-3">Temps Passé (h)</th>
                            <th className="px-4 py-3"><Tooltip text="Taux horaire brut facturé pour cette prestation (Prix Unitaire / Temps Passé). N'inclut pas les charges.">Taux Horaire (HC)</Tooltip></th>
                            <th className="px-4 py-3"><Tooltip text="Coût d'un prestataire externe pour réaliser une partie ou la totalité de la prestation.">Sous-traitance (€)</Tooltip></th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                     <tbody>
                        {services.map(item => {
                            const hourlyRateHC = item.hoursSpent > 0 ? (item.unitPrice || 0) / item.hoursSpent : 0;
                            return (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <select 
                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                            value={item.name}
                                            onChange={(e) => handleGenericChange(setServices, item.id, 'name', e.target.value)}
                                        >
                                            <option value="">Sélectionner</option>
                                            {configurableServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                         <select 
                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                            value={item.realizedBy}
                                            onChange={(e) => handleGenericChange(setServices, item.id, 'realizedBy', e.target.value)}
                                        >
                                            <option value="">Sélectionner</option>
                                            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="number" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2" value={item.quantity || ''} onChange={e => handleGenericChange(setServices, item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="number" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2" value={item.unitPrice || ''} onChange={e => handleGenericChange(setServices, item.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="number" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2" value={item.hoursSpent || ''} onChange={e => handleGenericChange(setServices, item.id, 'hoursSpent', parseFloat(e.target.value) || 0)} />
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-700">
                                        {hourlyRateHC.toFixed(2)} €/h
                                    </td>
                                    <td className="px-4 py-3">
                                        <input type="number" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2" value={item.subcontractingCost || ''} onChange={e => handleGenericChange(setServices, item.id, 'subcontractingCost', parseFloat(e.target.value) || 0)} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => removeGenericItem(setServices, item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
             <button onClick={() => addGenericItem(setServices, { name: '', realizedBy: users[0]?.name || '', quantity: 1, unitPrice: 0, hoursSpent: 0, subcontractingCost: 0 })} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                <PlusCircle size={18} className="mr-2" /> Ajouter une prestation vendue
            </button>
        </div>
    );
    
    const renderChargesTab = () => (
        <div className="space-y-8">
            <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg">Note : Toute modification dans ce tableau réinitialise la vue sur le scénario "Réaliste".</p>
            {renderEditableTable("Charges Fixes", fixedCharges, setFixedCharges, [
                { key: 'name', label: 'Description', type: 'text', defaultValue: 'Nouvelle charge' },
                { key: 'amount', label: 'Montant (€)', type: 'number', defaultValue: 100 },
                { key: 'frequency', label: 'Fréquence', type: 'select', options: [{value: 'monthly', label: 'Mensuel'}, {value: 'annual', label: 'Annuel'}], defaultValue: 'monthly' },
            ], "Ajouter une charge fixe")}
            
            <div className="bg-white p-6 rounded-xl shadow-md border">
                 <h3 className="text-xl font-semibold text-gray-800 mb-4">Dépenses en vue d'améliorations</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Montant (€)</th>
                                <th className="px-4 py-3"><Tooltip text="Activez pour inclure cette dépense dans les calculs de rentabilité et de point mort. Désactivez pour la simuler en 'extra'.">Inclure au calcul</Tooltip></th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {improvementExpenses.map(item => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3"><input type="text" value={item.name} onChange={e => handleGenericChange(setImprovementExpenses, item.id, 'name', e.target.value)} className="w-full bg-gray-50 border-gray-300 rounded-lg p-2"/></td>
                                    <td className="px-4 py-3"><input type="number" value={item.amount} onChange={e => handleGenericChange(setImprovementExpenses, item.id, 'amount', parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 border-gray-300 rounded-lg p-2"/></td>
                                    <td className="px-4 py-3"><ToggleSwitch checked={item.included} onChange={() => handleGenericChange(setImprovementExpenses, item.id, 'included', !item.included)} /></td>
                                    <td className="px-4 py-3 text-right"><button onClick={() => removeGenericItem(setImprovementExpenses, item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addGenericItem(setImprovementExpenses, { name: 'Nouvelle dépense', amount: 50, included: true })} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                    <PlusCircle size={18} className="mr-2" /> Ajouter une dépense
                </button>
            </div>


            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Salaires et Cotisations (Mensuel)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Employé</th>
                                <th className="px-4 py-3"><Tooltip text="Le salaire avant toute déduction de cotisations. C'est la base de tous les calculs.">Salaire Brut</Tooltip></th>
                                <th className="px-4 py-3"><Tooltip text="Le salaire que l'employé reçoit réellement sur son compte en banque (Brut - Charges Salariales).">Salaire Net</Tooltip></th>
                                <th className="px-4 py-3"><Tooltip text="Part des cotisations sociales payées par l'employé (estimé à 22% du Brut).">Charges Salariales</Tooltip></th>
                                <th className="px-4 py-3"><Tooltip text="Part des cotisations sociales payées par l'entreprise (estimé à 42% du Brut).">Charges Patronales</Tooltip></th>
                                <th className="px-4 py-3"><Tooltip text="Le coût total de l'employé pour l'entreprise (Brut + Charges Patronales).">Coût Total</Tooltip></th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaries.map(sal => {
                                const gross = sal.grossSalary || 0;
                                const employeeC = gross * 0.22;
                                const employerC = gross * 0.42;
                                const netSalary = gross - employeeC;
                                const totalCost = gross + employerC;
                                return (
                                    <tr key={sal.id} className="border-b hover:bg-gray-50">
                                        <td className="px-2 py-2">
                                            <select 
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                                                value={sal.name}
                                                onChange={e => handleGenericChange(setSalaries, sal.id, 'name', e.target.value)}>
                                                <option value="">Sélectionner</option>
                                                {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-2"><input type="number" value={sal.grossSalary} onChange={e => handleGenericChange(setSalaries, sal.id, 'grossSalary', parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 border-gray-300 rounded-lg p-2"/></td>
                                        <td className="px-4 py-3 font-semibold text-green-700">{netSalary.toFixed(2)} €</td>
                                        <td className="px-4 py-3 text-gray-600">{employeeC.toFixed(2)} €</td>
                                        <td className="px-4 py-3 text-gray-600">{employerC.toFixed(2)} €</td>
                                        <td className="px-4 py-3 font-semibold text-red-700">{totalCost.toFixed(2)} €</td>
                                        <td className="px-4 py-3 text-right"><button onClick={() => removeGenericItem(setSalaries, sal.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addGenericItem(setSalaries, { name: users[0]?.name || '', grossSalary: 2000 })} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                    <PlusCircle size={18} className="mr-2" /> Ajouter un salaire
                </button>
            </div>
        </div>
    );
    
    const renderAnalysisTab = () => (
        <div className="space-y-8">
            {renderProfitabilityAnalysis()}
            {renderCompetitiveAnalysis()}
        </div>
    );

    const renderProfitabilityAnalysis = () => {
        const suggestedPrices = services.map(service => {
            const variableCostPerUnit = ((service.hoursSpent || 0) * hourlyRate) + (service.subcontractingCost || 0);
            const priceWithMargin = variableCostPerUnit > 0 ? variableCostPerUnit / (1 - (targetMargin / 100)) : 0;
            const currentProfitPerUnit = service.unitPrice - variableCostPerUnit;
            const currentMargin = service.unitPrice > 0 ? (currentProfitPerUnit / service.unitPrice) * 100 : 0;
            return { id: service.id, name: service.name, suggestedPrice: priceWithMargin, currentMargin };
        });

        return (
            <div className="bg-white p-6 rounded-xl shadow-md border">
                 <h3 className="text-xl font-semibold mb-2">Analyse de Rentabilité par Prestation</h3>
                 <p className="text-sm text-gray-500 mb-6">Évaluez la performance de chaque service et déterminez des prix de vente optimaux.</p>
                <div className="flex items-center mb-6 bg-gray-50 p-4 rounded-lg">
                    <label htmlFor="targetMargin" className="text-sm font-medium mr-3 whitespace-nowrap">Définir la marge cible :</label>
                    <input id="targetMargin" type="number" value={targetMargin} onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)} className="w-20 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2"/>
                    <span className="ml-2 text-gray-600">%</span>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Prestation</th>
                                <th className="px-4 py-3"><Tooltip text="Marge brute actuelle de la prestation : (Prix de Vente - Coûts Variables) / Prix de Vente.">Marge Actuelle</Tooltip></th>
                                <th className="px-4 py-3"><Tooltip text="Prix de vente minimum à appliquer pour atteindre votre 'Marge Cible' sur cette prestation.">Prix Conseillé</Tooltip></th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestedPrices.map(p => (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{p.name}</td>
                                    <td className={`px-4 py-3 font-semibold ${p.currentMargin < targetMargin ? 'text-red-600' : 'text-green-600'}`}>{p.currentMargin.toFixed(1)} %</td>
                                    <td className="px-4 py-3 font-bold text-blue-600">{p.suggestedPrice.toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        );
    };

    const renderCompetitiveAnalysis = () => {
        const PriceDiffIcon = ({ myPrice, avgPrice }) => {
            if (!myPrice || !avgPrice) return null;
            const difference = myPrice - avgPrice;
            if (difference > avgPrice * 0.05) return <ArrowUp size={20} className="text-red-500 ml-2" title="Supérieur au marché" />;
            if (difference < -avgPrice * 0.05) return <ArrowDown size={20} className="text-green-500 ml-2" title="Inférieur au marché" />;
            return <Minus size={20} className="text-yellow-500 ml-2" title="Similaire au marché" />;
        };

        const toggleAccordion = (serviceId) => {
            setOpenAccordion(openAccordion === serviceId ? null : serviceId);
        };
        
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-semibold mb-2">Positionnement par Prestation</h3>
                <p className="text-sm text-gray-500 mb-6">Gérez et comparez vos concurrents pour chaque service que vous proposez.</p>
                <div className="space-y-4">
                    {configurableServices.map(service => {
                        const mySoldService = services.find(s => s.name === service.name);
                        const serviceCompetitors = competitors.filter(c => c.serviceName === service.name);
                        const avgPrice = serviceCompetitors.length > 0 ? serviceCompetitors.reduce((acc, c) => acc + c.price, 0) / serviceCompetitors.length : 0;
                        const isOpen = openAccordion === service.id;

                        return (
                            <div key={service.id} className="border rounded-lg overflow-hidden">
                                <button onClick={() => toggleAccordion(service.id)} className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <span className="font-bold text-gray-800">{service.name}</span>
                                    <div className="flex items-center text-sm">
                                        <div className="mr-4">Votre Prix: <span className="font-bold text-blue-600">{mySoldService ? `${mySoldService.unitPrice.toFixed(2)} €` : 'N/A'}</span></div>
                                        <div>Moy. Marché: <span className="font-bold text-gray-600">{avgPrice > 0 ? `${avgPrice.toFixed(2)} €` : 'N/A'}</span></div>
                                        {mySoldService && <PriceDiffIcon myPrice={mySoldService.unitPrice} avgPrice={avgPrice} />}
                                        <ChevronDown className={`ml-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="p-4 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 font-semibold text-sm px-2">
                                            <span>Nom du Concurrent</span>
                                            <span>Prix (€)</span>
                                        </div>
                                        {serviceCompetitors.map(comp => (
                                            <div key={comp.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center mb-2 p-2 rounded-lg hover:bg-gray-50">
                                                <input
                                                    type="text"
                                                    value={comp.name}
                                                    onChange={(e) => handleGenericChange(setCompetitors, comp.id, 'name', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                                />
                                                <div className="flex items-center">
                                                    <input
                                                        type="number"
                                                        value={comp.price}
                                                        onChange={(e) => handleGenericChange(setCompetitors, comp.id, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                                    />
                                                    <button onClick={() => removeGenericItem(setCompetitors, comp.id)} className="ml-2 text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => addGenericItem(setCompetitors, { name: 'Nouveau Concurrent', serviceName: service.name, price: 0 })} 
                                            className="mt-3 flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                        >
                                            <PlusCircle size={16} className="mr-2" /> Ajouter un concurrent pour ce service
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPricingTool = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Vos Objectifs</h3>
                    <div className="space-y-3 text-sm">
                        <p className="flex justify-between">Charges fixes & améliorations: <span className="font-bold">{calculations.totalFixedCharges.toFixed(2)} €</span></p>
                        <p className="flex justify-between">Coût total des salaires: <span className="font-bold">{calculations.totalSalariesCost.toFixed(2)} €</span></p>
                        <p className="flex justify-between">Bénéfice net mensuel visé: <span className="font-bold">{targetNetProfit.toFixed(2)} €</span></p>
                        <hr className="my-2"/>
                        <p className="flex justify-between text-base font-semibold">Total à couvrir + Bénéfice: <span className="font-bold text-blue-600">{strategicPricing.totalRevenueTarget.toFixed(2)} €</span></p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Stratégie de Tarification</h3>
                    <p className="text-sm text-gray-600 mb-4">Ajustez le curseur pour équilibrer votre stratégie entre une tarification basée sur vos coûts et une autre basée sur les prix du marché.</p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-green-600">Marché</span>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            value={pricingStrategyWeight} 
                            onChange={e => setPricingStrategyWeight(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-red-600">Coûts</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Prix et Taux Horaires Suggérés</h3>
                 <p className="text-sm text-gray-500 mb-2">Basé sur vos objectifs, le taux horaire global à facturer pour toutes vos heures productives est de :</p>
                 <p className="text-center text-2xl font-bold text-blue-600 mb-6">{strategicPricing.costBasedGlobalHourlyRate.toFixed(2)} €/h</p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Prestation</th>
                                <th className="px-4 py-3"><Tooltip text="Prix moyen constaté chez les concurrents que vous avez saisis dans l'onglet Analyse.">Prix Marché</Tooltip></th>
                                <th className="px-4 py-3"><Tooltip text="Le prix que vous devriez facturer en appliquant votre taux horaire global (calculé à partir de vos charges et objectifs) au temps passé sur cette prestation.">Prix basé sur Coûts</Tooltip></th>
                                <th className="px-4 py-3 font-bold"><Tooltip text="Le prix recommandé par l'outil, en fonction de votre curseur de stratégie (Marché vs Coûts).">Prix Suggéré</Tooltip></th>
                                <th className="px-4 py-3"><Tooltip text="Le taux horaire que vous facturez réellement pour cette prestation en appliquant le Prix Suggéré. Comparez-le à votre taux horaire global !">Taux Horaire Effectif</Tooltip></th>
                            </tr>
                        </thead>
                        <tbody>
                            {strategicPricing.results.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                                    <td className="px-4 py-3">{item.marketPrice > 0 ? `${item.marketPrice.toFixed(2)} €` : 'N/A'}</td>
                                    <td className="px-4 py-3">{item.costBasedPrice.toFixed(2)} €</td>
                                    <td className="px-4 py-3 font-bold text-lg text-blue-700">{item.suggestedPrice.toFixed(2)} €</td>
                                    <td className="px-4 py-3 font-semibold">{item.effectiveHourlyRate.toFixed(2)} €/h</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border">
                 <h3 className="text-xl font-semibold text-gray-800 mb-4">Réglages Généraux & Objectifs</h3>
                <div className="flex items-center mb-6 bg-gray-50 p-4 rounded-lg">
                    <label htmlFor="hourlyRate" className="text-sm font-medium mr-3 whitespace-nowrap">Votre Taux Horaire (€/h) :</label>
                    <input id="hourlyRate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2"/>
                </div>
                <div className="flex items-center mb-6 bg-gray-50 p-4 rounded-lg">
                    <label htmlFor="targetNetProfit" className="text-sm font-medium mr-3 whitespace-nowrap">Objectif de Bénéfice Net Mensuel (€) :</label>
                    <input id="targetNetProfit" type="number" value={targetNetProfit} onChange={(e) => setTargetNetProfit(parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2"/>
                </div>
                <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                    <label htmlFor="taxRate" className="text-sm font-medium mr-3 whitespace-nowrap">Taux d'imposition sur les sociétés (%) :</label>
                    <input id="taxRate" type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2"/>
                </div>
            </div>

            {renderEditableTable("Configuration des Prestations", configurableServices, setConfigurableServices, [
                 { key: 'name', label: 'Nom de la Prestation', type: 'text', defaultValue: 'Nouveau type de service' },
            ], "Ajouter un type de prestation")}
            
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Gestion des Utilisateurs</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Nom de l'utilisateur</th>
                                <th className="px-4 py-3">Heures / Semaine</th>
                                <th className="px-4 py-3">Heures / Mois (estimé)</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="px-2 py-2"><input type="text" value={user.name} onChange={e => handleGenericChange(setUsers, user.id, 'name', e.target.value)} className="w-full bg-gray-50 border-gray-300 rounded-lg p-2"/></td>
                                    <td className="px-2 py-2"><input type="number" value={user.weeklyHours} onChange={e => handleGenericChange(setUsers, user.id, 'weeklyHours', parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 border-gray-300 rounded-lg p-2"/></td>
                                    <td className="px-4 py-3 font-semibold">{(user.weeklyHours * 4.33).toFixed(1)} h</td>
                                    <td className="px-4 py-3 text-right"><button onClick={() => removeGenericItem(setUsers, user.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={() => addGenericItem(setUsers, { name: 'Nouvel utilisateur', weeklyHours: 35 })} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                    <PlusCircle size={18} className="mr-2" /> Ajouter un utilisateur
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border">
                 <h3 className="text-xl font-semibold text-gray-800 mb-2">Partage & Collaboration</h3>
                 <p className="text-sm text-gray-500 mb-4">Partagez l'ID du prévisionnel ci-dessous pour collaborer.</p>
                 <div className="flex items-center gap-2">
                     <input type="text" readOnly value={forecastId || "Sauvegardez pour obtenir un ID"} className="w-full bg-gray-100 border-gray-300 text-sm rounded-lg p-2" />
                     <button onClick={() => forecastId && navigator.clipboard.writeText(forecastId)} className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 disabled:opacity-50" disabled={!forecastId}><Copy size={16}/></button>
                 </div>
            </div>
        </div>
    );

    const renderEditableTable = (title, items, setter, fields, addButtonLabel) => (
        <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            {fields.map(f => <th key={f.key} className="px-4 py-3">{f.label}</th>)}
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                {fields.map(f => (
                                    <td key={f.key} className="px-4 py-3">
                                        {f.type === 'select' ? (
                                            <select 
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                                value={item[f.key]}
                                                onChange={(e) => handleGenericChange(setter, item.id, f.key, e.target.value)}
                                            >
                                                {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type={f.type || 'text'}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                                value={item[f.key] || ''}
                                                placeholder={f.label}
                                                onChange={(e) => handleGenericChange(setter, item.id, f.key, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                            />
                                        )}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => removeGenericItem(setter, item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={() => addGenericItem(setter, fields.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue }), {}))} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                <PlusCircle size={18} className="mr-2" /> {addButtonLabel}
            </button>
        </div>
    );
    
    if (isLoading) return <div className="flex items-center justify-center h-screen bg-gray-100">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                       <h1 className="text-xl font-bold text-gray-900">Prévisionnel Financier 3D</h1>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                         <input type="text" className="w-24 md:w-40 bg-gray-100 border-gray-300 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="ID Prévisionnel" value={forecastId || ''} onChange={(e) => setForecastId(e.target.value)} />
                        <button onClick={saveForecast} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors shadow-sm text-sm">
                           <Save size={16} className="mr-0 md:mr-2" /> <span className="hidden md:inline">Sauvegarder</span>
                        </button>
                    </div>
                </div>
                <nav className="container mx-auto px-6 border-t">
                    <div className="flex space-x-4 -mb-px overflow-x-auto">
                        <TabButton label="Tableau de Bord" icon={<BarChart2 size={16}/>} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <TabButton label="Analyse" icon={<TrendingUp size={16}/>} isActive={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
                        <TabButton label="Tarification" icon={<SlidersHorizontal size={16}/>} isActive={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} />
                        <TabButton label="Nos prestations" icon={<Briefcase size={16}/>} isActive={activeTab === 'services'} onClick={() => setActiveTab('services')} />
                        <TabButton label="Charges & Dépenses" icon={<FileText size={16}/>} isActive={activeTab === 'charges'} onClick={() => setActiveTab('charges')} />
                        <TabButton label="Réglages" icon={<Settings size={16}/>} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    </div>
                </nav>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="text-3xl font-bold bg-transparent border-b-2 border-transparent focus:border-gray-300 outline-none w-full md:w-auto mb-6"/>

                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'analysis' && renderAnalysisTab()}
                {activeTab === 'pricing' && renderPricingTool()}
                {activeTab === 'services' && renderServicesTab()}
                {activeTab === 'charges' && renderChargesTab()}
                {activeTab === 'settings' && renderSettingsTab()}
            </main>
            <footer className="text-center py-4 text-xs text-gray-500 border-t mt-8 bg-white">
                <p>ID Utilisateur: {userId}</p>
                <p>{statusMessage}</p>
            </footer>
        </div>
    );
};

export default App;

