import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle, AlertTriangle, Phone, MapPin, Home } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

type RiskLevel = 'green' | 'yellow' | 'red';

export function RiskResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // This would be determined by symptom analysis
  const riskLevel: RiskLevel = (location.state?.riskLevel as RiskLevel) || 'yellow';

  const riskData = {
    green: {
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      title: 'Low Risk',
      message: 'Your symptoms appear to be minor. Monitor your condition and rest.',
      recommendations: [
        'Stay hydrated',
        'Get adequate rest',
        'Monitor symptoms for 2-3 days',
        'Visit a doctor if symptoms worsen',
      ],
    },
    yellow: {
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      title: 'Moderate Risk',
      message: 'Your symptoms need medical attention. Please consult a doctor soon.',
      recommendations: [
        'Visit your family doctor within 24-48 hours',
        'Take note of all symptoms',
        'Avoid self-medication',
        'Keep monitoring your condition',
      ],
    },
    red: {
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      title: 'High Risk',
      message: 'Your symptoms require immediate medical attention!',
      recommendations: [
        'Visit nearest hospital immediately',
        'Call 108 for ambulance if needed',
        'Do not wait or delay',
        'Inform family members',
      ],
    },
  };

  const currentRisk = riskData[riskLevel];
  const Icon = currentRisk.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4 py-6">
        {/* Result Card */}
        <Card className={`${currentRisk.bgColor} border-4 ${currentRisk.borderColor}`}>
          <CardHeader>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className={`bg-${currentRisk.color}-500 p-6 rounded-full`}>
                  <Icon className="w-16 h-16 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">{currentRisk.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-center text-lg text-${currentRisk.color}-900 mb-6`}>
              {currentRisk.message}
            </p>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What to do next:</h3>
              {currentRisk.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                  <div className={`w-6 h-6 rounded-full bg-${currentRisk.color}-500 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Actions (for red risk) */}
        {riskLevel === 'red' && (
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/nearby?emergency=true')}
              className="w-full h-14 bg-red-500 hover:bg-red-600 text-lg"
            >
              <Phone className="w-6 h-6 mr-3" />
              Call 108 / Emergency Map
            </Button>
            <Button
              onClick={() => navigate('/nearby?emergency=true')}
              variant="outline"
              className="w-full h-14 border-2 border-red-500 text-red-600 hover:bg-red-50 text-lg"
            >
              <MapPin className="w-6 h-6 mr-3" />
              Find Nearest Hospital
            </Button>
          </div>
        )}

        {/* Actions for yellow risk */}
        {riskLevel === 'yellow' && (
          <Button
            onClick={() => {
              alert('Opening doctor booking');
            }}
            className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-lg"
          >
            Book Doctor Appointment
          </Button>
        )}

        {/* Back to Home */}
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="w-full h-14 border-2 text-lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Button>

        {/* Disclaimer */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-900 text-center">
            <span className="font-bold">Important:</span> This assessment is not a medical diagnosis. It is based on the symptoms you reported and should not replace professional medical advice. If you're unsure, please consult a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
