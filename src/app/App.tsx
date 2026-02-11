import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
import { LanguageProvider, useLanguage } from '@/app/context/LanguageContext';

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
  estimatedDeliveryDate?: Date; // Ориентировочная дата доставки (от поставщика)
  branch: Branch; // Филиал, из которого пришла заявка
};

import { supabase } from '@/lib/supabase';
import { MASTER_PRODUCT_LIST } from '@/data/products';

export default function App() {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Добавляем флаг "из бота"
  const [isFromBot, setIsFromBot] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Detect role and branch from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') as Role | null;
    const branch = urlParams.get('branch') as Branch | 'all' | null;

    if (role) {
      console.log('🔗 Detected role from URL:', role);
      setSelectedRole(role);
      setIsFromBot(true);
    }
    if (branch && branch !== 'all') {
      console.log('🔗 Detected branch from URL:', branch);
      setSelectedBranch(branch as Branch);
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
        estimatedDeliveryDate: o.estimatedDeliveryDate ? new Date(o.estimatedDeliveryDate) : undefined,
      }));
      setOrders(parsedData);
    }
  };

  useEffect(() => {
    loadOrders();

    // Use polling as a replacement for Supabase Real-time
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const saveOrder = async (updatedOrder: Order) => {
    // 1. Optimistic Update (Update local state immediately)
    setOrders(prev => {
      const existing = prev.find(o => o.id === updatedOrder.id);
      if (existing) {
        return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      }
      return [...prev, updatedOrder];
    });

    // Close detail view if open
    setSelectedOrderId(null);
    setSelectedBranch(null);

    console.log('💾 Saving order to Supabase:', updatedOrder);

    // 2. Prepare payload for Supabase (sanitize Dates)
    const payload = {
      ...updatedOrder,
      createdAt: updatedOrder.createdAt.toISOString(), // Ensure ISO string
      deliveredAt: updatedOrder.deliveredAt ? updatedOrder.deliveredAt.toISOString() : null,
      estimatedDeliveryDate: updatedOrder.estimatedDeliveryDate ? updatedOrder.estimatedDeliveryDate.toISOString() : null,
    };

    // 3. Send to Supabase
    const { error } = await supabase.from('orders').upsert(payload);

    if (error) {
      console.error('❌ Error saving order to Supabase:', error);
      alert(`Ошибка сохранения! Данные не отправлены.\nОшибка: ${error.message}`);
      // Revert optimistic update? For now, just warn.
      loadOrders(); // Reload actual data to revert
    } else {
      console.log('✅ Order saved successfully!');
    }
  };

  const handleBackToStart = () => {
    if (!isFromBot) {
      setSelectedRole(null);
      setSelectedBranch(null);
      setSelectedOrderId(null);
    }
  };

  // Если открыли НЕ через бота и нет выбранной роли - показываем сообщение об ошибке (или селектор, если хотим оставить)
  // Но пользователь сказал "в мини апп это можно убрать", так что сделаем заглушку
  if (!selectedRole && isFromBot) {
    return (
      <div className="h-screen flex items-center justify-center p-8 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Доступ ограничен</h1>
          <p className="text-gray-500">Пожалуйста, откройте приложение через меню вашего Telegram бота.</p>
        </div>
      </div>
    );
  }

  // Если роль не выбрана (и мы не в режиме "из бота"), показываем выбор роли
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
          onUpdateOrder={saveOrder}
          onBackToRoles={() => setSelectedOrderId(null)}
          branch={selectedOrder.branch}
          onRefresh={loadOrders}
          isFromBot={isFromBot}
        />
      );
    }

    return (
      <FinancierView
        orders={orders}
        onSelectOrder={setSelectedOrderId}
        onBackToRoles={handleBackToStart}
        onRefresh={loadOrders}
        isFromBot={isFromBot}
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
          onUpdateOrder={saveOrder}
          onBackToRoles={() => setSelectedOrderId(null)}
          branch={selectedOrder.branch}
          onRefresh={loadOrders}
          isFromBot={isFromBot}
        />
      );
    }

    return (
      <SupplierView
        orders={orders}
        onSelectOrder={setSelectedOrderId}
        onBackToRoles={handleBackToStart}
        onRefresh={loadOrders}
        isFromBot={isFromBot}
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
      alert(t('alertNoDeliveries'));
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
        isFromBot={isFromBot}
      />
    );
  }

  // ... (inside the component)

  // Для шеф-повара - находим или создаем заявку для выбранного филиала
  let currentOrder = orders.find(o => o.branch === selectedBranch && (o.status === 'sent_to_chef' || o.status === 'chef_checking'));

  if (!currentOrder) {
    // Создаем новую заявку с базовым списком продуктов
    const baseProducts = MASTER_PRODUCT_LIST.map((p: any) => ({
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

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {selectedRole === 'chef' && (
        <ChefView
          order={currentOrder}
          onUpdateOrder={saveOrder}
          onBackToRoles={() => setSelectedBranch(null)}
          branch={selectedBranch}
          onRefresh={loadOrders}
          isFromBot={isFromBot}
        />
      )}
    </div>
  );
}

