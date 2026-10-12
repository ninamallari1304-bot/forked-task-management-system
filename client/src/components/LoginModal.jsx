import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import moodleLogo from '../assets/moodle-logo.png';
import { api } from '../api';

export default function LoginModal({ onClose, switchToRegister, switchToForgotPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing again
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const data = await api('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('isLoggedIn', 'true');

            // Full reload so DataContext fetches this user's projects and tasks
            window.location.assign('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex justify-center mb-6">
                    <img
                        src={moodleLogo}
                        alt="Moodle"
                        className="h-auto w-36 object-contain"
                    />
                </div>

                <h2 className="text-2xl font-semibold text-center mb-2">Welcome Back</h2>
                <p className="text-center text-sm text-slate-500 mb-6">Log in to continue to Moodle</p>

                <form className="space-y-4" onSubmit={handleLogin}>
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 text-center">
                        {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@gmail.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 text-sm placeholder-slate-400"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700">Password</label>
                            <button type="button" onClick={switchToForgotPassword} className="text-xs text-slate-400 hover:text-blue-500">Forgot?</button>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 text-sm placeholder-slate-400 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
                        Log In
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account? <button onClick={switchToRegister} className="text-slate-800 font-semibold hover:underline">Sign Up</button>
                </p>
            </div>
        </div>
    );
}