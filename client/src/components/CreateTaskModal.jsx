import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function CreateTaskModal({
    onClose,
    onAddTask,
    initialStatus = 'Not Started',
    initialProject
}) {
    const { projects } = useData();
    
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: initialStatus,
        project: initialProject || (projects.length > 0 ? projects[0].name : 'General'),
        startDate: today,
        dueDate: '',
        priority: 'Low',
        category: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const tags = formData.category.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        const newTask = {
            name: formData.name,
            description: formData.description,
            status: formData.status,
            project: formData.project,
            startDate: formData.startDate,
            dueDate: formData.dueDate,
            priority: formData.priority,
            tags: tags.length > 0 ? tags : ['General']
        };

        setSaving(true);
        try {
            const savedTask = await onAddTask(newTask);
            if (savedTask) onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-6 relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Create New Task</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Task Name</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Finalize layout" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Add details..." rows="2" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm resize-none"></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm bg-white">
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
                            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm bg-white">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project</label>
                            <select name="project" value={formData.project} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm bg-white">
                                {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
                            <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Due Date</label>
                            <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category Tags (comma separated)</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Design, Frontend" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-emerald-400 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-60">{saving ? 'Saving...' : 'Create Task'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}