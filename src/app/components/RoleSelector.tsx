import { ChefHat, Wallet, Truck, ArrowLeft } from 'lucide-react';
import type { Role } from '@/app/App';

type RoleSelectorProps = {
  onSelectRole: (role: Role) => void;
  onBack: () => void;
};

export function RoleSelector({ onSelectRole, onBack }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-primary flex flex-col p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <button
        onClick={onBack}
        className="self-start mb-6 p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform z-10"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center shadow-xl rotate-3">
              <span className="text-primary text-3xl font-black italic tracking-tighter">TIS</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Optimizer
          </h1>
          <p className="text-white/70 text-center mb-10 font-medium">
            Выберите вашу роль для продолжения
          </p>

          <div className="space-y-4">
            <button
              onClick={() => onSelectRole('chef')}
              className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl active:scale-95 transition-all border border-white/10 hover:bg-white/15"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ff3d00] to-[#d50000] rounded-2xl flex items-center justify-center shadow-lg">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-xl font-bold text-white">Шеф-повар</h2>
                  <p className="text-sm text-white/50">Создание списка продуктов</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectRole('financier')}
              className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl active:scale-95 transition-all border border-white/10 hover:bg-white/15"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2979ff] to-[#0091ea] rounded-2xl flex items-center justify-center shadow-lg">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-xl font-bold text-white">Финансист</h2>
                  <p className="text-sm text-white/50">Проверка и корректировка</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectRole('supplier')}
              className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl active:scale-95 transition-all border border-white/10 hover:bg-white/15"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ffab00] to-[#ff6d00] rounded-2xl flex items-center justify-center shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-xl font-bold text-white">Поставщик</h2>
                  <p className="text-sm text-white/50">Установка цен и доставка</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
