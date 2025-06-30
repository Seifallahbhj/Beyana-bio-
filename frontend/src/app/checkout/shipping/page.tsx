"use client";

import React from "react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "../../../contexts/CartContext";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const shippingSchema = z.object({
  address: z.string().min(5, "L'adresse est requise."),
  city: z.string().min(2, "La ville est requise."),
  zipCode: z.string().min(5, "Le code postal est requis."),
  state: z.string().min(2, "Le département/région est requis."),
  country: z.string().min(2, "Le pays est requis."),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const ShippingPage = () => {
  // Note: Ce composant est enveloppé dans `ProtectedRoute`,
  // donc l'utilisateur est forcément connecté ici.
  // La logique pour sauvegarder l'adresse sera ajoutée au CartContext.

  const router = useRouter();
  const { shippingAddress, saveShippingAddress } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: shippingAddress || {
      address: "",
      city: "",
      zipCode: "",
      state: "",
      country: "France", // Valeur par défaut
    },
  });

  const onSubmit: SubmitHandler<ShippingFormData> = (data) => {
    saveShippingAddress(data);
    router.push("/checkout/payment");
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Adresse de Livraison
        </h1>
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse
              </label>
              <Input id="address" {...register("address")} />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                Ville
              </label>
              <Input id="city" {...register("city")} />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code Postal
                </label>
                <Input id="zipCode" {...register("zipCode")} />
                {errors.zipCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  Département/Région
                </label>
                <Input id="state" {...register("state")} />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                Pays
              </label>
              <Input id="country" {...register("country")} />
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>
            <Button type="submit" fullWidth variant="primary">
              Continuer vers le paiement
            </Button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ShippingPage;
