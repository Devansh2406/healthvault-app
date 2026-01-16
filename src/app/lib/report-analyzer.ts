
// Types for Analysis
export interface DetectedValue {
    testName: string;
    originalName: string;
    value: number;
    unit: string;
    status: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';
    rangeUsed: string;
}

export interface AnalysisResult {
    rawText: string;
    findings: DetectedValue[];
    detectedDate?: string;
    followUpQuestions: string[];
    riskLevel: 'GREEN' | 'YELLOW' | 'RED';
    summary: string;
}

interface TestDef {
    id: string;
    keywords: string[];
    excludes?: string[];
    unitRegex: RegExp;
    min: number;
    max: number;
    critical_min: number;
    critical_max: number;
    questions_low?: string[];
    questions_high?: string[];
    desc: string;
}

// 1. KNOWLEDGE BASE: Simplified Reference Ranges
// This acts as the "Hard-coded Training Data"
const TEST_REFERENCES: TestDef[] = [
    {
        id: 'hemoglobin',
        keywords: ['hemoglobin', 'haemoglobin', 'hgb', 'hb'],
        excludes: ['glycosylated', 'a1c', 'mean', 'corpuscular', 'cell'],
        unitRegex: /(g\/?dl|gm\/?%)/i,
        min: 12.0, max: 17.0,
        critical_min: 7.0, critical_max: 20.0,
        questions_low: ["Do you experience shortness of breath?", "Do you feel constantly tired?"],
        questions_high: ["Do you smoke?", "Do you engage in high-altitude travel?"],
        desc: "Carries oxygen. Low = Anemia."
    },
    {
        id: 'wbc',
        keywords: ['wbc', 'white blood', 'leukocyte', 'tlc', 'total count'],
        excludes: ['rbc'],
        unitRegex: /(\/cumm|\/ul|\/mm3)/i,
        min: 4000, max: 11000,
        critical_min: 2000, critical_max: 25000,
        questions_low: ["Have you had recent recurrent infections?"],
        questions_high: ["Do you currently have a fever?", "Any body aches?"],
        desc: "Immunity marker. High = Infection."
    },
    {
        id: 'platelets',
        keywords: ['platelet', 'plt', 'thrombocyte'],
        excludes: ['mean', 'volume', 'mpv'],
        unitRegex: /(lakh|\/cumm|10\^3)/i,
        min: 150000, max: 450000,
        critical_min: 40000, critical_max: 1000000,
        questions_low: ["Do you bleed easily from gums?", "Red spots on skin?"],
        questions_high: ["Any tingling in hands?"],
        desc: "Clotting factor. Low = Bleeding risk."
    },
    {
        id: 'glucose_fasting',
        keywords: ['fasting blood sugar', 'fbs', 'glucose fasting'],
        excludes: ['urine', 'pp'],
        unitRegex: /mg\/?dl/i,
        min: 70, max: 100,
        critical_min: 50, critical_max: 350,
        questions_high: ["Excessive thirst?", "Frequent urination at night?"],
        questions_low: ["Dizziness or shaking?"],
        desc: "Blood sugar (Fasting). High = Diabetes risk."
    },
    {
        id: 'creatinine',
        keywords: ['creatinine', 's. creat'],
        excludes: ['urine', 'ratio'],
        unitRegex: /mg\/?dl/i,
        min: 0.6, max: 1.2,
        critical_min: 0.1, critical_max: 3.0,
        questions_high: ["Swollen feet?", "Reduced urine output?"],
        desc: "Kidney function."
    }
];

// 2. PARSING ENGINE
export function analyzeReport(text: string): AnalysisResult {
    const lines = text.split('\n');
    const findings: DetectedValue[] = [];
    const questionsSet = new Set<string>();

    // Date Detection
    const dateMatch = text.match(/\b\d{1,2}[-./]\d{1,2}[-./]\d{2,4}\b/);
    const detectedDate = dateMatch ? dateMatch[0] : undefined;

    TEST_REFERENCES.forEach(test => {
        lines.forEach(line => {
            const lowerLine = line.toLowerCase();

            // 1. Keyword Detection
            const keyword = test.keywords.find(k => lowerLine.includes(k));
            if (!keyword) return;

            // 2. Exclusion Logic
            if (test.excludes && test.excludes.some(exc => lowerLine.includes(exc))) return;

            // 3. Value Extraction
            const afterKeyword = lowerLine.substring(lowerLine.indexOf(keyword) + keyword.length);
            const numberMatch = afterKeyword.match(/(\d+(\.\d+)?)/);

            if (numberMatch && numberMatch[0]) {
                const val = parseFloat(numberMatch[0]);

                // Sanity Check (Ignore absurd values data)
                if (test.id === 'hemoglobin' && val > 30) return;
                if (test.id === 'wbc' && val < 50) return;

                const unitMatch = afterKeyword.match(test.unitRegex);
                const unit = unitMatch ? unitMatch[0] : '';

                // 4. Logic & Interpretation (Determining Risk)
                let status: DetectedValue['status'] = 'normal';
                let compVal = val;
                if (test.id === 'platelets' && val < 10 && unit.includes('lakh')) compVal = val * 100000;

                if (compVal < test.critical_min) status = 'critical_low';
                else if (compVal > test.critical_max) status = 'critical_high';
                else if (compVal < test.min) status = 'low';
                else if (compVal > test.max) status = 'high';

                findings.push({
                    testName: test.id,
                    originalName: keyword.toUpperCase(),
                    value: val,
                    unit: unit,
                    status: status,
                    rangeUsed: `${test.min}-${test.max}`
                });

                if (status !== 'normal') {
                    if (status.includes('low')) test.questions_low?.forEach(q => questionsSet.add(q));
                    if (status.includes('high')) test.questions_high?.forEach(q => questionsSet.add(q));
                }
            }
        });
    });

    // Deduplication
    const uniqueFindings = Array.from(new Map(findings.map(item => [item.testName, item])).values());

    // 6. Risk Scoring Engine (Deterministic)
    let riskLevel: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    if (uniqueFindings.some(f => f.status.includes('critical'))) riskLevel = 'RED';
    else if (uniqueFindings.some(f => f.status !== 'normal')) riskLevel = 'YELLOW';

    // 8. Explanation Output
    let summaryParts: string[] = [];

    if (detectedDate) summaryParts.push(`**Date:** ${detectedDate}`);

    if (riskLevel === 'RED') {
        summaryParts.push("🔴 **RED RISK: Visit nearest hospital immediately.**\nExtremely abnormal values detected.");
    } else if (riskLevel === 'YELLOW') {
        summaryParts.push("🟡 **Yellow:** Consult doctor soon.\nModerate abnormal values found.");
    } else if (uniqueFindings.length > 0) {
        summaryParts.push("🟢 **Green:** Monitor and consult doctor if needed.\nResults appear within standard ranges.");
    } else {
        summaryParts.push("ℹ️ **Note:** No distinct medical values extracted. Ensure image is clear.");
    }

    const abnormalFindings = uniqueFindings.filter(f => f.status !== 'normal');
    if (abnormalFindings.length > 0) {
        summaryParts.push("\n**Findings:**");
        abnormalFindings.forEach(f => {
            const testRef = TEST_REFERENCES.find(t => t.id === f.testName);
            const statusLabel = f.status.includes('high') ? 'Higher than commonly seen' : 'Lower than usually expected';

            summaryParts.push(`• **${f.originalName}** is ${statusLabel}.`);
        });
    }

    const summary = summaryParts.join('\n');

    return {
        rawText: text,
        findings: uniqueFindings,
        detectedDate,
        followUpQuestions: Array.from(questionsSet),
        riskLevel,
        summary
    };
}
