/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { describe, expect, it } from 'vitest';
import { Kernel, kernel } from '../../src/decorators/kernel.js';

describe('@kernel', () => {
  describe('marker behavior', () => {
    it('calls the decorated method exactly once, passing arguments through unchanged', () => {
      let callCount = 0;
      let receivedArgs: unknown[] = [];
      class TestKernels extends Kernel {
        @kernel
        static process(a: number, b: number) {
          callCount++;
          receivedArgs = [a, b];
        }
      }

      TestKernels.process(2, 3);

      expect(callCount).toBe(1);
      expect(receivedArgs).toEqual([2, 3]);
    });
  });

  describe('misuse guards', () => {
    it('throws at class-definition time if @kernel decorates a non-static method', () => {
      expect(() => {
        class BadKernels extends Kernel {
          // @ts-expect-error intentionally decorating an instance method to test the runtime guard
          @kernel
          instanceMethod() {}
        }
        void BadKernels;
      }).toThrow(/static method/);
    });

    it('throws if invoked directly with a non-method decorator context (defensive guard)', () => {
      const fakeFieldContext = {
        kind: 'field',
        static: true,
      } as unknown as ClassMethodDecoratorContext<
        typeof Kernel,
        (this: typeof Kernel) => void
      >;

      expect(() =>
        kernel(function (this: typeof Kernel) {}, fakeFieldContext),
      ).toThrow(/static method/);
    });
  });

  describe('Kernel base class', () => {
    it('permits instantiating a class that extends Kernel (unused but legal)', () => {
      class TestKernels extends Kernel {}

      expect(() => new TestKernels()).not.toThrow();
    });
  });
});

function neverCalled() {
  class NotAKernel {
    // @ts-expect-error — NotAKernel does not extend Kernel
    @kernel
    static bad(): void {}
  }
  void NotAKernel;
}
void neverCalled;
