import React, { useState } from "react";

interface OrderFiltersProps {
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    user: string;
    email: string;
    name: string;
  };
  onFilterChange: (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    user: string;
    email: string;
    name: string;
  }) => void;
  onReset: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState({
    user: filters.user,
    email: filters.email,
    name: filters.name,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    search: filters.search,
  });

  const handleInputChange = (field: string, value: string) => {
    setLocalFilters({
      ...localFilters,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtres</h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* ID client */}
        <div className="filter-group">
          <label
            htmlFor="user"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ID client
          </label>
          <input
            type="text"
            id="user"
            name="user"
            value={localFilters.user}
            onChange={e => handleInputChange("user", e.target.value)}
            placeholder="ID client"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email client */}
        <div className="filter-group">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email client
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={localFilters.email}
            onChange={e => handleInputChange("email", e.target.value)}
            placeholder="Email client"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Nom ou prénom client */}
        <div className="filter-group">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nom ou prénom client
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={localFilters.name}
            onChange={e => handleInputChange("name", e.target.value)}
            placeholder="Nom ou prénom"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={localFilters.status || ""}
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
            value={localFilters.startDate || ""}
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
            value={localFilters.endDate || ""}
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
            value={localFilters.search || ""}
            onChange={e => handleInputChange("search", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onReset}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Réinitialiser
        </button>
        <button
          type="submit"
          form="order-filters"
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Filtrer
        </button>
      </div>
    </div>
  );
};

export default OrderFilters;
