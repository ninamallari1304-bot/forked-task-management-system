import { useState } from 'react';
import { ArrowLeft, CheckCircle, Mail, X } from 'lucide-react';
import moodleLogo from '../assets/moodle-logo.png';
import { api } from '../api';

export default function ForgotPasswordModal({ onClose, switchToLogin }) {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }
        setError('');
        try {
            setLoading(true);
            await api('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: email.trim() }),
            });
            setSent(true);
        } catch (err) {
            setError(err.message || 'Unable to send the reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-8">
                <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600" aria-label="Close forgot password dialog">
                    <X className="h-5 w-5" />
                </button>

                {sent ? (
                    <div className="flex flex-col items-center py-6 text-center">
                        <CheckCircle className="mb-5 h-14 w-14 text-teal-500" />
                        <h2 className="text-2xl font-semibold text-slate-800">Check your email</h2>
                        <p className="mt-2 mb-7 text-sm text-slate-500">
                            If an account exists for {email.trim()}, we've sent a link to reset your password.
                        </p>
                        <button onClick={switchToLogin} className="w-full rounded-lg bg-blue-500 py-2.5 font-medium text-white transition hover:bg-blue-600">
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex justify-center">
                            <img src={moodleLogo} alt="Moodle" className="h-auto w-36 object-contain" />
                        </div>
                        <h2 className="text-center text-2xl font-semibold text-slate-800">Forgot password?</h2>
                        <p className="mb-6 mt-2 text-center text-sm text-slate-500">Enter your account email and we'll send you a reset link.</p>

                        {error && <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm text-red-600">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-slate-700">Email address</span>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input required autoFocus type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="name@example.com" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pl-10 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
                                </div>
                            </label>
                            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-500 py-2.5 font-medium text-white transition hover:bg-blue-600 disabled:opacity-60">
                                {loading ? 'Sending...' : 'Send reset link'}
                            </button>
                        </form>

                        <button onClick={switchToLogin} className="mx-auto mt-6 flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-800">
                            <ArrowLeft className="h-4 w-4" /> Back to login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}