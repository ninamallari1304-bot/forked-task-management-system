import { X, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import moodleLogo from '../assets/moodle-logo.png';
import { api } from '../api';

export default function RegisterModal({ onClose, switchToLogin }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const { fullName, email, password, confirmPassword } = formData;

        // Basic validation
        if (!fullName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            await api('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name: fullName, email, password }),
            });
            setIsSuccess(true);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <CheckCircle className="w-16 h-16 text-emerald-400 mb-6 animate-in zoom-in duration-300" />
                        <h2 className="text-2xl font-semibold text-center text-slate-800 mb-2">
                            Account Created Successfully!
                        </h2>
                        <p className="text-center text-sm text-slate-500 mb-8">
                            You can now log in using your email and password.
                        </p>
                        <button
                            onClick={switchToLogin}
                            className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                            Proceed to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center mb-6">
                            <img
                                src={moodleLogo}
                                alt="Moodle"
                                className="h-auto w-36 object-contain"
                            />
                        </div>

                        <h2 className="text-2xl font-semibold text-center mb-2">Create an Account</h2>
                        <p className="text-center text-sm text-slate-500 mb-6">Start managing your tasks with Moodle</p>

                        <form className="space-y-4" onSubmit={handleRegister}>
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 text-center animate-in fade-in">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Juan Dela Cruz"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 text-sm placeholder-slate-400"
                                />
                            </div>

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
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 text-sm placeholder-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 text-sm placeholder-slate-400"
                                />
                            </div>

                            <button type="submit" className="w-full bg-emerald-400 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
                                Create an Account
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Already have an account? <button type="button" onClick={switchToLogin} className="text-slate-800 font-semibold hover:underline">Log In</button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}