import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        <main 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            collapsed ? 'md:pl-24' : 'md:pl-72'
          }`}
        >
          <div className="py-6 pt-20 md:pt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
