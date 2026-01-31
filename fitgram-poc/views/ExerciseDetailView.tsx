
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Exercise, Difficulty } from '../types';
import { MOCK_DATA } from './ExerciseListView';

const ExerciseDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Integrate Telegram BackButton
    const tg = window.Telegram?.WebApp;
    
    // Determine back destination
    const handleBack = () => {
      if (exercise) {
        navigate(`/group/${encodeURIComponent(exercise.muscle_group)}`);
      } else {
        navigate('/');
      }
    };

    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    }

    const loadExercise = async () => {
      setIsLoading(true);
      try {
        const initData = tg?.initData || '';
        const response = await fetch(`/api/exercises/${id}`, {
          headers: { 'X-TG-Init-Data': initData }
        });

        if (response.ok) {
          const data = await response.json();
          setExercise(data);
        } else {
          const found = MOCK_DATA.find(ex => ex.id === Number(id));
          if (found) setExercise(found);
        }
      } catch (err) {
        const found = MOCK_DATA.find(ex => ex.id === Number(id));
        if (found) setExercise(found);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercise();

    return () => {
      if (tg?.BackButton) {
        tg.BackButton.offClick(handleBack);
      }
    };
  }, [id, navigate, exercise]);

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      if (exercise) {
        navigate(`/group/${encodeURIComponent(exercise.muscle_group)}`);
      } else {
        navigate('/');
      }
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Exercise not found</h2>
        <button onClick={() => navigate('/')} className="text-blue-500 font-bold uppercase tracking-widest text-sm">Back to Library</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-32">
      {/* Video Header */}
      <div className="relative aspect-video bg-black sticky top-0 z-10 shadow-lg">
        <video 
          src={exercise.video_url} 
          className="w-full h-full object-contain"
          controls 
          autoPlay 
          playsInline
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 relative -mt-4 bg-zinc-50 dark:bg-zinc-950 rounded-t-3xl z-20 shadow-2xl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter leading-none">{exercise.name}</h1>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            exercise.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
            exercise.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
            'bg-rose-100 text-rose-700'
          }`}>
            {exercise.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest">
          <div className="w-4 h-4 rounded-sm bg-blue-500 flex items-center justify-center text-[8px] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8H2z"/><path d="M10 2v4"/><path d="M10 18v4"/></svg>
          </div>
          {exercise.muscle_group}
        </div>

        <div className="space-y-3 pb-4">
          <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tighter italic">Instructions</h3>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm font-medium">
            {exercise.description}
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 left-4 right-4 z-50">
        <button 
          onClick={handleComplete}
          disabled={isCompleted}
          className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tighter ${
            isCompleted 
              ? 'bg-emerald-500 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'
          }`}
        >
          {isCompleted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Workout Recorded
            </>
          ) : (
            <>
              Mark as Complete
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExerciseDetailView;
