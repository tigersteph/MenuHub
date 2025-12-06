import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

/**
 * Section témoignages avec carousel
 * Structure prête, contenu à ajouter dans les traductions
 */
const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Données de témoignages - À remplacer par des données réelles depuis les traductions
  // Pour l'instant, structure vide prête à recevoir le contenu
  const testimonials = [
    // Exemple de structure :
    // {
    //   name: "Jean Dupont",
    //   establishment: "Le Gourmet",
    //   text: "MenuHub a transformé notre service...",
    //   rating: 5,
    //   image: "/img/testimonials/client-1.jpg"
    // }
  ];

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    // Auto-play du carousel seulement si on a des témoignages
    if (testimonials.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length, nextTestimonial]);

  // Si pas de témoignages, ne pas afficher la section (après les hooks)
  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Découvrez ce que nos clients disent de MenuHub
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-zinc-50 rounded-2xl p-8 md:p-12 shadow-lg">
            {/* Témoignage */}
            <div className="text-center">
              {/* Note étoiles */}
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(currentTestimonial.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#FF5A1F] text-[#FF5A1F]"
                  />
                ))}
              </div>

              {/* Texte */}
              <blockquote className="text-lg md:text-xl text-zinc-700 mb-6 italic">
                "{currentTestimonial.text}"
              </blockquote>

              {/* Auteur */}
              <div className="flex items-center justify-center gap-4">
                {currentTestimonial.image && (
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-[#FF5A1F]"
                  />
                )}
                <div className="text-left">
                  <div className="font-semibold text-zinc-900">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-sm text-zinc-600">
                    {currentTestimonial.establishment}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-white hover:bg-zinc-100 transition-colors shadow-md"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="h-5 w-5 text-zinc-700" />
              </button>

              {/* Indicateurs */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-[#FF5A1F]'
                        : 'w-2 bg-zinc-300'
                    }`}
                    aria-label={`Aller au témoignage ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-white hover:bg-zinc-100 transition-colors shadow-md"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="h-5 w-5 text-zinc-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

