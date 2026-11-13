import axiosClient from "@/shared/api/axiosClient";

export type MediaPurpose = "avatar" | "shop-image" | "product-image" | "review-image" | "product-video";
export interface UploadedMedia {
  url: string;
  public_id: string;
  resource_type: "image" | "video";
  format: string;
  bytes: number;
}
export interface MediaUploadJob {
  id: string;
  name: string;
  purpose: MediaPurpose;
  progress: number;
  state: "uploading" | "complete" | "failed";
  error?: string;
}

interface MediaUploadEnvelope {
  success: boolean;
  data: UploadedMedia;
  error?: { code?: string; message?: string };
}

const maxImageBytes = 5 * 1024 * 1024;
const maxVideoBytes = 20 * 1024 * 1024;
let jobs: MediaUploadJob[] = [];
const listeners = new Set<() => void>();
const pendingUploadKeys = new Map<string, string>();

async function mediaUploadKey(file: File, purpose: MediaPurpose) {
  let fingerprint: string;
  try {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
  }
  const storageKey = `media.upload.idempotency.v1:${purpose}:${fingerprint}`;
  const pendingKey = pendingUploadKeys.get(storageKey);
  if (pendingKey) return { key: pendingKey, storageKey };
  try {
    const savedKey = sessionStorage.getItem(storageKey);
    if (savedKey) return { key: savedKey, storageKey };
  } catch {
    // Continue with an in-memory key when browser storage is disabled.
  }
  const key = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  try {
    sessionStorage.setItem(storageKey, key);
  } catch {
    // A current upload remains protected even when retry persistence is unavailable.
  }
  pendingUploadKeys.set(storageKey, key);
  return { key, storageKey };
}

function publish(next: MediaUploadJob[]) {
  jobs = next;
  listeners.forEach((listener) => listener());
}

export function subscribeMediaUploads(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMediaUploadSnapshot() {
  return jobs;
}

function validateMedia(file: File, purpose: MediaPurpose) {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  const isVideo = purpose === "product-video";
  if (file.size === 0 || file.size > (isVideo ? maxVideoBytes : maxImageBytes)) {
    throw new Error(isVideo ? "Video tối đa 20 MB." : "Ảnh JPG/JPEG/PNG tối đa 5 MB.");
  }
  if (isVideo) {
    if (!["mp4", "mov", "webm"].includes(ext) || (file.type && !file.type.startsWith("video/") && file.type !== "application/octet-stream")) {
      throw new Error("Video chỉ hỗ trợ định dạng MP4, MOV hoặc WebM.");
    }
    return;
  }
  const validImageType = ext === "png"
    ? !file.type || file.type === "image/png"
    : ["jpg", "jpeg"].includes(ext) && (!file.type || file.type === "image/jpeg" || file.type === "image/jpg");
  if (!validImageType) {
    throw new Error("Chỉ chấp nhận ảnh JPG/JPEG/PNG hợp lệ.");
  }
}

function uploadError(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: MediaUploadEnvelope } }).response;
    if (response?.data?.error?.message) return response.data.error.message;
  }
  return error instanceof Error ? error.message : "Tải tệp lên thất bại. Vui lòng thử lại.";
}

export async function uploadMedia(file: File, purpose: MediaPurpose): Promise<UploadedMedia> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const job: MediaUploadJob = { id, name: file.name, purpose, progress: 0, state: "uploading" };
  publish([...jobs, job]);

  try {
    validateMedia(file, purpose);
    const { key, storageKey } = await mediaUploadKey(file, purpose);
    const body = new FormData();
    body.append("purpose", purpose);
    body.append("file", file, file.name);
    const response = await axiosClient.post<MediaUploadEnvelope>("/api/v1/media", body, {
      timeout: 120000,
      headers: { "Idempotency-Key": key },
      onUploadProgress: (event) => {
        const progress = event.total ? Math.min(99, Math.round((event.loaded / event.total) * 100)) : 0;
        publish(jobs.map((item) => item.id === id ? { ...item, progress } : item));
      },
    });
    if (!response.data?.success || !response.data.data?.url) throw new Error("Máy chủ không trả về địa chỉ tệp hợp lệ.");
    try {
      if (sessionStorage.getItem(storageKey) === key) sessionStorage.removeItem(storageKey);
    } catch {
      // The completed upload is already confirmed by the server.
    }
    pendingUploadKeys.delete(storageKey);
    publish(jobs.map((item) => item.id === id ? { ...item, progress: 100, state: "complete" } : item));
    window.setTimeout(() => publish(jobs.filter((item) => item.id !== id)), 8000);
    return response.data.data;
  } catch (error) {
    const message = uploadError(error);
    publish(jobs.map((item) => item.id === id ? { ...item, state: "failed", error: message } : item));
    window.setTimeout(() => publish(jobs.filter((item) => item.id !== id)), 12000);
    throw new Error(message, { cause: error });
  }
}
