import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { clearCart, clearCartError, fetchCart, removeCartItem, updateCartItem } from "@/domains/customer/state/cartSlice";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")} ₫`;

export default function ShoppingCart() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedItems = useMemo(
    () => cart.items.filter((item) => item.is_available && (selected[item.id] ?? true)),
    [cart.items, selected],
  );
  const subtotal = selectedItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleItem = (id: number, checked: boolean) => setSelected((state) => ({ ...state, [id]: checked }));
  const selectAll = (checked: boolean) => setSelected(Object.fromEntries(cart.items.map((item) => [item.id, checked && item.is_available])));
  const mutate = async (operation: () => Promise<unknown>) => {
    dispatch(clearCartError());
    setActionError(null);
    try { await operation(); }
    catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể cập nhật giỏ hàng.");
      void dispatch(fetchCart()); // Refresh stock and availability after conflicts or network recovery.
    }
  };

  return (
    <CustomerLayout>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-semibold text-primary">GIỎ HÀNG</p><h1 className="mt-1 text-3xl font-bold">Giỏ hàng của bạn</h1></div>
          <span className="text-sm text-slate-600">{cart.item_count} sản phẩm</span>
        </div>

        {(actionError || cart.error) && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{actionError || cart.error}</span><div className="flex shrink-0 gap-3"><button onClick={() => void dispatch(fetchCart())} className="font-semibold underline">Thử lại</button><button onClick={() => { setActionError(null); dispatch(clearCartError()); }} aria-label="Đóng thông báo">×</button></div></div>}

        {cart.loading && cart.items.length === 0 ? (
          <div role="status" className="rounded-2xl bg-white p-12 text-center text-slate-600 shadow-sm">Đang tải giỏ hàng…</div>
        ) : cart.items.length === 0 ? (
          <section className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300">shopping_bag</span>
            <h2 className="mt-3 text-xl font-bold">Giỏ hàng đang trống</h2>
            <p className="mt-2 text-slate-600">Khám phá sản phẩm và thêm món bạn yêu thích vào giỏ.</p>
            <Link to="/" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-white">Tiếp tục mua sắm</Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b p-4">
                <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={cart.items.some((item) => item.is_available) && cart.items.filter((item) => item.is_available).every((item) => selected[item.id] ?? true)} onChange={(event) => selectAll(event.target.checked)} />Chọn sản phẩm còn bán</label>
                <button type="button" disabled={cart.updating} onClick={() => void mutate(() => dispatch(clearCart()).unwrap())} className="text-sm font-semibold text-red-600 disabled:opacity-50">Xóa tất cả</button>
              </div>
              <ul className="divide-y">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-4 p-4 md:flex-nowrap">
                    <input aria-label={`Chọn ${item.product_name}`} type="checkbox" checked={item.is_available && (selected[item.id] ?? true)} disabled={!item.is_available} onChange={(event) => toggleItem(item.id, event.target.checked)} />
                    <Link to={`/product/${item.product_id}`} className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">{item.product_thumbnail_url ? <img src={item.product_thumbnail_url} alt="" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-3xl text-slate-400">image</span>}</Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${item.product_id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-primary">{item.product_name}</Link>
                      <p className="mt-1 text-sm text-slate-500">{item.shop_name} · {item.variant_name || item.variant_sku}</p>
                      {!item.is_available && <p className="mt-1 text-sm font-medium text-red-600">Sản phẩm hiện không còn khả dụng. Bạn có thể xóa khỏi giỏ.</p>}
                      {item.is_available && item.quantity > item.available_stock && <p className="mt-1 text-sm font-medium text-amber-700">Chỉ còn {item.available_stock} sản phẩm; hãy điều chỉnh số lượng.</p>}
                    </div>
                    <div className="flex min-w-[175px] items-center justify-between gap-4 md:flex-col md:items-end">
                      <strong>{money(item.unit_price)}</strong>
                      <div className="flex items-center gap-3">
                        <button aria-label="Giảm số lượng" disabled={cart.updating || item.quantity <= 1} onClick={() => void mutate(() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 })).unwrap())} className="h-8 w-8 rounded-lg border disabled:opacity-40">−</button>
                        <span aria-live="polite" className="min-w-5 text-center">{item.quantity}</span>
                        <button aria-label="Tăng số lượng" disabled={cart.updating || !item.is_available || item.quantity >= item.available_stock} onClick={() => void mutate(() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 })).unwrap())} className="h-8 w-8 rounded-lg border disabled:opacity-40">+</button>
                        <button aria-label={`Xóa ${item.product_name}`} disabled={cart.updating} onClick={() => void mutate(() => dispatch(removeCartItem(item.id)).unwrap())} className="ml-2 text-sm font-semibold text-red-600 disabled:opacity-50">Xóa</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">Tóm tắt giỏ hàng</h2>
              <div className="mt-5 flex justify-between text-sm text-slate-600"><span>Sản phẩm đã chọn</span><span>{selectedCount}</span></div>
              <div className="mt-3 flex justify-between border-t pt-4 font-bold"><span>Tạm tính</span><span>{money(subtotal)}</span></div>
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Chức năng đặt hàng chưa được hỗ trợ ở phiên bản backend hiện tại. Số tiền trên chỉ là tạm tính, chưa gồm vận chuyển hoặc ưu đãi.</p>
              <button type="button" disabled className="mt-4 w-full rounded-xl bg-slate-200 px-4 py-3 font-bold text-slate-500" title="API tạo đơn hàng chưa khả dụng">Đặt hàng chưa khả dụng</button>
              <Link to="/" className="mt-3 block text-center text-sm font-semibold text-primary">Tiếp tục mua sắm</Link>
            </aside>
          </div>
        )}
      </main>
    </CustomerLayout>
  );
}
