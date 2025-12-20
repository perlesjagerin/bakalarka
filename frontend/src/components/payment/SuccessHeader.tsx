import { CheckCircle } from 'lucide-react';

export default function SuccessHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
        <CheckCircle className="text-green-600" size={48} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Platba byla úspěšná!
      </h1>
      <p className="text-gray-600">
        Vaše rezervace byla potvrzena. Potvrzení jsme vám zaslali na e-mail.
      </p>
    </div>
  );
}
