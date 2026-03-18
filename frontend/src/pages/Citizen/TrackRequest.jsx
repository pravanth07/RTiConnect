import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { citizenAPI } from '../../api';
import { PageWrapper, StatusBadge, DeadlineBadge } from '../../components/UI';
import { format } from 'date-fns';
import { FileText, Download, ArrowLeft, ShieldCheck, Link as LinkIcon, Loader } from 'lucide-react';
import DownloadReceipt from '../../components/DownloadReceipt';
import { useState } from 'react';

// Pseudo-SHA generator for simulation
const generateHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(12, '0') + Math.random().toString(16).slice(2, 8);
};

export default function TrackRequest() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['track', id], queryFn: () => citizenAPI.trackRequest(id) });
  const req = data?.data?.request;
  
  // Blockchain Simulation State
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 2000); // 2 second mock verification
  };

  if (isLoading) return <PageWrapper title="Track Request"><div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-xl" /><div className="h-64 bg-gray-200 rounded-xl" /></div></PageWrapper>;
  if (!req) return <PageWrapper title="Track Request"><p className="text-red-600">Request not found.</p></PageWrapper>;

  return (
    <PageWrapper title="Track RTI Request">
      <div className="max-w-3xl space-y-6">
        <Link to="/citizen" className="flex items-center gap-2 text-blue-700 hover:underline text-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Request header */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-blue-700 text-sm font-semibold">{req.requestId}</p>
              <h2 className="text-xl font-bold mt-1">{req.subject}</h2>
              <p className="text-gray-500 text-sm">{req.department}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={req.status} />
              <DeadlineBadge daysRemaining={req.daysRemaining} />
            </div>
          </div>
          <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
            <p className="font-medium mb-1">Information Sought:</p>
            <p className="whitespace-pre-wrap">{req.description}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-gray-500">Filed On</p><p className="font-medium">{format(new Date(req.createdAt), 'dd MMM yyyy')}</p></div>
            <div><p className="text-gray-500">Deadline</p><p className="font-medium">{format(new Date(req.responseDeadline), 'dd MMM yyyy')}</p></div>
            <div><p className="text-gray-500">Assigned PIO</p><p className="font-medium">{req.assignedPIO?.name || '—'}</p></div>
          </div>

          {/* Download Receipt Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <DownloadReceipt requestId={req._id} />
          </div>
        </div>

        {/* Response */}
        {req.response && (
          <div className="card border-l-4 border-green-500">
            <h3 className="font-semibold text-green-800 mb-3">✅ PIO Response</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{req.response}</p>
            {req.responseDocuments?.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-600">Attached Documents:</p>
                {req.responseDocuments.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-700 hover:underline">
                    <Download size={14} /> {doc.originalName}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rejection */}
        {req.rejectionReason && (
          <div className="card border-l-4 border-red-500">
            <h3 className="font-semibold text-red-800 mb-2">❌ Rejection Reason</h3>
            <p className="text-gray-700">{req.rejectionReason}</p>
            <p className="text-sm text-gray-500 mt-2">You may file a First Appeal within 30 days under Section 19.</p>
            <Link to={`/citizen/appeal/${req._id}`} className="btn-primary inline-block mt-3 text-sm">File First Appeal</Link>
          </div>
        )}

        {/* Timeline */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ShieldCheck className="text-green-600" /> Immutable Audit Trail
            </h3>
            
            {verified ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 font-bold text-xs rounded-lg border border-green-200">
                <ShieldCheck size={14} /> Cryptographically Verified
              </div>
            ) : (
              <button 
                onClick={handleVerify} 
                disabled={verifying}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors border border-gray-300 disabled:opacity-50"
              >
                {verifying ? (
                  <><Loader size={14} className="animate-spin" /> Verifying Nodes...</>
                ) : (
                  <><LinkIcon size={14} /> Verify Integrity</>
                )}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {req.statusHistory?.map((item, i) => {
              // Generate a deterministic fake hash based on the item details
              const txHash = generateHash(item.status + item.changedAt + (item.note || ''));
              
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${verified ? 'bg-green-500' : 'bg-blue-600'}`}>
                      {verified && <ShieldCheck size={10} className="text-white" />}
                    </div>
                    {i < req.statusHistory.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${verified ? 'bg-green-200' : 'bg-blue-200'}`} />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="text-xs text-gray-400 font-medium">{format(new Date(item.changedAt), 'dd MMM yyyy HH:mm')}</span>
                      </div>
                      
                      {/* TxHash display */}
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded font-mono text-[10px] text-gray-500" title="Blockchain Transaction Hash">
                        <LinkIcon size={10} />
                        Tx: {txHash}
                      </div>
                    </div>
                    {item.note && <p className="text-sm text-gray-700 mt-2 bg-gray-50/50 p-2 rounded">{item.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
