import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useSidebar } from '../../hooks/useSidebar';

export function Layout() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="app-container">
      <Sidebar />
      <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
