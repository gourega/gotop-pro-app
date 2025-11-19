import React, { useState, useEffect, useCallback } from 'react';

// Les imports de Firebase ne sont plus nécessaires :
// import { getPendingPurchases, approvePurchase, getUsers, deleteUserAndData } from '../services/firebaseService';

// Les types sont conservés au cas où vous souhaiteriez réactiver l'interface
// (Ils ne causeront pas d'erreur s'ils ne sont pas utilisés)
import { PendingPurchase, User } from '../types'; 
import { CURRENCY_SYMBOL } from '../constants'; // L'import de la constante est conservé

// ---------------------------------------------------------------------------------------------------
// Composant Principal
// ---------------------------------------------------------------------------------------------------

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('purchases');

    // Affichage temporaire pour indiquer que l'interface est désactivée
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Administration</h1>
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        className={`py-2 px-4 border-b-2 font-medium text-sm ${
                            activeTab === 'purchases' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        Achats en attente (Désactivé)
                    </button>
                    <button
                        className={`py-2 px-4 border-b-2 font-medium text-sm ${
                            activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab('users')}
                    >
                        Utilisateurs (Désactivé)
                    </button>
                </nav>
            </div>
            {activeTab === 'purchases' && <PendingPurchasesTab />}
            {activeTab === 'users' && <UsersTab />}
            <p className="mt-6 text-red-500 font-semibold">
                NOTE : Les fonctionnalités d'administration sont désactivées car les services Firebase ont été retirés.
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------
// Composant : Achats en attente (Désactivé)
// ---------------------------------------------------------------------------------------------------

const PendingPurchasesTab = () => {
    // Les états et gestionnaires asynchrones liés à Firebase sont supprimés.
    const [names, setNames] = useState<Record<string, { firstName: string, lastName: string }>>({});

    const handleNameChange = (id: string, field: 'firstName' | 'lastName', value: string) => {
        setNames(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <p>La liste des achats en attente n'est pas disponible (service Firebase retiré).</p>
        </div>
    );
};

// ---------------------------------------------------------------------------------------------------
// Composant : Utilisateurs (Désactivé)
// ---------------------------------------------------------------------------------------------------

const UsersTab = () => {
    // Les états et gestionnaires asynchrones liés à Firebase sont supprimés.
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <p>La liste des utilisateurs n'est pas disponible (service Firebase retiré).</p>
        </div>
    );
};