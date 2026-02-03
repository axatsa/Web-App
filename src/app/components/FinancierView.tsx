import { useState } from 'react';
import { ArrowLeft, Send, Plus, Trash2, Edit2, Check, X, Wallet } from 'lucide-react';
import type { Order, Product, Unit, Branch } from '@/app/App';
import { StatusBadge } from '@/app/components/StatusBadge';

const branchNames: Record<Branch, string> = {
  chilanzar: 'Чиланзар (Новза)',
  uchtepa: 'Учтепа',
  shayzantaur: 'Шайзантаур',
  olmazar: 'Олмазар',
};

type FinancierViewProps = {
  order: Order;
  onUpdateOrder: (order: Order) => void;
  onBackToRoles: () => void;
  branch: Branch;
};

export function FinancierView({ order, onUpdateOrder, onBackToRoles, branch }: FinancierViewProps) {
  const [localProducts, setLocalProducts] = useState(order.products);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    quantity: 0,
    unit: 'кг',
    category: '⭕️ Другие'
  });

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditProduct({ ...product });
  };

  const handleSaveEdit = () => {
    if (editProduct && editingId) {
      setLocalProducts(prev =>
        prev.map(p => (p.id === editingId ? (editProduct as Product) : p))
      );
      setEditingId(null);
      setEditProduct(null);
    }
  };

  const handleDelete = (productId: string) => {
    if (confirm('Удалить этот продукт?')) {
      setLocalProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleAddProduct = () => {
    if (newProduct.name?.trim()) {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        quantity: newProduct.quantity || 0,
        unit: newProduct.unit as Unit,
        category: newProduct.category || '⭕️ Другие',
      };
      setLocalProducts(prev => [...prev, product]);
      setNewProduct({ name: '', quantity: 0, unit: 'кг', category: '⭕️ Другие' });
      setIsAdding(false);
    }
  };

  const handleSend = () => {
    if (order.status === 'sent_to_financier') {
      onUpdateOrder({
        ...order,
        products: localProducts,
        status: 'sent_to_supplier',
      });
      alert('Список одобрен и отправлен поставщику');
    } else if (order.status === 'financier_checking') {
      onUpdateOrder({
        ...order,
        status: 'completed',
      });
      alert('Заказ успешно завершен!');
    }
  };

  const isReadOnly = order.status !== 'sent_to_financier' && order.status !== 'financier_checking';
  const isFinalCheck = order.status === 'financier_checking';

  const totalAmount = localProducts.reduce((sum, p) => {
    if (p.price && p.quantity > 0) {
      return sum + p.price * p.quantity;
    }
    return sum;
  }, 0);

  // Group products by category
  const categories = Array.from(new Set(localProducts.map(p => p.category))).sort();

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <header className="bg-blue-600 text-white p-6 pb-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <button onClick={onBackToRoles} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Финансист</h1>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => setIsAdding(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
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
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pl-2 border-l-4 border-blue-500">
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="bg-white p-5 rounded-[2.5rem] shadow-md border border-gray-100 transition-all active:scale-[0.99]">
                      {editingId === product.id && editProduct ? (
                        <div className="space-y-4">
                          <input
                            autoFocus
                            className="text-xl font-bold w-full bg-gray-50 border-none rounded-2xl px-4 py-2 mb-2 focus:ring-2 focus:ring-blue-500"
                            value={editProduct.name}
                            onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                          />
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-[10px] uppercase font-bold text-gray-400 ml-2 mb-1 block">Кол-во</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-blue-500"
                                  value={editProduct.quantity || ''}
                                  onChange={(e) => setEditProduct({ ...editProduct, quantity: parseFloat(e.target.value) || 0 })}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{editProduct.unit}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] uppercase font-bold text-gray-400 ml-2 mb-1 block">Ед. изм.</label>
                              <select
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                                value={editProduct.unit}
                                onChange={(e) => setEditProduct({ ...editProduct, unit: e.target.value as Unit })}
                              >
                                <option value="кг">кг</option>
                                <option value="шт">шт</option>
                                <option value="л">л</option>
                                <option value="г">г</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 ml-2 mb-1 block">Категория</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-blue-500"
                              value={editProduct.category}
                              onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 bg-green-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                            >
                              <Check className="w-5 h-5" /> Сохранить
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditProduct(null); }}
                              className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                            >
                              <X className="w-5 h-5" /> Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-lg leading-tight mb-2 pr-2">{product.name}</h4>
                              <div className="flex items-center gap-4">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                                  {product.quantity} {product.unit}
                                </span>
                                {product.price && (
                                  <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                                    {product.price.toLocaleString()} сум
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isReadOnly && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEditing(product)}
                                  className="p-3 bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                          {product.price && product.quantity > 0 && (
                            <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                              <span className="text-gray-400 text-xs font-bold uppercase">Итого:</span>
                              <span className="text-lg font-black text-gray-900">
                                {(product.price * product.quantity).toLocaleString()} сум
                              </span>
                            </div>
                          )}
                        </div>
                      )}
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
            <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Общая сумма</p>
            <p className="text-3xl font-black text-gray-900 leading-none">
              {totalAmount.toLocaleString()} <span className="text-sm font-bold text-gray-400 uppercase ml-1">сум</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Позиций</p>
            <p className="text-xl font-black text-blue-600 leading-none">{localProducts.length}</p>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleSend}
            disabled={localProducts.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-3xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {order.status === 'sent_to_financier' ? 'Утвердить и отправить поставщику' : 'Завершить заказ'}
          </button>
        )}
        {isReadOnly && (
          <div className="text-center p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Редактирование в данном статусе недоступно</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl scale-in-center">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              Новый товар
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-gray-400 ml-4 mb-2 block">Наименование</label>
                <input
                  autoFocus
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Например: Помидоры Черри"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-black text-gray-400 ml-4 mb-2 block">Кол-во</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0"
                    value={newProduct.quantity || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-black text-gray-400 ml-4 mb-2 block">Ед. изм.</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value as Unit })}
                  >
                    <option value="кг">кг</option>
                    <option value="шт">шт</option>
                    <option value="л">л</option>
                    <option value="г">г</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-gray-400 ml-4 mb-2 block">Категория</label>
                <input
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={handleAddProduct}
                  className="flex-2 bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  Добавить
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl transition-all active:scale-95"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
