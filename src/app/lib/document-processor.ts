import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Initialize PDF.js worker
// Using unpkg to avoid build configuration issues with local worker files in Vite
// We use the version exported from the library to ensure compatibility
GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;

export async function processDocument(file: File): Promise<string> {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return await readPdfFile(file);
    } else if (fileType.startsWith('image/')) {
        return await readImageFile(file);
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or Image.');
    }
}

async function readPdfFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

async function readImageFile(file: File): Promise<string> {
    // Tesseract.js handles the worker loading automatically from CDN by default
    const result = await Tesseract.recognize(
        file,
        'eng',
        {
            // logger removed
        }
    );
    return result.data.text;
}
