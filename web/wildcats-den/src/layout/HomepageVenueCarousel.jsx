import React, { useState, useEffect } from "react";
import "./styles/HomepageVenueCarousel.css";

export default function HomepageVenueCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const nextSlide = () => {
    setCurrent((prev) =>
      prev + 1 >= images.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev - 1 < 0 ? images.length - 1 : prev - 1
    );
  };

  // Autoslide images every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer); 
  }, [current]);

  // 3 visible images shown
  const visibleImages = [
    images[current],
    images[(current + 1) % images.length],
    images[(current + 2) % images.length]
  ];

  return (
    <>
      {/* MAIN CAROUSEL (3 IMAGES) */}
      <div className="home-carousel-container">
        <button className="home-carousel-arrow" onClick={prevSlide}>‹</button>

        <div className="home-carousel-three">
          {visibleImages.map((img, index) => (
            <img
              key={index}
              src={img}
              className="home-carousel-item"
              onClick={() => {
                setCurrent((current + index) % images.length);
                setOpenModal(true);
              }}
              alt="Carousel"
            />
          ))}
        </div>

        <button className="home-carousel-arrow" onClick={nextSlide}>›</button>
      </div>

      {/* POPUP MODAL */}
      {openModal && (
        <div className="home-carousel-modal">
          <div
            className="home-modal-backdrop"
            onClick={() => setOpenModal(false)}
          />

          <div className="home-modal-content">
            <button className="home-modal-arrow" onClick={prevSlide}>‹</button>

            <img 
              src={images[current]} 
              alt="Enlarged" 
              className="home-modal-image" 
            />

            <button className="home-modal-arrow" onClick={nextSlide}>›</button>
          </div>
        </div>
      )}
    </>
  );
}
