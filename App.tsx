
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import ExerciseListView from './views/ExerciseListView';
import ExerciseGroupView from './views/ExerciseGroupView';
import ExerciseDetailView from './views/ExerciseDetailView';
import ProfileView from './views/ProfileView';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading...</div>;

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ExerciseListView />} />
          <Route path="/group/:groupName" element={<ExerciseGroupView />} />
          <Route path="/exercise/:id" element={<ExerciseDetailView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-around z-50">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span className="text-[10px] font-bold">Groups</span>
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="text-[10px] font-bold">Profile</span>
          </NavLink>
        </nav>
      </Layout>
    </HashRouter>
  );
};

export default App;
