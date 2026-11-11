import React, { useEffect, useRef } from "react";
import type { AddProductFormData } from "@/domains/shop/types/shopAddProduct.types";
import { uploadMedia } from "@/shared/api/mediaUpload";

interface AddProductMediaProps {
  formData: AddProductFormData;
  onChange: (fields: Partial<AddProductFormData>) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export const AddProductMedia: React.FC<AddProductMediaProps> = ({
  formData,
  onChange,
  onUploadingChange,
}) => {
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const detailFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const detailImagesRef = useRef(formData.detailImages);
  const uploadingCount = useRef(0);
  const coverSelection = useRef(0);
  const videoSelection = useRef(0);

  useEffect(() => { detailImagesRef.current = formData.detailImages; }, [formData.detailImages]);

  const beginUpload = () => {
    uploadingCount.current += 1;
    onUploadingChange?.(true);
  };
  const endUpload = () => {
    uploadingCount.current = Math.max(0, uploadingCount.current - 1);
    onUploadingChange?.(uploadingCount.current > 0);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const selection = ++coverSelection.current;
    const preview = URL.createObjectURL(file);
    const previous = formData.coverImage;
    onChange({ coverImage: preview });
    beginUpload();
    try {
      const result = await uploadMedia(file, "product-image");
      if (selection === coverSelection.current) onChange({ coverImage: result.url });
    } catch {
      if (selection === coverSelection.current) onChange({ coverImage: previous });
    } finally {
      URL.revokeObjectURL(preview);
      endUpload();
    }
  };

  const handleDetailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = "";
    if (!files?.length) return;
    const accepted = Array.from(files).slice(0, Math.max(0, 8 - detailImagesRef.current.length));
    const previews = accepted.map((file, idx) => ({ id: `img-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`, file, preview: URL.createObjectURL(file) }));
    detailImagesRef.current = [...detailImagesRef.current, ...previews.map(({ id, preview }) => ({ id, url: preview, tag: "Ảnh chi tiết" }))];
    onChange({ detailImages: detailImagesRef.current });
    await Promise.all(previews.map(async ({ id, file, preview }) => {
      beginUpload();
      try {
        const result = await uploadMedia(file, "product-image");
        detailImagesRef.current = detailImagesRef.current.map((image) => image.id === id ? { ...image, url: result.url } : image);
        onChange({ detailImages: detailImagesRef.current });
      } catch {
        detailImagesRef.current = detailImagesRef.current.filter((image) => image.id !== id);
        onChange({ detailImages: detailImagesRef.current });
      } finally {
        URL.revokeObjectURL(preview);
        endUpload();
      }
    }));
  };

  const handleRemoveDetailImage = (id: string) => {
    detailImagesRef.current = detailImagesRef.current.filter((img) => img.id !== id);
    onChange({
      detailImages: detailImagesRef.current,
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const selection = ++videoSelection.current;
    const previous = formData.videoUrl;
    const preview = URL.createObjectURL(file);
    onChange({ videoUrl: preview });
    beginUpload();
    try {
      const result = await uploadMedia(file, "product-video");
      if (selection === videoSelection.current) onChange({ videoUrl: result.url });
    } catch {
      if (selection === videoSelection.current) onChange({ videoUrl: previous });
    } finally {
      URL.revokeObjectURL(preview);
      endUpload();
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs border border-outline-variant/30 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">photo_library</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              2. Quản lý hình ảnh
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Hình ảnh sắc nét và video thực tế giúp gia tăng tỷ lệ chuyển đổi đơn hàng lên tới 68%
            </p>
          </div>
        </div>
        <div className="font-label-sm text-label-sm text-outline font-medium">
          Tối đa 9 ảnh + 1 video
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Cover Image (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface flex items-center gap-1">
              <span>Ảnh bìa (Ảnh đại diện 1:1)</span>
              <span className="text-error font-label-sm">*</span>
            </span>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
              800x800px
            </span>
          </div>

          <input
            type="file"
            ref={coverFileInputRef}
            onChange={handleCoverUpload}
            accept=".jpg,.jpeg,image/jpeg"
            className="hidden"
          />

          <div
            onClick={() => coverFileInputRef.current?.click()}
            className="relative group aspect-square rounded-2xl overflow-hidden bg-surface-container-low flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-surface-container transition-all border border-outline-variant/30"
          >
            {formData.coverImage ? (
              <>
                <img
                  src={formData.coverImage}
                  alt={formData.name || "Cover Image"}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary text-on-primary font-label-sm text-[11px] font-bold w-max mb-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Ảnh bìa chính thức
                  </span>
                  <div className="flex items-center gap-3 mt-1.5 text-white/90 text-xs font-semibold">
                    <span className="flex items-center gap-1 hover:underline">
                      <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                      Đổi ảnh
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-outline">
                <span className="material-symbols-outlined text-[36px] text-primary">
                  add_photo_alternate
                </span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Tải lên ảnh bìa
                </span>
                <span className="font-body-sm text-body-sm">
                  JPG/JPEG, tối đa 5 MB
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Detail Images & Video (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Detail Images */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-label-md text-label-md text-on-surface">
                Ảnh chi tiết góc chụp (Góc nghiêng, đế, gót, on-feet look)
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                Đã tải {formData.detailImages.length}/8
              </span>
            </div>

            <input
              type="file"
              ref={detailFileInputRef}
              onChange={handleDetailUpload}
              accept=".jpg,.jpeg,image/jpeg"
              multiple
              className="hidden"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.detailImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-surface-container-low shadow-xs border border-outline-variant/30"
                >
                  <img
                    src={img.url}
                    alt={img.tag}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDetailImage(img.id);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-white font-label-sm text-[10px]">
                    {img.tag}
                  </span>
                </div>
              ))}

              {formData.detailImages.length < 8 && (
                <div
                  onClick={() => detailFileInputRef.current?.click()}
                  className="aspect-square rounded-xl bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all border border-dashed border-outline-variant hover:border-primary"
                >
                  <span className="material-symbols-outlined text-[26px] text-primary mb-1">
                    add_photo_alternate
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    + Thêm ảnh
                  </span>
                  <span className="font-body-sm text-[10px] text-outline">
                    Góc chụp phụ
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Video slot */}
          <div className="bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[24px]">videocam</span>
              </div>
              <div>
                <div className="font-label-md text-label-md font-bold text-on-surface">
                  Video trải nghiệm sản phẩm (Tối đa 60s)
                </div>
                <div className="font-body-sm text-body-sm text-outline">
                  {formData.videoUrl
                    ? "Đã chọn video giới thiệu sản phẩm"
                    : "MP4/MOV/WebM, tối đa 20 MB. Bạn có thể rời trang trong lúc tải."}
                </div>
              </div>
            </div>

            <input
              type="file"
              ref={videoFileInputRef}
              onChange={handleVideoUpload}
              accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md shadow-xs transition-all whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                <span>{formData.videoUrl ? "Đổi video" : "Chọn video từ máy"}</span>
              </button>
              {formData.videoUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ videoUrl: undefined })}
                  className="p-2 rounded-xl text-error hover:bg-error-container/20 transition-colors"
                  title="Xoá video"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

