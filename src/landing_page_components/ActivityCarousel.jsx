// src/ActivityCarousel.jsx
import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';

const ActivityCarousel = ({ interval = 3000 }) => {
  const [current, setCurrent] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('activities')
          .select('id, name, image_url')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, []);

  useEffect(() => {
    if (!activities.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activities.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, activities.length]);

  if (loading) {
    return <div className="w-full my-8 text-center text-slate-400">Loading activities...</div>;
  }
  if (!activities.length) {
    return <div className="w-full my-8 text-center text-slate-400">No activities found.</div>;
  }

  return (
    <div className="w-full my-8">
      <div className="w-full h-[340px] sm:h-[420px] md:h-[520px] lg:h-[620px] flex items-center justify-center bg-transparent overflow-hidden shadow-lg">
        <img
          src={activities[current].image_url}
          alt={activities[current].name}
          className="object-contain w-full h-full transition-all duration-700"
        />
      </div>
      <div className="flex mt-4 justify-center space-x-2">
        {activities.map((_, idx) => (
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
