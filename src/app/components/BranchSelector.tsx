import { MapPin } from 'lucide-react';
import type { Branch } from '@/app/App';

type BranchSelectorProps = {
  onSelectBranch: (branch: Branch) => void;
};

const branches: { id: Branch; name: string; color: string }[] = [
  { id: 'chilanzar', name: 'Чиланзар (Новза)', color: 'from-[#9b59b6] to-[#8e44ad]' },
  { id: 'uchtepa', name: 'Учтепа', color: 'from-[#3498db] to-[#2980b9]' },
  { id: 'shayzantaur', name: 'Шайзантаур', color: 'from-[#e74c3c] to-[#c0392b]' },
  { id: 'olmazar', name: 'Олмазар', color: 'from-[#16a085] to-[#138d75]' },
];

export function BranchSelector({ onSelectBranch }: BranchSelectorProps) {
  return (
    <div className="min-h-screen bg-primary flex flex-col p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center shadow-xl rotate-3">
              <span className="text-primary text-3xl font-black italic tracking-tighter">TIS</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Выберите филиал
          </h1>
          <p className="text-white/70 text-center mb-10 font-medium">
            С каким филиалом вы работаете?
          </p>

          <div className="space-y-4">
            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => onSelectBranch(branch.id)}
                className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl active:scale-95 transition-all border border-white/10 hover:bg-white/15"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${branch.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="text-xl font-bold text-white">{branch.name}</h2>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

