import { useState, useEffect } from 'react';
import { ArrowLeft, Send, ChefHat, MessageSquare, Check, Trash2, Plus, RefreshCcw } from 'lucide-react';
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
  onRefresh?: () => void;
};

export function ChefView({ order, onUpdateOrder, onBackToRoles, branch, onRefresh }: ChefViewProps) {
  const [localProducts, setLocalProducts] = useState(order.products);

  // Синхронизация localProducts при изменении order.products
  useEffect(() => {
    setLocalProducts(order.products);
  }, [order.products]);

  const handleUpdateProduct = (productId: string, field: string, value: any) => {
    setLocalProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSend = () => {
    if (order.status === 'sent_to_chef') {
      // Валидация: проверяем, что хотя бы один продукт имеет quantity > 0
      const hasProducts = localProducts.some(p => p.quantity > 0);
      if (!hasProducts) {
        alert('Пожалуйста, укажите количество хотя бы для одного продукта');
        return;
      }

      onUpdateOrder({
        ...order,
        products: localProducts,
        status: 'sent_to_financier',
      });
      alert('Список продуктов отправлен финансисту');
    } else if (order.status === 'chef_checking') {
      onUpdateOrder({
        ...order,
        products: localProducts,
        status: 'financier_checking',
      });
      alert('Проверка завершена. Отправлено финансисту на финальную проверку');
    }
  };

  const isReadOnly = order.status !== 'sent_to_chef' && order.status !== 'chef_checking';
  const isCheckingMode = order.status === 'chef_checking';

  // Group products by category
  // In checking mode, show only selected products
  const displayProducts = isCheckingMode
    ? localProducts.filter(p => p.quantity > 0)
    : localProducts;

  const categories = Array.from(new Set(displayProducts.map(p => p.category)));

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f5] flex flex-col">
      <header className="flex-none text-white p-4 pb-4 rounded-b-2xl shadow-lg relative overflow-hidden" style={{ backgroundColor: '#8B0000' }}>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <button onClick={onBackToRoles} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            <h1 className="text-lg font-bold">Шеф-повар</h1>
          </div>
          {onRefresh ? (
            <button
              onClick={onRefresh}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-white/80 text-[10px] uppercase font-semibold">Филиал: {branchNames[branch]}</p>
            <h2 className="text-xl font-bold italic tracking-tight leading-none">
              {order.createdAt.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
              })}
            </h2>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 -mt-2 pb-[180px]">
        <div className="space-y-8">
          {categories.map(category => {
            const categoryProducts = displayProducts.filter(p => p.category === category);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pl-2 border-l-4" style={{ borderColor: '#8B0000' }}>
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 transition-all active:scale-[0.98]">
                      <div className="flex items-start justify-between gap-3">
                        {isCheckingMode && (
                          <button
                            onClick={() => handleUpdateProduct(product.id, 'checked', !product.checked)}
                            className={`mt-1 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center flex-shrink-0 ${product.checked
                              ? 'bg-[#8B0000] border-[#8B0000] text-white'
                              : 'bg-white border-gray-200 text-transparent'
                              }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <div className="flex-1">
                          <h4 className={`font-bold text-gray-900 text-lg leading-tight mb-1 ${isCheckingMode && product.checked ? 'text-gray-400 line-through' : ''}`}>
                            {product.name}
                          </h4>
                          {isCheckingMode && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {product.price && (
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                  Цена: {product.price.toLocaleString()} сум
                                </span>
                              )}
                              {product.comment && (
                                <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-xl border border-blue-100 w-full">
                                  <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                                  <p><b>Поставщик:</b> {product.comment}</p>
                                </div>
                              )}
                            </div>
                          )}
                          {isCheckingMode && (
                            <textarea
                              placeholder="Ваш комментарий по доставке..."
                              value={product.chefComment || ''}
                              onChange={(e) => handleUpdateProduct(product.id, 'chefComment', e.target.value)}
                              rows={1}
                              className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 text-sm mt-2 focus:ring-1 focus:ring-[#8B0000] transition-all resize-none"
                            />
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={product.quantity || ''}
                              onChange={(e) => handleUpdateProduct(product.id, 'quantity', Math.max(0, parseFloat(e.target.value) || 0))}
                              placeholder="0"
                              disabled={isReadOnly || isCheckingMode}
                              className="w-20 bg-gray-50 border-none rounded-2xl px-2 py-2 text-center font-bold text-gray-900 transition-all text-lg disabled:opacity-50"
                              style={{ outlineColor: '#8B0000' }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {product.unit}
                          </span>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-4 rounded-t-[2.5rem] shadow-2xl z-20">
        {!isReadOnly && (
          <button
            onClick={handleSend}
            className="w-full text-white font-bold py-4 rounded-3xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-lg hover:opacity-90"
            style={{ backgroundColor: '#8B0000', boxShadow: '0 10px 15px -3px rgba(139, 0, 0, 0.3)' }}
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
