"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice, type OrderSummary } from "@/lib/products";

const STATUSES: OrderSummary["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusBadge: Record<OrderSummary["status"], string> = {
  pending: "bg-[#fbf1dc] text-[#8a5a00]",
  processing: "bg-[#e7eef9] text-[#1d4d8f]",
  shipped: "bg-[#efe6f7] text-[#5e2a84]",
  delivered: "bg-[#e6f3ea] text-[#1f6236]",
  cancelled: "bg-stone-200 text-stone-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderSummary["status"]>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/orders")
      .then(async res => (res.ok ? res.json() : []))
      .then((data: OrderSummary[]) => {
        if (!active) return;
        setOrders(data);
        if (data[0]) setExpanded(data[0]._id);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updateStatus = async (orderId: string, status: OrderSummary["status"]) => {
    setUpdating(orderId);
    setFeedback("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback(data.error || "Unable to update order status.");
        return;
      }
      setOrders(current => current.map(o => (o._id === orderId ? data : o)));
      setFeedback(
        status === "cancelled"
          ? `Order ${data.orderNumber} cancelled and stock restored.`
          : `Order ${data.orderNumber} updated to ${status}.`,
      );
    } finally {
      setUpdating(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(order => {
      if (filter !== "all" && order.status !== filter) return false;
      if (
        q &&
        !`${order.orderNumber} ${order.customerName || ""} ${order.customerEmail || ""} ${order.customerPhone || ""}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [filter, orders, search]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Fulfilment</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">COD Orders</h1>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search order #, customer, phone…"
          className="border border-line bg-white px-3.5 py-2.5 text-xs outline-wine sm:w-64"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map(status => {
          const count = status === "all" ? orders.length : orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition ${
                filter === status
                  ? "bg-wine text-white"
                  : "border border-line bg-white text-stone-600 hover:border-wine hover:text-wine"
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className="mt-5 border border-line bg-white px-4 py-3 text-xs font-medium text-wine">{feedback}</p>
      )}

      {loading ? (
        <p className="mt-10 text-xs text-stone-500">Loading orders…</p>
      ) : filtered.length ? (
        <div className="mt-6 space-y-4">
          {filtered.map(order => {
            const isOpen = expanded === order._id;
            return (
              <article key={order._id} className="border border-line bg-white">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : order._id)}
                    className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-left text-xs"
                  >
                    <div>
                      <p className="font-semibold text-ink">{order.orderNumber}</p>
                      <p className="mt-0.5 text-[11px] text-stone-500">
                        {new Date(order.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500">{order.customerPhone}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{formatPrice(order.total)}</p>
                      <p className="text-[10px] uppercase tracking-wider text-stone-500">Cash on Delivery</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${statusBadge[order.status]}`}>
                      {order.status}
                    </span>
                  </button>

                  <div className="flex items-center gap-3">
                    <select
                      aria-label={`Status for ${order.orderNumber}`}
                      value={order.status}
                      disabled={updating === order._id}
                      onChange={e => updateStatus(order._id, e.target.value as OrderSummary["status"])}
                      className="border border-line bg-[#faf7f3] px-3 py-2 text-xs font-medium capitalize outline-wine disabled:opacity-50"
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : order._id)}
                      className="grid h-8 w-8 place-items-center border border-line text-sm text-stone-500 hover:border-wine hover:text-wine"
                      aria-label="Toggle order details"
                    >
                      {isOpen ? "−" : "+"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-line bg-[#fdfbf8] p-5 text-xs">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">Line Items</p>
                        <div className="mt-3 divide-y divide-line border-y border-line">
                          {(order.items || []).map(item => (
                            <div key={item.id} className="flex items-center gap-3 py-3">
                              <img src={item.image} alt={item.name} className="h-14 w-11 object-cover" />
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-[11px] text-stone-500">
                                  Size {item.size} × {item.quantity} ({formatPrice(item.price)} each)
                                </p>
                              </div>
                              <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">Customer & Delivery</p>
                          <div className="mt-2 space-y-1 text-stone-700">
                            <p className="font-medium text-ink">{order.customerName}</p>
                            <p>{order.customerEmail}</p>
                            <p>{order.customerPhone}</p>
                            <p className="pt-1 text-stone-600">{order.customerAddress}</p>
                            {order.notes && (
                              <p className="mt-2 border-l-2 border-wine bg-white p-2.5 text-[11px] text-stone-600">
                                <strong>Note:</strong> {order.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-line pt-3 space-y-1.5">
                          <div className="flex justify-between text-stone-600">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-wine">
                              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                              <span>−{formatPrice(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-stone-600">
                            <span>Delivery</span>
                            <span>{order.deliveryFee === 0 ? "Complimentary" : formatPrice(order.deliveryFee)}</span>
                          </div>
                          <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold text-ink">
                            <span>Total (COD)</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 border border-line bg-white p-10 text-center text-xs text-stone-500">
          No orders found matching this filter.
        </div>
      )}
    </>
  );
}
