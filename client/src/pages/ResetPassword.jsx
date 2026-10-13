import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { api } from '../api';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) return setError('Password must be at least 6 characters long.');
        if (password !== confirm) return setError('Passwords do not match.');
        setError('');
        setLoading(true);
        try {
            await api(`/api/auth/reset-password/${encodeURIComponent(token || '')}`, {
                method: 'POST',
                body: JSON.stringify({ password }),
            });
            setDone(true);
            setTimeout(() => navigate('/'), 2500);
        } catch (err) {
            setError(err.message || 'Unable to reset your password. Please request a new link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                {done ? (
                    <p className="text-center text-slate-700">Password updated! Redirecting to login...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-center text-2xl font-semibold text-slate-800">Create a new password</h2>
                        {error && <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm text-red-600">{error}</div>}
                        {[['New password', password, setPassword], ['Confirm new password', confirm, setConfirm]].map(([label, value, setter]) => (
                            <label key={label} className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input required minLength={6} autoComplete={label === 'New password' ? 'new-password' : 'new-password'} type={show ? 'text' : 'password'} value={value} onChange={(e) => { setter(e.target.value); setError(''); }} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pl-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
                                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </label>
                        ))}
                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-500 py-2.5 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Updating...' : 'Update password'}</button>
                    </form>
                )}
            </div>
        </div>
    );
}