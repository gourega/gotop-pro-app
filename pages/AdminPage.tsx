
import React, { useState, useEffect, useCallback } from 'react';
import { getPendingPurchases, approvePurchase, getUsers, deleteUserAndData } from '../services/firebaseService';
import { PendingPurchase, User } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('purchases');

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord Administrateur</h1>
            
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('purchases')} className={`${activeTab === 'purchases' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Commandes en attente</button>
                    <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Gestion des utilisateurs</button>
                </nav>
            </div>

            <div>
                {activeTab === 'purchases' && <PendingPurchasesTab />}
                {activeTab === 'users' && <UsersTab />}
            </div>
        </div>
    );
}

const PendingPurchasesTab = () => {
    const [purchases, setPurchases] = useState<PendingPurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [names, setNames] = useState<Record<string, { firstName: string, lastName: string }>>({});

    const fetchPurchases = useCallback(async () => {
        setLoading(true);
        const data = await getPendingPurchases();
        setPurchases(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);
    
    const handleApprove = async (purchase: PendingPurchase) => {
        const name = names[purchase.id!];
        if (!name || !name.firstName || !name.lastName) {
            alert("Veuillez entrer le prénom et le nom de l'utilisateur.");
            return;
        }
        await approvePurchase(purchase, name.firstName, name.lastName);
        alert(`L'utilisateur ${name.firstName} ${name.lastName} a été créé.`);
        fetchPurchases(); // Refresh list
    };
    
    const handleNameChange = (id: string, field: 'firstName' | 'lastName', value: string) => {
        setNames(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {purchases.length === 0 ? <p>Aucune commande en attente.</p> : (
                <ul className="divide-y divide-gray-200">
                    {purchases.map(p => (
                        <li key={p.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="font-medium">Téléphone: {p.phone}</p>
                                <p className="text-sm text-gray-500">{p.modules.length} module(s) - {p.totalPrice.toFixed(0)} {CURRENCY_SYMBOL}</p>
                            </div>
                             <div className="flex gap-2 items-center">
                                <input type="text" placeholder="Prénom" onChange={(e) => handleNameChange(p.id!, 'firstName', e.target.value)} className="p-1 border rounded-md text-sm" />
                                <input type="text" placeholder="Nom" onChange={(e) => handleNameChange(p.id!, 'lastName', e.target.value)} className="p-1 border rounded-md text-sm" />
                                <button onClick={() => handleApprove(p)} className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600">Approuver</button>
                             </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const UsersTab = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleDelete = async (userId: string, name: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} ? Cette action est irréversible.`)) {
            await deleteUserAndData(userId);
            alert("Utilisateur supprimé.");
            fetchUsers();
        }
    }

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Search bar can be added here */}
            <ul className="divide-y divide-gray-200">
                {users.map(u => (
                    <li key={u.uid} className="py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium">{u.firstName} {u.lastName}</p>
                            <p className="text-sm text-gray-500">{u.phone}</p>
                        </div>
                        <button onClick={() => handleDelete(u.uid, `${u.firstName} ${u.lastName}`)} className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600">Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};