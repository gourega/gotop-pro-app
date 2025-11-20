import { GoogleGenAI, Type } from "@google/genai";
import { TrainingModule } from '../types';

// CORRECTION 1: Ajout du chemin d'accès au fichier types pour la compilation (si nécessaire)
// Assurez-vous que le fichier types.ts est bien dans un dossier 'types' ou un niveau plus haut si besoin
// import { TrainingModule } from '../types'; 

// CRITIQUE : Contournement de l'erreur de typage 'ImportMeta.env'
const API_KEY: string = (import.meta as any).env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    // Le code ci-dessous est parfait, il lance une erreur claire pour le débogage
    console.warn("Gemini API key not found. Please set the VITE_GEMINI_API_KEY environment variable.");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY, // 'apiKey' en minuscule est correct.
});

// Le schéma est parfait, complet et bien typé.
const trainingPlanSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "A unique identifier for the module, like a slug." },
      topic: { type: Type.STRING },
      title: { type: Type.STRING },
      mini_course: { type: Type.STRING },
      lesson_content: { type: Type.STRING, description: "Detailed lesson in HTML format. Use headings (<h3>), paragraphs (<p>), lists (<ul>, <li>), and bold text (<strong>)." }, // L'ajout d'une description plus explicite est bénéfique pour le modèle
      video_url: { type: Type.STRING, description: "URL to a relevant YouTube video." },
      infographic_url: { type: Type.STRING, description: "URL for a placeholder infographic (e.g., https://picsum.photos/800/1200)." },
      quiz_questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question_text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["question_text", "options", "answer", "explanation"]
        }
      },
      exercises: { type: Type.STRING, description: "A practical action plan." },
      tips: { type: Type.ARRAY, items: { type: Type.STRING } },
      next_steps: { type: Type.STRING },
    },
    required: ["id", "topic", "title", "mini_course", "lesson_content", "video_url", "infographic_url", "quiz_questions", "exercises", "tips", "next_steps"]
  }
};

export const generateTrainingPlan = async (topics: string[]): Promise<TrainingModule[]> => {
  // CRITIQUE : Pour forcer le plantage immédiat si la clé n'est pas là
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured in VITE_GEMINI_API_KEY.");
  }

  const prompt = `
    You are an expert instructional designer for small business owners in the beauty, restaurant, and retail sectors.
    Based on the following areas of improvement identified from a self-assessment quiz, generate a comprehensive and personalized training plan. The areas of improvement are: ${topics.join(', ')}.

    The output MUST be a valid JSON array of objects, adhering to the provided schema. Each object in the array represents a training module.

    For each module, provide the following:
    - "id": A unique identifier for the module in kebab-case (e.g., "accueil-telephonique").
    - "topic": The general category (e.g., "Accueil téléphonique", "Organisation du travail").
    - "title": A catchy and descriptive title for the module.
    - "mini_course": A short, engaging 2-3 sentence summary of what the user will learn.
    - "lesson_content": A detailed lesson in HTML format. Use headings (<h3>), paragraphs (<p>), lists (<ul>, <li>), and bold text (<strong>) to structure the content. Make it practical and actionable.
    - "video_url": A URL to a relevant YouTube video that supplements the lesson.
    - "infographic_url": A placeholder URL for a helpful infographic (e.g., "https://picsum.photos/800/1200").
    - "quiz_questions": An array of 3 multiple-choice questions to test understanding. Each question object should have: "question_text", an array of "options" (4 options), the correct "answer", and an "explanation" for why the answer is correct.
    - "exercises": A short, practical action plan or exercise for the user to implement in their business.
    - "tips": A list of 2-3 actionable tips related to the module topic.
    - "next_steps": Suggestions on what to focus on after completing this module.

    Ensure the content is high-quality, professional, and directly addresses the provided areas of improvement.
    Generate a module for each topic provided.
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: trainingPlanSchema,
        },
    });

    const jsonString = response.text; 

    // Mieux vaut ne pas forcer la vérification d'une chaîne JSON vide, 
    // car le modèle est censé retourner un tableau vide "[]" en cas d'échec de génération.
    // L'échec du JSON.parse en cas de chaîne non valide sera géré par le bloc catch.
    
    const generatedModules = JSON.parse(jsonString); // Ceci devrait fonctionner
    
    // Le type casting est correct
    return generatedModules as TrainingModule[];

  } catch (error) {
    console.error("Error generating training plan with Gemini:", error);
    // Lance une erreur plus spécifique pour le débogage front-end/console
    throw new Error("Failed to generate training plan. Check the Gemini API Key and service logs.");
  }
};