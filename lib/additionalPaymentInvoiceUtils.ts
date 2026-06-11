import { getUrl } from "@/lib/content-utils";
import type { AdditionalPaymentData, AdditionalPaymentSigner } from "@/components/common/AdditionalPaymentInvoiceDocument";
import type { AdditionalPaymentInvoice } from "@/redux/api/admin/payments/additional-payment/additionalPayment.type";

/** Bill To name + optional subtext (email/address), without duplicating the name. */
export function resolveBillToDisplay(
  data: Pick<AdditionalPaymentData, "billTo" | "address" | "user">,
): { name: string; subtext: string | null } {
  const name = (
    data.billTo ||
    data.user?.fullName ||
    data.user?.username ||
    ""
  ).trim();

  const email = data.user?.email?.trim();
  const address = data.address?.trim();
  const nameKey = name.toLowerCase();

  let subtext: string | null = null;
  if (email && email.toLowerCase() !== nameKey) {
    subtext = email;
  } else if (address && address.toLowerCase() !== nameKey) {
    subtext = address;
  }

  return { name: name || "-", subtext };
}

/** Build a browser-loadable URL for signer images (same-origin /uploads proxy when possible). */
export function resolveSignerImageUrl(
  imageUrl: string | null | undefined,
): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) {
    return imageUrl;
  }

  const normalized = imageUrl.replace(/^\//, "");
  if (normalized.startsWith("uploads/")) {
    return `/${normalized}`;
  }

  return getUrl(imageUrl);
}

function pickSigner(
  ...candidates: (AdditionalPaymentSigner | null | undefined)[]
): AdditionalPaymentSigner | null {
  for (const signer of candidates) {
    if (signer?.imageUrl) return signer;
  }
  return candidates.find(Boolean) ?? null;
}

/**
 * Ensure authorizedBy / approvedBy are present on invoice data.
 * User GET-by-id may omit signer relations; the /my list often includes them.
 */
export function enrichAdditionalPaymentInvoice(
  detail: AdditionalPaymentInvoice | AdditionalPaymentData,
  listFallback?: AdditionalPaymentInvoice | null,
): AdditionalPaymentData {
  const raw = detail as AdditionalPaymentInvoice & Record<string, unknown>;

  const authorizedBy = pickSigner(
    detail.authorizedBy,
    listFallback?.authorizedBy,
    raw.authorizedBySigner as AdditionalPaymentSigner | undefined,
  );

  const approvedBy = pickSigner(
    detail.approvedBy,
    listFallback?.approvedBy,
    raw.approvedBySigner as AdditionalPaymentSigner | undefined,
  );

  return {
    ...detail,
    authorizedBy,
    approvedBy,
  };
}

/** Preload signer images as data URLs so html-to-image captures them reliably. */
export async function preloadSignerImages(
  data: AdditionalPaymentData,
): Promise<AdditionalPaymentData> {
  const preload = async (
    signer: AdditionalPaymentSigner | null | undefined,
  ): Promise<AdditionalPaymentSigner | null> => {
    if (!signer?.imageUrl) return signer ?? null;

    const src = resolveSignerImageUrl(signer.imageUrl);
    if (!src || src.startsWith("data:")) return signer;

    const dataUrl = await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

    if (!dataUrl) return signer;
    return { ...signer, imageUrl: dataUrl };
  };

  const [authorizedBy, approvedBy] = await Promise.all([
    preload(data.authorizedBy),
    preload(data.approvedBy),
  ]);

  return { ...data, authorizedBy, approvedBy };
}
