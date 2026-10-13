import { useState } from 'react';
import { Home, Folder, ClipboardList, CalendarDays, Settings, LogOut, ChevronUp, ChevronDown, Plus, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import CreateProjectModal from './CreateProjectModal';
import moodleLogo from '../assets/moodle-logo.png';

export default function Sidebar({ isMobileMenuOpen, onMobileMenuClose }) {
    const location = useLocation();
    const navigate = useNavigate();

    // Pull global projects and the add function from Context
    const { projects, handleAddProject, clearData } = useData();

    const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    // Map the global themes to the Sidebar's specific lightweight styling
    const sidebarThemes = {
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        rose: { bg: 'bg-rose-100', text: 'text-rose-500' },
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    };

    const navItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Projects', icon: Folder, path: '/projects' },
        { name: 'Tasks', icon: ClipboardList, path: '/tasks' },
        { name: 'Calendar', icon: CalendarDays, path: '/calendar' },
    ];

    const confirmLogout = () => {
        // Logging out clears only local session information; MongoDB data remains intact.
        ['token', 'isLoggedIn', 'userName', 'userEmail'].forEach((key) =>
            localStorage.removeItem(key)
        );
        clearData();
        navigate('/', { replace: true });
    };

    const onCreateProject = async (newProject) => {
        const savedProject = await handleAddProject(newProject);
        if (!savedProject) return null;

        setIsCreateProjectModalOpen(false);
        if (!isProjectsExpanded) setIsProjectsExpanded(true);
        navigate(`/projects/${savedProject.id}`);
        return savedProject;
    };

    return (
        <>
            {isMobileMenuOpen && (
                <button
                    onClick={onMobileMenuClose}
                    className="md:hidden fixed inset-0 z-40 bg-slate-900/30"
                    aria-label="Close navigation menu"
                />
            )}

            <aside className={`w-64 border-r border-slate-200 h-screen fixed md:sticky top-0 left-0 z-50 flex flex-col bg-white md:bg-slate-50/95 shrink-0 transition-transform duration-200 ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                <div className="flex items-center justify-center p-6 md:p-8 pb-6">
                <Link to="/dashboard" onClick={onMobileMenuClose} aria-label="Go to Dashboard">
                    <img
                        src={moodleLogo}
                        alt="Moodle"
                        className="h-auto w-36 object-contain"
                    />
                </Link>
                    <button
                        onClick={onMobileMenuClose}
                        className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        aria-label="Close navigation menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 px-2 md:px-4 overflow-y-auto custom-scrollbar">
                    <div className="md:mb-8">
                        <p className="px-4 text-xs font-medium text-slate-400 mb-3">Essentials</p>
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.name === 'Projects' && location.pathname.includes('/projects/'));
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            isActive 
                                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                                        }`}
                                    >
                                        <item.icon className="w-[18px] h-[18px]" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-between px-4 mb-3">
                            <div 
                                className="flex items-center gap-2 text-slate-400 text-xs font-medium cursor-pointer hover:text-slate-600 select-none transition-colors"
                                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                            >
                                {isProjectsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                <p>Projects</p>
                            </div>
                            <button 
                                onClick={() => setIsCreateProjectModalOpen(true)}
                                className="hover:bg-slate-200 p-1 rounded-md transition-colors"
                                title="Create new project"
                            >
                                <Plus className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        </div>
                        
                        {isProjectsExpanded && (
                            <nav className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                                {projects.map((project) => {
                                    const theme = sidebarThemes[project.theme] || sidebarThemes.emerald;
                                    const isActive = location.pathname === `/projects/${project.id}`;
                                    
                                    return (
                                        <Link 
                                            key={project.id} 
                                            to={`/projects/${project.id}`} 
                                            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded ${theme.bg} ${theme.text} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                                                {project.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="truncate">{project.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200">
                    <p className="px-4 text-xs font-medium text-slate-400 mb-3">General</p>
                    <nav className="space-y-1">
                        <Link
                            to="/settings"
                            onClick={onMobileMenuClose}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                location.pathname === '/settings'
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                            }`}
                        >
                            <Settings className="w-[18px] h-[18px]" />
                            Settings
                        </Link>
                        <button 
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                            <LogOut className="w-[18px] h-[18px]" />
                            Logout
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Create Project Modal */}
            {isCreateProjectModalOpen && (
                <CreateProjectModal 
                    onClose={() => setIsCreateProjectModalOpen(false)} 
                    onCreateProject={onCreateProject} 
                />
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Confirm Logout</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to log out of your account?</p>
                        
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}