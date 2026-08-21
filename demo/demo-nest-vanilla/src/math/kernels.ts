import {
  Kernel,
  kernel,
  FloatArray,
  UInt32,
  Float32,
  getGlobalId,
} from '@pagy0z/j2ocl';

export class MathKernels extends Kernel {
  @kernel
  static matMul(
    a: FloatArray,
    b: FloatArray,
    out: FloatArray,
    size: UInt32,
  ): void {
    const row: UInt32 = getGlobalId(0);
    const col: UInt32 = getGlobalId(1);

    let sum: Float32 = Float32.of(0);
    for (
      let k: UInt32 = UInt32.of(0);
      k.lessThan(size);
      k = k.add(UInt32.of(1))
    ) {
      sum = sum.add(
        a.get(row.mul(size).add(k)).mul(b.get(k.mul(size).add(col))),
      );
    }
    out.set(row.mul(size).add(col), sum);
  }
}
