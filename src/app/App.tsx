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

import { api } from '@/lib/api';
import type { Order, Product, Status, Branch, Role } from '@/lib/api';

export { getTashkentDate };
function getTashkentDate(): Date {
  const now = new Date();
  const tashkentOffset = 5 * 60;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (tashkentOffset * 60000));
}

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
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);

  const loadInitialData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getProducts()
      ]);

      setOrders(ordersData);
      setMasterProducts(productsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  useEffect(() => {
    loadInitialData();

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

    // 2. Send to local API
    try {
      await api.upsertOrder(updatedOrder);
      console.log('✅ Order saved successfully!');
    } catch (error: any) {
      console.error('❌ Error saving order:', error);
      alert(`Ошибка сохранения! Данные не отправлены.\nОшибка: ${error.message}`);
      loadOrders(); // Reload actual data to revert
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
    // ВАЖНО: Проверяем, что продукты уже загрузились из API
    if (masterProducts.length === 0) {
      // Показываем загрузку, пока продукты не загрузятся
      return (
        <div className="h-screen flex items-center justify-center bg-[#f5f5f5]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Загрузка продуктов...</p>
          </div>
        </div>
      );
    }

    // Создаем новую заявку с базовым списком продуктов из БД
    const baseProducts = masterProducts.map((p) => ({
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

