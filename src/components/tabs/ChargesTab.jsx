import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import ToggleSwitch from '../common/ToggleSwitch';

const ChargesTab = ({
  fixedCharges,
  onChargeChange,
  onAddCharge,
  onRemoveCharge,
  improvementExpenses,
  onImprovementChange,
  onAddImprovement,
  onRemoveImprovement,
  salaries,
  users,
  onSalaryChange,
  onAddSalary,
  onRemoveSalary,
}) => (
  <div className="space-y-8">
    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Charges fixes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Montant (€)</th>
              <th className="px-4 py-3">Fréquence</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fixedCharges.map((charge) => (
              <tr key={charge.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={charge.name || ''}
                    onChange={(event) => onChargeChange(charge.id, 'name', event.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={charge.amount ?? 0}
                    onChange={(event) => onChargeChange(charge.id, 'amount', event.target.value, { min: 0 })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={charge.frequency || 'monthly'}
                    onChange={(event) => onChargeChange(charge.id, 'frequency', event.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                  >
                    <option value="monthly">Mensuel</option>
                    <option value="annual">Annuel</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onRemoveCharge(charge.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={onAddCharge} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
        <PlusCircle size={18} className="mr-2" /> Ajouter une charge
      </button>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Dépenses d'amélioration</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Montant (€)</th>
              <th className="px-4 py-3">Incluse</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {improvementExpenses.map((expense) => (
              <tr key={expense.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={expense.name || ''}
                    onChange={(event) => onImprovementChange(expense.id, 'name', event.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={expense.amount ?? 0}
                    onChange={(event) => onImprovementChange(expense.id, 'amount', event.target.value, { min: 0 })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                  />
                </td>
                <td className="px-4 py-3">
                  <ToggleSwitch
                    checked={expense.included}
                    onChange={() => onImprovementChange(expense.id, 'included', !expense.included, { isBoolean: true })}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onRemoveImprovement(expense.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={onAddImprovement} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
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
              <th className="px-4 py-3">
                <Tooltip text="Le salaire avant toute déduction de cotisations. C'est la base de tous les calculs.">Salaire Brut</Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Le salaire que l'employé reçoit réellement sur son compte en banque (Brut - Charges Salariales).">Salaire Net</Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Part des cotisations sociales payées par l'employé (estimé à 22% du Brut).">Charges Salariales</Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Part des cotisations sociales payées par l'entreprise (estimé à 42% du Brut).">Charges Patronales</Tooltip>
              </th>
              <th className="px-4 py-3">
                <Tooltip text="Le coût total de l'employé pour l'entreprise (Brut + Charges Patronales).">Coût Total</Tooltip>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((salary) => {
              const gross = salary.grossSalary || 0;
              const employeeC = gross * 0.22;
              const employerC = gross * 0.42;
              const netSalary = gross - employeeC;
              const totalCost = gross + employerC;
              return (
                <tr key={salary.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2">
                    <select
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                    value={salary.name || ''}
                      onChange={(event) => onSalaryChange(salary.id, 'name', event.target.value)}
                    >
                      <option value="">Sélectionner</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={salary.grossSalary ?? 0}
                      onChange={(event) => onSalaryChange(salary.id, 'grossSalary', event.target.value, { min: 0 })}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-700">{netSalary.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-gray-600">{employeeC.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-gray-600">{employerC.toFixed(2)} €</td>
                  <td className="px-4 py-3 font-semibold text-red-700">{totalCost.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onRemoveSalary(salary.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={onAddSalary} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
        <PlusCircle size={18} className="mr-2" /> Ajouter un salaire
      </button>
    </div>
  </div>
);

export default ChargesTab;
