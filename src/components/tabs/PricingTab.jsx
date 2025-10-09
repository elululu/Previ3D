import React from 'react';
import Tooltip from '../common/Tooltip';

const PricingTab = ({
  calculations,
  strategicPricing,
  targetNetProfit,
  pricingStrategyWeight,
  onPricingStrategyChange,
}) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Vos Objectifs</h3>
        <div className="space-y-3 text-sm">
          <p className="flex justify-between">
            Charges fixes & améliorations: <span className="font-bold">{calculations.totalFixedCharges.toFixed(2)} €</span>
          </p>
          <p className="flex justify-between">
            Coût total des salaires: <span className="font-bold">{calculations.totalSalariesCost.toFixed(2)} €</span>
          </p>
          <p className="flex justify-between">
            Bénéfice net mensuel visé: <span className="font-bold">{targetNetProfit.toFixed(2)} €</span>
          </p>
          <hr className="my-2" />
          <p className="flex justify-between text-base font-semibold">
            Total à couvrir + Bénéfice:{' '}
            <span className="font-bold text-blue-600">{strategicPricing.totalRevenueTarget.toFixed(2)} €</span>
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Stratégie de Tarification</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ajustez le curseur pour équilibrer votre stratégie entre une tarification basée sur vos coûts et une autre basée sur les prix du marché.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-green-600">Marché</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={pricingStrategyWeight}
            onChange={(event) => onPricingStrategyChange(parseFloat(event.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-semibold text-red-600">Coûts</span>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Prix et Taux Horaires Suggérés</h3>
      <p className="text-sm text-gray-500 mb-2">
        Basé sur vos objectifs, le taux horaire global à facturer pour toutes vos heures productives est de :
      </p>
      <p className="text-center text-2xl font-bold text-blue-600 mb-6">
        {strategicPricing.costBasedGlobalHourlyRate.toFixed(2)} €/h
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">Prestation</th>
              <th className="px-4 py-3">
                <Tooltip text="Prix moyen constaté chez les concurrents que vous avez saisis dans l'onglet Analyse.">Prix Marché</Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Le prix que vous devriez facturer en appliquant votre taux horaire global au temps passé sur cette prestation.">
                  Prix basé sur Coûts
                </Tooltip>
              </th>
              <th className="px-4 py-3 font-bold">
                <Tooltip text="Le prix recommandé par l'outil, en fonction de votre curseur de stratégie (Marché vs Coûts).">
                  Prix Suggéré
                </Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Le taux horaire que vous facturez réellement pour cette prestation en appliquant le Prix Suggéré. Comparez-le à votre taux horaire global !">
                  Taux Horaire Effectif
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {strategicPricing.results.map((item) => (
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

export default PricingTab;
