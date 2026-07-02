export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export async function resizeImageToJpegDataUrl(
  file: File,
  maxSide = 1600,
  quality = 0.85,
): Promise<{ dataUrl: string; mime: string }> {
  const dataUrl = await fileToDataUrl(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image_decode_failed"));
      img.src = dataUrl;
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) throw new Error("invalid_image");
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);
    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_unsupported");
    ctx.drawImage(img, 0, 0, tw, th);
    const out = canvas.toDataURL("image/jpeg", quality);
    return { dataUrl: out, mime: "image/jpeg" };
  } catch {
    return { dataUrl, mime: file.type || "image/jpeg" };
  }
}

export function dataUrlToBase64(d: string) {
  const i = d.indexOf(",");
  return i >= 0 ? d.slice(i + 1) : d;
}

// Marca de agua discreta para resultados generados en el plan Gratis.
export async function applyWatermark(dataUrl: string, label = "Textiq AI"): Promise<string> {
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("watermark_decode_failed"));
      img.src = dataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0);

    const fontSize = Math.max(14, Math.round(canvas.width * 0.025));
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    const paddingX = fontSize * 0.9;
    const paddingY = fontSize * 0.6;
    const textWidth = ctx.measureText(label).width;
    const boxW = textWidth + paddingX * 2;
    const boxH = fontSize + paddingY * 2;
    const x = canvas.width - boxW - fontSize * 0.6;
    const y = canvas.height - boxH - fontSize * 0.6;

    ctx.fillStyle = "rgba(20, 24, 33, 0.55)";
    ctx.fillRect(x, y, boxW, boxH);
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + paddingX, y + boxH / 2);

    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return dataUrl;
  }
}
