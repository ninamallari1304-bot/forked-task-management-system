import { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function CreateProjectModal({ onClose, onCreateProject }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        theme: 'yellow'
    });

    const themes = [
        { id: 'yellow', name: 'Yellow', colorClass: 'bg-[#FBC02D]' },
        { id: 'rose', name: 'Rose', colorClass: 'bg-rose-500' },
        { id: 'emerald', name: 'Emerald', colorClass: 'bg-emerald-500' },
        { id: 'blue', name: 'Blue', colorClass: 'bg-blue-500' },
        { id: 'purple', name: 'Purple', colorClass: 'bg-purple-500' },
    ];

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) return;

        const newProject = {
            name: formData.name.trim(),
            description: formData.description.trim() || 'New workspace',
            theme: formData.theme
        };

        setSaving(true);
        try {
            const savedProject = await onCreateProject(newProject);
            if (savedProject) onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-6 relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Create New Project</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Name</label>
                        <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g., Thesis Chapter 1" 
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="What is this project about?" 
                            rows="2"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Folder Color</label>
                        <div className="flex gap-3">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, theme: theme.id})}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${theme.colorClass} ${formData.theme === theme.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                                >
                                    {formData.theme === theme.id && <Check className="w-4 h-4 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-400 hover:bg-emerald-500 rounded-lg transition-colors"
                        >
                            {saving ? 'Saving...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}