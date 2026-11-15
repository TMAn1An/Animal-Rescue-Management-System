/** Normalises Bangladeshi mobile numbers to the 11-digit local form (01XXXXXXXXX). */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/[\s\-()]/g, "");
  // Bangla digits → ASCII
  d = d.replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c)));
  if (d.startsWith("+880")) d = "0" + d.slice(4);
  else if (d.startsWith("880")) d = "0" + d.slice(3);
  return /^01[3-9]\d{8}$/.test(d) ? d : null;
}

export function maskPhone(phone: string): string {
  return phone.length >= 7 ? `${phone.slice(0, 3)}•••••${phone.slice(-3)}` : phone;
}
