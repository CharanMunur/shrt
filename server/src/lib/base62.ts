const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function toBase62(num: number): string {
  if (num === 0) return BASE62_ALPHABET[0];
  let res = "";
  let n = num;
  while (n > 0) {
    res = BASE62_ALPHABET[n % 62] + res;
    n = Math.floor(n / 62);
  }
  return res;
}

export function fromBase62(str: string): number {
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    const idx = BASE62_ALPHABET.indexOf(str[i]);
    if (idx === -1) return 0;
    num = num * 62 + idx;
  }
  return num;
}
