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

    it('accepts the legacy (target, propertyKey, descriptor) calling convention and returns the descriptor unchanged', () => {
      class TestKernels extends Kernel {}
      const descriptor: TypedPropertyDescriptor<(this: typeof TestKernels) => void> = { value: function (this: typeof TestKernels) {} };

      const result = kernel(TestKernels, 'process', descriptor);

      expect(result).toBe(descriptor);
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

    it('throws for the legacy convention if target is not a class constructor (i.e. an instance member)', () => {
      const fakePrototypeTarget = {} as unknown as typeof Kernel;
      const descriptor: TypedPropertyDescriptor<(this: typeof Kernel) => void> = { value: function (this: typeof Kernel) {} };

      expect(() => kernel(fakePrototypeTarget, 'instanceMethod', descriptor)).toThrow(/static method/);
    });

    it('throws if invoked directly with a non-method decorator context (defensive guard)', () => {
      const fakeFieldContext = {
        kind: 'field',
        static: true,
      } as unknown as ClassMethodDecoratorContext<typeof Kernel, (this: typeof Kernel) => void>;

      expect(() => kernel(function (this: typeof Kernel) {}, fakeFieldContext)).toThrow(/static method/);
    });

    it('throws at class-definition time (stage-3) if the class does not extend Kernel, even past a suppressed type error', () => {
      expect(() => {
        class NotAKernel {
          // @ts-expect-error intentionally decorating a class that does not extend Kernel
          @kernel
          static bad(): void {}
        }
        void NotAKernel;
      }).toThrow(/extending Kernel/);
    });

    it('throws for the legacy convention if the class does not extend Kernel', () => {
      class NotAKernel {}
      const descriptor: TypedPropertyDescriptor<() => void> = {
        value: function () {},
      };

      expect(() => kernel(NotAKernel as unknown as typeof Kernel, 'bad', descriptor)).toThrow(/extending Kernel/);
    });

    it('throws if invoked directly with an unexpected number of arguments (defensive guard)', () => {
      const kernelAsUntyped = kernel as (...args: unknown[]) => unknown;

      expect(() => kernelAsUntyped(1, 2, 3, 4)).toThrow(/static method/);
    });
  });

  describe('Kernel base class', () => {
    it('permits instantiating a class that extends Kernel (unused but legal)', () => {
      class TestKernels extends Kernel {}

      expect(() => new TestKernels()).not.toThrow();
    });
  });
});
