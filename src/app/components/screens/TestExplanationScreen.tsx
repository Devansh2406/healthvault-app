import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Download, AlertTriangle, CheckCircle, Pill, FileText, Activity, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { useApp } from '@/app/context/AppContext';

const SAMPLE_REPORT = {
  id: 'sample',
  name: 'Diagnostic Test Library',
  category: 'Medical Reference',
  date: new Date().toISOString().split('T')[0],
  analysis: "Welcome to the Diagnostic Test Library. \n\nThis section serves as a comprehensive guide to understanding various medical tests, their purposes, and what the results indicate. \n\nBrowse through common tests like Complete Blood Count (CBC), Lipid Profile, Thyroid Function Tests, and more to verify your understanding.",
  summary: "This reference library helps patients understand medical reports better. Always consult a doctor for a professional diagnosis.",
  keyFindings: [
    "Complete Blood Count (CBC)",
    "Lipid Profile (Cholesterol)",
    "Thyroid Profile (T3, T4, TSH)",
    "Blood Sugar (HbA1c)",
    "Liver Function Test (LFT)"
  ],
  reviewed: true,
  tags: ['Reference', 'Education']
};

export function TestExplanationScreen() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { reports, addReminder } = useApp();

  let report = reports.find(r => r.id === testId);

  // Fallback for Library Sample
  if (!report && testId === 'sample') {
    report = SAMPLE_REPORT as any;
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Report Not Found</h2>
        <p className="text-gray-500 mb-6">The report you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/reports')}>Go Back to Vault</Button>
      </div>
    );
  }

  const handleDownload = () => {
    if (report.file) {
      const url = URL.createObjectURL(report.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("Original file not available (Sample Data)");
    }
  };

  const handleView = () => {
    if (report.file) {
      const url = URL.createObjectURL(report.file);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate('/reports')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{report.name}</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Date and Basic Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
          <span>Uploaded on {report.date}</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{report.category}</span>
        </div>

        {/* AI Analysis Summary */}
        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-purple-900">AI Analysis</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
              {report.analysis || report.summary || "AI analysis is pending. Please check back shortly."}
            </p>
          </CardContent>
        </Card>

        {/* Key Findings */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 px-1">Key Findings</h3>
          <div className="grid gap-3">
            {(report.keyFindings || [report.name]).map((finding, idx) => (
              <Card key={idx} className="border-l-4 border-l-orange-400 shadow-sm">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full shrink-0">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{finding}</h4>
                    <p className="text-xs text-gray-500 mt-1">Found in report analysis</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary (if available) */}
        {report.summary && report.summary !== report.analysis && (
          <Card className="bg-gray-50 border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <h4 className="font-bold text-gray-700 text-sm">Full Summary</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{report.summary}</p>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3">
        {report.file ? (
          <>
            <Button variant="outline" className="flex-1" onClick={handleView}>
              <Eye className="w-4 h-4 mr-2" /> View
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </>
        ) : (
          <Button disabled className="w-full bg-gray-300 text-gray-500">
            <FileText className="w-4 h-4 mr-2" /> Digital Record Only
          </Button>
        )}
      </div>
    </div>
  );
}
