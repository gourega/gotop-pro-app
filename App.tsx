import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
// FIX: Split import to correctly import `FirebaseUser` as a type.
// This resolves the "'FirebaseUser' cannot be used as a value" error and subsequent compilation issues.
import { auth, onAuthStateChanged, signOut } from './services/firebaseService';
import type { User as FirebaseUser } from 'firebase/auth';


// --- ICONS ---
const LogoIcon = () => (
    <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// --- LAYOUT COMPONENTS ---
const Header: React.FC<{ user: FirebaseUser | null, isAdmin: boolean }> = ({ user, isAdmin }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <LogoIcon />
                        <span className="text-xl font-bold text-gray-800">Go'Top Pro</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        {!user && <Link to="/quiz" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Évaluation</Link>}
                        {user ? (
                            <>
                                {isAdmin ? (
                                    <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Admin</Link>
                                ) : (
                                    <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Mon Compte</Link>
                                )}
                                <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Déconnexion</button>
                            </>
                        ) : (
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Se connecter</Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

const Footer = () => (
    <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Go'Top Pro. Tous droits réservés.</p>
            <div className="mt-2 space-x-4">
                <Link to="/legal" className="hover:text-indigo-600">Mentions Légales</Link>
                <Link to="/privacy" className="hover:text-indigo-600">Politique de Confidentialité</Link>
            </div>
        </div>
    </footer>
);

const AppContent = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAdmin(currentUser?.email === 'admin@gotop.pro');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center"><p>Loading...</p></div>;
    }

    // FIX: Moved from module scope to component scope to resolve "Cannot find name" errors.
    const LegalPage = () => <div className="container mx-auto p-8"><h1>Mentions Légales</h1><p>Contenu à venir...</p></div>;
    const PrivacyPage = () => <div className="container mx-auto p-8"><h1>Politique de Confidentialité</h1><p>Contenu à venir...</p></div>;


    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header user={user} isAdmin={isAdmin} />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/dashboard/*" element={user && !isAdmin ? <DashboardPage /> : <AuthPage />} />
                    <Route path="/admin" element={user && isAdmin ? <AdminPage /> : <AuthPage />} />
                    <Route path="/legal" element={<LegalPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};


export default function App() {
    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    );
}
