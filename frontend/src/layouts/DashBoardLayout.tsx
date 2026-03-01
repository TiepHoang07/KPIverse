import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#ebf3fc]">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 pt-16 lg:pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
