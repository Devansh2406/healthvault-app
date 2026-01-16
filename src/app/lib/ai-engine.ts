import { MEDICAL_KNOWLEDGE_BASE, MedicalDoc } from './medical-knowledge';

// Types for the AI capabilities
interface AnalyzeResult {
    intent: 'symptom' | 'test_report' | 'greeting' | 'emergency' | 'general';
    retrievedDocs: MedicalDoc[];
    response: string;
    isEmergency: boolean;
    suggestedAction?: string;
}

interface UserContext {
    name?: string;
    age?: number;
    gender?: string;
    conditions?: string[];
    reports?: any[]; // Simplified for now
}

class MedicalAIEngine {

    // 1. INTENT DETECTION (Rule-based for speed/safety)
    private detectIntent(query: string): 'symptom' | 'test_report' | 'greeting' | 'emergency' | 'general' {
        const lower = query.toLowerCase();

        // Critical / Emergency
        if (lower.includes('heart attack') || lower.includes('chest pain') || lower.includes('breathing') || lower.includes('unconscious') || lower.includes('emergency')) {
            return 'emergency';
        }

        // Test Reports
        if (lower.includes('report') || lower.includes('result') || lower.includes('test') || lower.includes('hemoglobin') || lower.includes('platelet') || lower.includes('sugar') || lower.includes('level')) {
            return 'test_report';
        }

        // Symptoms
        if (lower.includes('pain') || lower.includes('fever') || lower.includes('cough') || lower.includes('headache') || lower.includes('vomit') || lower.includes('feel')) {
            return 'symptom';
        }

        // Greeting
        if (lower.match(/^(hi|hello|hey|good morning)/)) {
            return 'greeting';
        }

        return 'general';
    }

    // 2. RETRIEVAL (Vector Simulation using Keywords)
    private retrieveKnowledge(query: string): MedicalDoc[] {
        const lowerQ = query.toLowerCase();
        const tokens = lowerQ.split(' ').filter(t => t.length > 3); // Simple tokenization

        const scoredDocs = MEDICAL_KNOWLEDGE_BASE.map(doc => {
            let score = 0;
            // Exact keyword match
            doc.keywords.forEach(k => {
                if (lowerQ.includes(k)) score += 5;
            });
            // Token match
            tokens.forEach(t => {
                if (doc.content.toLowerCase().includes(t)) score += 1;
            });
            return { doc, score };
        });

        // Return top 3 docs with score > 0
        return scoredDocs
            .filter(d => d.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(d => d.doc);
    }

    // 3. SAFETY & PROMPT ENGINEERING (Simulated Response Generation)
    private generateResponse(intent: string, query: string, context: UserContext, docs: MedicalDoc[]): string {

        // 3a. SAFETY FIRST: Emergency
        if (intent === 'emergency') {
            return "⚠️ **CRITICAL ALERT**: Your symptoms suggest a potential medical emergency. Please visit the nearest hospital immediately or call 108. I have activated the Hospital Locator for you.";
        }

        // 3b. GREETING
        if (intent === 'greeting') {
            return `Hello ${context.name || 'there'}! I am Swasthya Sathi, your medical assistant. I can explain your reports or check your symptoms. How can I help?`;
        }

        // 3c. RAG GENERATION
        if (docs.length === 0) {
            return "I'm not sure about that specific medical topic yet. I recommend consulting a general physician for accurate advice. Is there anything else about your reports I can help with?";
        }

        // Build the "Prompt" context (Internal logic)
        const knowledgeContext = docs.map(d => `[${d.topic}]: ${d.content}`).join('\n');

        // Generate Template Response based on retrieval
        let response = `Based on trusted ${docs[0].source} guidelines regarding **${docs[0].topic}**:\n\n${docs[0].content}\n\n`;

        // Contextualization
        if (context.age) {
            response += `For a ${context.age}-year-old ${context.gender || 'patient'}, it is important to monitor this closely. `;
        }

        // Strict Medical Disclaimer
        if (intent === 'symptom') {
            response += "\n\n**Note:** Symptoms can vary. If this persists for more than 24 hours, please consult a doctor.";
        } else if (intent === 'test_report') {
            response += "\n\n**Interpretation:** This is an informational analysis. Only a doctor can provide a clinical diagnosis.";
        }

        return response;
    }

    // MAIN PIPELINE
    public async processQuery(query: string, context: UserContext): Promise<AnalyzeResult> {
        // 1. Intent
        const intent = this.detectIntent(query);

        // 2. Retrieval
        const retrievedDocs = this.retrieveKnowledge(query);

        // 3. Generation (with Safety)
        const response = this.generateResponse(intent, query, context, retrievedDocs);

        // 4. Post-processing
        const isEmergency = intent === 'emergency' || retrievedDocs.some(d => d.severity === 'high');

        return {
            intent,
            retrievedDocs,
            response,
            isEmergency,
            suggestedAction: isEmergency ? 'locate_hospital' : undefined
        };
    }
}

export const medicalAI = new MedicalAIEngine();
