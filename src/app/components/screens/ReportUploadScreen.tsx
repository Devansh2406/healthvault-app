import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, FileText, CheckCircle, Star, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useApp } from '@/app/context/AppContext';
import { extractVitalsFromText, ExtractedVital } from '@/app/utils/vitalExtraction';

export function ReportUploadScreen() {
  const navigate = useNavigate();
  const { addReport, addVital } = useApp();

  // -- RESTORED STATE --
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState('');
  const [category, setCategory] = useState('blood');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [reportText, setReportText] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [showExtractionDialog, setShowExtractionDialog] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedVital[]>([]);
  const [selectedVitals, setSelectedVitals] = useState<Record<number, boolean>>({});

  const categories = [
    { value: 'blood', label: 'Blood Report' },
    { value: 'biochemistry', label: 'Biochemistry' },
    { value: 'hormones', label: 'Hormones' },
    { value: 'imaging', label: 'Imaging (X-Ray, MRI)' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'other', label: 'Other Document' },
  ];
  // -- END RESTORED STATE --

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      // Wait for state update/render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Camera access failed:", err);
      // Fallback to native input
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw frame
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to Blob/File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

            // Re-use logic
            setUploadedFile(file);
            setReportName(file.name.replace(/\.[^/.]+$/, ""));
            // Mock OCR for demo
            if (Math.random() > 0.5) {
              setReportText("Fasting Blood Sugar: 98 mg/dL\nBP: 120/80 mmHg");
            }

            setCompleted(true);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTriggerCamera = () => {
    // Try live camera first
    startCamera();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    if (!reportName) {
      setReportName(file.name.replace(/\.[^/.]+$/, ""));
    }

    if (file.name.toLowerCase().includes('blood') || file.name.toLowerCase().includes('lab')) {
      setReportText("Fasting Blood Sugar: 98 mg/dL\nBP: 120/80 mmHg\nHemoglobin: 14.5 g/dL");
    }

    setCompleted(true);
  };

  // Clean up stream on unmount
  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handlePreSave = () => {
    // 1. Try extraction
    const combinedText = `${reportName} ${notes} ${reportText}`;
    const vitals = extractVitalsFromText(combinedText);

    if (vitals.length > 0) {
      setExtractedData(vitals);
      const initialSelection: Record<number, boolean> = {};
      vitals.forEach((_, idx) => initialSelection[idx] = true);
      setSelectedVitals(initialSelection);
      setShowExtractionDialog(true);
    } else {
      handleFinalSave();
    }
  };

  const handleFinalSave = () => {
    if (!uploadedFile) return;

    const newReportId = Date.now().toString();
    addReport({
      id: newReportId,
      name: reportName || uploadedFile.name,
      category: categories.find(c => c.value === category)?.label || 'Other',
      date: reportDate,
      analysis: reportText || 'File stored successfully.',
      keyFindings: [],
      summary: 'Manually uploaded report.',
      notes,
      starred: isStarred,
      reviewed: false,
      file: uploadedFile
    });

    extractedData.forEach((vital, idx) => {
      if (selectedVitals[idx]) {
        addVital({
          id: Date.now().toString() + idx,
          type: vital.type,
          value: vital.value,
          unit: vital.unit,
          date: reportDate,
          time: '09:00',
          source: 'report',
          reportId: newReportId,
          notes: `Extracted from ${reportName}`
        });
      }
    });

    setShowExtractionDialog(false);
    navigate('/reports');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6 font-sans">
      {/* Hidden Input for File Selection */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileChange}
      />

      {/* Hidden Input for Camera fallback */}
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {/* Camera Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="flex-1 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full w-12 h-12 p-0"
              onClick={stopCamera}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>

            <button
              onClick={captureImage}
              className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all active:scale-95"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>

            <div className="w-12" /> {/* Spacer for centering */}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/reports')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Upload Report</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto mt-4">
        {!completed ? (
          <>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add Medical Record</h2>
              <p className="text-gray-500 text-sm px-8">Upload prescriptions, lab reports, or any health documents to organize them in your vault.</p>
            </div>

            <Card className="border-2 border-dashed border-gray-300 shadow-none bg-gray-50/50">
              <CardContent className="space-y-4 pt-6">
                <Button
                  onClick={handleTriggerUpload}
                  className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm text-base justify-center gap-3"
                >
                  <FileText className="w-5 h-5 text-blue-500" />
                  Select Document
                </Button>
                <Button
                  onClick={handleTriggerCamera}
                  variant="outline"
                  className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm text-base justify-center gap-3"
                >
                  <Camera className="w-5 h-5 text-teal-500" />
                  Take Photo
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-green-50 p-6 flex flex-col items-center justify-center border-b border-green-100">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="font-semibold text-green-800">File Selected</p>
              <p className="text-sm text-green-700 max-w-[200px] truncate">{uploadedFile?.name}</p>
              <Button variant="link" onClick={() => setCompleted(false)} className="text-green-700 text-xs h-auto p-0 mt-2">Change File</Button>
            </div>

            <CardContent className="p-5 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Report Name</label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="bg-gray-50"
                  placeholder="e.g. Annual Blood Work"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                  <Input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* simulated OCR text field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    Report Text
                    <Sparkles className="w-3 h-3 text-purple-500" />
                  </label>
                  <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">AI Extraction Ready</span>
                </div>
                <Textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="bg-gray-50 min-h-[100px] text-sm font-mono"
                  placeholder="Paste report text here for automatic data extraction..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-gray-50 min-h-[60px]"
                  placeholder="Doctor mentioned high cholesterol..."
                />
              </div>

              <div
                className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100 cursor-pointer"
                onClick={() => setIsStarred(!isStarred)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isStarred ? 'bg-yellow-400 text-white' : 'bg-white text-gray-300'}`}>
                  <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Mark as Important</p>
                  <p className="text-xs text-gray-500">Pin to top of your vault</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => navigate('/reports')} className="flex-1 text-gray-500">Cancel</Button>
                <Button
                  onClick={handlePreSave}
                  className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200"
                >
                  Save to Vault
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Extraction Confirmation Dialog */}
      <Dialog open={showExtractionDialog} onOpenChange={setShowExtractionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Insights Detected
            </DialogTitle>
            <DialogDescription>
              We found health markers in your report. Select the ones you want to track in your Health Timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {extractedData.map((vital, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Checkbox
                  id={`vital-${idx}`}
                  checked={selectedVitals[idx] || false}
                  onCheckedChange={(checked) => setSelectedVitals(prev => ({ ...prev, [idx]: checked as boolean }))}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={`vital-${idx}`}
                    className="text-sm font-bold text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {vital.type.toUpperCase().replace('_', ' ')}: {vital.value} {vital.unit}
                  </label>
                  <p className="text-xs text-gray-500">
                    Found: "{vital.originalText}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleFinalSave()}>Skip</Button>
            <Button onClick={() => handleFinalSave()} className="bg-purple-600 hover:bg-purple-700 text-white">
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
