/**
 * Darkstore dashboard mock data – used when API is unavailable or returns empty.
 */

const now = new Date();
const deadline = new Date(now.getTime() + 12 * 60 * 1000);

export const MOCK_DASHBOARD_SUMMARY = {
  queue: { new_orders: 8, breakdown: { normal: 12, priority: 4, express: 2 } },
  sla_threat: { percentage: 18, orders_under_5min: 3 },
  store_capacity: { percentage: 72, expected_peak_time: '4:00 PM' },
  rider_wait_times: { average: '2m 15s', last_hour_data: [40, 60, 45, 75, 30, 55, 65, 80, 50, 70, 55] },
};

export const MOCK_STAFF_LOAD = {
  pickers: { active: 6, total: 8, load_percentage: 75 },
  packers: { active: 4, total: 6, load_percentage: 67 },
};

export const MOCK_STOCK_ALERTS = {
  alerts: [
    { sku: 'SKU-101', item_name: 'Organic Milk 1L', current_count: 2 },
    { sku: 'SKU-102', item_name: 'Whole Wheat Bread', current_count: 0 },
    { sku: 'SKU-103', item_name: 'Greek Yogurt 500g', current_count: 1 },
    { sku: 'SKU-104', item_name: 'Free Range Eggs 12pk', current_count: 3 },
    { sku: 'SKU-105', item_name: 'Butter 200g', current_count: 1 },
  ],
};

export const MOCK_RTO_ALERTS = {
  alerts: [
    { order_id: 'ORD-4001', customer_name: 'John D.', address: '123 Main St', attempt_count: 2 },
    { order_id: 'ORD-4002', customer_name: 'Jane S.', address: '456 Oak Ave', attempt_count: 1 },
  ],
};

export const MOCK_LIVE_ORDERS = Array.from({ length: 12 }, (_, i) => {
  const created = new Date(now.getTime() - (i + 1) * 3 * 60 * 1000);
  const dl = new Date(created.getTime() + 15 * 60 * 1000);
  const diff = dl.getTime() - now.getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  const secs = Math.max(0, Math.floor((diff % 60000) / 1000));
  return {
    order_id: `ORD-${3000 + i}`,
    item_count: 3 + (i % 5),
    sla_timer: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
    sla_deadline: dl.toISOString(),
    status: i % 3 === 0 ? 'new' : i % 3 === 1 ? 'processing' : 'ready',
    sla_status: mins < 5 ? 'critical' : mins < 15 ? 'warning' : 'safe',
    assignee: i % 2 === 0 ? { id: `P${i}`, name: `Picker ${(i % 4) + 1}`, initials: `P${(i % 4) + 1}` } : null,
    order_type: i % 4 === 0 ? 'express' : i % 4 === 1 ? 'priority' : 'normal',
    created_at: created.toISOString(),
  };
});
