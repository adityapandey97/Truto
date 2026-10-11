import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { MobileSidebar } from './MobileSidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { GlobalSearchModal } from './GlobalSearchModal.jsx';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-codepilot-bg flex text-codepilot-text antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <GlobalSearchModal />
    </div>
  );
}
