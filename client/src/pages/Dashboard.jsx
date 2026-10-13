import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

import Sidebar from '../components/Sidebar';
import AppNavbar from '../components/AppNavbar';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import KanbanView from '../components/KanbanView';
import ListView from '../components/ListView';
import { 
    FileText, ListTodo, CheckSquare, ChevronRight, Kanban, List, Filter, ArrowUpDown, Search, X, Check
} from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('User');
    const [userEmail, setUserEmail] = useState('');
    const [viewMode, setViewMode] = useState('kanban'); 
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createModalInitialStatus, setCreateModalInitialStatus] = useState('Not Started');

    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const { tasks, projects, handleAddTask, handleUpdateTask, handleDeleteTask } = useData();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [sortOption, setSortOption] = useState('default');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [filterProject, setFilterProject] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) {
            const firstName = storedName.split(' ')[0];
            setUserName(firstName);
        }
        setUserEmail(localStorage.getItem('userEmail') || '');
    }, []);

    let processedTasks = tasks.filter(task => 
        filterProject === 'All' ? true : task.project === filterProject
    );

    if (searchQuery.trim() !== '') {
        const lowerQuery = searchQuery.toLowerCase();
        processedTasks = processedTasks.filter(task => 
            task.name.toLowerCase().includes(lowerQuery) || 
            task.description.toLowerCase().includes(lowerQuery) ||
            task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    processedTasks.sort((a, b) => {
        if (sortOption === 'date-asc') return new Date(a.dueDate) - new Date(b.dueDate);
        else if (sortOption === 'date-desc') return new Date(b.dueDate) - new Date(a.dueDate);
        else if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
        return 0; 
    });

    const uniqueProjects = ['All', ...new Set(tasks.map(t => t.project))];

    // Opens Task Details Modal
    const activeTask = tasks.find(t => t.id === selectedTaskId);

    const handleTaskClick = (task) => {
        setSelectedTaskId(task.id);
    };

    const StatCard = ({ icon: Icon, value, label, onClick }) => (
        <div 
            onClick={onClick}
            className="border border-slate-200 rounded-2xl relative group hover:border-emerald-300 hover:shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer bg-white flex p-6 flex-col"
        >
            <div className="flex justify-between items-start w-full mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <button className="text-xs font-medium text-slate-400 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-3xl mb-1">{value}</h3>
                <p className="text-slate-400 font-medium text-xs">{label}</p>
            </div>
        </div>
    );

    const projectBreakdown = Object.values(
        tasks.reduce((acc, task) => {
            if (!acc[task.project]) {
                let colorClass = 'bg-emerald-400';
                if (task.project === 'Capstone 2') colorClass = 'bg-yellow-400';
                if (task.project.includes('Advanced Web')) colorClass = 'bg-rose-400';
                acc[task.project] = { name: task.project, total: 0, completed: 0, color: colorClass };
            }
            acc[task.project].total += 1;
            if (task.status === 'Completed') acc[task.project].completed += 1;
            return acc;
        }, {})
    ).map(project => ({ ...project, percentage: Math.round((project.completed / project.total) * 100) }));

    const overallPercentage = tasks.length > 0 
        ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) 
        : 0;

    return (
        <div className="flex min-h-screen bg-slate-50/50 font-sans">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} onMobileMenuClose={() => setIsMobileMenuOpen(false)} />
            
            <main className="flex-1 flex flex-col h-screen min-h-0 overflow-hidden">
                <AppNavbar
                    title="Dashboard"
                    breadcrumbs={[{ label: 'Home', to: '/dashboard' }]}
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                >
                    <button 
                        onClick={() => { setCreateModalInitialStatus('Not Started'); setIsCreateModalOpen(true); }}
                        className="bg-emerald-400 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span className="text-lg leading-none">+</span> Create Task
                    </button>
                </AppNavbar>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative pb-10">
                    
                    <div className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 mb-6">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome back, {userName}!</h1>
                        <p className="text-sm text-slate-500 max-w-6xl">
                            Here is an overview of your active projects and tasks. Click any task card to view its full details.
                        </p>
                    </div>

                    <div className="px-4 sm:px-6 lg:px-10 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <StatCard icon={FileText} value={projects.length} label="Active Projects" onClick={() => navigate('/projects')} />
                            <StatCard icon={ListTodo} value={tasks.length} label="Number of Tasks" onClick={() => navigate('/tasks')} />
                            <StatCard icon={CheckSquare} value={`${overallPercentage}%`} label="Target Completed" onClick={() => setIsDetailsModalOpen(true)} />
                        </div>
                    </div>

                    <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 sm:px-6 lg:px-10 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex p-1 bg-slate-200/50 rounded-lg">
                                <button 
                                    onClick={() => setViewMode('kanban')}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        viewMode === 'kanban' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Kanban className="w-4 h-4" /> Kanban
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <List className="w-4 h-4" /> List
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2 text-slate-500">
                                <div className="relative">
                                    <button 
                                        onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}
                                        className={`p-2 rounded-lg transition-colors ${filterProject !== 'All' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-200/50'}`}
                                    >
                                        <Filter className="w-4 h-4" />
                                    </button>
                                    {isFilterOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                                            <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">Filter by Project</p>
                                            {uniqueProjects.map(project => (
                                                <button
                                                    key={project}
                                                    onClick={() => { setFilterProject(project); setIsFilterOpen(false); }}
                                                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                                                >
                                                    <span className={`truncate ${filterProject === project ? 'font-medium text-emerald-600' : 'text-slate-600'}`}>{project}</span>
                                                    {filterProject === project && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button 
                                        onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }}
                                        className={`p-2 rounded-lg transition-colors ${sortOption !== 'default' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-200/50'}`}
                                    >
                                        <ArrowUpDown className="w-4 h-4" />
                                    </button>
                                    {isSortOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                                            <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">Sort Tasks</p>
                                            {[
                                                { id: 'default', label: 'Default Order' },
                                                { id: 'date-asc', label: 'Due Date (Earliest)' },
                                                { id: 'date-desc', label: 'Due Date (Latest)' },
                                                { id: 'name-asc', label: 'Name (A-Z)' },
                                            ].map(option => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => { setSortOption(option.id); setIsSortOpen(false); }}
                                                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                                                >
                                                    <span className={`${sortOption === option.id ? 'font-medium text-emerald-600' : 'text-slate-600'}`}>{option.label}</span>
                                                    {sortOption === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center relative ml-1">
                                    {isSearchOpen && (
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Search tasks..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-48 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 animate-in slide-in-from-right-4 bg-white"
                                        />
                                    )}
                                    <button 
                                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                                        className={`p-2 rounded-lg transition-colors z-10 relative ${isSearchOpen || searchQuery ? 'bg-slate-200/80 text-slate-800' : 'hover:bg-slate-200/50'}`}
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 lg:px-10 mt-6">
                        {viewMode === 'kanban' ? (
                            <KanbanView 
                                tasks={processedTasks} 
                                onTaskClick={handleTaskClick} 
                                onCreateClick={(status) => { setCreateModalInitialStatus(status); setIsCreateModalOpen(true); }} 
                            />
                        ) : (
                            <ListView 
                                tasks={processedTasks} 
                                onTaskClick={handleTaskClick} 
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Render TaskDetailsModal if a task is selected */}
            {activeTask && (
                <TaskDetailsModal 
                    task={activeTask}
                    onClose={() => setSelectedTaskId(null)}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                />
            )}

            {isCreateModalOpen && (
                <CreateTaskModal 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onAddTask={handleAddTask}
                    initialStatus={createModalInitialStatus}
                />
            )}

            {isDetailsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-semibold text-slate-800 mb-8">Completion Breakdown</h3>
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                            {projectBreakdown.length > 0 ? (
                                projectBreakdown.map((project, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <span className="text-slate-700">{project.name}</span>
                                            <span className="text-slate-900">{project.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className={`${project.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${project.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">No active projects to display.</p>
                            )}
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-400 text-sm">Overall Target</span>
                                    <span className="text-slate-900 text-md font-bold">{overallPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}