import React from 'react';
import { PlusCircle, Trash2, Copy } from 'lucide-react';

const EditableTable = ({ title, items, columns, onChange, onAdd, onRemove }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3">
                {column.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.type === 'select' ? (
                    <select
                      value={item[column.key]}
                      onChange={(event) => onChange(item.id, column.key, event.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    >
                      {column.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={column.type || 'text'}
                      min={column.min}
                      max={column.max}
                      step={column.step}
                      value={item[column.key] ?? ''}
                      onChange={(event) => onChange(item.id, column.key, event.target.value, column.constraints)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    />
                  )}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <button onClick={onAdd} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
      <PlusCircle size={18} className="mr-2" /> Ajouter
    </button>
  </div>
);

const SettingsTab = ({
  hourlyRate,
  onHourlyRateChange,
  targetNetProfit,
  onTargetNetProfitChange,
  taxRate,
  onTaxRateChange,
  configurableServices,
  onConfigServiceChange,
  onAddConfigService,
  onRemoveConfigService,
  users,
  onUserChange,
  onAddUser,
  onRemoveUser,
  forecastId,
  onCopyForecastId,
  recentForecasts,
  onSelectRecentForecast,
}) => {
  const shareUrl = typeof window !== 'undefined' && forecastId ? `${window.location.origin}?forecastId=${forecastId}` : '';

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Réglages Généraux & Objectifs</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col bg-gray-50 p-4 rounded-lg">
            <span className="text-sm font-medium mb-1">Votre Taux Horaire (€/h)</span>
            <input
              type="number"
              min={0}
              step={5}
              value={hourlyRate ?? 0}
              onChange={(event) => onHourlyRateChange(event.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
            />
          </label>
          <label className="flex flex-col bg-gray-50 p-4 rounded-lg">
            <span className="text-sm font-medium mb-1">Objectif de Bénéfice Net Mensuel (€)</span>
            <input
              type="number"
              min={0}
              step={50}
              value={targetNetProfit ?? 0}
              onChange={(event) => onTargetNetProfitChange(event.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
            />
          </label>
          <label className="flex flex-col bg-gray-50 p-4 rounded-lg">
            <span className="text-sm font-medium mb-1">Taux d'imposition sur les sociétés (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={taxRate ?? 0}
              onChange={(event) => onTaxRateChange(event.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
            />
          </label>
        </div>
      </div>

      <EditableTable
        title="Configuration des Prestations"
        items={configurableServices}
        columns={[{ key: 'name', label: 'Nom de la Prestation', type: 'text' }]}
        onChange={onConfigServiceChange}
        onAdd={onAddConfigService}
        onRemove={onRemoveConfigService}
      />

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
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={user.name || ''}
                      onChange={(event) => onUserChange(user.id, 'name', event.target.value)}
                      className="w-full bg-gray-50 border-gray-300 rounded-lg p-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={user.weeklyHours ?? 0}
                      onChange={(event) => onUserChange(user.id, 'weeklyHours', event.target.value, { min: 0, max: 80 })}
                      className="w-full bg-gray-50 border-gray-300 rounded-lg p-2"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">{(user.weeklyHours * 4.33).toFixed(1)} h</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onRemoveUser(user.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={onAddUser} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
          <PlusCircle size={18} className="mr-2" /> Ajouter un utilisateur
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Partage & Collaboration</h3>
          <p className="text-sm text-gray-500 mb-2">Partagez l'ID ou le lien direct du prévisionnel pour collaborer.</p>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={forecastId || 'Sauvegardez pour obtenir un ID'}
              className="w-full bg-gray-100 border-gray-300 text-sm rounded-lg p-2"
            />
            <button
              onClick={onCopyForecastId}
              className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
              disabled={!forecastId}
            >
              <Copy size={16} /> Copier
            </button>
          </div>
          {shareUrl && (
            <div className="mt-2 text-xs text-gray-600 break-all">Lien direct : {shareUrl}</div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Vos prévisionnels récents</h4>
          <select
            className="w-full md:w-72 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
            onChange={(event) => onSelectRecentForecast(event.target.value)}
            value=""
          >
            <option value="">Sélectionner un prévisionnel</option>
            {recentForecasts.map((forecast) => (
              <option key={forecast.id} value={forecast.id}>
                {forecast.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Les prévisionnels sont triés par date de mise à jour. Sélectionnez-en un pour le charger automatiquement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
