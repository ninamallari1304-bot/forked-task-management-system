import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!localStorage.getItem('token')) {
                setLoading(false);
                return;
            }
            try {
                const [p, t] = await Promise.all([
                    api('/api/projects'),
                    api('/api/tasks'),
                ]);
                setProjects(p);
                setTasks(t);
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAddProject = async (newProject) => {
        try {
            const saved = await api('/api/projects', {
                method: 'POST',
                body: JSON.stringify(newProject),
            });
            setProjects(prev => [...prev, saved]);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddTask = async (newTask) => {
        try {
            const saved = await api('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(newTask),
            });
            setTasks(prev => [...prev, saved]);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateTask = async (updatedTask) => {
        try {
            const saved = await api(`/api/tasks/${updatedTask.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedTask),
            });
            setTasks(prev => prev.map(t => (t.id === saved.id ? saved : t)));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await api(`/api/tasks/${taskId}`, { method: 'DELETE' });
            setTasks(prev => prev.filter(task => task.id !== taskId));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteProject = async (projectId) => {
        const project = projects.find(item => item.id === projectId);
        if (!project) return;

        try {
            await api(`/api/projects/${projectId}`, { method: 'DELETE' });
            setProjects(prev => prev.filter(item => item.id !== projectId));
            setTasks(prev => prev.filter(task => task.project !== project.name));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <DataContext.Provider value={{ 
            projects, handleAddProject, 
            tasks, handleAddTask, handleUpdateTask, handleDeleteTask, handleDeleteProject,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};