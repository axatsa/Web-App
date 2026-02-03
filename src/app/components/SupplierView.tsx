import { useState } from 'react';
import { ArrowLeft, Send, MessageSquare, Truck } from 'lucide-react';
import type { Order, Branch } from '@/app/App';
import { StatusBadge } from '@/app/components/StatusBadge';

const branchNames: Record<Branch, string> = {
  chilanzar: 'Чиланзар (Новза)',
  uchtepa: 'Учтепа',
  shayzantaur: 'Шайзантаур',
  olmazar: 'Олмазар',
};

type SupplierViewProps = {
  order: Order;
  onUpdateOrder: (order: Order) => void;
  onBackToRoles: () => void;
  branch: Branch;
};

export function SupplierView({ order, onUpdateOrder, onBackToRoles, branch }: SupplierViewProps) {
  const [localProducts, setLocalProducts] = useState(order.products);

  const handleUpdateProduct = (productId: string, field: 'price' | 'comment', value: any) => {
    setLocalProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSend = () => {
    if (order.status === 'sent_to_supplier') {
      onUpdateOrder({
        ...order,
        products: localProducts,
        status: 'supplier_collecting',
      });
      alert('Заказ принят в сборку');
    } else if (order.status === 'supplier_collecting') {
      onUpdateOrder({
        ...order,
        status: 'supplier_delivering',
      });
      alert('Заказ передан в доставку');
    } else if (order.status === 'supplier_delivering') {
      onUpdateOrder({
        ...order,
        status: 'chef_checking',
      });
      alert('Заказ доставлен! Передано шеф-повару на проверку');
    }
  };

  const getActionLabel = () => {
    switch (order.status) {
      case 'sent_to_supplier': return 'Принять и подготовить';
      case 'supplier_collecting': return 'Передать в доставку';
      case 'supplier_delivering': return 'Подтвердить доставку';
      default: return 'Отправить';
    }
  };

  const totalWithPrice = localProducts.filter(p => p.price && p.price > 0).length;
  const totalAmount = localProducts.reduce((sum, p) => {
    if (p.price && p.quantity > 0) {
      return sum + p.price * p.quantity;
    }
    return sum;
  }, 0);

  const isReadOnly = order.status !== 'sent_to_supplier';

  // Group products by category
  const categories = Array.from(new Set(localProducts.map(p => p.category)));

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <header className="bg-orange-500 text-white p-6 pb-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <button onClick={onBackToRoles} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Поставщик</h1>
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
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pl-2 border-l-4 border-orange-500">
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="bg-white p-5 rounded-[2.5rem] shadow-md border border-gray-100 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg leading-tight mb-2 pr-2">{product.name}</h4>
                          <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                            {product.quantity} {product.unit}
                          </span>
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
                            placeholder="Введите цену за ед."
                            value={product.price || ''}
                            onChange={(e) => handleUpdateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                            disabled={isReadOnly}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-300 disabled:opacity-50"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">сум / {product.unit}</span>
                        </div>

                        <div className="relative">
                          <textarea
                            placeholder="Комментарий к товару..."
                            value={product.comment || ''}
                            onChange={(e) => handleUpdateProduct(product.id, 'comment', e.target.value)}
                            disabled={isReadOnly}
                            rows={1}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 font-medium text-gray-700 focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-300 disabled:opacity-50 resize-none"
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

      {/* Action bar and total summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 space-y-4 rounded-t-[2.5rem] shadow-2xl z-20">
        <div className="flex items-center justify-between px-2">
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Общая сумма заказа</p>
            <p className="text-3xl font-black text-gray-900 leading-none">
              {totalAmount.toLocaleString()} <span className="text-sm font-bold text-gray-400 uppercase ml-1">сум</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Позиций</p>
            <p className="text-xl font-black text-orange-600 leading-none">{localProducts.length}</p>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={order.status === 'sent_to_supplier' && totalWithPrice === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-3xl shadow-xl shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          {getActionLabel()}
        </button>
      </div>
    </div>
  );
}
