"use client";

import React, { useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Button, Input } from "../../components/ui";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation d'envoi (à remplacer par l'API réelle)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-green to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Notre équipe est là pour vous accompagner et répondre à toutes
                vos questions sur nos produits biologiques.
              </p>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Informations de contact */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Informations de contact
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-green/10 rounded-full p-3">
                      <svg
                        className="w-6 h-6 text-primary-green"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Adresse
                      </h3>
                      <p className="text-gray-600">
                        123 Rue de la Nature
                        <br />
                        75001 Paris, France
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-green/10 rounded-full p-3">
                      <svg
                        className="w-6 h-6 text-primary-green"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Téléphone
                      </h3>
                      <p className="text-gray-600">
                        +33 1 23 45 67 89
                        <br />
                        Lun-Ven: 9h-18h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-green/10 rounded-full p-3">
                      <svg
                        className="w-6 h-6 text-primary-green"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Email
                      </h3>
                      <p className="text-gray-600">
                        contact@beyana.fr
                        <br />
                        support@beyana.fr
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-green/10 rounded-full p-3">
                      <svg
                        className="w-6 h-6 text-primary-green"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Horaires d&apos;ouverture
                      </h3>
                      <p className="text-gray-600">
                        Lundi - Vendredi: 9h00 - 18h00
                        <br />
                        Samedi: 10h00 - 16h00
                        <br />
                        Dimanche: Fermé
                      </p>
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Suivez-nous
                  </h3>
                  <div className="flex space-x-4">
                    {[
                      { name: "Facebook", icon: "📘" },
                      { name: "Instagram", icon: "📷" },
                      { name: "Twitter", icon: "🐦" },
                      { name: "LinkedIn", icon: "💼" },
                    ].map((social) => (
                      <button
                        key={social.name}
                        className="bg-gray-200 hover:bg-primary-green hover:text-white rounded-full p-3 transition-colors"
                        title={social.name}
                      >
                        <span className="text-lg">{social.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formulaire de contact */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Envoyez-nous un message
                </h2>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="text-green-600 text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Message envoyé !
                    </h3>
                    <p className="text-green-700 mb-4">
                      Merci pour votre message. Nous vous répondrons dans les
                      plus brefs délais.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Envoyer un autre message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Nom complet *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Votre nom"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Sujet *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Sujet de votre message"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
                        placeholder="Votre message..."
                      />
                    </div>

                    <Button type="submit" loading={loading} fullWidth size="lg">
                      {loading ? "Envoi en cours..." : "Envoyer le message"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions fréquentes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Trouvez rapidement des réponses aux questions les plus
                courantes.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question:
                    "Comment sont sélectionnés vos produits biologiques ?",
                  answer:
                    "Nous travaillons directement avec des producteurs certifiés bio, en privilégiant les circuits courts et les pratiques agricoles durables.",
                },
                {
                  question: "Quels sont les délais de livraison ?",
                  answer:
                    "Nos délais de livraison varient entre 2-5 jours ouvrés selon votre localisation. La livraison est gratuite à partir de 50€ d'achat.",
                },
                {
                  question: "Proposez-vous des produits sans gluten ?",
                  answer:
                    "Oui, nous proposons une large gamme de produits sans gluten, clairement identifiés sur notre site avec des filtres dédiés.",
                },
                {
                  question: "Comment puis-je retourner un produit ?",
                  answer:
                    "Vous disposez de 14 jours pour retourner un produit non ouvert dans son emballage d'origine. Contactez notre service client pour initier le retour.",
                },
              ].map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
