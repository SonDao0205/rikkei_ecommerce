import React, { useState } from "react";
import type {
  AddProductFormData,
  AddProductVariantRow,
  AddProductColorItem,
} from "@/domains/shop/types/shopAddProduct.types";

interface AddProductVariantsProps {
  formData: AddProductFormData;
  onChange: (fields: Partial<AddProductFormData>) => void;
}

export const AddProductVariants: React.FC<AddProductVariantsProps> = ({
  formData,
  onChange,
}) => {
  const [newColorName, setNewColorName] = useState("");
  const [newSizeName, setNewSizeName] = useState("");

  // Batch apply fields
  const [batchCostPrice, setBatchCostPrice] = useState("");
  const [batchSellPrice, setBatchSellPrice] = useState("");
  const [batchStock, setBatchStock] = useState("");

  // Generate SKU matrix based on cross-product of colors & sizes
  const regenerateVariants = (
    colors: AddProductColorItem[],
    sizes: string[],
    existingVariants: AddProductVariantRow[]
  ) => {
    const list: AddProductVariantRow[] = [];
    const prefix = formData.name
      ? formData.name
          .split(" ")
          .map((w) => w[0]?.toUpperCase())
          .slice(0, 3)
          .join("")
      : "PRD";

    for (const c of colors) {
      for (const s of sizes) {
        const id = `${c.name}-${s}`;
        const existing = existingVariants.find(
          (v) => v.color === c.name && v.size === s
        );

        if (existing) {
          list.push(existing);
        } else {
          const colorCode = c.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 3)
            .toUpperCase();
          const skuCode = `${prefix}-${colorCode}-${s}`;
          list.push({
            id,
            color: c.name,
            size: s,
            colorHex: c.hex,
            sku: skuCode,
            costPrice: 450000,
            sellPrice: 890000,
            stock: 25,
            status: "available",
          });
        }
      }
    }
    return list;
  };

  // Add Color
  const handleAddColor = () => {
    const name = newColorName.trim();
    if (!name) return;
    if (formData.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setNewColorName("");
      return;
    }
    const newColors: AddProductColorItem[] = [
      ...formData.colors,
      { id: `c-${Date.now()}`, name, hex: "#6366f1" },
    ];
    const newVariants = regenerateVariants(newColors, formData.sizes, formData.variants);
    onChange({ colors: newColors, variants: newVariants });
    setNewColorName("");
  };

  // Remove Color
  const handleRemoveColor = (colorName: string) => {
    const newColors = formData.colors.filter((c) => c.name !== colorName);
    const newVariants = regenerateVariants(newColors, formData.sizes, formData.variants);
    onChange({ colors: newColors, variants: newVariants });
  };

  // Add Size
  const handleAddSize = () => {
    const size = newSizeName.trim();
    if (!size) return;
    if (formData.sizes.some((s) => s.toLowerCase() === size.toLowerCase())) {
      setNewSizeName("");
      return;
    }
    const newSizes = [...formData.sizes, size];
    const newVariants = regenerateVariants(formData.colors, newSizes, formData.variants);
    onChange({ sizes: newSizes, variants: newVariants });
    setNewSizeName("");
  };

  // Remove Size
  const handleRemoveSize = (sizeName: string) => {
    const newSizes = formData.sizes.filter((s) => s !== sizeName);
    const newVariants = regenerateVariants(formData.colors, newSizes, formData.variants);
    onChange({ sizes: newSizes, variants: newVariants });
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

  // Update specific variant field
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
              Thiết lập các nhóm biến thể như Màu sắc, Kích cỡ và quản lý giá vốn, giá bán lẻ từng SKU
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
            onClick={() => onChange({ hasVariants: !formData.hasVariants })}
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
              placeholder="VD: SKU-BASIC-01"
              className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 outline-none focus:border-primary text-sm font-body-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface">Giá vốn (₫)</label>
            <input
              type="number"
              value={formData.singleCostPrice}
              onChange={(e) => onChange({ singleCostPrice: Number(e.target.value) })}
              placeholder="450000"
              className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 outline-none focus:border-primary text-sm font-body-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface">Giá bán niêm yết (₫)</label>
            <input
              type="number"
              value={formData.singleSellPrice}
              onChange={(e) => onChange({ singleSellPrice: Number(e.target.value) })}
              placeholder="890000"
              className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 outline-none focus:border-primary text-sm font-body-sm font-bold text-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface">Kho hàng</label>
            <input
              type="number"
              value={formData.singleStock}
              onChange={(e) => onChange({ singleStock: Number(e.target.value) })}
              placeholder="100"
              className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 outline-none focus:border-primary text-sm font-body-sm"
            />
          </div>
        </div>
      ) : (
        /* Multi-Variant Mode */
        <div className="flex flex-col gap-5">
          {/* Option 1: Colors */}
          <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Nhóm phân loại 1:
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container-lowest text-primary font-label-md text-label-md shadow-xs font-bold">
                  Màu sắc
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {formData.colors.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-xs border border-outline-variant/20"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(c.name)}
                    className="text-outline hover:text-error ml-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </span>
              ))}

              <div className="relative inline-flex items-center gap-1.5">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                  placeholder="+ Thêm màu khác..."
                  className="w-40 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-1.5 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary"
                />
                {newColorName.trim() && (
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-2.5 py-1.5 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-semibold cursor-pointer"
                  >
                    Thêm
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Option 2: Sizes */}
          <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3 border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Nhóm phân loại 2:
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container-lowest text-primary font-label-md text-label-md shadow-xs font-bold">
                  Kích cỡ (Size)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {formData.sizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-xs border border-outline-variant/20"
                >
                  <span>{s.startsWith("Size") ? s : `Size ${s}`}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(s)}
                    className="text-outline hover:text-error ml-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </span>
              ))}

              <div className="relative inline-flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSizeName}
                  onChange={(e) => setNewSizeName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                  placeholder="+ Thêm size..."
                  className="w-32 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-1.5 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary"
                />
                {newSizeName.trim() && (
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-2.5 py-1.5 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-semibold cursor-pointer"
                  >
                    Thêm
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Batch Apply Bar */}
          <div className="bg-surface-container rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-primary">bolt</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">
                Áp dụng hàng loạt cho tất cả biến thể:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-36">
                <input
                  type="number"
                  value={batchCostPrice}
                  onChange={(e) => setBatchCostPrice(e.target.value)}
                  placeholder="Giá vốn ₫"
                  className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative w-36">
                <input
                  type="number"
                  value={batchSellPrice}
                  onChange={(e) => setBatchSellPrice(e.target.value)}
                  placeholder="Giá bán ₫"
                  className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative w-28">
                <input
                  type="number"
                  value={batchStock}
                  onChange={(e) => setBatchStock(e.target.value)}
                  placeholder="Kho hàng"
                  className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-2 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyBatch}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-xs cursor-pointer font-semibold"
              >
                Áp dụng cho {formData.variants.length} biến thể
              </button>
            </div>
          </div>

          {/* Dynamic SKU Matrix Table */}
          <div className="overflow-x-auto rounded-xl bg-surface-container-low border border-outline-variant/30">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-high/60 font-label-md text-label-md text-on-surface border-b border-outline-variant/20">
                  <th className="py-3 px-4">Biến thể phân loại</th>
                  <th className="py-3 px-3">Mã SKU Phân loại</th>
                  <th className="py-3 px-3">Giá vốn (₫)</th>
                  <th className="py-3 px-3">Giá bán niêm yết (₫)</th>
                  <th className="py-3 px-3">Kho hàng</th>
                  <th className="py-3 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {formData.variants.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-surface-container-lowest/60 transition-colors"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 shrink-0"
                          style={{ backgroundColor: v.colorHex || "#3f3f46" }}
                        />
                        <span className="font-label-md text-label-md font-semibold">
                          {v.color} - {v.size}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) =>
                          handleUpdateVariantField(v.id, "sku", e.target.value)
                        }
                        className="w-36 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg font-body-sm text-body-sm outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary font-mono text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={v.costPrice}
                        onChange={(e) =>
                          handleUpdateVariantField(
                            v.id,
                            "costPrice",
                            Number(e.target.value)
                          )
                        }
                        className="w-28 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg font-body-sm text-body-sm outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary text-right"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={v.sellPrice}
                        onChange={(e) =>
                          handleUpdateVariantField(
                            v.id,
                            "sellPrice",
                            Number(e.target.value)
                          )
                        }
                        className="w-28 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg font-label-md text-label-md text-primary font-bold outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary text-right"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) =>
                          handleUpdateVariantField(
                            v.id,
                            "stock",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg font-body-sm text-body-sm outline-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary text-right"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {v.stock === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[10px] font-bold">
                          Hết hàng
                        </span>
                      ) : v.stock <= 15 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-sm text-[10px] font-bold">
                          Sắp hết ({v.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[10px] font-bold">
                          Sẵn hàng
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between font-body-sm text-body-sm text-outline pt-1">
            <span>Hiển thị {formData.variants.length} phân loại đang kích hoạt</span>
          </div>
        </div>
      )}
    </section>
  );
};

