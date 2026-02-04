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

  // Для демонстрации создаем несколько заявок (в реальности будут из БД)
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      status: 'sent_to_financier',
      createdAt: getTashkentDate(),
      branch: 'chilanzar',
      products: [
        // 🥛 Молочные продукты
        { id: '1', name: 'Молоко (Sut)', category: '🥛 Молочные продукты', quantity: 0, unit: 'л' },
        { id: '2', name: 'Кефир (Kefir)', category: '🥛 Молочные продукты', quantity: 0, unit: 'л' },
        { id: '3', name: 'Творог (Tvorog / Suzma)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },
        { id: '4', name: 'Каймак (Qaymoq)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },
        { id: '5', name: 'Сметана (Smetana / Qaymoqcha)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },
        { id: '6', name: 'Сыр твёрдый (Qattiq pishloq)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },
        { id: '7', name: 'Сыр плавленый (Eritilgan pishloq)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },
        { id: '8', name: 'Сыр моцарелла (Motsarella pishlog‘i)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },
        { id: '9', name: 'Сыр Ханский (Xon pishlog‘i)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },
        { id: '10', name: 'Сырок (Shirin pishloqcha)', category: '🥛 Молочные продукты', quantity: 0, unit: 'шт' },
        { id: '11', name: 'Сливочное масло (Sariyog‘)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },
        { id: '12', name: 'Маргарин «Шедрое лето» (Margarin)', category: '🥛 Молочные продукты', quantity: 0, unit: 'кг' },

        // 🥚 Яйца и мясо
        { id: '13', name: 'Яйца куриные (Tovuq tuxumi)', category: '🥚 Яйца и мясо', quantity: 0, unit: 'шт' },
        { id: '14', name: 'Яйца перепелиные (Bedana tuxumi)', category: '🥚 Яйца и мясо', quantity: 0, unit: 'шт' },
        { id: '15', name: 'Индейка (Kurka go‘shti)', category: '🥚 Яйца и мясо', quantity: 0, unit: 'кг' },
        { id: '16', name: 'Колбаса варёная (Qaynatilgan kolbasa)', category: '🥚 Яйца и мясо', quantity: 0, unit: 'кг' },
        { id: '17', name: 'Колбаса копчёная (Dudlangan kolbasa)', category: '🥚 Яйца и мясо', quantity: 0, unit: 'кг' },
        { id: '18', name: 'Сосиски (Sosiska)', category: '🥚 Яйца и мясо', quantity: 0, unit: 'кг' },

        // 🍞 Хлеб и мучное
        { id: '19', name: 'Мука (Un)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'кг' },
        { id: '20', name: 'Лаваш (Lavash non)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'шт' },
        { id: '21', name: 'Хлеб (Non)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'шт' },
        { id: '22', name: 'Тостовый хлеб (Tost noni)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'шт' },
        { id: '23', name: 'Манпар (тесто) (Xamir)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'кг' },
        { id: '24', name: 'Макароны (Makaron)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'кг' },
        { id: '25', name: 'Спагетти (Spagetti)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'кг' },
        { id: '26', name: 'Вермишель (Vermishel)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'кг' },
        { id: '27', name: 'Фунчоза (Funchuza)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'кг' },
        { id: '28', name: 'Манная крупа (Manka yormasi)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'кг' },
        { id: '29', name: 'Овсянка (Suli yormasi)', category: '🍞 Хлеб и мучное', quantity: 0, unit: 'кг' },

        // 🍚 Крупы и бобовые
        { id: '30', name: 'Рис (Guruch)', category: '🍚 Крупы и бобовые', quantity: 0, unit: 'кг' },
        { id: '31', name: 'Рис обычный (Oddiy guruch)', category: '🍚 Крупы и бобовые', quantity: 0, unit: 'кг' },
        { id: '32', name: 'Рис Лазер (Lazer guruch)', category: '🍚 Крупы и бобовые', quantity: 0, unit: 'кг' },
        { id: '33', name: 'Перловка (Arpa yormasi)', category: '🍚 Крупы и бобовые', quantity: 0, unit: 'кг' },
        { id: '34', name: 'Нут / горох (No‘xat)', category: '🍚 Крупы и бобовые', quantity: 0, unit: 'кг' },
        { id: '35', name: 'Горох (консерва) (Konserva no‘xat)', category: '🍚 Крупы и бобовые', quantity: 0, unit: 'шт' },

        // 🧂 Специи и приправы
        { id: '36', name: 'Соль (Tuz)', category: '🧂 Специи и приправы', quantity: 0, unit: 'кг' },
        { id: '37', name: 'Корейская соль (Koreys tuzi)', category: '🧂 Специи и приправы', quantity: 0, unit: 'кг' },
        { id: '38', name: 'Зира (Zira)', category: '🧂 Специи и приправы', quantity: 0, unit: 'г' },
        { id: '39', name: 'Приправа для лагмана (Lag‘mon ziravori)', category: '🧂 Специи и приправы', quantity: 0, unit: 'г' },
        { id: '40', name: 'Лавровый лист (Dafna bargi)', category: '🧂 Специи и приправы', quantity: 0, unit: 'шт' },
        { id: '41', name: 'Роллтон (приправа) (Rollton ziravori)', category: '🧂 Специи и приправы', quantity: 0, unit: 'шт' },
        { id: '42', name: 'Кунжут (Kunjut)', category: '🧂 Специи и приправы', quantity: 0, unit: 'г' },

        // ☕ Напитки и сладкое
        { id: '43', name: 'Какао (Kakao)', category: '☕ Напитки и сладкое', quantity: 0, unit: 'кг' },
        { id: '44', name: 'Чёрный чай (Qora choy)', category: '☕ Напитки и сладкое', quantity: 0, unit: 'кг' },
        { id: '45', name: 'Сахар (Shakar)', category: '☕ Напитки и сладкое', quantity: 0, unit: 'кг' },
        { id: '46', name: 'Варенье (Murabbo)', category: '☕ Напитки и сладкое', quantity: 0, unit: 'кг' },
        { id: '47', name: 'Шоколадная паста (Shokolad pastasi)', category: '☕ Напитки и сладкое', quantity: 0, unit: 'шт' },
        { id: '48', name: 'Миллер (вафли) (Vafli)', category: '☕ Напитки и сладкое', quantity: 0, unit: 'шт' },
        { id: '49', name: 'Изюм (Mayiz)', category: '☕ Напитки и сладкое', quantity: 0, unit: 'кг' },
        { id: '50', name: 'Грецкий орех (Yong‘oq)', category: '☕ Напитки и сладкое', quantity: 0, unit: 'кг' },

        // 🥫 Соусы и добавки
        { id: '51', name: 'Майонез (Mayonez)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'кг' },
        { id: '52', name: 'Соевый соус (Soya sousi)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'л' },
        { id: '53', name: 'Уксус (Sirka)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'л' },
        { id: '54', name: 'Томатная паста (Tomat pastasi)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'кг' },
        { id: '55', name: 'Кетчуп (Ketchup)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'шт' },
        { id: '56', name: 'Масло растительное (O‘simlik yog‘i)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'л' },
        { id: '57', name: 'Сода (Soda)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'шт' },
        { id: '58', name: 'Дрожжи (Xamirturush)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'шт' },
        { id: '59', name: 'Разрыхлитель (Pishirish kukuni)', category: '🥫 Соусы и добавки', quantity: 0, unit: 'шт' },

        // 🥕 Овощи и зелень
        { id: '60', name: 'Картофель (Kartoshka)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '61', name: 'Морковь красная (Qizil sabzi)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '62', name: 'Морковь жёлтая (Sariq sabzi)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '63', name: 'Капуста зелёная (Yashil karam)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '64', name: 'Капуста красная (Qizil karam)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '65', name: 'Капуста квашеная (Tuzlangan karam)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '66', name: 'Помидоры (Pomidor)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '67', name: 'Огурцы (Bodring)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '68', name: 'Солёные огурцы (Tuzlangan bodring)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '69', name: 'Болгарский перец (Bulgar qalampiri)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '70', name: 'Болгарский перец «Светофор» (Rangli qalampir)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '71', name: 'Лук (Piyoz)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '72', name: 'Сельдерей (Selderey)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '73', name: 'Корейская морковь (Koreyscha sabzi)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '74', name: 'Укроп (Shivit)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '75', name: 'Кинза (Kashnich)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '76', name: 'Свекла красная (Qizil lavlagi)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },
        { id: '77', name: 'Редька белая (Oq turup)', category: '🥕 Овощи и зелень', quantity: 0, unit: 'кг' },

        // 🍎 Фрукты
        { id: '78', name: 'Бананы (Banan)', category: '🍎 Фрукты', quantity: 0, unit: 'кг' },
        { id: '79', name: 'Яблоки (Olma)', category: '🍎 Фрукты', quantity: 0, unit: 'кг' },
        { id: '80', name: 'Груша (Nok)', category: '🍎 Фрукты', quantity: 0, unit: 'кг' },
        { id: '81', name: 'Лимоны (Limon)', category: '🍎 Фрукты', quantity: 0, unit: 'кг' },

        // ⭕️Другие
        { id: '83', name: 'Другое 1', category: '⭕️ Другие', quantity: 0, unit: 'шт' },
        { id: '84', name: 'Другое 2', category: '⭕️ Другие', quantity: 0, unit: 'шт' },
      ],
    },
    {
      id: '2',
      status: 'sent_to_financier',
      createdAt: new Date(Date.now() - 86400000), // вчера
      branch: 'uchtepa',
      products: [
        { id: '1', name: 'Молоко (Sut)', category: '🥛 Молочные продукты', quantity: 10, unit: 'л', price: 12000 },
        { id: '60', name: 'Картофель (Kartoshka)', category: '🥕 Овощи и зелень', quantity: 50, unit: 'кг', price: 5000 },
      ],
    },
    {
      id: '3',
      status: 'financier_checking',
      createdAt: new Date(Date.now() - 172800000), // 2 дня назад
      branch: 'shayzantaur',
      deliveredAt: new Date(Date.now() - 86400000),
      products: [
        { id: '13', name: 'Яйца куриные (Tovuq tuxumi)', category: '🥚 Яйца и мясо', quantity: 100, unit: 'шт', price: 1500 },
        { id: '19', name: 'Мука (Un)', category: '🍞 Хлеб и мучное', quantity: 20, unit: 'кг', price: 8000 },
      ],
    },
  ]);

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
        />
      );
    }

    return (
      <FinancierView
        orders={orders}
        onSelectOrder={setSelectedOrderId}
        onBackToRoles={() => setSelectedRole(null)}
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
        />
      );
    }

    return (
      <SupplierView
        orders={orders}
        onSelectOrder={setSelectedOrderId}
        onBackToRoles={() => setSelectedRole(null)}
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
      />
    );
  }

  // Для шеф-повара - находим или создаем заявку для выбранного филиала
  let currentOrder = orders.find(o => o.branch === selectedBranch && (o.status === 'sent_to_chef' || o.status === 'chef_checking'));

  if (!currentOrder) {
    // Создаем новую заявку с базовым списком продуктов
    const baseProducts = orders[0]?.products.map(p => ({
      ...p,
      quantity: 0,
      price: undefined,
      comment: undefined
    })) || [];

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

  const handleUpdateOrder = (updatedOrder: Order) => {
    const existingIndex = orders.findIndex(o => o.id === updatedOrder.id);
    if (existingIndex >= 0) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    } else {
      setOrders(prev => [...prev, updatedOrder]);
    }
    setSelectedBranch(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {selectedRole === 'chef' && (
        <ChefView
          order={currentOrder}
          onUpdateOrder={handleUpdateOrder}
          onBackToRoles={handleBack}
          branch={selectedBranch}
        />
      )}
    </div>
  );
}
