import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 py-6 pt-16 lg:pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
