import React, { useState, useMemo } from "react";
import type {
  AddProductFormData,
  AddProductVariantRow,
  AddProductColorItem,
} from "@/domains/shop/types/shopAddProduct.types";
import { CATEGORY_TREE_DATA } from "@/domains/shop/constants/categoryTreeData";

interface AddProductVariantsProps {
  formData: AddProductFormData;
  onChange: (fields: Partial<AddProductFormData>) => void;
}

const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: "Đen Tuyền", hex: "#18181b" },
  { name: "Trắng Kem", hex: "#fef3c7" },
  { name: "Trắng", hex: "#ffffff" },
  { name: "Xám Khói", hex: "#64748b" },
  { name: "Xanh Navy", hex: "#1e3a8a" },
  { name: "Đỏ Đô", hex: "#991b1b" },
  { name: "Nâu Đất", hex: "#78350f" },
  { name: "Xanh Rêu", hex: "#365314" },
  { name: "Be", hex: "#f5f5dc" },
  { name: "Cam Đất", hex: "#ea580c" },
];

const DEFAULT_SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];

export const AddProductVariants: React.FC<AddProductVariantsProps> = ({
  formData,
  onChange,
}) => {
  // Batch apply fields
  const [batchCostPrice, setBatchCostPrice] = useState("");
  const [batchSellPrice, setBatchSellPrice] = useState("");
  const [batchStock, setBatchStock] = useState("");

  // Custom size inputs keyed by color ID
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<string, string>>({});

  // Suggested sizes from category or fallback
  const suggestedSizes = useMemo(() => {
    const category = CATEGORY_TREE_DATA.find((c) => c.id === formData.categoryId);
    return category?.suggestedSizes && category.suggestedSizes.length > 0
      ? category.suggestedSizes
      : DEFAULT_SHOE_SIZES;
  }, [formData.categoryId]);

  // Generate SKU helper
  const generateSku = (productName: string, colorName: string, size: string) => {
    const prefix = productName
      ? productName
          .trim()
          .split(/\s+/)
          .map((w) => w[0]?.toUpperCase())
          .slice(0, 3)
          .join("")
      : "PRD";
    const colorCode =
      colorName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 3)
        .toUpperCase() || "CLR";
    const sizeCode = size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "SZ";
    return `${prefix}-${colorCode}-${sizeCode}`;
  };

  // Add new color block
  const handleAddNewColorBlock = () => {
    const newId = `c-${Date.now()}`;
    const newColor: AddProductColorItem = {
      id: newId,
      name: "",
      hex: "#18181b",
    };
    onChange({ colors: [...formData.colors, newColor] });
  };

  // Remove entire color block
  const handleRemoveColorBlock = (colorId: string) => {
    const colorToRemove = formData.colors.find((c) => c.id === colorId);
    if (!colorToRemove) return;

    const nextColors = formData.colors.filter((c) => c.id !== colorId);
    const nextVariants = formData.variants.filter((v) => v.color !== colorToRemove.name);
    const nextSizes = Array.from(new Set(nextVariants.map((v) => v.size)));

    onChange({
      colors: nextColors,
      variants: nextVariants,
      sizes: nextSizes,
    });
  };

  // Update color name
  const handleColorNameChange = (colorId: string, newName: string) => {
    const oldColor = formData.colors.find((c) => c.id === colorId);
    if (!oldColor) return;
    const oldName = oldColor.name;

    const nextColors = formData.colors.map((c) =>
      c.id === colorId ? { ...c, name: newName } : c
    );

    const nextVariants = formData.variants.map((v) => {
      if (v.color === oldName) {
        return {
          ...v,
          color: newName,
          id: `${newName}-${v.size}`,
          sku: generateSku(formData.name, newName, v.size),
        };
      }
      return v;
    });

    onChange({ colors: nextColors, variants: nextVariants });
  };

  // Update color hex
  const handleColorHexChange = (colorId: string, newHex: string) => {
    const targetColor = formData.colors.find((c) => c.id === colorId);
    if (!targetColor) return;

    const nextColors = formData.colors.map((c) =>
      c.id === colorId ? { ...c, hex: newHex } : c
    );

    const nextVariants = formData.variants.map((v) => {
      if (v.color === targetColor.name) {
        return { ...v, colorHex: newHex };
      }
      return v;
    });

    onChange({ colors: nextColors, variants: nextVariants });
  };

  // Choose preset color
  const handleSelectPresetColor = (colorId: string, preset: { name: string; hex: string }) => {
    const targetColor = formData.colors.find((c) => c.id === colorId);
    if (!targetColor) return;
    const oldName = targetColor.name;

    const nextColors = formData.colors.map((c) =>
      c.id === colorId ? { ...c, name: preset.name, hex: preset.hex } : c
    );

    const nextVariants = formData.variants.map((v) => {
      if (v.color === oldName) {
        return {
          ...v,
          color: preset.name,
          colorHex: preset.hex,
          id: `${preset.name}-${v.size}`,
          sku: generateSku(formData.name, preset.name, v.size),
        };
      }
      return v;
    });

    onChange({ colors: nextColors, variants: nextVariants });
  };

  // Toggle size for a specific color
  const handleToggleSizeForColor = (
    colorItem: AddProductColorItem,
    size: string
  ) => {
    const isCurrentlyActive = formData.variants.some(
      (v) => v.color === colorItem.name && v.size === size
    );

    let nextVariants: AddProductVariantRow[];

    if (isCurrentlyActive) {
      // Remove variant
      nextVariants = formData.variants.filter(
        (v) => !(v.color === colorItem.name && v.size === size)
      );
    } else {
      // Add variant with 0 / blank default values
      const defaultCost = batchCostPrice ? Number(batchCostPrice) : 0;
      const defaultSell = batchSellPrice ? Number(batchSellPrice) : 0;
      const defaultStock = batchStock !== "" ? Number(batchStock) : 0;

      const newRow: AddProductVariantRow = {
        id: `${colorItem.name}-${size}`,
        color: colorItem.name,
        size,
        colorHex: colorItem.hex,
        sku: generateSku(formData.name, colorItem.name, size),
        costPrice: defaultCost,
        sellPrice: defaultSell,
        stock: defaultStock,
        status: defaultStock === 0 ? "out_of_stock" : defaultStock <= 15 ? "low_stock" : "available",
      };
      nextVariants = [...formData.variants, newRow];
    }

    const nextSizes = Array.from(new Set(nextVariants.map((v) => v.size)));
    onChange({ variants: nextVariants, sizes: nextSizes });
  };

  // Add custom size to a specific color
  const handleAddCustomSizeToColor = (colorItem: AddProductColorItem) => {
    const rawInput = customSizeInputs[colorItem.id] || "";
    const trimmedSize = rawInput.trim();
    if (!trimmedSize) return;

    // Check if already active
    const alreadyExists = formData.variants.some(
      (v) => v.color === colorItem.name && v.size.toLowerCase() === trimmedSize.toLowerCase()
    );

    if (!alreadyExists) {
      const defaultCost = batchCostPrice ? Number(batchCostPrice) : 0;
      const defaultSell = batchSellPrice ? Number(batchSellPrice) : 0;
      const defaultStock = batchStock !== "" ? Number(batchStock) : 0;

      const newRow: AddProductVariantRow = {
        id: `${colorItem.name}-${trimmedSize}`,
        color: colorItem.name,
        size: trimmedSize,
        colorHex: colorItem.hex,
        sku: generateSku(formData.name, colorItem.name, trimmedSize),
        costPrice: defaultCost,
        sellPrice: defaultSell,
        stock: defaultStock,
        status: defaultStock === 0 ? "out_of_stock" : defaultStock <= 15 ? "low_stock" : "available",
      };
      const nextVariants = [...formData.variants, newRow];
      const nextSizes = Array.from(new Set(nextVariants.map((v) => v.size)));
      onChange({ variants: nextVariants, sizes: nextSizes });
    }

    setCustomSizeInputs((prev) => ({ ...prev, [colorItem.id]: "" }));
  };

  // Remove single size from a color
  const handleRemoveSizeFromColor = (colorName: string, size: string) => {
    const nextVariants = formData.variants.filter(
      (v) => !(v.color === colorName && v.size === size)
    );
    const nextSizes = Array.from(new Set(nextVariants.map((v) => v.size)));
    onChange({ variants: nextVariants, sizes: nextSizes });
  };

  // Update specific variant field (stock, prices, sku)
  const handleUpdateVariantField = (
    id: string,
    field: keyof AddProductVariantRow,
    value: string | number
  ) => {
    const updated = formData.variants.map((row) => {
      if (row.id !== id) return row;
      const next = { ...row, [field]: value };
      if (field === "stock") {
        const numStock = Number(value);
        next.status =
          numStock === 0
            ? "out_of_stock"
            : numStock <= 15
            ? "low_stock"
            : "available";
      }
      return next;
    });
    onChange({ variants: updated });
  };

  // Batch Apply
  const handleApplyBatch = () => {
    const cost = batchCostPrice ? Number(batchCostPrice) : undefined;
    const sell = batchSellPrice ? Number(batchSellPrice) : undefined;
    const stock = batchStock !== "" ? Number(batchStock) : undefined;

    const updated = formData.variants.map((v) => {
      const nextStock = stock !== undefined ? stock : v.stock;
      return {
        ...v,
        costPrice: cost !== undefined ? cost : v.costPrice,
        sellPrice: sell !== undefined ? sell : v.sellPrice,
        stock: nextStock,
        status:
          nextStock === 0
            ? ("out_of_stock" as const)
            : nextStock <= 15
            ? ("low_stock" as const)
            : ("available" as const),
      };
    });

    onChange({ variants: updated });
  };

  // Overall totals
  const totalStockAll = formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs border border-outline-variant/30 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">dataset</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              3. Phân loại hàng &amp; Ma trận SKU
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Thiết lập từng nhóm màu sắc, chọn danh sách kích cỡ (size) và số lượng kho cho từng màu
            </p>
          </div>
        </div>

        {/* Variant Switch toggle */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            Bật nhiều biến thể
          </span>
          <button
            type="button"
            onClick={() => {
              const nextHasVariants = !formData.hasVariants;
              if (nextHasVariants && formData.colors.length === 0) {
                // Initialize with 1 empty color block when switching on
                onChange({
                  hasVariants: true,
                  colors: [{ id: `c-${Date.now()}`, name: "", hex: "#18181b" }],
                });
              } else {
                onChange({ hasVariants: nextHasVariants });
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              formData.hasVariants ? "bg-primary" : "bg-outline-variant"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-surface-container-lowest transition-transform ${
                formData.hasVariants ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {!formData.hasVariants ? (
        /* Single SKU Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface">Mã SKU</label>
            <input
              type="text"
              value={formData.singleSku}
              onChange={(e) => onChange({ singleSku: e.target.value })}
              placeholder="Ví dụ: SKU-BASIC-01"
              className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 outline-none focus:border-primary text-sm font-body-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface">Giá vốn (₫)</label>
            <input
              type="number"
              min={0}
              value={formData.singleCostPrice === 0 ? "" : formData.singleCostPrice}
              onChange={(e) =>
                onChange({
                  singleCostPrice: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)),
                })
              }
              placeholder="Ví dụ: 450.000"
              className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 outline-none focus:border-primary text-sm font-body-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface">Giá bán niêm yết (₫)</label>
            <input
              type="number"
              min={0}
              value={formData.singleSellPrice === 0 ? "" : formData.singleSellPrice}
              onChange={(e) =>
                onChange({
                  singleSellPrice: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)),
                })
              }
              placeholder="Ví dụ: 890.000"
              className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 outline-none focus:border-primary text-sm font-body-sm font-bold text-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface">Kho hàng</label>
            <input
              type="number"
              min={0}
              value={formData.singleStock === 0 ? "" : formData.singleStock}
              onChange={(e) =>
                onChange({
                  singleStock: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)),
                })
              }
              placeholder="Ví dụ: 100"
              className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 outline-none focus:border-primary text-sm font-body-sm"
            />
          </div>
        </div>
      ) : (
        /* Multi-Variant Mode: Per-Color Configuration Cards */
        <div className="flex flex-col gap-6">
          {/* Quick Notice */}
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-on-surface text-body-sm font-body-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px]">
                style
              </span>
              <span>
                Mỗi khung bên dưới đại diện cho 1 màu sắc. Bạn có thể chọn các kích cỡ có sẵn cho màu đó và nhập số lượng kho tương ứng.
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-container-lowest text-primary shadow-2xs shrink-0">
              {formData.colors.length} nhóm màu • {formData.variants.length} SKU
            </span>
          </div>

          {/* List of Color Blocks or Empty State */}
          {formData.colors.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface-container-low border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">palette</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Chưa có nhóm biến thể màu sắc
                </h3>
                <p className="font-body-sm text-body-sm text-outline max-w-md mt-1">
                  Bấm nút bên dưới để thêm màu sắc đầu tiên và thiết lập kích cỡ, giá và kho hàng tương ứng.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddNewColorBlock}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-bold shadow-xs cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>+ Thêm nhóm màu sắc đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {formData.colors.map((colorItem, colorIndex) => {
                const colorVariants = formData.variants.filter((v) => v.color === colorItem.name);
                const activeSizesSet = new Set(colorVariants.map((v) => v.size));
                const totalStockThisColor = colorVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

                // All sizes to show as chips: suggested + any custom sizes this color already has
                const allSizeChips = Array.from(
                  new Set([...suggestedSizes, ...colorVariants.map((v) => v.size)])
                );

                return (
                  <div
                    key={colorItem.id}
                    className="bg-surface-container-low rounded-2xl p-4 sm:p-5 lg:p-6 border border-outline-variant/30 flex flex-col gap-5 shadow-2xs hover:border-primary/40 transition-all"
                  >
                    {/* Block Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {colorIndex + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full ring-2 ring-black/15 shadow-2xs shrink-0"
                            style={{ backgroundColor: colorItem.hex }}
                          />
                          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                            {colorItem.name || `Nhóm màu ${colorIndex + 1}`}
                          </span>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-outline font-medium">
                          {colorVariants.length} size • {totalStockThisColor} sản phẩm trong kho
                        </span>
                      </div>

                      {formData.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColorBlock(colorItem.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 text-xs font-semibold transition-colors cursor-pointer"
                          title="Xóa nhóm màu này"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>Xóa màu này</span>
                        </button>
                      )}
                    </div>

                    {/* 1. Color Selector & Input */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                        <span>Màu sắc:</span>
                        <span className="text-xs font-normal text-outline">
                          (Nhập tên màu hoặc chọn nhanh từ bảng màu gợi ý)
                        </span>
                      </label>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Color Picker Dot + Color Name Input */}
                        <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/40 shadow-2xs">
                          <label
                            htmlFor={`color-picker-${colorItem.id}`}
                            className="w-6 h-6 rounded-full cursor-pointer ring-1 ring-black/20 shrink-0 hover:scale-105 transition-transform"
                            style={{ backgroundColor: colorItem.hex }}
                            title="Nhấp để đổi mã màu sắc"
                          >
                            <input
                              id={`color-picker-${colorItem.id}`}
                              type="color"
                              value={colorItem.hex}
                              onChange={(e) => handleColorHexChange(colorItem.id, e.target.value)}
                              className="opacity-0 w-0 h-0 pointer-events-none"
                            />
                          </label>
                          <input
                            type="text"
                            value={colorItem.name}
                            onChange={(e) => handleColorNameChange(colorItem.id, e.target.value)}
                            placeholder="Nhập tên màu (VD: Đen Tuyền)..."
                            className="bg-transparent text-on-surface font-body-sm text-body-sm font-semibold outline-none w-48 sm:w-56"
                          />
                        </div>

                        {/* Quick preset chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-outline font-medium mr-1">Gợi ý:</span>
                          {PRESET_COLORS.map((preset) => {
                            const isCurrent =
                              colorItem.name.toLowerCase() === preset.name.toLowerCase();
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => handleSelectPresetColor(colorItem.id, preset)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-primary text-on-primary font-bold shadow-2xs"
                                    : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/30"
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                                  style={{ backgroundColor: preset.hex }}
                                />
                                <span>{preset.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 2. Choose Sizes for this Color */}
                    <div className="flex flex-col gap-2.5 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-primary">
                            straighten
                          </span>
                          <span>
                            Chọn các kích cỡ (Size) cho màu &quot;{colorItem.name || "này"}&quot;:
                          </span>
                        </label>
                        <span className="text-xs text-outline">
                          Nhấp để bật / tắt size cho màu này
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {allSizeChips.map((size) => {
                          const isActive = activeSizesSet.has(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleToggleSizeForColor(colorItem, size)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-label-md text-sm transition-all cursor-pointer ${
                                isActive
                                  ? "bg-primary text-on-primary font-bold shadow-xs ring-2 ring-primary/20 scale-[1.02]"
                                  : "bg-surface-container-lowest text-on-surface hover:border-primary/60 hover:text-primary border border-outline-variant/40"
                              }`}
                            >
                              <span>{size.startsWith("Size") ? size : `Size ${size}`}</span>
                              {isActive && (
                                <span className="material-symbols-outlined text-[15px]">check</span>
                              )}
                            </button>
                          );
                        })}

                        {/* Custom Size Input */}
                        <div className="inline-flex items-center gap-1 bg-surface-container-lowest rounded-xl px-2 py-1 border border-outline-variant/40 shadow-2xs">
                          <input
                            type="text"
                            value={customSizeInputs[colorItem.id] || ""}
                            onChange={(e) =>
                              setCustomSizeInputs((prev) => ({
                                ...prev,
                                [colorItem.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), handleAddCustomSizeToColor(colorItem))
                            }
                            placeholder="+ Thêm size..."
                            className="w-28 bg-transparent text-on-surface text-xs font-body-sm outline-none px-1"
                          />
                          {(customSizeInputs[colorItem.id] || "").trim() && (
                            <button
                              type="button"
                              onClick={() => handleAddCustomSizeToColor(colorItem)}
                              className="px-2 py-0.5 rounded-lg bg-primary text-on-primary text-xs font-bold cursor-pointer"
                            >
                              Thêm
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. Quantity & Pricing Table for this Color */}
                    <div className="flex flex-col gap-2 pt-2">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        Danh sách biến thể &amp; Số lượng kho cho màu &quot;{colorItem.name || "này"}&quot;:
                      </span>

                      {colorVariants.length === 0 ? (
                        <div className="p-4 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant/40 text-center flex flex-col items-center justify-center gap-1 text-outline">
                          <span className="material-symbols-outlined text-[24px] text-primary/60">
                            touch_app
                          </span>
                          <p className="font-body-sm text-body-sm">
                            Chưa chọn kích cỡ nào cho màu này. Bấm vào các nút size ở trên hoặc nhập size mới để thiết lập số lượng kho!
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
                          <table className="w-full text-left font-body-sm text-body-sm">
                            <thead>
                              <tr className="bg-surface-container-high/40 font-label-md text-label-md text-on-surface border-b border-outline-variant/20">
                                <th className="py-2.5 px-3">Kích cỡ (Size)</th>
                                <th className="py-2.5 px-3">Mã SKU Phân loại</th>
                                <th className="py-2.5 px-3">Giá vốn (₫)</th>
                                <th className="py-2.5 px-3">Giá bán (₫)</th>
                                <th className="py-2.5 px-3">Số lượng (Kho)</th>
                                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                                <th className="py-2.5 px-2 text-center">Xóa</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                              {colorVariants.map((v) => (
                                <tr
                                  key={v.id}
                                  className="hover:bg-surface-container-high/20 transition-colors"
                                >
                                  <td className="py-2 px-3">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-bold text-xs">
                                      <span>{v.size.startsWith("Size") ? v.size : `Size ${v.size}`}</span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={v.sku}
                                      onChange={(e) =>
                                        handleUpdateVariantField(v.id, "sku", e.target.value)
                                      }
                                      placeholder="Mã SKU (VD: RR-BLK-39)"
                                      className="w-36 bg-surface-container-low px-2 py-1 rounded-lg font-mono text-xs outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      min={0}
                                      value={v.costPrice === 0 ? "" : v.costPrice}
                                      onChange={(e) =>
                                        handleUpdateVariantField(
                                          v.id,
                                          "costPrice",
                                          e.target.value === "" ? 0 : Math.max(0, Number(e.target.value))
                                        )
                                      }
                                      placeholder="Giá vốn ₫"
                                      className="w-24 bg-surface-container-low px-2 py-1 rounded-lg text-xs outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary text-right"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      min={0}
                                      value={v.sellPrice === 0 ? "" : v.sellPrice}
                                      onChange={(e) =>
                                        handleUpdateVariantField(
                                          v.id,
                                          "sellPrice",
                                          e.target.value === "" ? 0 : Math.max(0, Number(e.target.value))
                                        )
                                      }
                                      placeholder="Giá bán ₫"
                                      className="w-24 bg-surface-container-low px-2 py-1 rounded-lg font-bold text-xs text-primary outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary text-right"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      min={0}
                                      value={v.stock === 0 ? "" : v.stock}
                                      onChange={(e) =>
                                        handleUpdateVariantField(
                                          v.id,
                                          "stock",
                                          e.target.value === "" ? 0 : Math.max(0, Number(e.target.value))
                                        )
                                      }
                                      placeholder="0"
                                      className="w-20 bg-surface-container-low px-2 py-1 rounded-lg text-xs font-bold text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary text-right"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    {v.stock === 0 ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
                                        Hết hàng
                                      </span>
                                    ) : v.stock <= 15 ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                        Sắp hết ({v.stock})
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        Sẵn hàng ({v.stock})
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSizeFromColor(colorItem.name, v.size)}
                                      className="text-outline hover:text-error p-1 rounded-md hover:bg-error-container/20 transition-colors cursor-pointer"
                                      title="Xóa kích cỡ này"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">
                                        close
                                      </span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Another Color Block Button */}
          <button
            type="button"
            onClick={handleAddNewColorBlock}
            className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary font-label-md text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
            <span>+ Thêm khung biến thể màu sắc khác</span>
          </button>

          {/* Batch Apply Bar */}
          <div className="bg-surface-container rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-outline-variant/20 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[22px] text-primary">bolt</span>
              <div>
                <span className="font-label-md text-label-md text-on-surface font-bold block">
                  Áp dụng giá &amp; kho hàng đồng loạt:
                </span>
                <span className="text-xs text-outline font-normal">
                  Điền nhanh giá và số lượng cho tất cả {formData.variants.length} biến thể
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-32 sm:w-36">
                <input
                  type="number"
                  min={0}
                  value={batchCostPrice}
                  onChange={(e) => setBatchCostPrice(e.target.value)}
                  placeholder="Giá vốn ₫"
                  className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative w-32 sm:w-36">
                <input
                  type="number"
                  min={0}
                  value={batchSellPrice}
                  onChange={(e) => setBatchSellPrice(e.target.value)}
                  placeholder="Giá bán ₫"
                  className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary font-bold text-primary"
                />
              </div>
              <div className="relative w-24 sm:w-28">
                <input
                  type="number"
                  min={0}
                  value={batchStock}
                  onChange={(e) => setBatchStock(e.target.value)}
                  placeholder="Kho hàng"
                  className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyBatch}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-xs cursor-pointer font-bold"
              >
                Áp dụng tất cả
              </button>
            </div>
          </div>

          {/* Footer Summary */}
          <div className="flex flex-wrap items-center justify-between text-body-sm font-body-sm text-outline px-1">
            <span>
              Tổng cộng: <strong className="text-on-surface font-semibold">{formData.colors.length}</strong> màu sắc,{" "}
              <strong className="text-on-surface font-semibold">{formData.variants.length}</strong> biến thể SKU
            </span>
            <span>
              Tổng số lượng tồn kho: <strong className="text-primary font-bold">{totalStockAll}</strong> sản phẩm
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddProductVariants;
