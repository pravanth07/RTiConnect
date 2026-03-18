import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cioAPI } from '../../api';
import { PageWrapper } from '../../components/UI';
import toast from 'react-hot-toast';
import { UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';

export default function ManagePIOs() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '', designation: '' });

  const { data, isLoading } = useQuery({ queryKey: ['cioAllPIOs'], queryFn: cioAPI.getPIOs });
  const pios = data?.data?.pios || [];

  const createMut = useMutation({
    mutationFn: () => cioAPI.createPIO(form),
    onSuccess: () => { toast.success('PIO account created!'); setShowForm(false); setForm({ name: '', email: '', password: '', phone: '', department: '', designation: '' }); qc.invalidateQueries(['cioAllPIOs']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const toggleMut = useMutation({
    mutationFn: (id) => cioAPI.togglePIO(id),
    onSuccess: () => { toast.success('PIO status updated.'); qc.invalidateQueries(['cioAllPIOs']); },
  });

  return (
    <PageWrapper title="Manage PIO Officers">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-sm">{pios.length} PIO officers registered</p>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <UserPlus size={16} /> Add New PIO
          </button>
        </div>

        {showForm && (
          <div className="card border-2 border-blue-200">
            <h3 className="font-semibold mb-4">Create PIO Account</h3>
            <div className="grid grid-cols-2 gap-4">
              {[['name','Full Name'],['email','Email'],['password','Password'],['phone','Phone'],['department','Department'],['designation','Designation']].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                  <input type={key === 'password' ? 'password' : 'text'} className="input-field" placeholder={label} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="btn-primary">
                {createMut.isPending ? 'Creating...' : 'Create PIO'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        <div className="card">
          {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-600">Name</th>
                  <th className="pb-3 font-medium text-gray-600">Email</th>
                  <th className="pb-3 font-medium text-gray-600">Department</th>
                  <th className="pb-3 font-medium text-gray-600">Active Requests</th>
                  <th className="pb-3 font-medium text-gray-600">Overdue</th>
                  <th className="pb-3 font-medium text-gray-600">Status</th>
                  <th className="pb-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pios.map(pio => (
                  <tr key={pio._id} className={`hover:bg-gray-50 ${!pio.isActive ? 'opacity-50' : ''}`}>
                    <td className="py-3 font-medium">{pio.name}</td>
                    <td className="py-3 text-gray-500">{pio.email}</td>
                    <td className="py-3">{pio.department}</td>
                    <td className="py-3 text-center">{pio.activeRequests}</td>
                    <td className="py-3 text-center">{pio.overdueRequests > 0 ? <span className="text-red-600 font-bold">{pio.overdueRequests}</span> : '0'}</td>
                    <td className="py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${pio.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{pio.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="py-3">
                      <button onClick={() => toggleMut.mutate(pio._id)} className="text-gray-500 hover:text-blue-700 transition-colors">
                        {pio.isActive ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
