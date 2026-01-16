import { HealthMetric } from '@/app/context/AppContext';

export interface ExtractedVital {
    type: HealthMetric['type'];
    value: number;
    unit: string;
    confidence: number; // 0 to 1
    originalText: string;
}

export const extractVitalsFromText = (text: string): ExtractedVital[] => {
    const extracted: ExtractedVital[] = [];
    const normalizedText = text.toLowerCase();

    // 1. Blood Sugar / Glucose
    // Patterns: "Fasting Blood Sugar: 90", "Glucose (F): 110 mg/dL", "FBS 95"
    const sugarRegex = /(?:fasting blood sugar|fbs|glucose \(f\)|blood sugar|glucose)[\s:]+(\d{2,3})/i;
    const sugarMatch = normalizedText.match(sugarRegex);
    if (sugarMatch && sugarMatch[1]) {
        extracted.push({
            type: 'sugar',
            value: parseInt(sugarMatch[1]),
            unit: 'mg/dL',
            confidence: 0.9,
            originalText: sugarMatch[0]
        });
    }

    // 2. Blood Pressure
    // Patterns: "BP: 120/80", "Blood Pressure 110/70 mmhg"
    const bpRegex = /(?:bp|blood pressure)[\s:]+(\d{2,3})\/(\d{2,3})/i;
    const bpMatch = normalizedText.match(bpRegex);
    if (bpMatch && bpMatch[1] && bpMatch[2]) {
        extracted.push({
            type: 'bp_sys',
            value: parseInt(bpMatch[1]),
            unit: 'mmHg',
            confidence: 0.9,
            originalText: bpMatch[0]
        });
        extracted.push({
            type: 'bp_dia',
            value: parseInt(bpMatch[2]),
            unit: 'mmHg',
            confidence: 0.9,
            originalText: bpMatch[0]
        });
    }

    // 3. Weight
    // Patterns: "Weight: 70kg", "Weight 70.5 kg"
    const weightRegex = /(?:weight|wt)[\s:]+(\d{2,3}(?:\.\d)?)\s*(?:kg|kgs)/i;
    const weightMatch = normalizedText.match(weightRegex);
    if (weightMatch && weightMatch[1]) {
        extracted.push({
            type: 'weight',
            value: parseFloat(weightMatch[1]),
            unit: 'kg',
            confidence: 0.85,
            originalText: weightMatch[0]
        });
    }

    // 4. Thyroid (TSH)
    // Patterns: "TSH: 2.5", "Thyroid Stimulating Hormone 3.4"
    const tshRegex = /(?:tsh|thyroid stimulating hormone)[\s:]+(\d{1,2}(?:\.\d{1,2})?)/i;
    const tshMatch = normalizedText.match(tshRegex);
    if (tshMatch && tshMatch[1]) {
        extracted.push({
            type: 'thyroid',
            value: parseFloat(tshMatch[1]),
            unit: 'mIU/L',
            confidence: 0.85,
            originalText: tshMatch[0]
        });
    }

    // 5. Hemoglobin
    // Patterns: "Hemoglobin: 13.5", "Hb 12.0"
    const hbRegex = /(?:hemoglobin|hb)[\s:]+(\d{1,2}(?:\.\d{1,2})?)/i;
    const hbMatch = normalizedText.match(hbRegex);
    if (hbMatch && hbMatch[1]) {
        extracted.push({
            type: 'hemoglobin',
            value: parseFloat(hbMatch[1]),
            unit: 'g/dL',
            confidence: 0.9,
            originalText: hbMatch[0]
        });
    }

    return extracted;
};
