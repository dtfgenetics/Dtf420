function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Small deterministic PRNG for gameplay simulation, replay, AI and test fixtures.
 *
 * IMPORTANT: Do not change the hash or next() algorithm without a versioned
 * migration. Existing Stoner Duck Race seeds rely on this exact sequence.
 */
export class DeterministicRng {
  private state: number;

  constructor(seed: string) {
    this.state = hashSeed(seed) || 1;
  }

  next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  int(min: number, maxInclusive: number): number {
    return Math.floor(this.range(min, maxInclusive + 1));
  }

  chance(probability: number): boolean {
    return this.next() < Math.max(0, Math.min(1, probability));
  }

  pick<T>(values: readonly T[]): T | undefined {
    if (values.length === 0) return undefined;
    return values[this.int(0, values.length - 1)];
  }

  shuffle<T>(values: readonly T[]): T[] {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = this.int(0, index);
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    return shuffled;
  }

  /**
   * Creates a deterministic independent stream without consuming this stream.
   * Use named streams so cosmetic randomness cannot perturb gameplay randomness.
   */
  fork(label: string): DeterministicRng {
    return new DeterministicRng(`${this.state}:${label}`);
  }
}
