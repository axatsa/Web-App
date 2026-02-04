import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

import { ChefView } from '@/app/components/ChefView';
import { FinancierView } from '@/app/components/FinancierView';
import { SupplierView } from '@/app/components/SupplierView';
import { RoleSelector } from '@/app/components/RoleSelector';
import { BranchSelector } from '@/app/components/BranchSelector';

export type Role = 'chef' | 'financier' | 'supplier';

export type Branch = 'chilanzar' | 'uchtepa' | 'shayzantaur' | 'olmazar';

export type Status =
  | 'sent_to_chef'       // 1. Отправлен шеф повару
  | 'sent_to_financier'  // 2. Отправлен финансисту
  | 'sent_to_supplier'   // 3. Отправлен поставщику
  | 'supplier_collecting' // 4. Поставщик собирает заказ
  | 'supplier_delivering' // 5. Поставщик доставляет заказ
  | 'chef_checking'      // 6. Шеф-повар проверяет заказ
  | 'financier_checking' // 7. Финансист проверяет заказ того что проверил шеф повар
  | 'completed';         // 8. Завершен


export type Unit = 'кг' | 'шт' | 'л' | 'г';

export type Product = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: Unit;
  price?: number;
  comment?: string;
  checked?: boolean;
  chefComment?: string;
};

// Функция для получения текущей даты по ташкентскому времени
export function getTashkentDate(): Date {
  const now = new Date();
  // Ташкент UTC+5
  const tashkentOffset = 5 * 60; // минуты
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (tashkentOffset * 60000));
}

export type Order = {
  id: string;
  status: Status;
  products: Product[];
  createdAt: Date;
  deliveredAt?: Date; // Дата доставки (устанавливается при доставке)
  branch: Branch; // Филиал, из которого пришла заявка
};

import { supabase } from '@/lib/supabase';
import { MASTER_PRODUCT_LIST } from '@/data/products';

export default function App() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from Supabase
  const loadOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('Error loading orders:', error);
    } else if (data) {
      // Convert string dates to Date objects if needed
      const parsedData = data.map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        deliveredAt: o.deliveredAt ? new Date(o.deliveredAt) : undefined,
      }));
      setOrders(parsedData);
    }
  };

  useEffect(() => {
    loadOrders();

    // Subscribe to changes (Real-time updates!)
    const subscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('🔄 Realtime update received:', payload);
        // Reload all orders to be safe or handle delta
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Если роль не выбрана, показываем выбор роли
  if (!selectedRole) {
    return (
      <RoleSelector
        onSelectRole={setSelectedRole}
        onBack={() => { }}
      />
    );
  }

  // Если выбрали финансиста - сразу показываем список заявок
  if (selectedRole === 'financier') {
    const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

    if (selectedOrder) {
      return (
        <FinancierView
          order={selectedOrder}
          onUpdateOrder={(updatedOrder: Order) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            setSelectedOrderId(null);
          }}
          onBackToRoles={() => setSelectedOrderId(null)}
          branch={selectedOrder.branch}
          onRefresh={loadOrders}
        />
      );
    }

    return (
      <FinancierView
        orders={orders}
        onSelectOrder={setSelectedOrderId}
        onBackToRoles={() => setSelectedRole(null)}
        onRefresh={loadOrders}
      />
    );
  }

  // Для поставщика тоже сразу показываем список заявок (без выбора филиала)
  if (selectedRole === 'supplier') {
    const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

    if (selectedOrder) {
      return (
        <SupplierView
          order={selectedOrder}
          onUpdateOrder={(updatedOrder: Order) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            setSelectedOrderId(null);
          }}
          onBackToRoles={() => setSelectedOrderId(null)}
          branch={selectedOrder.branch}
          onRefresh={loadOrders}
        />
      );
    }

    return (
      <SupplierView
        orders={orders}
        onSelectOrder={setSelectedOrderId}
        onBackToRoles={() => setSelectedRole(null)}
        onRefresh={loadOrders}
      />
    );
  }

  const handleCheckDeliveries = () => {
    const deliveryOrders = orders.filter(o => o.status === 'chef_checking');
    if (deliveryOrders.length > 0) {
      // For now, if there are multiple, we could show a list, 
      // but let's just pick the first one and set the branch to open it
      const firstDelivery = deliveryOrders[0];
      setSelectedBranch(firstDelivery.branch);
    } else {
      alert('Пока ничего не привезли. Новых доставок для проверки нет.');
      loadOrders(); // Попробуем обновить данные
    }
  };

  // Только для шеф-повара выбираем филиал
  if (!selectedBranch) {
    const deliveryBranches = Array.from(new Set(orders.filter(o => o.status === 'chef_checking').map(o => o.branch)));

    return (
      <BranchSelector
        onSelectBranch={setSelectedBranch}
        onCheckDeliveries={handleCheckDeliveries}
        deliveryBranches={deliveryBranches}
        onBack={() => setSelectedRole(null)}
        onRefresh={loadOrders}
      />
    );
  }

  // ... (inside the component)

  // Для шеф-повара - находим или создаем заявку для выбранного филиала
  let currentOrder = orders.find(o => o.branch === selectedBranch && (o.status === 'sent_to_chef' || o.status === 'chef_checking'));

  if (!currentOrder) {
    // Создаем новую заявку с базовым списком продуктов
    const baseProducts = MASTER_PRODUCT_LIST.map(p => ({
      ...p,
      quantity: 0,
      price: undefined,
      comment: undefined
    }));

    currentOrder = {
      id: Date.now().toString(),
      status: 'sent_to_chef',
      createdAt: getTashkentDate(),
      branch: selectedBranch,
      products: baseProducts,
    };
  }

  const handleBack = () => {
    setSelectedBranch(null);
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    // Optimistic update
    const existingIndex = orders.findIndex(o => o.id === updatedOrder.id);
    if (existingIndex >= 0) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    } else {
      setOrders(prev => [...prev, updatedOrder]);
    }
    setSelectedBranch(null);

    // Save to Supabase
    const { error } = await supabase.from('orders').upsert(updatedOrder);
    if (error) {
      console.error('Error saving order:', error);
      alert('Ошибка при сохранении! Проверьте интернет.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {selectedRole === 'chef' && (
        <ChefView
          order={currentOrder}
          onUpdateOrder={handleUpdateOrder}
          onBackToRoles={handleBack}
          branch={selectedBranch}
          onRefresh={loadOrders}
        />
      )}
    </div>
  );
}

