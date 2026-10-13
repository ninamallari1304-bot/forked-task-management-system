import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import CalendarView from './pages/Calendar';
import Settings from './pages/Settings';
import ResetPassword from './pages/ResetPassword';

import { DataProvider } from './context/DataContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoutes() {
  return localStorage.getItem('isLoggedIn') === 'true' ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/projects/:projectId" element={<Projects />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}