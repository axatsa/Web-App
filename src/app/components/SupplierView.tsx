import { useState, useEffect } from 'react';
import { ArrowLeft, Send, MessageSquare, Truck, Check, RefreshCcw } from 'lucide-react';
import type { Order, Branch } from '@/app/App';
import { getTashkentDate } from '@/app/App';
import { StatusBadge } from '@/app/components/StatusBadge';

const branchNames: Record<Branch, string> = {
  chilanzar: 'Чиланзар (Новза)',
  uchtepa: 'Учтепа',
  shayzantaur: 'Шайзантаур',
  olmazar: 'Олмазар',
};

type SupplierViewProps =
  | {
    orders: Order[];
    onSelectOrder: (orderId: string) => void;
    onBackToRoles: () => void;
    onRefresh?: () => void;
  }
  | {
    order: Order;
    onUpdateOrder: (order: Order) => void;
    onBackToRoles: () => void;
    branch: Branch;
    onRefresh?: () => void;
  };

export function SupplierView(props: SupplierViewProps) {
  // If showing list of orders
  if ('orders' in props) {
    const { orders, onSelectOrder, onBackToRoles, onRefresh } = props;
    const activeOrders = orders.filter(o => o.status === 'sent_to_supplier');

    return (
      <div className="h-screen overflow-hidden bg-[#f5f5f5] flex flex-col">
        <header className="flex-none text-white p-4 pb-4 rounded-b-2xl shadow-lg relative overflow-hidden" style={{ backgroundColor: '#FF6B00' }}>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <button onClick={onBackToRoles} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <h1 className="text-lg font-bold">Поставщик</h1>
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

          <div className="relative z-10">
            <h2 className="text-xl font-bold italic tracking-tight leading-none">Все заявки</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 -mt-2 pb-[120px]">
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] shadow-md border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Заказов пока нет</h3>
                <p className="text-gray-500">Сейчас нет новых заявок для обработки.</p>
              </div>
            ) : (
              activeOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="bg-white p-6 rounded-[2.5rem] shadow-md border border-gray-100 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#fff3e0' }}>
                          <Truck className="w-6 h-6" style={{ color: '#FF6B00' }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{branchNames[order.branch]}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            {order.createdAt.toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="ml-16">
                        <p className="text-sm text-gray-600">
                          Позиций: <span className="font-bold text-gray-900">{order.products.filter(p => p.quantity > 0).length}</span>
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  // If showing details of a single order
  const { order, onUpdateOrder, onBackToRoles, branch } = props;
  const [localProducts, setLocalProducts] = useState(order.products);

  // Синхронизация localProducts при изменении order.products
  useEffect(() => {
    setLocalProducts(order.products);
  }, [order.products]);

  const handleUpdateProduct = (productId: string, field: 'price' | 'comment' | 'checked', value: any) => {
    setLocalProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSend = () => {
    // Validation: Check if all products have a price
    const missingPrice = localProducts.some(p => p.quantity > 0 && (!p.price || p.price <= 0));

    if (missingPrice) {
      alert('Пожалуйста, укажите цену для всех товаров! Финансист не примет заявку без цен.');
      return;
    }

    onUpdateOrder({
      ...order,
      products: localProducts,
      status: 'chef_checking',
    });
    alert('Заявка заполнена и отправлена шеф-повару на проверку');
  };

  const filteredProducts = localProducts.filter(p => p.quantity > 0);
  const categories = Array.from(new Set(filteredProducts.map(p => p.category)));
  const totalAmount = filteredProducts.reduce((sum, p) => sum + ((p.price || 0) * p.quantity), 0);
  const totalWithPrice = filteredProducts.filter(p => (p.price || 0) > 0).length;
  const allPricesFilled = filteredProducts.length > 0 && totalWithPrice === filteredProducts.length;

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f5] flex flex-col">
      <header className="flex-none text-white p-4 pb-4 rounded-b-2xl shadow-lg relative overflow-hidden" style={{ backgroundColor: '#FF6B00' }}>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <button onClick={onBackToRoles} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <h1 className="text-lg font-bold">Поставщик</h1>
          </div>
          <div className="w-9" />
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-white/80 text-[10px] uppercase font-semibold leading-none mb-1">Филиал: {branchNames[branch]}</p>
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

      <main className="flex-1 overflow-y-auto p-4 -mt-2 pb-[240px]">
        <div className="space-y-8">
          {categories.map(category => {
            const categoryProducts = filteredProducts.filter(p => p.category === category);
            return (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pl-2 border-l-4" style={{ borderColor: '#FF6B00' }}>
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="bg-white p-5 rounded-[2.5rem] shadow-md border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => handleUpdateProduct(product.id, 'checked', !product.checked)}
                            className={`mt-1 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center flex-shrink-0 ${product.checked
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'bg-white border-gray-200 text-transparent'
                              }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <div>
                            <h4 className={`font-bold text-gray-900 text-lg leading-tight mb-2 ${product.checked ? 'text-gray-400 line-through' : ''}`}>
                              {product.name}
                            </h4>
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                              {product.quantity} {product.unit}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Итоговая цена</p>
                          <p className="text-xl font-black text-gray-900">
                            {((product.price || 0) * product.quantity).toLocaleString()} сум
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Цена за ед."
                            value={product.price || ''}
                            onChange={(e) => handleUpdateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-300"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">сум / {product.unit}</span>
                        </div>

                        <div className="relative">
                          <textarea
                            placeholder="Комментарий..."
                            value={product.comment || ''}
                            onChange={(e) => handleUpdateProduct(product.id, 'comment', e.target.value)}
                            rows={1}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 font-medium text-gray-700 focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                          />
                          <MessageSquare className="absolute right-5 top-4 w-4 h-4 text-gray-300" />
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

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-4 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20">
        <div className="flex-1">
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-0.5">
            Заполнено <span className={allPricesFilled ? "text-green-500" : "text-orange-500"}>{totalWithPrice}/{filteredProducts.length}</span>
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-gray-900 leading-none">
              {totalAmount.toLocaleString()}
            </p>
            <span className="text-xs font-bold text-gray-400 uppercase">сум</span>
          </div>
        </div>

        <div className="flex-none">
          <button
            onClick={handleSend}
            disabled={!allPricesFilled}
            className="bg-[#FF6B00] text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:active:scale-100 disabled:bg-gray-300"
          >
            <Send className="w-4 h-4" />
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
