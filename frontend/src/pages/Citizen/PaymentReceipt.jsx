import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/UI';
import { CheckCircle2, Download, Printer, ArrowLeft } from 'lucide-react';

export default function PaymentReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If no state is present, it means the user tried accessing this directly without a payment.
  if (!location.state) {
    return <Navigate to="/citizen" replace />;
  }

  const { paymentId, orderId, amount, requestId, department, subject, date } = location.state;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageWrapper title="Payment Receipt">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <button 
            type="button" 
            onClick={() => navigate('/citizen')} 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <button 
            onClick={handlePrint}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Printer size={16} />
            Print / Download PDF
          </button>
        </div>

        {/* Receipt Card */}
        <div className="card border-t-4 border-t-green-500 print:shadow-none print:border-t-green-500 overflow-hidden bg-white">
          <div className="text-center p-6 border-b border-gray-100 bg-green-50/30">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 scale-in">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful</h2>
            <p className="text-gray-600">Your RTI application has been submitted.</p>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Receipt Number</p>
                <p className="font-mono text-gray-900 font-medium">{paymentId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date Paid</p>
                <p className="text-gray-900">{new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Applicant Name</p>
                  <p className="font-semibold text-gray-900">{user?.name || 'Citizen'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">RTI Request ID</p>
                <p className="font-mono font-medium text-blue-700 bg-blue-50 py-1 px-3 rounded-md inline-block">
                  {requestId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="text-gray-900 font-medium">{department}</p>
                </div>
                 <div>
                  <p className="text-xs text-gray-500 mb-1">Subject</p>
                  <p className="text-gray-900 truncate" title={subject}>{subject}</p>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="mt-8 border rounded-lg overflow-hidden border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="py-3 px-4 font-medium">Description</th>
                      <th className="py-3 px-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-4 px-4 text-gray-900">RTI Application Fee (Section 6)</td>
                      <td className="py-4 px-4 text-right font-medium text-gray-900">₹{amount}.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 font-bold text-gray-900">Total Paid</th>
                      <th className="py-3 px-4 text-right font-bold text-xl text-gray-900">₹{amount}.00</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
              <p>This is a computer-generated receipt and does not require a physical signature.</p>
              <p className="mt-1">Order ID: {orderId}</p>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none !important;
            }
            .card, .card * {
              visibility: visible;
            }
            .card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
            }
            body {
               background: white;
            }
          }
        `}} />
      </div>
    </PageWrapper>
  );
}
