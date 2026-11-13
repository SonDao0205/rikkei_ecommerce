import React, { useState, useMemo, useCallback } from "react";
import type {
  ShopProductItem,
  BackendSellerProductVariant,
} from "@/domains/shop/types/shopProduct.types";
import { DEFAULT_PRODUCT_IMAGE } from "@/domains/shop/api/shopProductApi";

interface CategoryOption {
  id: string;
  name: string;
  attrName: string;
  suggestedSizes: string[];
}

const PRODUCT_CATEGORIES: CategoryOption[] = [
  {
    id: "930011",
    name: "Giày dép (Sneaker, Sandal, Da...)",
    attrName: "Kích cỡ giày",
    suggestedSizes: ["38", "39", "40", "41", "42", "43", "44"],
  },
  {
    id: "930002",
    name: "Áo và quần (T-Shirt, Sơ mi, Jeans...)",
    attrName: "Kích cỡ quần áo",
    suggestedSizes: ["S", "M", "L", "XL", "XXL", "Freesize"],
  },
  {
    id: "930006",
    name: "Áo khoác (Hoodie, Bomber, Gió...)",
    attrName: "Kích cỡ áo",
    suggestedSizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "930001",
    name: "Thời trang & Phụ kiện chung",
    attrName: "Size",
    suggestedSizes: ["S", "M", "L", "XL"],
  },
  {
    id: "930010",
    name: "Balo và túi xách",
    attrName: "Kích thước túi",
    suggestedSizes: ["13 inch", "14 inch", "15.6 inch", "Mini", "Tiêu chuẩn"],
  },
  {
    id: "930005",
    name: "Điện thoại & Phụ kiện",
    attrName: "Dung lượng bộ nhớ",
    suggestedSizes: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  },
  {
    id: "930007",
    name: "Máy tính & Laptop",
    attrName: "Cấu hình RAM / SSD",
    suggestedSizes: ["8GB/256GB", "16GB/512GB", "16GB/1TB", "32GB/1TB"],
  },
  {
    id: "930003",
    name: "Nhà cửa & Đời sống",
    attrName: "Phân loại / Kích cỡ",
    suggestedSizes: ["Nhỏ", "Vừa", "Lớn", "Bộ tiêu chuẩn"],
  },
  {
    id: "930004",
    name: "Thực phẩm & Đồ uống",
    attrName: "Khối lượng / Đóng gói",
    suggestedSizes: ["250g", "500g", "1kg", "Combo 2 gói"],
  },
];

const SUGGESTED_COLORS = [
  { name: "Đen", hex: "#1e293b" },
  { name: "Trắng", hex: "#f8fafc", border: true },
  { name: "Xám", hex: "#64748b" },
  { name: "Xanh navy", hex: "#1e3a8a" },
  { name: "Be", hex: "#f5f5dc", border: true },
  { name: "Đỏ", hex: "#dc2626" },
  { name: "Nâu", hex: "#78350f" },
  { name: "Vàng", hex: "#eab308" },
  { name: "Cam", hex: "#ea580c" },
  { name: "Hồng", hex: "#ec4899" },
];

const SAMPLE_PRESETS: Record<
  string,
  {
    name: string;
    sku: string;
    price: number;
    colors: string[];
    sizes: string[];
    img: string;
  }
> = {
  shoes: {
    name: "Giày Sneaker Retro Runner V2 Da Lộn Thủ Công",
    sku: "VN-SNK-V2",
    price: 850000,
    colors: ["Đen Tuyền", "Trắng Kem", "Xanh Navy"],
    sizes: ["39", "40", "41", "42", "43"],
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
  apparel: {
    name: "Áo Thun Heavyweight Vintage Washed Boxy Fit",
    sku: "VN-TEE-HVY",
    price: 350000,
    colors: ["Đen Washed", "Trắng Mộc", "Xám Khói"],
    sizes: ["S", "M", "L", "XL"],
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
  },
  hoodie: {
    name: "Áo Khoác Gió Kháng Nước Windbreaker Minimal",
    sku: "VN-JKT-WND",
    price: 650000,
    colors: ["Đen", "Xanh Rêu", "Xám Bạc"],
    sizes: ["M", "L", "XL", "XXL"],
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
  },
};

interface VariantMatrixRow {
  key: string;
  val1: string;
  val2?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  enabled: boolean;
}

interface ShopProductModalProps {
  isOpen: boolean;
  editingProduct: ShopProductItem | null;
  onClose: () => void;
  onSave: (product: Partial<ShopProductItem>) => void;
}

interface ShopProductModalFormProps {
  editingProduct: ShopProductItem | null;
  onClose: () => void;
  onSave: (product: Partial<ShopProductItem>) => void;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
};

const ShopProductModalForm: React.FC<ShopProductModalFormProps> = ({
  editingProduct,
  onClose,
  onSave,
}) => {
  const initialCat =
    editingProduct?.category || String(editingProduct?.categoryId || "930011");

  const [name, setName] = useState(editingProduct?.name || "");
  const [baseSku, setBaseSku] = useState(editingProduct?.sku || "VN-SNK-88219");
  const [category, setCategory] = useState(initialCat);
  const [categoryLabel, setCategoryLabel] = useState(
    editingProduct?.categoryLabel ||
      PRODUCT_CATEGORIES.find((c) => c.id === initialCat)?.name ||
      "Giày dép",
  );
  const [brand, setBrand] = useState("An Nhiên");
  const [description, setDescription] = useState(
    editingProduct?.variationSubtitle ||
      "Sản phẩm thiết kế cao cấp, chất liệu bền bỉ và kiểm duyệt chất lượng kỹ càng.",
  );
  const [imageUrl, setImageUrl] = useState(
    editingProduct?.imageUrl ||
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  );

  // Single product fallback pricing
  const [singlePrice, setSinglePrice] = useState(
    editingProduct?.price || 850000,
  );
  const [singleStock, setSingleStock] = useState(editingProduct?.stock ?? 25);

  // Variants Toggle
  const [hasVariants, setHasVariants] = useState<boolean>(() => {
    if (editingProduct?.rawVariants && editingProduct.rawVariants.length > 1) {
      return true;
    }
    return true; // Default enabled to easily configure size/color
  });

  // Category info
  const currentCategoryOption = useMemo(() => {
    return (
      PRODUCT_CATEGORIES.find((c) => c.id === category) || PRODUCT_CATEGORIES[0]
    );
  }, [category]);

  // Attribute Group 1 (Colors)
  const [group1Name, setGroup1Name] = useState("Màu sắc");
  const [group1Values, setGroup1Values] = useState<string[]>(() => {
    if (editingProduct?.rawVariants && editingProduct.rawVariants.length > 0) {
      const colors = new Set<string>();
      editingProduct.rawVariants.forEach((v) => {
        const parts = v.name.split(/[/,•-]/).map((s) => s.trim());
        if (parts[0]) colors.add(parts[0]);
      });
      if (colors.size > 0) return Array.from(colors);
    }
    return ["Đen", "Trắng", "Xanh navy"];
  });
  const [newGroup1Input, setNewGroup1Input] = useState("");

  // Attribute Group 2 (Sizes)
  const [enableGroup2, setEnableGroup2] = useState(true);
  const [group2Name, setGroup2Name] = useState("Kích cỡ / Size");
  const [group2Values, setGroup2Values] = useState<string[]>(() => {
    if (editingProduct?.rawVariants && editingProduct.rawVariants.length > 0) {
      const sizes = new Set<string>();
      editingProduct.rawVariants.forEach((v) => {
        const parts = v.name.split(/[/,•-]/).map((s) => s.trim());
        if (parts[1]) sizes.add(parts[1]);
      });
      if (sizes.size > 0) return Array.from(sizes);
    }
    return ["39", "40", "41", "42"];
  });
  const [newGroup2Input, setNewGroup2Input] = useState("");

  // Overrides for individual matrix cells (price, stock, sku, enabled)
  const [customCellOverrides, setCustomCellOverrides] = useState<
    Record<
      string,
      { price?: number; stock?: number; sku?: string; enabled?: boolean }
    >
  >({});

  // Batch Fill inputs
  const [batchPrice, setBatchPrice] = useState<string>("850000");
  const [batchStock, setBatchStock] = useState<string>("20");
  const [batchSkuPrefix, setBatchSkuPrefix] = useState<string>("");

  // Pure derived Variant Matrix combinations (No useEffect setState!)
  const variantRows = useMemo(() => {
    if (!hasVariants) return [];

    const g1 = group1Values.filter((v) => v.trim() !== "");
    const g2 = enableGroup2 ? group2Values.filter((v) => v.trim() !== "") : [];

    const rows: VariantMatrixRow[] = [];

    if (g1.length === 0 && g2.length === 0) {
      return [];
    }

    if (g1.length > 0 && g2.length === 0) {
      g1.forEach((val1) => {
        const key = val1;
        const override = customCellOverrides[key];
        const defaultSku = `${baseSku}-${slugify(val1)}`;

        rows.push({
          key,
          val1,
          name: val1,
          sku: override?.sku ?? defaultSku,
          price: override?.price ?? singlePrice,
          stock: override?.stock ?? 15,
          enabled: override?.enabled ?? true,
        });
      });
    } else if (g1.length > 0 && g2.length > 0) {
      g1.forEach((val1) => {
        g2.forEach((val2) => {
          const key = `${val1}-${val2}`;
          const override = customCellOverrides[key];
          const defaultSku = `${baseSku}-${slugify(val1)}-${slugify(val2)}`;

          rows.push({
            key,
            val1,
            val2,
            name: `${val1} / Size ${val2}`,
            sku: override?.sku ?? defaultSku,
            price: override?.price ?? singlePrice,
            stock: override?.stock ?? 15,
            enabled: override?.enabled ?? true,
          });
        });
      });
    } else if (g1.length === 0 && g2.length > 0) {
      g2.forEach((val2) => {
        const key = val2;
        const override = customCellOverrides[key];
        const defaultSku = `${baseSku}-SIZE-${slugify(val2)}`;

        rows.push({
          key,
          val1: val2,
          name: `Size ${val2}`,
          sku: override?.sku ?? defaultSku,
          price: override?.price ?? singlePrice,
          stock: override?.stock ?? 15,
          enabled: override?.enabled ?? true,
        });
      });
    }

    return rows;
  }, [
    hasVariants,
    group1Values,
    enableGroup2,
    group2Values,
    customCellOverrides,
    baseSku,
    singlePrice,
  ]);

  // Handle adding chips
  const handleAddGroup1Value = () => {
    const val = newGroup1Input.trim();
    if (val && !group1Values.includes(val)) {
      setGroup1Values([...group1Values, val]);
      setNewGroup1Input("");
    }
  };

  const handleRemoveGroup1Value = (val: string) => {
    setGroup1Values(group1Values.filter((v) => v !== val));
  };

  const handleAddGroup2Value = () => {
    const val = newGroup2Input.trim();
    if (val && !group2Values.includes(val)) {
      setGroup2Values([...group2Values, val]);
      setNewGroup2Input("");
    }
  };

  const handleRemoveGroup2Value = (val: string) => {
    setGroup2Values(group2Values.filter((v) => v !== val));
  };

  // Quick chips
  const handleQuickAddColor = (colorName: string) => {
    if (!group1Values.includes(colorName)) {
      setGroup1Values([...group1Values, colorName]);
    }
  };

  const handleQuickAddSize = (sizeValue: string) => {
    if (!group2Values.includes(sizeValue)) {
      setGroup2Values([...group2Values, sizeValue]);
    }
  };

  // Quick preset loader
  const handleLoadPreset = (presetKey: keyof typeof SAMPLE_PRESETS) => {
    const p = SAMPLE_PRESETS[presetKey];
    if (!p) return;
    setName(p.name);
    setBaseSku(p.sku);
    setSinglePrice(p.price);
    setImageUrl(p.img);
    setGroup1Values(p.colors);
    setGroup2Values(p.sizes);
    setEnableGroup2(true);
    setHasVariants(true);
  };

  // Batch Apply to all active rows
  const handleBatchApply = () => {
    const pNum = Number(batchPrice);
    const sNum = Number(batchStock);
    const nextOverrides: Record<
      string,
      { price?: number; stock?: number; sku?: string; enabled?: boolean }
    > = { ...customCellOverrides };

    variantRows.forEach((r, idx) => {
      let newSku = r.sku;
      if (batchSkuPrefix.trim()) {
        const suffix = r.val2 ? `${r.val1}-${r.val2}` : r.val1;
        newSku = `${batchSkuPrefix.trim()}-${slugify(suffix)}`;
      }
      nextOverrides[r.key] = {
        ...nextOverrides[r.key],
        price:
          !isNaN(pNum) && pNum > 0
            ? pNum
            : (nextOverrides[r.key]?.price ?? r.price),
        stock:
          !isNaN(sNum) && sNum >= 0
            ? sNum
            : (nextOverrides[r.key]?.stock ?? r.stock),
        sku: newSku || `${baseSku}-${idx + 1}`,
      };
    });

    setCustomCellOverrides(nextOverrides);
  };

  // Update specific row cell
  const handleUpdateRow = useCallback(
    (
      key: string,
      field: "price" | "stock" | "sku" | "enabled",
      value: unknown,
    ) => {
      setCustomCellOverrides((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [field]: value,
        },
      }));
    },
    [],
  );

  // Category switch
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const found = PRODUCT_CATEGORIES.find((c) => c.id === val);
    setCategoryLabel(found ? found.name : "Ngành hàng chung");
    if (found?.suggestedSizes && found.suggestedSizes.length > 0) {
      setGroup2Name(found.attrName);
    }
  };

  // Form Stats
  const activeRows = useMemo(
    () => variantRows.filter((r) => r.enabled),
    [variantRows],
  );
  const totalStockCount = useMemo(() => {
    if (!hasVariants) return Number(singleStock) || 0;
    return activeRows.reduce((sum, r) => sum + (Number(r.stock) || 0), 0);
  }, [hasVariants, singleStock, activeRows]);

  const priceRangeString = useMemo(() => {
    if (!hasVariants) {
      return new Intl.NumberFormat("vi-VN").format(singlePrice) + " ₫";
    }
    if (activeRows.length === 0) return "0 ₫";
    const prices = activeRows.map((r) => r.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return new Intl.NumberFormat("vi-VN").format(min) + " ₫";
    }
    return `${new Intl.NumberFormat("vi-VN").format(min)} ₫ - ${new Intl.NumberFormat("vi-VN").format(max)} ₫`;
  }, [hasVariants, singlePrice, activeRows]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (hasVariants && activeRows.length === 0) {
      alert(
        "Vui lòng kích hoạt ít nhất một biến thể hoặc tắt tùy chọn biến thể.",
      );
      return;
    }

    const finalPrice =
      hasVariants && activeRows.length > 0
        ? Math.min(...activeRows.map((r) => r.price))
        : singlePrice;

    const finalStock = hasVariants ? totalStockCount : singleStock;

    const variationTitle =
      hasVariants && activeRows.length > 0
        ? `${activeRows.length} phân loại (${group1Name}${enableGroup2 ? `, ${group2Name}` : ""})`
        : "Bản tiêu chuẩn";

    const variationSubtitle =
      hasVariants && activeRows.length > 0
        ? group1Values.slice(0, 3).join(", ") +
          (group1Values.length > 3 ? "..." : "")
        : "Tiêu chuẩn nhà máy";

    const finalVariants: BackendSellerProductVariant[] =
      hasVariants && activeRows.length > 0
        ? activeRows.map((r, idx) => ({
            sku: r.sku || `${baseSku}-${idx + 1}`,
            name: r.name,
            price: Number(r.price),
            stock: Number(r.stock),
            image_url: imageUrl,
            attribute_value_ids: [],
          }))
        : [
            {
              sku: baseSku,
              name: "Tiêu chuẩn",
              price: Number(singlePrice),
              stock: Number(singleStock),
              image_url: imageUrl,
              attribute_value_ids: [],
            },
          ];

    onSave({
      id: editingProduct?.id,
      name: name.trim(),
      sku: baseSku.trim(),
      category,
      categoryId: Number(category),
      categoryLabel,
      price: finalPrice,
      formattedPrice: new Intl.NumberFormat("vi-VN").format(finalPrice) + " ₫",
      stock: finalStock,
      variationTitle,
      variationSubtitle,
      imageUrl: imageUrl.trim() || DEFAULT_PRODUCT_IMAGE,
      stockStatus:
        finalStock > 20
          ? "abundant"
          : finalStock > 5
            ? "safe"
            : finalStock > 0
              ? "low"
              : "out",
      stockStatusLabel:
        finalStock > 20
          ? "Đủ hàng"
          : finalStock > 5
            ? "An toàn"
            : finalStock > 0
              ? "Sắp hết"
              : "Hết hàng",
      status: "ACTIVE",
      rawVariants: finalVariants,
      rawImages: [
        {
          url: imageUrl.trim() || DEFAULT_PRODUCT_IMAGE,
          is_primary: true,
        },
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">
                {editingProduct ? "edit_note" : "add_shopping_cart"}
              </span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Quản lý thông tin chi tiết, màu sắc, kích cỡ (Size) và kho hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Sample Presets */}
            {!editingProduct && (
              <div className="hidden sm:flex items-center gap-1.5 mr-2">
                <span className="font-label-sm text-xs text-outline">
                  Mẫu nhanh:
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadPreset("shoes")}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-fixed hover:text-on-primary-fixed text-on-surface font-label-sm text-xs transition-colors cursor-pointer"
                  title="Điền mẫu Giày Sneaker kèm Size và Màu sắc"
                >
                  👟 Giày Sneaker
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset("apparel")}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-fixed hover:text-on-primary-fixed text-on-surface font-label-sm text-xs transition-colors cursor-pointer"
                  title="Điền mẫu Áo thun thời trang"
                >
                  👕 Áo thun
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Đóng modal"
            >
              <span className="material-symbols-outlined text-[22px]">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 space-y-8"
        >
          {/* SECTION 1: Thông tin cơ bản */}
          <section className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-[20px] text-primary">
                info
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                1. Thông tin cơ bản
              </h3>
            </div>

            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Tên sản phẩm <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Giày Sneaker Nam Retro Runner V2 Da Lộn hoặc Áo Khoác Gió Kháng Nước..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                  Danh mục ngành hàng <span className="text-error">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs cursor-pointer"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                  Thương hiệu (Brand)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ví dụ: An Nhiên, Nike, Adidas..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                  Mã SKU cơ sở <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={baseSku}
                  onChange={(e) => setBaseSku(e.target.value)}
                  placeholder="VN-SNK-88219"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-mono text-body-sm focus:outline-none focus:border-primary shadow-xs uppercase font-bold text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả công năng, chất liệu, hướng dẫn chọn size, form dáng sản phẩm..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
          </section>

          {/* SECTION 2: Hình ảnh sản phẩm */}
          <section className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  image
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  2. Hình ảnh sản phẩm (HTTPS URL)
                </h3>
              </div>
              <span className="font-label-sm text-xs text-outline">
                Xem trước ảnh tức thì
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/40 shadow-xs relative group">
                <img
                  src={imageUrl}
                  alt="Ảnh xem trước"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                  }}
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label-sm text-[11px] text-outline">
                    Ảnh mẫu nhanh:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl(
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
                      )
                    }
                    className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface font-medium transition-colors cursor-pointer"
                  >
                    Sneaker đỏ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl(
                        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800",
                      )
                    }
                    className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface font-medium transition-colors cursor-pointer"
                  >
                    Sneaker cổ điển
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl(
                        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
                      )
                    }
                    className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface font-medium transition-colors cursor-pointer"
                  >
                    Sneaker trắng
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl(
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
                      )
                    }
                    className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface font-medium transition-colors cursor-pointer"
                  >
                    Áo thun cotton
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Thông tin bán hàng & Cấu hình Biến thể */}
          <section className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/20 gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-primary">
                  tune
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    3. Phân loại hàng &amp; Biến thể sản phẩm
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Thiết lập phân loại đa kích cỡ (Size), màu sắc, giá bán và
                    tồn kho tương ứng
                  </p>
                </div>
              </div>

              {/* Toggle Has Variants */}
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                />
                <span className="font-label-md text-label-md font-bold text-primary">
                  Sản phẩm có biến thể (Màu sắc, Size...)
                </span>
              </label>
            </div>

            {/* A. If SINGLE PRODUCT (No Variants) */}
            {!hasVariants ? (
              <div className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                    Giá bán niêm yết (₫) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    value={singlePrice}
                    onChange={(e) => setSinglePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-mono text-body-md font-bold text-primary focus:outline-none focus:border-primary shadow-xs"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                    Tồn kho sẵn có (chiếc) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={singleStock}
                    onChange={(e) => setSingleStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-mono text-body-md font-bold text-on-surface focus:outline-none focus:border-primary shadow-xs"
                  />
                </div>
              </div>
            ) : (
              /* B. If PRODUCT HAS VARIANTS */
              <div className="space-y-6">
                {/* 1. Nhóm Phân loại 1 (Màu sắc) */}
                <div className="rounded-xl border border-outline-variant/30 p-4.5 bg-surface-container-lowest space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        Nhóm phân loại 1:
                      </span>
                      <input
                        type="text"
                        value={group1Name}
                        onChange={(e) => setGroup1Name(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-outline-variant/40 font-label-md text-xs font-bold text-primary bg-surface-container-lowest focus:outline-none focus:border-primary w-28 sm:w-36"
                      />
                    </div>
                    <span className="font-body-sm text-xs text-outline">
                      {group1Values.length} màu đã chọn
                    </span>
                  </div>

                  {/* Group 1 Chips */}
                  <div className="flex flex-wrap items-center gap-2 min-h-[38px] p-2 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                    {group1Values.map((val) => (
                      <span
                        key={val}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/40 font-label-md text-xs font-semibold shadow-2xs group"
                      >
                        {val}
                        <button
                          type="button"
                          onClick={() => handleRemoveGroup1Value(val)}
                          className="hover:text-error text-outline transition-colors cursor-pointer"
                          title={`Xóa ${val}`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            close
                          </span>
                        </button>
                      </span>
                    ))}

                    {/* Add Input */}
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={newGroup1Input}
                        onChange={(e) => setNewGroup1Input(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddGroup1Value();
                          }
                        }}
                        placeholder="+ Thêm màu mới..."
                        className="px-3 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs font-body-sm focus:outline-none focus:border-primary w-36"
                      />
                      <button
                        type="button"
                        onClick={handleAddGroup1Value}
                        className="p-1 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors cursor-pointer text-xs"
                        title="Thêm"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Color Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="font-label-sm text-[11px] text-outline mr-1">
                      Gợi ý màu nhanh:
                    </span>
                    {SUGGESTED_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleQuickAddColor(c.name)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                          group1Values.includes(c.name)
                            ? "bg-primary text-on-primary opacity-60"
                            : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c.border ? "border border-outline/30" : ""
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Nhóm Phân loại 2 (Kích cỡ / Size) */}
                <div className="rounded-xl border border-outline-variant/30 p-4.5 bg-surface-container-lowest space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-secondary-fixed text-secondary font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        Nhóm phân loại 2:
                      </span>
                      <input
                        type="text"
                        value={group2Name}
                        onChange={(e) => setGroup2Name(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-outline-variant/40 font-label-md text-xs font-bold text-secondary bg-surface-container-lowest focus:outline-none focus:border-secondary w-36 sm:w-44"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setEnableGroup2(!enableGroup2)}
                      className="font-label-sm text-xs text-primary hover:underline cursor-pointer"
                    >
                      {enableGroup2
                        ? "Bỏ nhóm 2 (Chỉ dùng Màu sắc)"
                        : "+ Bật nhóm 2 (Kích cỡ / Size)"}
                    </button>
                  </div>

                  {enableGroup2 && (
                    <>
                      {/* Group 2 Chips */}
                      <div className="flex flex-wrap items-center gap-2 min-h-[38px] p-2 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                        {group2Values.map((val) => (
                          <span
                            key={val}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/40 font-label-md text-xs font-semibold shadow-2xs group"
                          >
                            Size: {val}
                            <button
                              type="button"
                              onClick={() => handleRemoveGroup2Value(val)}
                              className="hover:text-error text-outline transition-colors cursor-pointer"
                              title={`Xóa ${val}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                close
                              </span>
                            </button>
                          </span>
                        ))}

                        {/* Add Input */}
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            value={newGroup2Input}
                            onChange={(e) => setNewGroup2Input(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddGroup2Value();
                              }
                            }}
                            placeholder="+ Thêm size..."
                            className="px-3 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-xs font-body-sm focus:outline-none focus:border-secondary w-32"
                          />
                          <button
                            type="button"
                            onClick={handleAddGroup2Value}
                            className="p-1 rounded-lg bg-secondary-fixed text-secondary hover:bg-secondary hover:text-on-secondary transition-colors cursor-pointer text-xs"
                            title="Thêm size"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              add
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Size Suggestions for Current Category */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="font-label-sm text-[11px] text-outline mr-1">
                          Gợi ý size ({currentCategoryOption.attrName}):
                        </span>
                        {currentCategoryOption.suggestedSizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleQuickAddSize(s)}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono transition-all cursor-pointer ${
                              group2Values.includes(s)
                                ? "bg-secondary-container text-on-secondary-container opacity-60"
                                : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Batch Fill Toolbar */}
                <div className="p-4 rounded-xl bg-primary-fixed/20 border border-primary/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      bolt
                    </span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      Áp dụng giá &amp; tồn kho hàng loạt cho tất cả biến thể:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 font-medium">
                        Giá bán chung (₫)
                      </label>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={batchPrice}
                        onChange={(e) => setBatchPrice(e.target.value)}
                        placeholder="850000"
                        className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-xs font-bold text-primary focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 font-medium">
                        Kho hàng chung (chiếc)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={batchStock}
                        onChange={(e) => setBatchStock(e.target.value)}
                        placeholder="20"
                        className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-xs font-bold text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 font-medium">
                        Tiền tố SKU
                      </label>
                      <input
                        type="text"
                        value={batchSkuPrefix}
                        onChange={(e) => setBatchSkuPrefix(e.target.value)}
                        placeholder={baseSku}
                        className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-xs focus:outline-none focus:border-primary uppercase font-bold"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleBatchApply}
                        className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          done_all
                        </span>
                        <span>Áp dụng cho tất cả</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Variant Matrix Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      Danh sách biến thể ({variantRows.length} phân loại):
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Chỉnh sửa trực tiếp từng ô giá và kho cho từng Size &amp;
                      Màu
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-outline-variant/40 shadow-xs max-h-80 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider font-semibold border-b border-outline-variant/30 z-10">
                        <tr>
                          <th className="py-2.5 px-3.5 w-10 text-center">
                            Bật
                          </th>
                          <th className="py-2.5 px-3">{group1Name}</th>
                          {enableGroup2 && (
                            <th className="py-2.5 px-3">{group2Name}</th>
                          )}
                          <th className="py-2.5 px-3 min-w-[140px]">
                            Giá bán (₫) *
                          </th>
                          <th className="py-2.5 px-3 min-w-[110px]">
                            Kho hàng *
                          </th>
                          <th className="py-2.5 px-3 min-w-[180px]">
                            Mã SKU phân loại
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 font-body-sm text-xs text-on-surface bg-surface-container-lowest">
                        {variantRows.map((row) => (
                          <tr
                            key={row.key}
                            className={`hover:bg-surface-container-low/50 transition-colors ${
                              !row.enabled
                                ? "opacity-45 bg-surface-container/20"
                                : ""
                            }`}
                          >
                            <td className="py-2.5 px-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={row.enabled}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    row.key,
                                    "enabled",
                                    e.target.checked,
                                  )
                                }
                                className="w-3.5 h-3.5 rounded text-primary focus:ring-0 cursor-pointer"
                                title="Bật/Tắt biến thể này"
                              />
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="font-label-md text-xs font-bold text-on-surface px-2 py-0.5 rounded bg-surface-container">
                                {row.val1}
                              </span>
                            </td>

                            {enableGroup2 && (
                              <td className="py-2.5 px-3">
                                <span className="font-mono text-xs font-bold text-secondary px-2 py-0.5 rounded bg-secondary-fixed/50">
                                  {row.val2}
                                </span>
                              </td>
                            )}

                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min={1000}
                                step={1000}
                                required={row.enabled}
                                disabled={!row.enabled}
                                value={row.price}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    row.key,
                                    "price",
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full px-2.5 py-1 rounded-lg border border-outline-variant/40 font-mono text-xs font-bold text-primary bg-surface-container-lowest focus:outline-none focus:border-primary"
                              />
                            </td>

                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min={0}
                                required={row.enabled}
                                disabled={!row.enabled}
                                value={row.stock}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    row.key,
                                    "stock",
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full px-2.5 py-1 rounded-lg border border-outline-variant/40 font-mono text-xs font-bold text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary"
                              />
                            </td>

                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                required={row.enabled}
                                disabled={!row.enabled}
                                value={row.sku}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    row.key,
                                    "sku",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2.5 py-1 rounded-lg border border-outline-variant/40 font-mono text-[11px] font-bold uppercase text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 text-xs">
                    <div className="flex items-center gap-3">
                      <span>
                        Đang kích hoạt:{" "}
                        <strong className="text-primary font-bold">
                          {activeRows.length}
                        </strong>{" "}
                        / {variantRows.length} phân loại
                      </span>
                      <span>•</span>
                      <span>
                        Tổng tồn kho:{" "}
                        <strong className="text-on-surface font-bold">
                          {totalStockCount}
                        </strong>{" "}
                        chiếc
                      </span>
                    </div>

                    <div className="mt-1 sm:mt-0 font-label-md text-xs font-bold text-primary">
                      Khoảng giá: {priceRangeString}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sticky Modal Footer */}
          <div className="sticky bottom-0 -mx-6 -mb-8 sm:-mx-8 px-6 sm:px-8 py-4 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg z-20">
            <div className="flex items-center gap-3 text-xs text-on-surface-variant self-start sm:self-auto">
              <span>
                Tổng tồn kho: <strong>{totalStockCount} chiếc</strong>
              </span>
              <span>•</span>
              <span>
                Giá niêm yết:{" "}
                <strong className="text-primary font-bold font-mono">
                  {priceRangeString}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                <span>
                  {editingProduct ? "Cập nhật sản phẩm" : "Lưu sản phẩm mới"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ShopProductModal: React.FC<ShopProductModalProps> = ({
  isOpen,
  editingProduct,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <ShopProductModalForm
      key={editingProduct ? editingProduct.id : "new-product"}
      editingProduct={editingProduct}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

export default ShopProductModal;
