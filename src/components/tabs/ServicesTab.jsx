import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import Tooltip from '../common/Tooltip';

const ServicesTab = ({
  services,
  configurableServices,
  users,
  onSelectChange,
  onNumberChange,
  onRemove,
  onAdd,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md border">
    <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg mb-4">
      Toute modification dans ce tableau réinitialise la vue sur le scénario « Réaliste ».
    </p>
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
            <th className="px-4 py-3">
              <Tooltip text="Taux horaire brut facturé pour cette prestation (Prix Unitaire / Temps Passé). N'inclut pas les charges.">Taux Horaire (HC)</Tooltip>
            </th>
            <th className="px-4 py-3">
              <Tooltip text="Coût d'un prestataire externe pour réaliser une partie ou la totalité de la prestation.">Sous-traitance (€)</Tooltip>
            </th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const hourlyRateHC = service.hoursSpent > 0 ? (service.unitPrice || 0) / service.hoursSpent : 0;
            return (
              <tr key={service.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <select
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    value={service.name || ''}
                    onChange={(event) => onSelectChange(service.id, 'name', event.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    {configurableServices.map((configService) => (
                      <option key={configService.id} value={configService.name}>
                        {configService.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    value={service.realizedBy || ''}
                    onChange={(event) => onSelectChange(service.id, 'realizedBy', event.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                    value={service.quantity ?? 0}
                    onChange={(event) => onNumberChange(service.id, 'quantity', event.target.value, { min: 0, integer: true })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                    value={service.unitPrice ?? 0}
                    onChange={(event) => onNumberChange(service.id, 'unitPrice', event.target.value, { min: 0 })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                    value={service.hoursSpent ?? 0}
                    onChange={(event) => onNumberChange(service.id, 'hoursSpent', event.target.value, { min: 0 })}
                  />
                </td>
                <td className="px-4 py-3 font-semibold text-blue-600">{hourlyRateHC.toFixed(2)} €/h</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                    value={service.subcontractingCost ?? 0}
                    onChange={(event) => onNumberChange(service.id, 'subcontractingCost', event.target.value, { min: 0 })}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onRemove(service.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <button
      onClick={onAdd}
      className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold"
    >
      <PlusCircle size={18} className="mr-2" /> Ajouter une prestation
    </button>
  </div>
);

export default ServicesTab;
