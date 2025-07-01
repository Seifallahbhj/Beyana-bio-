import React from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Button } from "../../components/ui";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Commandes
  {
    category: "commandes",
    question: "Comment passer une commande ?",
    answer:
      "Naviguez dans notre catalogue, ajoutez les produits souhaités à votre panier, puis suivez le processus de commande en 3 étapes : informations de livraison, paiement et confirmation.",
  },
  {
    category: "commandes",
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, et les virements bancaires. Tous les paiements sont sécurisés par Stripe.",
  },
  {
    category: "commandes",
    question: "Comment modifier ou annuler une commande ?",
    answer:
      "Vous pouvez modifier votre commande dans les 2 heures suivant sa validation. Pour annuler, contactez notre service client au plus vite. Une fois expédiée, la commande ne peut plus être modifiée.",
  },
  {
    category: "commandes",
    question: "Comment suivre ma commande ?",
    answer:
      "Connectez-vous à votre compte et consultez la section 'Mes commandes'. Vous recevrez également des emails de suivi à chaque étape de votre commande.",
  },

  // Livraison
  {
    category: "livraison",
    question: "Quels sont les délais de livraison ?",
    answer:
      "Nos délais de livraison varient entre 2-5 jours ouvrés selon votre localisation. La livraison est gratuite à partir de 50€ d'achat, sinon 5.90€.",
  },
  {
    category: "livraison",
    question: "Livrez-vous dans toute la France ?",
    answer:
      "Oui, nous livrons dans toute la France métropolitaine. Pour les DOM-TOM et l'international, contactez-nous pour connaître les conditions spécifiques.",
  },
  {
    category: "livraison",
    question: "Que faire si je ne suis pas présent lors de la livraison ?",
    answer:
      "Le livreur tentera une nouvelle livraison le lendemain. Si vous êtes absent, un avis de passage sera déposé avec les instructions pour récupérer votre colis.",
  },

  // Retours
  {
    category: "retours",
    question: "Comment retourner un produit ?",
    answer:
      "Vous disposez de 14 jours pour retourner un produit non ouvert dans son emballage d'origine. Contactez notre service client pour initier le retour et obtenir un bon de retour.",
  },
  {
    category: "retours",
    question: "Quels produits peuvent être retournés ?",
    answer:
      "Tous nos produits peuvent être retournés sauf les produits frais et périssables. Les produits d'hygiène personnelle ne peuvent être retournés que s'ils sont dans leur emballage d'origine.",
  },
  {
    category: "retours",
    question: "Combien de temps pour être remboursé ?",
    answer:
      "Le remboursement est effectué sous 5-10 jours ouvrés après réception et validation du retour. Il sera crédité sur le moyen de paiement utilisé lors de la commande.",
  },

  // Compte
  {
    category: "compte",
    question: "Comment créer un compte ?",
    answer:
      "Cliquez sur 'Se connecter' puis 'Créer un compte'. Remplissez le formulaire avec vos informations personnelles et validez votre email pour activer votre compte.",
  },
  {
    category: "compte",
    question: "J'ai oublié mon mot de passe, que faire ?",
    answer:
      "Sur la page de connexion, cliquez sur 'Mot de passe oublié' et saisissez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe.",
  },
  {
    category: "compte",
    question: "Comment modifier mes informations personnelles ?",
    answer:
      "Connectez-vous à votre compte, allez dans 'Mon profil' et cliquez sur 'Modifier'. Vous pouvez alors mettre à jour vos informations personnelles et adresses.",
  },

  // Produits
  {
    category: "produits",
    question: "Tous vos produits sont-ils biologiques ?",
    answer:
      "Oui, tous nos produits sont certifiés biologiques. Nous travaillons uniquement avec des producteurs certifiés par des organismes reconnus (AB, Ecocert, etc.).",
  },
  {
    category: "produits",
    question: "Proposez-vous des produits sans gluten ?",
    answer:
      "Oui, nous proposons une large gamme de produits sans gluten, clairement identifiés sur notre site avec des filtres dédiés et des mentions spécifiques sur chaque produit.",
  },
  {
    category: "produits",
    question: "Comment sont sélectionnés vos producteurs ?",
    answer:
      "Nous sélectionnons rigoureusement nos producteurs en privilégiant les circuits courts, les pratiques agricoles durables et la qualité des produits. Chaque producteur est visité régulièrement.",
  },
  {
    category: "produits",
    question: "Quelle est la durée de conservation de vos produits ?",
    answer:
      "La durée de conservation varie selon les produits. Elle est indiquée sur chaque emballage. Nos produits frais sont livrés dans les 24-48h suivant la récolte.",
  },
];

const categories = [
  { id: "commandes", name: "Commandes", icon: "🛒" },
  { id: "livraison", name: "Livraison", icon: "🚚" },
  { id: "retours", name: "Retours", icon: "↩️" },
  { id: "compte", name: "Compte", icon: "👤" },
  { id: "produits", name: "Produits", icon: "🌱" },
];

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-green to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Centre d&apos;aide</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Trouvez rapidement des réponses à vos questions et découvrez
                comment tirer le meilleur parti de BEYANA.
              </p>
            </div>
          </div>
        </section>

        {/* Recherche rapide */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recherche rapide
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tapez votre question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-green">
                  🔍
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Catégories d'aide */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Par où commencer ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choisissez une catégorie pour trouver les réponses à vos
                questions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {faqData.filter(faq => faq.category === category.id).length}{" "}
                    questions
                  </p>
                </div>
              ))}
            </div>

            {/* FAQ par catégorie */}
            {categories.map(category => (
              <div key={category.id} className="mb-16">
                <div className="flex items-center mb-8">
                  <span className="text-3xl mr-4">{category.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {category.name}
                  </h3>
                </div>

                <div className="space-y-6">
                  {faqData
                    .filter(faq => faq.category === category.id)
                    .map((faq, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border p-6"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          {faq.question}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Guides d'utilisation */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Guides d&apos;utilisation
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des tutoriels détaillés pour vous accompagner dans
                l&apos;utilisation de BEYANA.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Première commande",
                  description:
                    "Guide complet pour passer votre première commande sur BEYANA.",
                  icon: "🎯",
                  duration: "5 min",
                },
                {
                  title: "Gérer mon compte",
                  description:
                    "Apprenez à gérer vos informations personnelles et préférences.",
                  icon: "⚙️",
                  duration: "3 min",
                },
                {
                  title: "Suivre mes commandes",
                  description:
                    "Découvrez comment suivre l&apos;état de vos commandes en temps réel.",
                  icon: "📊",
                  duration: "2 min",
                },
                {
                  title: "Retourner un produit",
                  description: "Procédure complète pour retourner un produit.",
                  icon: "🔄",
                  duration: "4 min",
                },
                {
                  title: "Paiements sécurisés",
                  description:
                    "Tout savoir sur nos méthodes de paiement et la sécurité.",
                  icon: "🔒",
                  duration: "3 min",
                },
                {
                  title: "Programme fidélité",
                  description:
                    "Comment gagner et utiliser vos points fidélité.",
                  icon: "⭐",
                  duration: "2 min",
                },
              ].map((guide, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="text-3xl mb-4">{guide.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      ⏱️ {guide.duration}
                    </span>
                    <Button variant="ghost" size="sm">
                      Lire le guide →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact support */}
        <section className="py-16 bg-primary-green">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Besoin d&apos;aide supplémentaire ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Notre équipe support est disponible pour vous accompagner et
              répondre à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Contacter le support
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-primary-green"
              >
                Chat en ligne
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
