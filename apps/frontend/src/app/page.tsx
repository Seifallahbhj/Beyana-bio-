"use client";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import FeaturedProductsSection from "../components/features/FeaturedProductsSection";
import { Card } from "../components/ui";
import RobustImage from "../components/ui/RobustImage";
import Link from "next/link";

const categories = [
  {
    name: "Fruits & Légumes",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop",
    href: "/categories",
  },
  {
    name: "Céréales & Grains",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
    href: "/categories",
  },
  {
    name: "Huiles & Vinaigres",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=200&fit=crop",
    href: "/categories",
  },
  {
    name: "Épices & Condiments",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
    href: "/categories",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-r from-primary-green to-secondary-green text-white">
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-5xl font-display font-bold mb-6">
              Bienvenue sur <span className="text-accent-gold">Beyana</span>
            </h1>
            <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
              Le meilleur du bio, local et responsable, livré chez vous.
              Découvrez nos produits naturels, sains et savoureux.
            </p>
            <Link href="/products">
              <span className="inline-block px-8 py-4 bg-accent-gold text-primary-green font-bold rounded-lg shadow hover:bg-yellow-400 transition">
                Voir la boutique
              </span>
            </Link>
          </div>
        </section>

        {/* Catégories phares */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
              Nos catégories phares
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(cat => (
                <Link key={cat.name} href={cat.href}>
                  <Card hover className="overflow-hidden cursor-pointer">
                    <div className="relative h-48">
                      <RobustImage
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                        fallbackType="svg"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          {cat.name}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Produits vedettes */}
        <FeaturedProductsSection />

        {/* Valeurs */}
        <section className="py-16 bg-neutral-cream">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
              Nos valeurs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Bio & Naturel
                </h3>
                <p className="text-gray-600">
                  Des produits issus de l&apos;agriculture biologique, sans
                  pesticides ni OGM.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Local & Responsable
                </h3>
                <p className="text-gray-600">
                  Soutien aux producteurs locaux et circuits courts pour une
                  planète préservée.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">♻️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Engagement durable
                </h3>
                <p className="text-gray-600">
                  Emballages éco-conçus et démarche zéro déchet pour un avenir
                  meilleur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
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
              <button className="px-6 py-3 bg-accent-gold text-primary-green font-bold rounded-lg hover:bg-yellow-400 transition">
                S&apos;abonner
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
