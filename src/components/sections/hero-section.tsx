"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const slides = [
{
  src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/Black_and_White_Modern_Grunge_Plastic_Texture_Streetwear_Landscape_Banner-2.png?",
  alt: "Hero banner for 'Premium Polo' shirts with a dark grunge texture, featuring models and bold text."
},
{
  src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/Black_and_White_Modern_Grunge_Plastic_Texture_Streetwear_Landscape_Banner-2.png?",
  alt: "Hero banner for 'Premium Polo' shirts with a dark grunge texture, featuring models and bold text."
},
{
  src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/8eef21f3-4a52-4ae0-bfcf-d495c2edc784-trendifymartclothing-com/assets/images/Black_and_White_Modern_Grunge_Plastic_Texture_Streetwear_Landscape_Banner-2.png?",
  alt: "Hero banner for 'Premium Polo' shirts with a dark grunge texture, featuring models and bold text."
}];


const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(nextSlide, 3000);
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, nextSlide]);

  return (
    <section className="relative w-full h-[50vh] md:h-[65vh] lg:h-[calc(100vh-80px)] max-h-[900px] bg-black overflow-hidden" aria-roledescription="carousel" aria-label="Image promotions">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}>

        {slides.map((slide, index) =>
        <div key={index} className="relative w-full h-full flex-shrink-0" aria-roledescription="slide">
            <Image
            src={slide.src}
            alt={slide.alt}
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            priority={index === 0} />

            {/* Hero Overlay Content */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center text-white max-w-4xl px-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 tracking-tight">
                  PREMIUM <span className="text-orange-500">POLO</span> COLLECTION
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl mb-4 tracking-wide opacity-90">
                  Elevate your style with our premium quality polo shirts
                </p>
                <p className="text-sm md:text-base lg:text-lg mb-8 font-light tracking-widest opacity-80">
                  COMFORT • STYLE • QUALITY
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/products"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold tracking-wider transition-all duration-300 transform hover:scale-105"
                  >
                    SHOP NOW
                  </Link>
                  <Link 
                    href="/collections"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-full font-semibold tracking-wider transition-all duration-300"
                  >
                    VIEW COLLECTIONS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-3 md:space-x-4 z-20">
        <button
          onClick={prevSlide}
          className="text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Previous slide">

          <ChevronLeft size={24} />
        </button>

        <div className="flex items-center space-x-2">
          {slides.map((_, slideIndex) =>
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className="p-0 m-0 w-2.5 h-2.5 rounded-full ring-1 ring-offset-2 ring-offset-black/20 ring-transparent focus:ring-white transition-all"
            aria-label={`Go to slide ${slideIndex + 1}`}>

              <span className={`block w-full h-full rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-transparent border border-white'}`}></span>
            </button>
          )}
        </div>

        <button
          onClick={nextSlide}
          className="text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Next slide">

          <ChevronRight size={24} />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}>

          {isPlaying ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white" />}
        </button>
      </div>
    </section>);

};

export default HeroSection;