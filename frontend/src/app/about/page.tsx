import React from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Button } from "../../components/ui";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-green to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">À propos de BEYANA</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Votre partenaire de confiance pour une alimentation biologique
                de qualité, respectueuse de l&apos;environnement et de votre
                santé.
              </p>
            </div>
          </div>
        </section>

        {/* Notre Histoire */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Notre Histoire
                </h2>
                <p className="text-lg text-gray-600">
                  Découvrez comment BEYANA est devenu votre référence en
                  produits biologiques de qualité.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Une passion pour le bio
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Fondée en 2020, BEYANA est née de la conviction que chacun
                    mérite d&apos;avoir accès à des produits biologiques de
                    qualité, cultivés dans le respect de l&apos;environnement et
                    de la biodiversité.
                  </p>
                  <p className="text-gray-600">
                    Notre équipe passionnée travaille chaque jour pour
                    sélectionner les meilleurs producteurs locaux et
                    internationaux, garantissant des produits frais, savoureux
                    et nutritifs.
                  </p>
                </div>
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <span className="text-gray-500">Image de notre équipe</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nos Valeurs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nos Valeurs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des principes qui guident chacune de nos actions et décisions au
                quotidien.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Qualité
                </h3>
                <p className="text-gray-600">
                  Nous sélectionnons rigoureusement chaque produit pour garantir
                  une qualité exceptionnelle et des saveurs authentiques.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Durabilité
                </h3>
                <p className="text-gray-600">
                  Nous nous engageons pour un avenir plus vert en privilégiant
                  des pratiques agricoles respectueuses de l&apos;environnement.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Communauté
                </h3>
                <p className="text-gray-600">
                  Nous soutenons les producteurs locaux et créons des liens
                  durables avec notre communauté de clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Notre Équipe */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Notre Équipe
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une équipe passionnée et experte dédiée à votre satisfaction et
                à la promotion d&apos;une alimentation saine.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Marie Dubois",
                  role: "Fondatrice & CEO",
                  description:
                    "Passionnée d&apos;agriculture biologique depuis plus de 15 ans.",
                },
                {
                  name: "Thomas Martin",
                  role: "Directeur Commercial",
                  description:
                    "Expert en relations avec les producteurs locaux.",
                },
                {
                  name: "Sophie Bernard",
                  role: "Responsable Qualité",
                  description:
                    "Garantit l&apos;excellence de chaque produit sélectionné.",
                },
                {
                  name: "Lucas Petit",
                  role: "Chef de Projet",
                  description:
                    "Coordonne nos initiatives de développement durable.",
                },
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Photo</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-green font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary-green">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Rejoignez l&apos;aventure BEYANA
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Découvrez notre sélection de produits biologiques et commencez
              votre voyage vers une alimentation plus saine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Découvrir nos produits
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-primary-green"
              >
                Nous contacter
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
