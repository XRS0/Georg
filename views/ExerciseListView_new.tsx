
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise, Difficulty } from '../types';

// Centralized mock data with stable high-quality sample videos
export const MOCK_DATA: Exercise[] = [
  {
    id: 1,
    name: "Classic Pushups",
    muscle_group: "Chest",
    difficulty: Difficulty.BEGINNER,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
    description: "Build upper body strength with controlled pushups. Keep your core tight and elbows at a 45-degree angle."
  },
  {
    id: 2,
    name: "Diamond Pushups",
    muscle_group: "Triceps",
    difficulty: Difficulty.ADVANCED,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?q=80&w=800&auto=format&fit=crop",
    description: "Focus on your triceps with a narrow grip. Form a diamond shape with your hands on the floor."
  },
  {
    id: 3,
    name: "Air Squats",
    muscle_group: "Legs",
    difficulty: Difficulty.BEGINNER,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=800&auto=format&fit=crop",
    description: "Fundamental lower-body movement for strength. Keep your chest up and weight on your heels."
  },
  {
    id: 4,
    name: "Reverse Lunges",
    muscle_group: "Legs",
    difficulty: Difficulty.INTERMEDIATE,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=800&auto=format&fit=crop",
    description: "Improve balance and quad strength. Step back and lower your knee until it's just above the ground."
  },
  {
    id: 5,
    name: "Tricep Dips",
    muscle_group: "Triceps",
    difficulty: Difficulty.BEGINNER,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?q=80&w=800&auto=format&fit=crop",
    description: "Target the back of your arms using a bench or chair. Keep your back close to the support."
  },
  {
    id: 6,
    name: "Wide Pushups",
    muscle_group: "Chest",
    difficulty: Difficulty.INTERMEDIATE,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1598971639058-aba7c12808ee?q=80&w=800&auto=format&fit=crop",
    description: "Engage your outer chest with a wider hand placement. Spread your hands wider than shoulder width."
  }
];

const ExerciseListView: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (response.ok) {
          const data = await response.json();
          setExercises(data.length > 0 ? data : MOCK_DATA);
        } else {
          setExercises(MOCK_DATA);
        }
      } catch (err) {
        setExercises(MOCK_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, []);

  // Group calculations
  const groups = Array.from(new Set(exercises.map(ex => ex.muscle_group))).sort();
  const groupCounts = exercises.reduce((acc, ex) => {
    acc[ex.muscle_group] = (acc[ex.muscle_group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleGroupClick = (group: string) => {
    navigate(`/group/${encodeURIComponent(group)}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <header className="pt-4">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-1 tracking-tight">Muscle Groups</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium italic">Choose your focus for today's session</p>
      </header>

      <div className="grid gap-4">
        {groups.map((group, idx) => (
          <button
            key={group}
            onClick={() => handleGroupClick(group)}
            className={`group relative w-full p-6 rounded-3xl text-left transition-all active:scale-[0.97] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm
              ${idx % 3 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                idx % 3 === 1 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 
                'bg-gradient-to-br from-zinc-800 to-zinc-900'}
            `}
          >
            {/* Subtle Pattern Overlay */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8H2z"/><path d="M10 2v4"/><path d="M10 18v4"/></svg>
            </div>

            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{group}</h2>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">
                  {groupCounts[group]} {groupCounts[group] === 1 ? 'Exercise' : 'Exercises'} Available
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExerciseListView;
