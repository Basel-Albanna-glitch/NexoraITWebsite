// Browser-side helpers for the dashboard: upload with progress, read image size, grab a video poster frame.

export function uploadFile(file: Blob, onProgress?: (fraction: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "/api/admin/upload");
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    xhr.onload = () => {
      let json: { url?: string; error?: string } = {};
      try { json = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && json.url) resolve(json.url);
      else reject(new Error(json.error || (xhr.status === 401 ? "You were signed out — sign in again." : "Upload failed.")));
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection."));
    xhr.send(file);
  });
}

export function imageSize(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { reject(new Error("That file isn't a readable image.")); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

/** Captures a frame ~1s into the video as a JPEG, to show before it plays. Resolves null if the browser can't. */
export function videoPoster(file: Blob): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (b: Blob | null) => { URL.revokeObjectURL(url); resolve(b); };
    const timer = setTimeout(() => done(null), 15000);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadedmetadata = () => { video.currentTime = Math.min(1, (video.duration || 2) / 2); };
    video.onseeked = () => {
      clearTimeout(timer);
      const w = Math.min(720, video.videoWidth || 720);
      const h = Math.round((w / (video.videoWidth || 1)) * (video.videoHeight || 1));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx || !h) return done(null);
      ctx.drawImage(video, 0, 0, w, h);
      canvas.toBlob((b) => done(b), "image/jpeg", 0.82);
    };
    video.onerror = () => { clearTimeout(timer); done(null); };
    video.src = url;
  });
}
