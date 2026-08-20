/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

export abstract class Kernel {
  // eslint-disable-next-line no-unused-private-class-members
  readonly #kernelBrand: unknown = undefined;
}

type KernelMethod<This extends typeof Kernel, Args extends unknown[]> = (this: This, ...args: Args) => void;

const MISUSE_MESSAGE = '@kernel: can only decorate a static method of a class extending Kernel';

function assertExtendsKernel(target: unknown): void {
  if (typeof target !== 'function' || !(target.prototype instanceof Kernel)) {
    throw new Error(MISUSE_MESSAGE);
  }
}

export function kernel<This extends typeof Kernel, Args extends unknown[]>(originalMethod: KernelMethod<This, Args>, context: ClassMethodDecoratorContext<This, KernelMethod<This, Args>>): KernelMethod<This, Args>;
export function kernel<This extends typeof Kernel, Args extends unknown[]>(target: This, propertyKey: string, descriptor: TypedPropertyDescriptor<KernelMethod<This, Args>>): TypedPropertyDescriptor<KernelMethod<This, Args>> | void;
export function kernel(...args: unknown[]): unknown {
  if (args.length === 2) {
    const [originalMethod, context] = args as [unknown, ClassMethodDecoratorContext];
    if (context.kind !== 'method' || !context.static) {
      throw new Error(MISUSE_MESSAGE);
    }
    context.addInitializer(function (this: unknown) {
      assertExtendsKernel(this);
    });
    return originalMethod;
  }

  if (args.length !== 3) {
    throw new Error(MISUSE_MESSAGE);
  }
  const [target, , descriptor] = args as [unknown, string, TypedPropertyDescriptor<unknown>];
  assertExtendsKernel(target);
  return descriptor;
}
