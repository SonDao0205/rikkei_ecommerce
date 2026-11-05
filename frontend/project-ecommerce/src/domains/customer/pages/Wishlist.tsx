import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { fetchWishlist, toggleWishlistItem } from "@/domains/customer/state/wishlistSlice";
import { addCartItem } from "@/domains/customer/state/cartSlice";
import { productApi } from "@/domains/storefront/api/productApi";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")} ₫`;

export default function Wishlist() {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist);

  const navigate = useNavigate();
  const cartUpdating = useAppSelector((state) => state.cart.updating);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAddToCart = async (productId: number) => {
    setActionError(null);
    try {
      const detail = await productApi.fetchProductDetail(productId);
      const availableVariants = detail.variants.filter((variant) => variant.stock > 0);
      if (availableVariants.length !== 1) {
        navigate(`/product/${productId}`);
        return;
      }
      await dispatch(addCartItem({ variantId: availableVariants[0].id, quantity: 1 })).unwrap();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

  return (
    <CustomerLayout>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <div className="mb-6"><p className="text-sm font-semibold text-primary">SẢN PHẨM ĐÃ LƯU</p><h1 className="mt-1 text-3xl font-bold">Danh sách yêu thích</h1><p className="mt-2 text-slate-600">Danh sách được đồng bộ với tài khoản của bạn.</p></div>
        {(wishlist.error || actionError) && <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{actionError || wishlist.error}</span>{wishlist.error && <button onClick={() => void dispatch(fetchWishlist())} className="ml-3 shrink-0 font-semibold underline">Thử lại</button>}</div>}
        {wishlist.loading && wishlist.items.length === 0 ? <div role="status" className="rounded-2xl bg-white p-12 text-center text-slate-600 shadow-sm">Đang tải danh sách…</div> : wishlist.items.length === 0 ? (
          <section className="rounded-2xl bg-white p-12 text-center shadow-sm"><span className="material-symbols-outlined text-5xl text-slate-300">favorite</span><h2 className="mt-3 text-xl font-bold">Bạn chưa lưu sản phẩm nào</h2><p className="mt-2 text-slate-600">Chạm biểu tượng trái tim trên sản phẩm để lưu lại tại đây.</p><Link to="/" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-white">Khám phá sản phẩm</Link></section>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.items.map((item) => (
              <li key={item.product_id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <Link to={`/product/${item.product_id}`} className="flex aspect-[4/3] items-center justify-center bg-slate-100">{item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.name} className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-5xl text-slate-400">image</span>}</Link>
                <div className="p-4"><p className="text-xs text-slate-500">{item.shop_name}</p><Link to={`/product/${item.product_id}`} className="mt-1 block line-clamp-2 min-h-12 font-semibold hover:text-primary">{item.name}</Link><div className="mt-3 flex items-center justify-between"><strong>{money(item.price)}</strong><span className="text-xs text-slate-500">{item.is_available ? `Còn ${item.available_stock}` : "Tạm hết hàng"}</span></div>
                  <div className="mt-4 flex gap-2"><button type="button" disabled={!item.is_available || item.available_stock < 1 || cartUpdating} onClick={() => void handleAddToCart(item.product_id)} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">{cartUpdating ? "Đang thêm…" : "Thêm vào giỏ"}</button><button type="button" disabled={wishlist.mutatingIds.includes(item.product_id)} onClick={() => void dispatch(toggleWishlistItem(item.product_id))} className="rounded-lg border px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50">Bỏ lưu</button></div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </CustomerLayout>
  );
}
