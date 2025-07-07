"use client";
import { useState } from "react";
import apiService from "../../services/api";
import useCategories, { Category } from "../../hooks/useCategories";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import Image from "next/image";

interface ProductFormData {
  _id?: string;
  name: string;
  price: string | number;
  category: string;
  images: string[];
  isFeatured?: boolean;
  descriptionShort: string;
  descriptionDetailed: string;
  stockQuantity: number;
}

export default function ProductForm({
  initialData,
  onSuccess,
}: {
  initialData?: ProductFormData;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name || "",
    price: initialData?.price || "",
    category: initialData?.category || "",
    images: initialData?.images || [],
    isFeatured: initialData?.isFeatured || false,
    descriptionShort: initialData?.descriptionShort || "",
    descriptionDetailed: initialData?.descriptionDetailed || "",
    stockQuantity: initialData?.stockQuantity || 0,
  });
  const [loading, setLoading] = useState(false);
  const categories = useCategories();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "beyana_upload");
      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/beyana/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          setForm(prev => ({
            ...prev,
            images: [...prev.images, data.secure_url],
          }));
          toast.success("Image uploadée !");
        } else {
          toast.error("Erreur upload image");
        }
      } catch {
        toast.error("Erreur upload image");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (initialData && initialData._id) {
        await apiService.put(`/products/${initialData._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Produit modifié !");
      } else {
        await apiService.post("/products", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Produit ajouté !");
      }
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === "object" && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        toast.error(
          axiosErr.response?.data?.message || "Erreur lors de l'enregistrement"
        );
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block mb-1">Nom du produit</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="border px-2 py-1 rounded w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Prix (€)</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          required
          min={0}
          step="0.01"
          className="border px-2 py-1 rounded w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Catégorie</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="border px-2 py-1 rounded w-full"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((cat: Category) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {form.images.map((img, idx) => (
            <div key={idx} className="relative group">
              <Image
                src={img}
                alt="Aperçu"
                width={96}
                height={96}
                className="h-24 w-24 object-cover rounded"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
              <button
                type="button"
                onClick={() =>
                  setForm(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== idx),
                  }))
                }
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs opacity-80 group-hover:opacity-100"
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            checked={!!form.isFeatured}
            onChange={handleChange}
            className="mr-2"
          />
          Mettre en avant (produit vedette)
        </label>
      </div>
      <div>
        <label className="block mb-1">Description courte</label>
        <input
          type="text"
          name="descriptionShort"
          value={form.descriptionShort}
          onChange={handleChange}
          required
          className="border px-2 py-1 rounded w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Description détaillée</label>
        <textarea
          name="descriptionDetailed"
          value={form.descriptionDetailed}
          onChange={handleChange}
          required
          className="border px-2 py-1 rounded w-full"
          rows={4}
        />
      </div>
      <div>
        <label className="block mb-1">Quantité en stock</label>
        <input
          type="number"
          name="stockQuantity"
          value={form.stockQuantity}
          onChange={handleChange}
          required
          min={0}
          step={1}
          className="border px-2 py-1 rounded w-full"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Enregistrement..." : initialData ? "Modifier" : "Ajouter"}
      </button>
    </form>
  );
}
