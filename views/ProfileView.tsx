
import React from 'react';

const ProfileView: React.FC = () => {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  // Mocked stats
  const stats = {
    workouts: 24,
    streak: 5,
    minutes: 480
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center py-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-500/20">
        <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden mb-4 bg-white/10 flex items-center justify-center text-3xl font-bold">
          {tgUser?.first_name?.[0] || 'U'}
        </div>
        <h2 className="text-xl font-bold">{tgUser?.first_name || 'Fitness Enthusiast'} {tgUser?.last_name || ''}</h2>
        <p className="text-blue-100 text-sm opacity-80">@{tgUser?.username || 'user'}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-2xl font-black text-blue-500">{stats.workouts}</p>
          <p className="text-[10px] uppercase font-bold text-zinc-400">Total Workouts</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-2xl font-black text-orange-500">{stats.streak}🔥</p>
          <p className="text-[10px] uppercase font-bold text-zinc-400">Day Streak</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-2xl font-black text-emerald-500">{stats.minutes}</p>
          <p className="text-[10px] uppercase font-bold text-zinc-400">Minutes</p>
        </div>
      </div>

      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
        <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">Personal Goals</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1 font-bold">
              <span className="text-zinc-600 dark:text-zinc-400 uppercase">Weekly Workouts</span>
              <span className="text-blue-500">4/5</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[80%] rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1 font-bold">
              <span className="text-zinc-600 dark:text-zinc-400 uppercase">Weight Goal</span>
              <span className="text-emerald-500">2kg Left</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[65%] rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <button className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors mt-4">
        Reset Statistics
      </button>
    </div>
  );
};

export default ProfileView;
