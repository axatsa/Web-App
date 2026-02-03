import { useState } from 'react';
import { ArrowLeft, Send, ChefHat, MessageSquare } from 'lucide-react';
import type { Order, Branch } from '@/app/App';
import { StatusBadge } from '@/app/components/StatusBadge';

const branchNames: Record<Branch, string> = {
  chilanzar: 'Чиланзар (Новза)',
  uchtepa: 'Учтепа',
  shayzantaur: 'Шайзантаур',
  olmazar: 'Олмазар',
};

type ChefViewProps = {
  order: Order;
  onUpdateOrder: (order: Order) => void;
  onBackToRoles: () => void;
  branch: Branch;
};

export function ChefView({ order, onUpdateOrder, onBackToRoles, branch }: ChefViewProps) {
  const [localProducts, setLocalProducts] = useState(order.products);

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, quantity: Math.max(0, numValue) } : p
      )
    );
  };

  const handleSend = () => {
    if (order.status === 'sent_to_chef') {
      onUpdateOrder({
        ...order,
        products: localProducts,
        status: 'sent_to_financier',
      });
      alert('Список продуктов отправлен финансисту');
    } else if (order.status === 'chef_checking') {
      onUpdateOrder({
        ...order,
        status: 'financier_checking',
      });
      alert('Проверка завершена. Отправлено финансисту на финальную проверку');
    }
  };

  const isReadOnly = order.status !== 'sent_to_chef' && order.status !== 'chef_checking';
  const isCheckingMode = order.status === 'chef_checking';

  // Group products by category
  const categories = Array.from(new Set(localProducts.map(p => p.category)));

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <header className="bg-red-600 text-white p-6 pb-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <button onClick={onBackToRoles} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Шеф-повар</h1>
          </div>
          <div className="w-10" />
        </div>

        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1 uppercase tracking-wider font-semibold">Филиал: {branchNames[branch]}</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic tracking-tight">Неделя {order.weekNumber}</h2>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 -mt-6">
        <div className="space-y-8 pb-32">
          {categories.map(category => {
            const categoryProducts = localProducts.filter(p => p.category === category);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pl-2 border-l-4 border-red-500">
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 transition-all active:scale-[0.98]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h4>
                          {isCheckingMode && product.comment && (
                            <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-xl mt-1 border border-blue-100">
                              <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                              <p><b>Поставщик:</b> {product.comment}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={product.quantity || ''}
                              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                              placeholder="0"
                              disabled={isReadOnly}
                              className="w-20 bg-gray-50 border-none rounded-2xl px-4 py-2 text-center font-bold text-gray-900 focus:ring-2 focus:ring-red-500 transition-all text-lg disabled:opacity-50"
                            />
                            <span className="absolute -bottom-5 right-0 left-0 text-[10px] text-center font-bold text-gray-400 uppercase">
                              {product.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Action bar and info summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 space-y-4 rounded-t-[2.5rem] shadow-2xl z-20">
        {!isReadOnly && (
          <button
            onClick={handleSend}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-3xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
          >
            <Send className="w-5 h-5" />
            {order.status === 'sent_to_chef' ? 'Отправить финансисту' : 'Завершить проверку'}
          </button>
        )}
        {isReadOnly && (
          <div className="text-center p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Редактирование в данном статусе недоступно</p>
          </div>
        )}
      </div>
    </div>
  );
}
