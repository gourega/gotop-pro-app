
import React, { useState, useEffect, useCallback } from 'react';
import { auth, getUserData, updateUserData, uploadProfilePicture, User as FirebaseUser } from '../services/firebaseService';
import { User } from '../types';

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('modules');
    
    const fetchUser = useCallback(async () => {
        if (auth.currentUser) {
            const userData = await getUserData(auth.currentUser.uid);
            if (userData) {
                setUser(userData);
            } else {
                // Handle case where user exists in Auth but not Firestore
                const newUser: User = { uid: auth.currentUser.uid, phone: auth.currentUser.phoneNumber! };
                setUser(newUser);
            }
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (loading) {
        return <div>Chargement du tableau de bord...</div>
    }

    if (!user) {
        return <div>Utilisateur non trouvé.</div>
    }
    
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, {user.firstName || 'Utilisateur'} !</h1>
            <p className="text-gray-600 mb-8">Votre espace personnel pour gérer vos formations et suivre votre progression.</p>
            
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('modules')} className={`${activeTab === 'modules' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Mes Modules</button>
                    <button onClick={() => setActiveTab('progress')} className={`${activeTab === 'progress' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Progression</button>
                    <button onClick={() => setActiveTab('rewards')} className={`${activeTab === 'rewards' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Récompenses</button>
                    <button onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Mon Profil</button>
                </nav>
            </div>

            <div>
                {activeTab === 'modules' && <MyModulesTab user={user} />}
                {activeTab === 'progress' && <ProgressTab user={user} />}
                {activeTab === 'rewards' && <RewardsTab user={user} />}
                {activeTab === 'profile' && <ProfileTab user={user} onUpdate={fetchUser} />}
            </div>
        </div>
    );
}

// --- TAB COMPONENTS ---
const MyModulesTab: React.FC<{ user: User }> = ({ user }) => {
    // Placeholder for module click navigation
    const handleModuleClick = (moduleId: string) => alert(`Navigating to module ${moduleId}`);

    if (!user.purchasedModules || user.purchasedModules.length === 0) {
        return (
            <div>
                <p>Vous n'avez acheté aucun module pour le moment.</p>
                {/* Link to Quiz/Results page to add modules */}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.purchasedModules.map(module => (
                <div key={module.id} onClick={() => handleModuleClick(module.id)} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden">
                    <img src={module.infographic_url} alt={module.title} className="h-40 w-full object-cover" />
                    <div className="p-6">
                        <span className="text-sm text-indigo-600 font-semibold">{module.topic}</span>
                        <h3 className="text-lg font-bold mt-1">{module.title}</h3>
                        <p className="text-sm text-gray-600 mt-2 h-16 overflow-hidden">{module.mini_course}</p>
                        {/* Status logic to be implemented */}
                        <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                           <span className="text-sm font-medium text-gray-500">Non commencé</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ProgressTab: React.FC<{ user: User }> = ({ user }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Votre Progression</h2>
        {/* Statistics to be implemented */}
        <p>Pourcentage global de complétion: 0%</p>
        <p>Nombre de modules terminés: 0</p>
    </div>
);

const RewardsTab: React.FC<{ user: User }> = ({ user }) => (
     <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Vos Récompenses</h2>
        <p>Badges obtenus: {user.badges?.length || 0}</p>
        {/* Badge display logic to be implemented */}
    </div>
);


const ProfileTab: React.FC<{ user: User, onUpdate: () => void }> = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        establishmentName: user.establishmentName || '',
        sector: user.sector || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        let photoURL = user.photoURL;
        if (selectedFile) {
            photoURL = await uploadProfilePicture(user.uid, selectedFile);
        }
        await updateUserData(user.uid, { ...formData, photoURL });
        setIsSaving(false);
        onUpdate();
        alert("Profil mis à jour !");
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&color=7F9CF5&background=EBF4FF`} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                    <div>
                        <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">Changer la photo de profil</label>
                        <input id="photoURL" type="file" onChange={handleFileChange} className="mt-1 text-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label>Prénom</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label>Nom</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label>Nom de l'établissement</label>
                        <input type="text" name="establishmentName" value={formData.establishmentName} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label>Secteur d'activité</label>
                        <select name="sector" value={formData.sector} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                            <option value="">Sélectionner...</option>
                            <option value="beauty">Beauté</option>
                            <option value="restaurant">Restauration</option>
                            <option value="retail">Boutique</option>
                        </select>
                    </div>
                </div>

                <div>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};
