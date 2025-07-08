import React from "react";

interface OrderFiltersProps {
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
  onFilterChange: (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => void;
  onReset: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleInputChange = (field: string, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtres</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={filters.status || ""}
            onChange={e => handleInputChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="Pending">En attente</option>
            <option value="Processing">En cours</option>
            <option value="Shipped">Expédiée</option>
            <option value="Delivered">Livrée</option>
            <option value="Cancelled">Annulée</option>
          </select>
        </div>

        {/* Date de début */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={e => handleInputChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date de fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={e => handleInputChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Recherche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <input
            type="text"
            placeholder="ID commande, client..."
            value={filters.search || ""}
            onChange={e => handleInputChange("search", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onReset}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default OrderFilters;
