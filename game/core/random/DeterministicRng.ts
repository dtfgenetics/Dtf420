import { createDeterministicRng } from "../../../vendor/dtf-game-platform/random.mjs";

type SharedRng = ReturnType<typeof createDeterministicRng>;

/**
 * Typed compatibility adapter over the canonical DTF shared-platform RNG.
 *
 * Keep this class surface stable for existing TypeScript games while the
 * algorithm and state behavior live in one shared implementation.
 */
export class DeterministicRng {
  private readonly runtime: SharedRng;

  constructor(seed: string) {
    this.runtime = createDeterministicRng(seed);
  }

  next(): number {
    return this.runtime.next();
  }

  range(min: number, max: number): number {
    return this.runtime.range(min, max);
  }

  int(min: number, maxInclusive: number): number {
    return this.runtime.int(min, maxInclusive);
  }

  chance(probability: number): boolean {
    return this.runtime.chance(probability);
  }

  pick<T>(values: readonly T[]): T | undefined {
    return this.runtime.pick([...values]) as T | undefined;
  }

  shuffle<T>(values: readonly T[]): T[] {
    return this.runtime.shuffle([...values]) as T[];
  }

  fork(label: string): DeterministicRng {
    return new DeterministicRng(`${this.runtime.getState()}:${label}`);
  }
}
