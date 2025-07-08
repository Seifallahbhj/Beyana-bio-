import React from "react";

interface OrderExportButtonsProps {
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  };
  onExportCSV?: () => void;
  onExportPDF: () => void;
  isLoading?: boolean;
}

const OrderExportButtons: React.FC<OrderExportButtonsProps> = ({
  filters,
  onExportPDF,
  isLoading = false,
}) => {
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return params.toString();
  };

  const handleCSVExport = () => {
    const queryString = buildQueryString();
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    console.log("API URL:", apiUrl); // Debug
    const url = `${apiUrl}/admin/orders/export/csv?${queryString}`;
    console.log("Full URL:", url); // Debug

    // Récupérer le token depuis localStorage
    const token = localStorage.getItem("adminToken");

    if (!token) {
      alert("Token d'authentification manquant");
      return;
    }

    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `commandes_${new Date().toISOString().split("T")[0]}.csv`
    );

    // Ajouter le token d'authentification
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de l'export");
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `commandes_${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Erreur export CSV:", error);
        alert("Erreur lors de l'export CSV");
      });
  };

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={handleCSVExport}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export CSV
      </button>

      <button
        onClick={onExportPDF}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        Export PDF
      </button>
    </div>
  );
};

export default OrderExportButtons;
