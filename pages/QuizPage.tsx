
import React, { useState, useMemo } from 'react';
import { QUIZ_QUESTIONS, MODULE_PRICE, CURRENCY_SYMBOL } from '../constants';
import { generateTrainingPlan } from '../services/geminiService';
import { savePendingPurchase } from '../services/firebaseService';
import { TrainingModule } from '../types';

const AnalysisAnimation = () => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Analyse en cours...</h3>
        <p className="text-gray-600 mt-2">Notre IA prépare votre parcours de formation personnalisé. Cela peut prendre un moment.</p>
    </div>
);

const ModuleAccordion: React.FC<{ module: TrainingModule; isRecommended: boolean; isSelected: boolean; onSelect: () => void; }> = ({ module, isRecommended, isSelected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
            <div className={`p-4 flex items-center justify-between cursor-pointer ${isSelected ? 'bg-indigo-50' : 'bg-white'}`} onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-4">
                    <input type="checkbox" checked={isSelected} onChange={onSelect} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" onClick={e => e.stopPropagation()} />
                    <div>
                        <h4 className="font-semibold text-gray-800">{module.title}</h4>
                        <p className="text-sm text-gray-500">{module.topic}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isRecommended && <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">Recommandé</span>}
                    <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {isOpen && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{module.mini_course}</p>
                </div>
            )}
        </div>
    );
};

export default function QuizPage() {
    const [step, setStep] = useState<'quiz' | 'loading' | 'results'>('quiz');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, boolean>>({});
    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [recommendedTopics, setRecommendedTopics] = useState<string[]>([]);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAnswer = (answer: boolean) => {
        setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setStep('loading');
        const nonAnswersTopics = QUIZ_QUESTIONS
            .filter((_, index) => answers[index] === false)
            .map(q => q.topic);
        
        const uniqueTopics = [...new Set(nonAnswersTopics)];
        setRecommendedTopics(uniqueTopics);

        try {
            const allTopics = [...new Set(QUIZ_QUESTIONS.map(q => q.topic))];
            const generatedModules = await generateTrainingPlan(allTopics);
            setModules(generatedModules);
            setError(null);
        } catch (e: any) {
            setError(e.message || "Une erreur est survenue lors de la génération des modules.");
            console.error(e);
        } finally {
            setStep('results');
        }
    };
    
    const toggleModuleSelection = (moduleId: string) => {
        setSelectedModules(prev =>
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        );
    };

    const { totalPrice, discount } = useMemo(() => {
        const count = selectedModules.length;
        const basePrice = count * MODULE_PRICE;
        let discount = 0;
        if (count >= 13) discount = 0.50;
        else if (count >= 9) discount = 0.30;
        else if (count >= 5) discount = 0.20;
        return { totalPrice: Math.round(basePrice * (1 - discount)), discount };
    }, [selectedModules]);

    const handlePurchase = async () => {
        if (!phoneNumber || !/^\+?[0-9\s]{8,}$/.test(phoneNumber)) {
            alert("Veuillez entrer un numéro de téléphone valide.");
            return;
        }
        const purchaseModules = modules.filter(m => selectedModules.includes(m.id));
        await savePendingPurchase({ phone: phoneNumber, modules: purchaseModules, totalPrice });
        setShowPaymentModal(false);
        const message = `Bonjour, je viens de valider ma fiche pour ${purchaseModules.length} module(s) Go'Top Pro pour un total de ${totalPrice.toFixed(0)} ${CURRENCY_SYMBOL}. Voici ma preuve de paiement.`;
        window.open(`https://wa.me/2250708070690?text=${encodeURIComponent(message)}`, '_blank');
    };

    const score = Object.values(answers).filter(a => a === true).length;

    if (step === 'quiz') {
        const progress = (currentQuestion / QUIZ_QUESTIONS.length) * 100;
        return (
            <div className="container mx-auto p-4 sm:p-8 max-w-3xl">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-2">Diagnostic de votre Établissement</h2>
                    <p className="text-center text-gray-600 mb-6">Question {currentQuestion + 1} sur {QUIZ_QUESTIONS.length}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xl text-center mb-8 min-h-[6rem]">{QUIZ_QUESTIONS[currentQuestion].text}</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => handleAnswer(true)} className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105">Oui</button>
                        <button onClick={() => handleAnswer(false)} className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105">Non</button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'loading') {
        return (
            <div className="container mx-auto p-4 sm:p-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <AnalysisAnimation />
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 sm:p-8">
             <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                <h2 className="text-3xl font-bold text-center mb-2">Vos Résultats & Recommandations</h2>
                <div className="text-center text-lg text-gray-700 mb-4">Votre score: <span className="font-bold text-indigo-600">{score} / {QUIZ_QUESTIONS.length}</span></div>
                <p className="text-center text-gray-600 max-w-2xl mx-auto">
                    {score < 8 ? "Il y a des opportunités d'amélioration significatives. Nos modules peuvent vous aider à transformer vos pratiques." :
                     score < 14 ? "Vos pratiques sont solides, mais il y a toujours de la place pour l'excellence. Ciblez des modules spécifiques pour perfectionner vos compétences." :
                     "Excellent ! Vos pratiques sont déjà à un niveau élevé. Explorez nos modules pour garder une longueur d'avance."}
                </p>
             </div>

             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-2xl font-semibold mb-4">Catalogue de formations</h3>
                    {modules.map(module => (
                        <ModuleAccordion
                            key={module.id}
                            module={module}
                            isRecommended={recommendedTopics.includes(module.topic)}
                            isSelected={selectedModules.includes(module.id)}
                            onSelect={() => toggleModuleSelection(module.id)}
                        />
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">Votre Panier</h3>
                        <p className="text-gray-600 mb-2">{selectedModules.length} module(s) sélectionné(s)</p>
                        {discount > 0 && <p className="text-sm text-green-600 font-medium mb-4">Remise de {(discount * 100).toFixed(0)}% appliquée !</p>}
                        <div className="text-3xl font-bold text-gray-800 mb-6">{totalPrice.toFixed(0)} {CURRENCY_SYMBOL}</div>
                        <button 
                            onClick={() => setShowPaymentModal(true)} 
                            disabled={selectedModules.length === 0}
                            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            Acheter les modules
                        </button>
                    </div>
                </div>
            </div>

            {showPaymentModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">Finaliser la commande</h2>
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Votre numéro de téléphone</label>
                            <input type="tel" id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+225 0708070690" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            <p className="text-xs text-gray-500 mt-1">Ce numéro sera utilisé pour créer votre compte.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md mb-6">
                            <h4 className="font-semibold">Récapitulatif</h4>
                            <p>{selectedModules.length} module(s) pour un total de <span className="font-bold">{totalPrice.toFixed(0)} {CURRENCY_SYMBOL}</span></p>
                        </div>
                        <div className="mb-6">
                            <h4 className="font-semibold mb-2">Instructions de paiement</h4>
                            <p className="text-sm text-gray-600">Veuillez effectuer votre paiement via l'un des moyens suivants :</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                                <li>Mobile Money: +225 0708070690</li>
                                <li>Wave/Djamo: <a href="#" className="text-indigo-600">Lien de paiement</a></li>
                            </ul>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowPaymentModal(false)} className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annuler</button>
                            <button onClick={handlePurchase} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Valider la fiche</button>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-4">Après validation, envoyez la preuve de paiement sur WhatsApp.</p>
                    </div>
                </div>
            )}
        </div>
    );
}