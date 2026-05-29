

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-8 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
        <div className="prose text-slate-600 text-sm">
          <p>By using FinInsight, you agree to the following terms...</p>
          {/* Add your terms text here */}
        </div>
        <button 
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

// CRITICAL: This line must exist for the import in login.tsx to work
export default TermsModal;