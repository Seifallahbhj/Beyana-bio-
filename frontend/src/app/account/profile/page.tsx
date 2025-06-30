"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import RobustImage from "@/components/ui/RobustImage";
import AvatarSVG from "@/components/ui/AvatarSVG";
import { apiService } from "@/services/api";
import { toast } from "react-hot-toast";

// Types stricts pour l'adresse et le formulaire
export type Address = {
  type: "shipping" | "billing";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addresses: Address[];
};

export default function ProfilePage() {
  const { user, updateProfile, refreshProfile, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    addresses: user?.addresses || [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Typage strict des handlers
  const handleInputChange = (
    field: keyof Omit<ProfileFormData, "addresses">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (
    index: number,
    field: keyof Address,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          type: "shipping",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "France",
        },
      ],
    }));
  };

  const removeAddress = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        addresses: formData.addresses,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: "Profil mis à jour avec succès !",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de la mise à jour",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erreur de communication avec le serveur",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUploading(true);
      setMessage(null);
      try {
        const result = await apiService.uploadAvatar(file);
        if (result.success && result.data?.avatar) {
          if (result.data) {
            setUser((prev) =>
              prev ? { ...prev, avatar: result.data!.avatar } : prev
            );
          }
          await refreshProfile();
          toast.success("Photo de profil mise à jour !");
        } else {
          setMessage({
            type: "error",
            text: result.error || "Erreur lors de l'upload de l'avatar",
          });
          toast.error(result.error || "Erreur lors de l'upload de l'avatar");
        }
      } catch {
        setMessage({
          type: "error",
          text: "Erreur lors de l'upload de l'avatar",
        });
        toast.error("Erreur lors de l'upload de l'avatar");
      } finally {
        setAvatarUploading(false);
      }
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Toast notification */}
      {message && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300
            ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }
          `}
          style={{ minWidth: 220 }}
        >
          {message.text}
        </div>
      )}
      <div className="mb-6 flex items-center gap-4">
        {/* AVATAR */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center cursor-pointer relative"
            onClick={handleAvatarClick}
            title="Changer la photo"
          >
            <RobustImage
              src={user.avatar || undefined}
              alt={user.firstName + " " + user.lastName}
              width={80}
              height={80}
              className="object-cover w-20 h-20"
              style={{ width: "auto", height: "auto" }}
              fallbackType="svg"
              fallbackSvg={<AvatarSVG />}
            />
            {avatarUploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-xs text-gray-500">Upload...</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="text-xs text-primary-green hover:underline focus:outline-none"
            onClick={handleAvatarClick}
          >
            Changer la photo
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            Informations Personnelles
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et vos adresses de livraison
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-primary-green" />
            Informations de base
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prénom *
              </label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("firstName", e.target.value)
                }
                required
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom *
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("lastName", e.target.value)
                }
                required
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 mb-1 flex items-center"
              >
                <Mail className="mr-1 h-4 w-4 text-gray-500" />
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
                placeholder="votre@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                L&apos;email ne peut pas être modifié pour des raisons de
                sécurité
              </p>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-700 mb-1 flex items-center"
              >
                <Phone className="mr-1 h-4 w-4 text-gray-500" />
                Téléphone
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>
        </div>

        {/* Adresses */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary-green" />
              Adresses de livraison
            </h3>
            <Button
              type="button"
              onClick={addAddress}
              variant="outline"
              size="sm"
            >
              Ajouter une adresse
            </Button>
          </div>

          {formData.addresses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune adresse enregistrée. Ajoutez votre première adresse de
              livraison.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.addresses.map((address, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Adresse {index + 1} -{" "}
                      {address.type === "shipping"
                        ? "Livraison"
                        : "Facturation"}
                    </h4>
                    <Button
                      type="button"
                      onClick={() => removeAddress(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rue et numéro
                      </label>
                      <Input
                        type="text"
                        value={address.street}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleAddressChange(index, "street", e.target.value)
                        }
                        placeholder="123 Rue de la Paix"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <Input
                        type="text"
                        value={address.city}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleAddressChange(index, "city", e.target.value)
                        }
                        placeholder="Paris"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <Input
                        type="text"
                        value={address.zipCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleAddressChange(index, "zipCode", e.target.value)
                        }
                        placeholder="75001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Région/État
                      </label>
                      <Input
                        type="text"
                        value={address.state}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleAddressChange(index, "state", e.target.value)
                        }
                        placeholder="Île-de-France"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays
                      </label>
                      <Input
                        type="text"
                        value={address.country}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleAddressChange(index, "country", e.target.value)
                        }
                        placeholder="France"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
