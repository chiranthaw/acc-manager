// src/ActivityCarousel.jsx
import React, { useState, useEffect } from 'react';

// Example images, replace with your own
import img1 from './images/activities/activity1.jpg';
import img2 from './images/activities/activity2.jpg';
import img3 from './images/activities/activity3.jpg';
import img4 from './images/activities/activity4.jpg';
import img5 from './images/activities/activity5.jpg';
import img6 from './images/activities/activity6.jpg';
import img7 from './images/activities/activity7.jpg';
import img8 from './images/activities/activity8.jpg';
import img9 from './images/activities/activity9.jpg';
import img10 from './images/activities/activity10.jpg';
import img11 from './images/activities/activity11.jpg';

const images = [
  { src: img1, alt: 'Activity 1' },
  { src: img2, alt: 'Activity 2' },
  { src: img3, alt: 'Activity 3' },
  { src: img4, alt: 'Activity 4' },
  { src: img5, alt: 'Activity 5' },
  { src: img6, alt: 'Activity 6' },
  { src: img7, alt: 'Activity 7' },
  { src: img8, alt: 'Activity 8' },
  { src: img9, alt: 'Activity 9' },
  { src: img10, alt: 'Activity 10' },
  { src: img11, alt: 'Activity 11' },
];

const ActivityCarousel = ({ interval = 3000 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className="w-full my-8">
      <div className="w-full h-[340px] sm:h-[420px] md:h-[520px] lg:h-[620px] flex items-center justify-center bg-transparent overflow-hidden shadow-lg">
        <img
          src={images[current].src}
          alt={images[current].alt}
          className="object-contain w-full h-full transition-all duration-700"
        />
      </div>
      <div className="flex mt-4 justify-center space-x-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${idx === current ? 'bg-green-600' : 'bg-gray-400'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ActivityCarousel;
