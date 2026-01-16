// Verified Medical Data from WHO / ICMR Guidelines (Simulated Knowledge Base)

export interface MedicalDoc {
    id: string;
    topic: string;
    keywords: string[];
    content: string;
    source: 'WHO' | 'ICMR' | 'Medical Guidelines';
    type: 'symptom' | 'test' | 'condition';
    severity?: 'low' | 'medium' | 'high';
}

export const MEDICAL_KNOWLEDGE_BASE: MedicalDoc[] = [
    // --- SYMPTOMS ---
    {
        id: 'sym_fever',
        topic: 'Fever',
        keywords: ['fever', 'temperature', 'high temp', '100f', '101f', '102f', '103f', '104f'],
        content: "A body temperature above 98.6°F (37°C) is generally considered a fever. Fevers above 100.4°F (38°C) indicate an active infection fighting process. Hydration is critical. Paracetamol is the standard first-line treatment for comfort, subject to dosage guidelines.",
        source: 'ICMR',
        type: 'symptom',
        severity: 'medium'
    },
    {
        id: 'sym_headache',
        topic: 'Headache',
        keywords: ['headache', 'migraine', 'head pain', 'throbbing'],
        content: "Headaches can range from tension (stress-related) to migraines. Danger signs include: sudden severe onset ('thunderclap'), accompanying fever, stiff neck, or visual disturbances. Rest, hydration, and dark rooms often help mild cases.",
        source: 'Medical Guidelines',
        type: 'symptom',
        severity: 'low'
    },
    {
        id: 'sym_chest_pain',
        topic: 'Chest Pain',
        keywords: ['chest pain', 'heart attack', 'tightness', 'left arm'],
        content: "Chest pain, especially with tightness, sweating, or radiation to the left arm/jaw, is a RED FLAG for cardiac events. Immediate medical attention is required. Do not wait.",
        source: 'WHO',
        type: 'symptom',
        severity: 'high'
    },
    {
        id: 'sym_shortness_breath',
        topic: 'Difficulty Breathing',
        keywords: ['breathless', 'short of breath', 'cant breathe', 'gasping'],
        content: "Dyspnea (shortness of breath) at rest is a critical emergency. It may indicate asthma, pneumonia, or cardiac issues. Oxygen saturation (SpO2) below 94% warning sign.",
        source: 'WHO',
        type: 'symptom',
        severity: 'high'
    },

    // --- TESTS ---
    {
        id: 'test_hemoglobin',
        topic: 'Hemoglobin',
        keywords: ['hemoglobin', 'hb', 'anemia', 'pale'],
        content: "Hemoglobin carries oxygen. Normal range: Men (13.5-17.5 g/dL), Women (12.0-15.5 g/dL). Low levels indicate Anemia (Iron deficiency is common in India). High levels may indicate dehydration or lung disease.",
        source: 'ICMR',
        type: 'test'
    },
    {
        id: 'test_wbc',
        topic: 'White Blood Cells (WBC)',
        keywords: ['wbc', 'leukocyte', 'infection', 'tlc'],
        content: "WBCs fight infection. Normal range: 4,500 - 11,000 /mcL. High count (Leukocytosis) suggests bacteria/viral infection or inflammation. Low count (Leukopenia) suggests viral infections (like Dengue) or bone marrow issues.",
        source: 'Medical Guidelines',
        type: 'test'
    },
    {
        id: 'test_glucose_fasting',
        topic: 'Fasting Blood Sugar',
        keywords: ['sugar', 'glucose', 'fasting', 'diabetes'],
        content: "Fasting Glucose: Normal (<100 mg/dL), Prediabetes (100-125 mg/dL), Diabetes (>126 mg/dL). Management includes diet control (less carbs) and medication if prescribed.",
        source: 'ICMR',
        type: 'test'
    },
    {
        id: 'test_platelets',
        topic: 'Platelet Count',
        keywords: ['platelets', 'dengue', 'bleeding', 'clotting'],
        content: "Platelets help clotting. Normal range: 1.5 - 4.5 Lakhs. Low platelets (Thrombocytopenia) are common in Dengue and Viral fevers. Danger zone is usually below 20,000.",
        source: 'Medical Guidelines',
        type: 'test'
    },

    // --- CONDITIONS ---
    {
        id: 'cond_bp',
        topic: 'Hypertension (High BP)',
        keywords: ['bp', 'pressure', 'hypertension', '140/90'],
        content: "Blood Pressure: Normal (<120/80). Elevated (120-129/<80). Hypertension Stage 1 (130-139/80-89). Hypertension Stage 2 (>140/>90). Silent killer. Requires salt restriction and regular monitoring.",
        source: 'WHO',
        type: 'condition'
    }
];
