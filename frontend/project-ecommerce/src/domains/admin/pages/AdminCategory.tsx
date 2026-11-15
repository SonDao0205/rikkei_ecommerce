import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/layout/AdminLayout";
import { adminCategoryApi, type AdminCategoryPayload } from "@/domains/admin/api/adminCategoryApi";
import type { Category } from "@/shared/types";

interface CategoryForm {
  parentId: string;
  name: string;
  slug: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: CategoryForm = {
  parentId: "",
  name: "",
  slug: "",
  imageUrl: "",
  sortOrder: "0",
  isActive: true,
};

const fieldClass = "mt-1 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

const slugFromName = (value: string) => value
  .toLocaleLowerCase("vi")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const AdminCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const slugError = useMemo(() => {
    if (!formError) return null;
    const lower = formError.toLowerCase();
    if (lower.includes("slug")) return formError;
    return null;
  }, [formError]);

  const nameError = useMemo(() => {
    if (!formError) return null;
    const lower = formError.toLowerCase();
    if (!lower.includes("slug") && (lower.includes("name") || lower.includes("tên"))) {
      return formError;
    }
    return null;
  }, [formError]);

  const generalError = useMemo(() => {
    if (!formError) return null;
    if (slugError || nameError) return null;
    return formError;
  }, [formError, slugError, nameError]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      setCategories(await adminCategoryApi.list());
    } catch (loadError: unknown) {
      setPageError(loadError instanceof Error ? loadError.message : "Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      await Promise.resolve();
      if (mounted) await loadCategories();
    })();
    return () => { mounted = false; };
  }, [loadCategories]);

  const categoryById = useMemo(() => new Map(categories.map((item) => [item.id, item])), [categories]);
  const descendantsOf = useCallback((id: number) => {
    const descendants = new Set<number>();
    const pending = [id];
    while (pending.length) {
      const parent = pending.pop()!;
      categories.filter((item) => item.parent_id === parent).forEach((child) => {
        if (!descendants.has(child.id)) {
          descendants.add(child.id);
          pending.push(child.id);
        }
      });
    }
    return descendants;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return categories.filter((item) => {
      const matchesSearch = !query || `${item.name} ${item.slug}`.toLocaleLowerCase("vi").includes(query);
      const matchesStatus = statusFilter === "all" || (statusFilter === "active") === Boolean(item.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setFormError(null);
    setPageError(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditing(item);
    setForm({
      parentId: item.parent_id === null ? "" : String(item.parent_id),
      name: item.name,
      slug: item.slug,
      imageUrl: item.image_url || "",
      sortOrder: String(item.sort_order),
      isActive: Boolean(item.is_active),
    });
    setSlugTouched(true);
    setFormError(null);
    setPageError(null);
    setIsFormOpen(true);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

    const name = form.name.trim();
    const slug = form.slug.trim();

    if (!name) {
      setFormError("Vui lòng điền tên danh mục.");
      return;
    }
    if (name.length < 2) {
      setFormError("Tên danh mục phải có ít nhất 2 ký tự.");
      return;
    }
    if (!slug) {
      setFormError("Vui lòng điền slug cho danh mục.");
      return;
    }
    const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      setFormError("Slug chỉ được chứa chữ thường không dấu, số và dấu gạch ngang.");
      return;
    }

    setSaving(true);
    const payload: AdminCategoryPayload = {
      parent_id: form.parentId ? Number(form.parentId) : null,
      name,
      slug,
      image_url: form.imageUrl.trim() || null,
      sort_order: Number(form.sortOrder) || 0,
      is_active: form.isActive,
    };
    try {
      if (editing) await adminCategoryApi.update(editing.id, payload);
      else await adminCategoryApi.create(payload);
      setNotice(editing ? "Đã cập nhật danh mục." : "Đã tạo danh mục.");
      setEditing(null);
      setForm(emptyForm);
      setFormError(null);
      setIsFormOpen(false);
      await loadCategories();
    } catch (saveError: unknown) {
      setFormError(saveError instanceof Error ? saveError.message : "Không thể lưu danh mục.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item: Category) => {
    setPageError(null);
    setNotice(null);
    try {
      const updated = await adminCategoryApi.setActive(item.id, item.is_active !== 1);
      setCategories((current) => current.map((category) => category.id === updated.id ? updated : category));
      setNotice(updated.is_active ? "Đã kích hoạt danh mục." : "Đã ngừng danh mục.");
    } catch (statusError: unknown) {
      setPageError(statusError instanceof Error ? statusError.message : "Không thể đổi trạng thái danh mục.");
    }
  };

  const deactivate = async (item: Category) => {
    if (!window.confirm(`Ngừng danh mục “${item.name}”? Danh mục và sản phẩm cũ vẫn được giữ trong dữ liệu.`)) return;
    setPageError(null);
    setNotice(null);
    try {
      const updated = await adminCategoryApi.deactivate(item.id);
      setCategories((current) => current.map((category) => category.id === updated.id ? updated : category));
      setNotice("Đã ngừng danh mục. Dữ liệu sản phẩm liên quan vẫn được giữ.");
    } catch (deleteError: unknown) {
      setPageError(deleteError instanceof Error ? deleteError.message : "Không thể ngừng danh mục.");
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Catalog administration</p>
            <h1 className="mt-2 text-3xl font-bold text-on-surface">Quản lý danh mục</h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">Chỉ quản trị viên được tạo, sửa và ngừng danh mục. Ngừng danh mục sẽ ẩn sản phẩm khỏi catalog công khai nhưng không xóa dữ liệu.</p>
          </div>
          <button type="button" onClick={openCreate} className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-on-primary shadow-sm hover:opacity-90">+ Thêm danh mục</button>
        </header>

        {!isFormOpen && pageError && <div role="alert" className="rounded-xl border border-error/30 bg-error-container/30 p-3 text-sm text-error">{pageError}</div>}
        {notice && <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</div>}

        <section className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-3">
            <input aria-label="Tìm danh mục" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc slug..." className="min-w-60 flex-1 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm" />
            <select aria-label="Lọc trạng thái danh mục" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm">
              <option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Đã ngừng</option>
            </select>
            <button type="button" onClick={() => void loadCategories()} disabled={loading} className="rounded-xl border border-outline-variant px-3 py-2 text-sm font-semibold disabled:opacity-50">Làm mới</button>
          </div>

          {loading ? <p role="status" className="py-12 text-center text-sm text-on-surface-variant">Đang tải danh mục...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead><tr className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant"><th className="px-3 py-3">Tên / slug</th><th className="px-3 py-3">Danh mục cha</th><th className="px-3 py-3">Thứ tự</th><th className="px-3 py-3">Trạng thái</th><th className="px-3 py-3 text-right">Thao tác</th></tr></thead>
                <tbody>
                  {filteredCategories.map((item) => (
                    <tr key={item.id} className="border-b border-outline-variant/50 last:border-0">
                      <td className="px-3 py-3"><div className="font-semibold text-on-surface">{item.name}</div><div className="mt-0.5 text-xs text-on-surface-variant">/{item.slug}</div></td>
                      <td className="px-3 py-3 text-on-surface-variant">{item.parent_id ? categoryById.get(item.parent_id)?.name || `#${item.parent_id}` : "—"}</td>
                      <td className="px-3 py-3">{item.sort_order}</td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{item.is_active ? "Hoạt động" : "Đã ngừng"}</span></td>
                      <td className="px-3 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(item)} className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold hover:bg-surface-container">Sửa</button><button type="button" onClick={() => void (item.is_active ? deactivate(item) : toggleStatus(item))} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${item.is_active ? "border-error/30 text-error hover:bg-error-container/20" : "border-outline-variant hover:bg-surface-container"}`}>{item.is_active ? "Ngừng danh mục" : "Kích hoạt"}</button></div></td>
                    </tr>
                  ))}
                  {!filteredCategories.length && <tr><td colSpan={5} className="py-12 text-center text-sm text-on-surface-variant">Không tìm thấy danh mục phù hợp.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {isFormOpen && (
          <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4" role="presentation">
            <section role="dialog" aria-modal="true" aria-labelledby="category-form-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="category-form-title" className="text-xl font-bold">{editing ? "Sửa danh mục" : "Thêm danh mục"}</h2><p className="mt-1 text-sm text-on-surface-variant">Slug là mã định danh ổn định dùng trong URL.</p></div><button type="button" onClick={() => { setIsFormOpen(false); setEditing(null); setForm(emptyForm); setFormError(null); }} aria-label="Đóng" className="rounded-lg p-2 hover:bg-surface-container">✕</button></div>
              <form noValidate className="space-y-4" onSubmit={(event) => void submit(event)}>
                <label className="block text-sm font-semibold">
                  Tên danh mục
                  <input
                    maxLength={120}
                    value={form.name}
                    onChange={(event) => {
                      const name = event.target.value;
                      if (formError) setFormError(null);
                      setForm((current) => ({ ...current, name, slug: slugTouched ? current.slug : slugFromName(name) }));
                    }}
                    className={`${fieldClass} ${nameError ? "border-error focus:border-error focus:ring-error/15" : ""}`}
                  />
                  {nameError && (
                    <p className="mt-1 text-xs text-error font-medium">{nameError}</p>
                  )}
                </label>
                <label className="block text-sm font-semibold">
                  Slug
                  <input
                    maxLength={150}
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      if (formError) setFormError(null);
                      setForm((current) => ({ ...current, slug: event.target.value }));
                    }}
                    className={`${fieldClass} ${slugError ? "border-error focus:border-error focus:ring-error/15" : ""}`}
                  />
                  {slugError && (
                    <p className="mt-1 text-xs text-error font-medium">{slugError}</p>
                  )}
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">Danh mục cha<select value={form.parentId} onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value }))} className={fieldClass}><option value="">Không có (danh mục gốc)</option>{categories.filter((item) => item.is_active && item.id !== editing?.id && !descendantsOf(editing?.id || 0).has(item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label className="block text-sm font-semibold">Thứ tự hiển thị<input type="number" min={0} max={100000} value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} className={fieldClass} /></label>
                </div>
                <label className="block text-sm font-semibold">Ảnh danh mục (URL HTTPS)<input type="text" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://..." className={fieldClass} /></label>
                <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />Danh mục đang hoạt động</label>
                {generalError && <p role="alert" className="rounded-lg bg-error-container/30 p-3 text-xs text-error font-medium">{generalError}</p>}
                <div className="flex justify-end gap-3 border-t border-outline-variant pt-4"><button type="button" onClick={() => { setIsFormOpen(false); setEditing(null); setForm(emptyForm); setFormError(null); }} className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-semibold">Hủy</button><button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60">{saving ? "Đang lưu..." : "Lưu danh mục"}</button></div>
              </form>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategory;
