export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parsePrice(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.replace(",", ".");
  const price = Number(normalized);

  if (Number.isNaN(price)) {
    return null;
  }

  return price;
}

export function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const price = Number(value);

  return `${price.toLocaleString("fr-TN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} DT`;
}

export function toInputDateTime(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

export function fromInputDateTime(value: string) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}
