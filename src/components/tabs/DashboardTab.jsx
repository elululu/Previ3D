import React from 'react';
import { DollarSign, ThumbsUp, Target as TargetIcon, Copy, Zap, ZapOff } from 'lucide-react';
import StatCard from '../common/StatCard';
import Tooltip from '../common/Tooltip';

const DashboardTab = ({ scenario, onScenarioChange, calculations, displayServices, userPerformance }) => (
  <>
    <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
      <h3 className="text-lg font-semibold mb-3">Scénarios de Prévision</h3>
      <div className="flex flex-wrap justify-center items-center gap-4">
        <button
          onClick={() => onScenarioChange('pessimist')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            scenario === 'pessimist' ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-100'
          }`}
        >
          <ZapOff size={16} /> Pessimiste (-20%)
        </button>
        <button
          onClick={() => onScenarioChange('realist')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            scenario === 'realist' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-blue-100'
          }`}
        >
          <TargetIcon size={16} /> Réaliste
        </button>
        <button
          onClick={() => onScenarioChange('optimist')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            scenario === 'optimist' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-100'
          }`}
        >
          <Zap size={16} /> Optimiste (+20%)
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Chiffre d'Affaires Mensuel"
        value={`${(calculations.totalRevenue || 0).toFixed(0)} €`}
        subtext="Total des revenus générés par vos prestations sur le mois."
        icon={<DollarSign size={24} className="text-green-800" />}
        color="bg-green-100"
      />
      <StatCard
        title="Bénéfice Net (Après Impôt)"
        value={`${(calculations.afterTaxProfit || 0).toFixed(0)} €`}
        smallText={`Avant impôt : ${(calculations.preTaxProfit || 0).toFixed(0)} €`}
        subtext="Le bénéfice final après déduction de toutes les charges et de l'impôt sur les sociétés."
        icon={<ThumbsUp size={24} className="text-indigo-800" />}
        color="bg-indigo-100"
      />
      <StatCard
        title="Taux de Rentabilité"
        value={`${(calculations.profitability || 0).toFixed(1)} %`}
        subtext="Pourcentage du CA qui se transforme en bénéfice net final."
        icon={<TargetIcon size={24} className="text-yellow-800" />}
        color="bg-yellow-100"
      />
      <StatCard
        title="Point Mort Mensuel"
        value={`${(calculations.breakEvenPoint || 0).toFixed(0)} €`}
        subtext="Le CA minimum à atteindre pour couvrir toutes vos charges (hors impôt)."
        icon={<Copy size={24} className="text-red-800" />}
        color="bg-red-100"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Répartition du Chiffre d'Affaires</h3>
        <div className="space-y-3">
          {displayServices.map((service) => {
            const revenue = (service.quantity || 0) * (service.unitPrice || 0);
            const percentage = calculations.totalRevenue > 0 ? ((revenue / calculations.totalRevenue) * 100).toFixed(1) : 0;
            return (
              <div key={service.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{service.name} ({service.quantity})</span>
                  <span>{revenue.toFixed(0)} € ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
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
          ].map((item) => {
            const percentage = calculations.totalExpenses > 0 ? ((item.value / calculations.totalExpenses) * 100).toFixed(1) : 0;
            return (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span>{item.value.toFixed(0)} € ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
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
              <th className="px-4 py-3">
                <Tooltip text="Nom de l'utilisateur tel que défini dans les Réglages.">Utilisateur</Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Chiffre d'affaires total généré par les prestations assignées à cet utilisateur.">Chiffre d'Affaires</Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Nombre total d'heures passées par cet utilisateur sur les prestations qui lui sont assignées.">Temps Passé</Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Chiffre d'Affaires / Temps Passé. Montre la valeur générée par heure de travail.">Taux Horaire Moyen Réel</Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {userPerformance.map((user) => (
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

export default DashboardTab;
