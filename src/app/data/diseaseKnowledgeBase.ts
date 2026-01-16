
export type DiseaseCategory = 'infectious' | 'chronic' | 'genetic' | 'deficiency' | 'mental' | 'other';
export type CurableStatus = 'yes' | 'no' | 'sometimes';

export interface TreatmentType {
    type: 'lifestyle' | 'medication_class' | 'therapy' | 'surgery';
    description: string;
}

export interface Disease {
    id: string;
    name: string;
    category: DiseaseCategory;
    short_description: string;
    common_symptoms: string[];
    risk_factors: string[];
    severity_levels: string[];
    is_curable: CurableStatus;
    treatment_knowledge: TreatmentType[];
    doctor_visit_trigger: string;
    emergency_trigger: string;
}

export const diseaseKnowledgeBase: Disease[] = [
    {
        id: 'asthma',
        name: 'Asthma',
        category: 'chronic',
        short_description: 'A condition in which your airways narrow and swell and may produce extra mucus.',
        common_symptoms: ['wheezing', 'breathlessness', 'chest tightness', 'coughing'],
        risk_factors: ['Exposure to allergens', 'Family history', 'Respiratory infections'],
        severity_levels: ['Intermittent', 'Mild persistent', 'Moderate persistent', 'Severe persistent'],
        is_curable: 'no',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Bronchodilators, Corticosteroids' },
            { type: 'lifestyle', description: 'Identify and avoid triggers (dust, cold air, pollen)' }
        ],
        doctor_visit_trigger: 'If attacks increase in frequency or inhaler usage increases',
        emergency_trigger: 'Severe breathing difficulty, blue lips/fingernails, rapid pulse'
    },
    {
        id: 'diabetes_type_2',
        name: 'Type 2 Diabetes',
        category: 'chronic',
        short_description: 'A chronic condition that affects the way the body processes blood sugar (glucose).',
        common_symptoms: ['increased thirst', 'frequent urination', 'increased hunger', 'fatigue', 'blurred vision'],
        risk_factors: ['Obesity', 'Inactivity', 'Family history', 'Age > 45'],
        severity_levels: ['Pre-diabetes', 'Controlled', 'Uncontrolled', 'Complicated'],
        is_curable: 'no',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Insulin, Oral hypoglycemics, Metformin' },
            { type: 'lifestyle', description: 'Healthy eating, regular exercise, weight monitoring' }
        ],
        doctor_visit_trigger: 'Symptoms of high/low blood sugar persisting, foot sores',
        emergency_trigger: 'Sweet fruit breath smell (Ketoacidosis), confusion, seizures'
    },
    {
        id: 'common_cold',
        name: 'Common Cold',
        category: 'infectious',
        short_description: 'A viral infection of your nose and throat (upper respiratory tract).',
        common_symptoms: ['runny nose', 'sore throat', 'cough', 'congestion', 'mild body aches', 'sneezing'],
        risk_factors: ['Close contact with infected', 'Weakened immune system', 'Season (winter)'],
        severity_levels: ['Mild'],
        is_curable: 'yes',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Analgesics, Decongestants' },
            { type: 'lifestyle', description: 'Rest, hydration, warm saltwater gargle' }
        ],
        doctor_visit_trigger: 'Symptoms last > 10 days, high fever',
        emergency_trigger: 'Trouble breathing, dehydration signs'
    },
    {
        id: 'hypertension',
        name: 'Hypertension (High Blood Pressure)',
        category: 'chronic',
        short_description: 'A condition in which the force of the blood against the artery walls is too high.',
        common_symptoms: ['headache', 'shortness of breath', 'nosebleeds', 'flushing'],
        risk_factors: ['High salt diet', 'Obesity', 'Smoking', 'Stress', 'Age'],
        severity_levels: ['Elevated', 'Stage 1', 'Stage 2', 'Hypertensive crisis'],
        is_curable: 'no',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Diuretics, Beta-blockers, ACE inhibitors' },
            { type: 'lifestyle', description: 'Low sodium diet, regular exercise, limiting alcohol' }
        ],
        doctor_visit_trigger: 'Consistently high readings despite lifestyle changes',
        emergency_trigger: 'Chest pain, severe headache, confusion (Hypertensive emergency)'
    },
    {
        id: 'migraine',
        name: 'Migraine',
        category: 'chronic',
        short_description: 'A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.',
        common_symptoms: ['severe throbbing pain', 'sensitivity to light', 'nausea', 'visual disturbances'],
        risk_factors: ['Hormonal changes', 'Stress', 'Certain foods/additives'],
        severity_levels: ['Episodic', 'Chronic'],
        is_curable: 'no',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Pain relievers, Triptans' },
            { type: 'lifestyle', description: 'Stress management, sleep schedule, avoid triggers' }
        ],
        doctor_visit_trigger: 'Headaches trigger frequently or severity increases',
        emergency_trigger: 'Abrupt, severe headache (thunderclap), stiff neck, confusion'
    },
    {
        id: 'hemorrhoids',
        name: 'Hemorrhoids (Piles)',
        category: 'other',
        short_description: 'Swollen veins in your lower rectum, causing discomfort and bleeding.',
        common_symptoms: ['rectal bleeding', 'anal pain', 'itching', 'lumps around anus', 'pain during bowel movements', 'piles'],
        risk_factors: ['Straining during bowel movements', 'Chronic constipation', 'Obesity', 'Pregnancy'],
        severity_levels: ['Internal', 'External', 'Thrombosed'],
        is_curable: 'yes',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Topical creams, Pain relievers, Stool softeners' },
            { type: 'lifestyle', description: 'High-fiber diet, Sitz baths, Hydration' }
        ],
        doctor_visit_trigger: 'Rectal bleeding, pain does not improve after a week of home care',
        emergency_trigger: 'Large amount of rectal bleeding, dizziness, fainting'
    },
    {
        id: 'dengue',
        name: 'Dengue Fever',
        category: 'infectious',
        short_description: 'A mosquito-borne viral infection causing severe flu-like illness.',
        common_symptoms: ['high fever', 'severe headache', 'pain behind eyes', 'joint pain', 'bone pain', 'rash', 'nausea'],
        risk_factors: ['Living in tropical areas', 'Mosquito exposure'],
        severity_levels: ['Mild', 'Severe (Dengue Hemorrhagic Fever)'],
        is_curable: 'yes',
        treatment_knowledge: [
            { type: 'lifestyle', description: 'Rest, Fluid replacement (ORS), Papaya leaf extract (traditional)' },
            { type: 'medication_class', description: 'Paracetamol (Avoid Aspirin/Ibuprofen)' }
        ],
        doctor_visit_trigger: 'High fever, severe pain, persistent vomiting',
        emergency_trigger: 'Severe abdominal pain, bleeding gums, rapid breathing, fatigue (Warning signs of severe dengue)'
    },
    {
        id: 'malaria',
        name: 'Malaria',
        category: 'infectious',
        short_description: 'A disease caused by a plasmodium parasite, transmitted by the bite of infected mosquitoes.',
        common_symptoms: ['fever', 'chills', 'headache', 'nausea', 'vomiting', 'muscle pain', 'fatigue', 'sweating'],
        risk_factors: ['Living in or visiting tropical regions', 'Mosquito exposure'],
        severity_levels: ['Uncomplicated', 'Severe'],
        is_curable: 'yes',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Antimalarial drugs (Chloroquine, ACTs)' },
            { type: 'lifestyle', description: 'Rest, hydration, fever management' }
        ],
        doctor_visit_trigger: 'Fever after visiting a high-risk area, severe symptoms',
        emergency_trigger: 'Seizures, confusion, difficulty breathing, severe anemia'
    },
    {
        id: 'typhoid',
        name: 'Typhoid Fever',
        category: 'infectious',
        short_description: 'A bacterial infection causing high fever, diarrhea, and vomiting.',
        common_symptoms: ['high fever', 'headache', 'stomach pain', 'weakness', 'vomiting', 'loose stools'],
        risk_factors: ['Contaminated food or water', 'Poor sanitation', 'Travel to endemic areas'],
        severity_levels: ['Mild', 'Severe'],
        is_curable: 'yes',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Antibiotics' },
            { type: 'lifestyle', description: 'Fluid replacement, bland diet, good hygiene' }
        ],
        doctor_visit_trigger: 'Persistent fever, severe abdominal pain',
        emergency_trigger: 'Severe intestinal bleeding or perforation (sudden severe pain)'
    },
    {
        id: 'gastroenteritis',
        name: 'Gastroenteritis (Stomach Flu/Food Poisoning)',
        category: 'infectious',
        short_description: 'Inflammation of the lining of the intestines caused by a virus, bacteria, or parasites.',
        common_symptoms: ['watery diarrhea', 'abdominal cramps', 'nausea', 'vomiting', 'low-grade fever'],
        risk_factors: ['Contaminated food/water', 'Contact with infected person'],
        severity_levels: ['Mild', 'Moderate', 'Severe (Dehydration)'],
        is_curable: 'yes',
        treatment_knowledge: [
            { type: 'lifestyle', description: 'Oral Rehydration Salts (ORS), BRAT diet (Bananas, Rice, Applesauce, Toast)' },
            { type: 'medication_class', description: 'Antidiarrheals (consult doctor), Probiotics' }
        ],
        doctor_visit_trigger: 'Symptoms last > 2 days, signs of dehydration',
        emergency_trigger: 'Blood in stool, severe dehydration (dry mouth, no urine), high fever'
    },
    {
        id: 'anemia',
        name: 'Iron Deficiency Anemia',
        category: 'deficiency',
        short_description: 'A condition where you lack enough healthy red blood cells to carry adequate oxygen to your body\'s tissues.',
        common_symptoms: ['fatigue', 'weakness', 'pale skin', 'chest pain', 'fast heartbeat', 'shortness of breath', 'cold hands and feet'],
        risk_factors: ['Low iron diet', 'Blood loss (menstruation, ulcers)', 'Pregnancy'],
        severity_levels: ['Mild', 'Moderate', 'Severe'],
        is_curable: 'yes',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Iron supplements, Vitamin C' },
            { type: 'lifestyle', description: 'Iron-rich diet (spinach, red meat, lentils)' }
        ],
        doctor_visit_trigger: 'Unexplained fatigue, rapid heart rate',
        emergency_trigger: 'Severe shortness of breath, chest pain, fainting'
    },
    {
        id: 'arthritis',
        name: 'Arthritis (Osteoarthritis)',
        category: 'chronic',
        short_description: 'Inflammation of one or more joints, causing pain and stiffness that can worsen with age.',
        common_symptoms: ['joint pain', 'stiffness', 'swelling', 'reduced range of motion', 'knee pain'],
        risk_factors: ['Age', 'Obesity', 'Joint injuries', 'Family history'],
        severity_levels: ['Early', 'Moderate', 'Severe'],
        is_curable: 'no',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Analgesics (Paracetamol), NSAIDs' },
            { type: 'lifestyle', description: 'Physical therapy, weight loss, hot/cold therapy' }
        ],
        doctor_visit_trigger: 'Joint pain, swelling, or stiffness lasting > 2 weeks',
        emergency_trigger: 'Sudden, severe joint pain with fever (Septic Arthritis)'
    },
    {
        id: 'conjunctivitis',
        name: 'Conjunctivitis (Pink Eye/Eye Flu)',
        category: 'infectious',
        short_description: 'Inflammation or infection of the transparent membrane pointing the eyelid and eyeball.',
        common_symptoms: ['redness in eye', 'itchiness', 'gritty feeling', 'discharge that prevents opening eye', 'tearing'],
        risk_factors: ['Exposure to infected person', 'Allergens', 'Contact lenses'],
        severity_levels: ['Viral', 'Bacterial', 'Allergic'],
        is_curable: 'yes',
        treatment_knowledge: [
            { type: 'lifestyle', description: 'Warm compress, stop wearing contact lenses, wash hands frequently' },
            { type: 'medication_class', description: 'Antibiotic eye drops (for bacterial), Artificial tears' }
        ],
        doctor_visit_trigger: 'Pain in eye, blurred vision, light sensitivity',
        emergency_trigger: 'Sudden vision loss, severe eye pain with rainbow halos'
    },
    {
        id: 'gerd',
        name: 'Acid Reflux (GERD)',
        category: 'chronic',
        short_description: 'A digestive disease in which stomach acid or bile irritates the food pipe lining.',
        common_symptoms: ['heartburn', 'chest pain', 'difficulty swallowing', 'regurgitation of food', 'sensation of lump in throat'],
        risk_factors: ['Obesity', 'Pregnancy', 'Smoking', 'Spicy/fatty foods'],
        severity_levels: ['Mild', 'Moderate', 'Severe'],
        is_curable: 'sometimes',
        treatment_knowledge: [
            { type: 'medication_class', description: 'Antacids, H2 blockers, Proton pump inhibitors' },
            { type: 'lifestyle', description: 'Avoid trigger foods, don\'t lie down after eating, elevate head of bed' }
        ],
        doctor_visit_trigger: 'Frequent heartburn (>2 times/week), difficulty swallowing',
        emergency_trigger: 'Severe chest pain (mimics heart attack), vomiting blood'
    }
];
