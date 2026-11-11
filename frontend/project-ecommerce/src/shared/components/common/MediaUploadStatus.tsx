import { useSyncExternalStore } from "react";
import { getMediaUploadSnapshot, subscribeMediaUploads } from "@/shared/api/mediaUpload";

export default function MediaUploadStatus() {
  const jobs = useSyncExternalStore(subscribeMediaUploads, getMediaUploadSnapshot, getMediaUploadSnapshot);
  if (!jobs.length) return null;

  return (
    <aside className="fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {jobs.slice(-4).map((job) => (
        <div key={job.id} className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-on-surface">
            <span className="material-symbols-outlined text-primary">{job.state === "complete" ? "check_circle" : job.state === "failed" ? "error" : "cloud_upload"}</span>
            <span className="min-w-0 flex-1 truncate">{job.name}</span>
            <span className="text-xs text-on-surface-variant">{job.state === "uploading" ? `${job.progress}%` : job.state === "complete" ? "Đã tải lên" : "Thất bại"}</span>
          </div>
          {job.state === "uploading" && <progress className="mt-2 h-1.5 w-full accent-primary" max={100} value={job.progress} />}
          {job.error && <p className="mt-1 text-xs text-error">{job.error}</p>}
        </div>
      ))}
    </aside>
  );
}
