import { keccak_256 } from '@noble/hashes/sha3'

export const ROOT = new Uint8Array(32)

export function toHex(bytes: Uint8Array, prefix = true): string {
  const hex = bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
  return prefix ? '0x' + hex : hex
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  if (!arrays.every((b) => b instanceof Uint8Array)) throw new Error('Uint8Array list expected');
  if (arrays.length === 1) return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}

// Namehash
export function nh(fqn: string | undefined, root=ROOT) {
  if (!fqn) return root
  return fqn.split('.').reverse().reduce((parent: Uint8Array, label: string) => {
    return keccak_256(concatBytes(parent, keccak_256(label)))
  }, root)
}
