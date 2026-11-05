import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { UserOrder, ShopOrderGroup, OrderItem } from '@/domains/order/types';

interface OrderDetailShopSectionProps {
  order: UserOrder;
  onShowToast?: (message: string) => void;
}

export const OrderDetailShopSection: React.FC<OrderDetailShopSectionProps> = ({
  order,
  onShowToast,
}) => {
  const navigate = useNavigate();

  // Helper format currency
  const formatCurrency = (val: number) => `${val.toLocaleString('vi-VN')} ₫`;

  // Group items by shop safely
  const shopGroups: ShopOrderGroup[] = React.useMemo(() => {
    // Map items by shopId
    const itemMap = new Map<number, OrderItem[]>();
    (order.items || []).forEach((item) => {
      const sId = item.shopId || 1;
      const list = itemMap.get(sId) || [];
      list.push(item);
      itemMap.set(sId, list);
    });

    if (order.shops && order.shops.length > 0) {
      return order.shops.map((shop) => ({
        shopId: shop.shopId,
        shopName: shop.shopName,
        shopAvatar: shop.logoUrl,
        isMall: shop.shopBadge === 'MALL',
        isArtisan: shop.shopBadge === 'ARTISAN',
        rating: 4.9,
        responseRate: 98,
        items: itemMap.get(shop.shopId) || (order.items || []).filter((i) => i.shopId === shop.shopId),
      }));
    }

    // Fallback: group items by shopId or shopName
    const groups: { [key: string]: ShopOrderGroup } = {};
    (order.items || []).forEach((item) => {
      const key = String(item.shopId || item.shopName || 'default');
      if (!groups[key]) {
        groups[key] = {
          shopId: item.shopId || 1,
          shopName: item.shopName || 'MarketPulse Official Store',
          shopAvatar: undefined,
          isMall: item.shopBadge === 'MALL',
          isArtisan: item.shopBadge === 'ARTISAN',
          rating: 4.9,
          responseRate: 99,
          items: [],
        };
      }
      groups[key].items.push(item);
    });

    return Object.values(groups);
  }, [order.shops, order.items]);

  const handleMessageShop = (shopName: string) => {
    if (onShowToast) {
      onShowToast(`Đã mở khung chat với gian hàng ${shopName}`);
    }
  };

  const isOrderCompleted =
    order.status === 'completed' || (order.status as string) === 'COMPLETED';

  return (
    <div className="flex flex-col gap-6">
      {shopGroups.map((shop, sIdx) => {
        const shopInitials = shop.shopName
          ? shop.shopName
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
          : 'MP';

        return (
          <section
            key={shop.shopId || sIdx}
            className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
          >
            {/* Shop Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-surface-container">
              <div className="flex items-center gap-3">
                {shop.shopAvatar ? (
                  <img
                    src={shop.shopAvatar}
                    alt={shop.shopName}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm bg-surface-container"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md font-bold shadow-sm">
                    {shopInitials}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/shop/${shop.shopId}`}
                      className="font-headline-md text-headline-md text-on-surface font-bold hover:text-primary transition-colors"
                    >
                      {shop.shopName}
                    </Link>
                    {shop.isMall && (
                      <span className="px-2 py-0.5 rounded bg-tertiary-container text-on-primary font-label-sm text-label-sm font-bold">
                        MALL CHÍNH HÃNG
                      </span>
                    )}
                    {shop.isArtisan && (
                      <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">
                        ARTISAN
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-outline mt-0.5">
                    Tỉ lệ phản hồi {shop.responseRate || 98}% • Đánh giá {shop.rating || 4.9}/5 ★
                  </p>
                </div>
              </div>

              {/* Shop Actions */}
              <div className="flex items-center gap-2.5">
                <Link
                  to={`/shop/${shop.shopId}`}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1"
                >
                  <span>Xem Shop</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleMessageShop(shop.shopName)}
                  className="px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">forum</span>
                  <span>Nhắn tin Shop</span>
                </button>
              </div>
            </div>

            {/* Item Rows for this shop */}
            <div className="flex flex-col gap-4">
              {shop.items.map((item: OrderItem) => {
                const itemPrice = item.unitPrice ?? 0;
                const itemTotal = itemPrice * item.quantity;
                const defaultBadge = item.shopBadge || 'Chính hãng 100%';
                const itemImage = item.imageUrl || '';

                return (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    {/* Item Left: Image & Info */}
                    <div className="flex items-start sm:items-center gap-4">
                      <Link to={`/product/${item.productId}`} className="shrink-0">
                        <img
                          src={itemImage}
                          alt={item.productName}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-surface-container-lowest shadow-sm hover:scale-105 transition-transform"
                        />
                      </Link>
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm self-start">
                          {defaultBadge}
                        </span>
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-headline-md text-headline-md text-on-surface font-bold leading-snug hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName && (
                          <p className="font-body-md text-body-md text-outline">
                            Phân loại: <span className="text-on-surface">{item.variantName}</span>
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-label-lg text-label-lg text-primary font-bold">
                            {formatCurrency(itemPrice)}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline">
                            x {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Item Right: Total & Item Actions */}
                    <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-3">
                      <div className="text-right">
                        <span className="font-body-sm text-body-sm text-outline block">Thành tiền</span>
                        <span className="font-headline-md text-headline-md text-on-surface font-bold">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/product/${item.productId}`)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors shadow-sm"
                        >
                          Mua lại
                        </button>
                        <div className="relative group/tooltip">
                          <button
                            type="button"
                            disabled={!isOrderCompleted}
                            onClick={() => {
                              if (isOrderCompleted && onShowToast) {
                                onShowToast(`Mở đánh giá sản phẩm: ${item.productName}`);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
                              isOrderCompleted
                                ? 'bg-primary-container text-on-primary hover:bg-primary shadow-sm'
                                : 'bg-surface-container text-outline cursor-not-allowed opacity-75'
                            }`}
                          >
                            Đánh giá sản phẩm
                          </button>
                          {!isOrderCompleted && (
                            <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:block z-30 w-48 p-2 rounded-lg bg-inverse-surface text-inverse-on-surface font-body-sm text-body-sm text-center shadow-lg">
                              Khả dụng khi nhận hàng thành công
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
