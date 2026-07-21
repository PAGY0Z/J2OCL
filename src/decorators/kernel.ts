/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

/**
 * Base class that every `@kernel`-bearing class must extend.
 *
 * `Kernel` itself has no behavior — its only purpose is to nominally brand subclasses
 * so the `kernel` decorator's `This extends typeof Kernel` generic constraint can't be
 * satisfied by an unrelated class. TypeScript classes are structurally typed, so an
 * empty class has no shape to distinguish it from any other; the required private
 * `#kernelBrand` field gives `Kernel` (and, by inheritance, its subclasses) a shape no
 * unrelated class can structurally match. It must be a required field (no `?`) — an
 * optional private field does not create a hard nominal barrier at the static
 * (`typeof Kernel`) level — and it is intentionally never read.
 */
export abstract class Kernel {
  // eslint-disable-next-line no-unused-private-class-members
  readonly #kernelBrand: unknown = undefined;
}

type KernelMethod<This extends typeof Kernel, Args extends unknown[]> = (
  this: This,
  ...args: Args
) => void;

/**
 * Class-method decorator that marks a static method as a J2OCL kernel.
 *
 * Enforces — through its `This extends typeof Kernel` generic constraint at compile
 * time, and through an explicit runtime check as a defensive fallback — that only a
 * static method of a class extending `Kernel` can be decorated.
 *
 * This is definition only, not execution: it does not change how the method runs.
 * Development-mode simulation and eventual GPU dispatch are a separate feature, not
 * implemented yet — today, calling a `@kernel`-decorated method behaves exactly like
 * calling an ordinary static method.
 *
 * @param originalMethod - The original static method being decorated.
 * @param context - Decorator context; must describe a static method.
 * @returns `originalMethod`, unchanged.
 * @throws {Error} If applied to anything other than a static method of a class
 * extending `Kernel`.
 */
export function kernel<This extends typeof Kernel, Args extends unknown[]>(
  originalMethod: KernelMethod<This, Args>,
  context: ClassMethodDecoratorContext<This, KernelMethod<This, Args>>,
): KernelMethod<This, Args> {
  if (context.kind !== 'method' || !context.static) {
    throw new Error(
      '@kernel: can only decorate a static method of a class extending Kernel',
    );
  }

  return originalMethod;
}
