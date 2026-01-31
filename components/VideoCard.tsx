
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise } from '../types';

interface VideoCardProps {
  exercise: Exercise;
  onComplete?: (id: number) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ exercise, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/exercise/${exercise.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all active:scale-[0.98] cursor-pointer"
    >
      <div className="relative aspect-video bg-zinc-200 dark:bg-zinc-800">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <video
          ref={videoRef}
          src={exercise.video_url}
          poster={exercise.thumbnail_url}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          playsInline
          muted
          loop
          onLoadedData={() => setIsLoading(false)}
        />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 translate-x-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{exercise.name}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            exercise.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
            exercise.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
            'bg-rose-100 text-rose-700'
          }`}>
            {exercise.difficulty}
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 line-clamp-1">
          {exercise.description}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {exercise.muscle_group}
          </span>
        </div>
      </div>
    </div>
  );
};
