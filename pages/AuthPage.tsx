
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, auth } from '../services/firebaseService';

export default function AuthPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // User Auth State
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);

    // Admin Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('user');

    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });
        }
    }, []);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        if (!window.recaptchaVerifier) {
            setError("reCAPTCHA not initialized.");
            setIsSubmitting(false);
            return;
        }
        try {
            const result = await signInWithPhoneNumber(auth, `+${phone.replace(/\D/g, '')}`, window.recaptchaVerifier);
            setConfirmationResult(result);
        } catch (err: any) {
            setError(err.message);
            // This might happen if the reCAPTCHA needs to be rendered.
            // In a real app, you might need to show it.
            window.recaptchaVerifier.render().then((widgetId: any) => {
               window.recaptchaWidgetId = widgetId;
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        if (!confirmationResult) {
            setError('Please request an OTP first.');
            setIsSubmitting(false);
            return;
        }
        try {
            await confirmationResult.confirm(otp);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user.email === 'admin@gotop.pro') {
                navigate('/admin');
            } else {
                setError('Accès non autorisé.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div id="recaptcha-container"></div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Connectez-vous à votre compte
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveTab('user')} className={`${activeTab === 'user' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}>Client</button>
                            <button onClick={() => setActiveTab('admin')} className={`${activeTab === 'admin' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}>Admin</button>
                        </nav>
                    </div>

                    {activeTab === 'user' && (
                        <form className="space-y-6" onSubmit={confirmationResult ? handleOtpSubmit : handlePhoneSubmit}>
                            {!confirmationResult ? (
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">Numéro de téléphone</label>
                                    <div className="mt-2">
                                        <input id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium leading-6 text-gray-900">Code de vérification</label>
                                    <div className="mt-2">
                                        <input id="otp" name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            
                            <div>
                                <button type="submit" disabled={isSubmitting} className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300">
                                    {isSubmitting ? 'Envoi...' : (confirmationResult ? 'Vérifier le code' : 'Recevoir le code')}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'admin' && (
                        <form className="space-y-6" onSubmit={handleAdminSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Adresse email</label>
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full rounded-md border-0 py-1.5" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Mot de passe</label>
                                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full rounded-md border-0 py-1.5" />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div>
                                <button type="submit" disabled={isSubmitting} className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300">
                                    {isSubmitting ? 'Connexion...' : 'Se connecter'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// Augment window interface for reCAPTCHA
declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        recaptchaWidgetId?: any;
    }
}
