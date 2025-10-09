import React from 'react';
import { PlusCircle, Trash2, ArrowUp, ArrowDown, Minus, ChevronDown } from 'lucide-react';
import Tooltip from '../common/Tooltip';

const PriceDiffIcon = ({ myPrice, avgPrice }) => {
  if (!myPrice || !avgPrice) return null;
  const difference = myPrice - avgPrice;
  if (difference > avgPrice * 0.05) return <ArrowUp size={20} className="text-red-500 ml-2" title="Supérieur au marché" />;
  if (difference < -avgPrice * 0.05) return <ArrowDown size={20} className="text-green-500 ml-2" title="Inférieur au marché" />;
  return <Minus size={20} className="text-yellow-500 ml-2" title="Similaire au marché" />;
};

const ProfitabilitySection = ({ services, hourlyRate, targetMargin, onTargetMarginChange }) => {
  const suggestedPrices = services.map((service) => {
    const variableCostPerUnit = ((service.hoursSpent || 0) * hourlyRate) + (service.subcontractingCost || 0);
    const priceWithMargin = variableCostPerUnit > 0 ? variableCostPerUnit / (1 - (targetMargin / 100)) : 0;
    const currentProfitPerUnit = (service.unitPrice || 0) - variableCostPerUnit;
    const currentMargin = service.unitPrice > 0 ? (currentProfitPerUnit / service.unitPrice) * 100 : 0;
    return { id: service.id, name: service.name, suggestedPrice: priceWithMargin, currentMargin };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h3 className="text-xl font-semibold mb-2">Analyse de Rentabilité par Prestation</h3>
      <p className="text-sm text-gray-500 mb-6">Évaluez la performance de chaque service et déterminez des prix de vente optimaux.</p>
      <div className="flex items-center mb-6 bg-gray-50 p-4 rounded-lg">
        <label htmlFor="targetMargin" className="text-sm font-medium mr-3 whitespace-nowrap">
          Définir la marge cible :
        </label>
        <input
          id="targetMargin"
          type="number"
          min={0}
          max={100}
          value={targetMargin}
          onChange={(event) => onTargetMarginChange(event.target.value)}
          className="w-20 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
        />
        <span className="ml-2 text-gray-600">%</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">Prestation</th>
              <th className="px-4 py-3">
                <Tooltip text="Marge brute actuelle de la prestation : (Prix de Vente - Coûts Variables) / Prix de Vente.">
                  Marge Actuelle
                </Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Prix de vente minimum à appliquer pour atteindre votre 'Marge Cible' sur cette prestation.">
                  Prix Conseillé
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {suggestedPrices.map((price) => (
              <tr key={price.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{price.name}</td>
                <td className={`px-4 py-3 font-semibold ${price.currentMargin < targetMargin ? 'text-red-600' : 'text-green-600'}`}>
                  {price.currentMargin.toFixed(1)} %
                </td>
                <td className="px-4 py-3 font-bold text-blue-600">{price.suggestedPrice.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CompetitiveSection = ({
  configurableServices,
  services,
  competitors,
  openAccordion,
  onToggleAccordion,
  onCompetitorChange,
  onRemoveCompetitor,
  onAddCompetitor,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md border">
    <h3 className="text-xl font-semibold mb-2">Positionnement par Prestation</h3>
    <p className="text-sm text-gray-500 mb-6">
      Gérez et comparez vos concurrents pour chaque service que vous proposez.
    </p>
    <div className="space-y-4">
      {configurableServices.map((service) => {
        const mySoldService = services.find((item) => item.name === service.name);
        const serviceCompetitors = competitors.filter((competitor) => competitor.serviceName === service.name);
        const avgPrice =
          serviceCompetitors.length > 0
            ? serviceCompetitors.reduce((acc, competitor) => acc + (competitor.price || 0), 0) / serviceCompetitors.length
            : 0;
        const isOpen = openAccordion === service.id;

        return (
          <div key={service.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleAccordion(service.id)}
              className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <span className="font-bold text-gray-800">{service.name}</span>
              <div className="flex items-center text-sm">
                <div className="mr-4">
                  Votre Prix:{' '}
                  <span className="font-bold text-blue-600">
                    {mySoldService ? `${(mySoldService.unitPrice || 0).toFixed(2)} €` : 'N/A'}
                  </span>
                </div>
                <div>
                  Moy. Marché:{' '}
                  <span className="font-bold text-gray-600">{avgPrice > 0 ? `${avgPrice.toFixed(2)} €` : 'N/A'}</span>
                </div>
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
                {serviceCompetitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center mb-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="text"
                      value={competitor.name || ''}
                      onChange={(event) => onCompetitorChange(competitor.id, 'name', event.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    />
                    <div className="flex items-center">
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={competitor.price ?? 0}
                        onChange={(event) => onCompetitorChange(competitor.id, 'price', event.target.value, { min: 0 })}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                      />
                      <button
                        onClick={() => onRemoveCompetitor(competitor.id)}
                        className="ml-2 text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => onAddCompetitor(service)}
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

const AnalysisTab = (props) => (
  <div className="space-y-8">
    <ProfitabilitySection {...props} />
    <CompetitiveSection {...props} />
  </div>
);

export default AnalysisTab;
