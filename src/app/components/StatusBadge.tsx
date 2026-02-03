import type { Status } from '@/app/App';

type StatusBadgeProps = {
  status: Status;
};

const statusConfig: Record<Status, { label: string; color: string; bgColor: string }> = {
  sent_to_chef: { label: '1. У шеф-повара', color: '#1a237e', bgColor: '#e8eaf6' },
  sent_to_financier: { label: '2. У финансиста', color: '#1a237e', bgColor: '#e8eaf6' },
  sent_to_supplier: { label: '3. У поставщика', color: '#1a237e', bgColor: '#e8eaf6' },
  supplier_collecting: { label: '4. Сбор заказа', color: '#f57c00', bgColor: '#fff3e0' },
  supplier_delivering: { label: '5. Доставка', color: '#f57c00', bgColor: '#fff3e0' },
  chef_checking: { label: '6. Проверка шефом', color: '#d32f2f', bgColor: '#ffebee' },
  financier_checking: { label: '7. Финальная проверка', color: '#388e3c', bgColor: '#e8f5e9' },
  completed: { label: '8. Завершен', color: '#388e3c', bgColor: '#e8f5e9' },
};


export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: config.bgColor,
        color: config.color
      }}
    >
      {config.label}
    </div>
  );
}
