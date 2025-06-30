import React from "react";
// import Image from "next/image";
import RobustImage from "../components/ui/RobustImage";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import FeaturedProductsSection from "../components/features/FeaturedProductsSection";
import { Button, Card } from "../components/ui";

// Types pour les catégories (données statiques pour l'instant)
interface Category {
  name: string;
  image: string;
  productCount: number;
  href: string;
}

const categories: Category[] = [
  {
    name: "Fruits & Légumes",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop",
    productCount: 45,
    href: "/category/fruits-legumes",
  },
  {
    name: "Céréales & Grains",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
    productCount: 32,
    href: "/category/cereales",
  },
  {
    name: "Huiles & Vinaigres",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=200&fit=crop",
    productCount: 28,
    href: "/category/huiles",
  },
  {
    name: "Épices & Condiments",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
    productCount: 67,
    href: "/category/epices",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-green to-secondary-green text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
                  Découvrez le{" "}
                  <span className="text-accent-gold">meilleur</span> des
                  produits bio
                </h1>
                <p className="text-xl mb-8 text-gray-100">
                  Une sélection premium de produits naturels, cultivés avec soin
                  et respect de l&apos;environnement. Votre bien-être, notre
                  priorité.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="secondary">
                    Découvrir nos produits
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary-green"
                  >
                    En savoir plus
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-gold">
                        500+
                      </div>
                      <div className="text-sm">Produits Bio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-gold">
                        50+
                      </div>
                      <div className="text-sm">Producteurs Locaux</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-gold">
                        100%
                      </div>
                      <div className="text-sm">Sans Pesticides</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-gold">
                        24h
                      </div>
                      <div className="text-sm">Livraison Express</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
                Explorez nos catégories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez notre gamme complète de produits bio organisés par
                catégories pour faciliter votre shopping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card key={category.name} hover className="overflow-hidden">
                  <div className="relative h-48">
                    <RobustImage
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      fallbackType="svg"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-xl font-semibold mb-2">
                          {category.name}
                        </h3>
                        <p className="text-sm opacity-90">
                          {category.productCount} produits
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <FeaturedProductsSection />

        {/* Values Section */}
        <section className="py-16 bg-neutral-cream">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
                Nos valeurs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Chez BEYANA, nous nous engageons pour votre santé et celle de la
                planète.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Agriculture Biologique
                </h3>
                <p className="text-gray-600">
                  Tous nos produits sont issus de l&apos;agriculture biologique,
                  garantissant une qualité supérieure sans pesticides.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Production Locale
                </h3>
                <p className="text-gray-600">
                  Nous privilégions les producteurs locaux pour réduire
                  l&apos;empreinte carbone et soutenir l&apos;économie locale.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">♻️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Emballages Éco-responsables
                </h3>
                <p className="text-gray-600">
                  Nos emballages sont conçus pour minimiser l&apos;impact
                  environnemental et favoriser le recyclage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-primary-green text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Restez informé
            </h2>
            <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
              Recevez nos dernières nouveautés, offres exclusives et conseils
              pour une alimentation saine et responsable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-gold"
              />
              <Button variant="secondary" size="lg">
                S&apos;abonner
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
