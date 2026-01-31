
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoCard } from '../components/VideoCard';
import { Exercise } from '../types';
import { MOCK_DATA } from './ExerciseListView';

const ExerciseGroupView: React.FC = () => {
  const { groupName } = useParams<{ groupName: string }>();
  const decodedGroupName = decodeURIComponent(groupName || '');
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle Telegram BackButton
    const tg = window.Telegram?.WebApp;
    const handleBack = () => navigate('/');
    
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    }

    const loadData = async () => {
      try {
        const response = await fetch('/api/exercises');
        let allData: Exercise[] = [];
        if (response.ok) {
          allData = await response.json();
          if (allData.length === 0) allData = MOCK_DATA;
        } else {
          allData = MOCK_DATA;
        }
        setExercises(allData.filter(ex => ex.muscle_group === decodedGroupName));
      } catch (err) {
        setExercises(MOCK_DATA.filter(ex => ex.muscle_group === decodedGroupName));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (tg?.BackButton) {
        tg.BackButton.offClick(handleBack);
        // We don't hide yet in case we're going to detail view
      }
    };
  }, [decodedGroupName, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-end pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">{decodedGroupName}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">{exercises.length} Workouts found</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-1"
        >
          Change Group
        </button>
      </header>

      <div className="grid gap-6">
        {exercises.map(exercise => (
          <VideoCard key={exercise.id} exercise={exercise} />
        ))}
        {exercises.length === 0 && (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
             </div>
             <p className="text-zinc-500 font-medium italic text-sm">No exercises found for this group.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseGroupView;
