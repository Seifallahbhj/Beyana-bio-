"use client";
import { useState, useEffect } from "react";
import apiService from "@/services/api";
import ProductForm from "@/components/products/ProductForm";
import toast from "react-hot-toast";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: { _id: string; name: string } | string;
  images: string[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await apiService.get(`/products?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.data.products);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await apiService.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Produit supprimé !");
      fetchProducts(page);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestion des produits</h1>
      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => {
          setEditProduct(null);
          setShowForm(true);
        }}
      >
        Ajouter un produit
      </button>
      {showForm && (
        <ProductForm
          initialData={
            editProduct
              ? {
                  _id: editProduct._id,
                  name: editProduct.name,
                  price: editProduct.price,
                  category:
                    typeof editProduct.category === "string"
                      ? editProduct.category
                      : editProduct.category._id,
                  images: Array.isArray(editProduct.images)
                    ? editProduct.images
                    : [],
                }
              : undefined
          }
          onSuccess={() => {
            setShowForm(false);
            setEditProduct(null);
            fetchProducts(page);
          }}
        />
      )}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <table className="min-w-full border mb-4">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prix</th>
                <th>Catégorie</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod._id}>
                  <td>{prod.name}</td>
                  <td>{prod.price} €</td>
                  <td>
                    {typeof prod.category === "string"
                      ? prod.category
                      : prod.category?.name}
                  </td>
                  <td>
                    <button
                      className="mr-2 text-blue-600"
                      onClick={() => {
                        setEditProduct(prod);
                        setShowForm(true);
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(prod._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
}
