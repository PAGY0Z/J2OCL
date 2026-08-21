import { runKernel } from '@pagy0z/j2ocl/execute';
import { FloatArray, UInt32 } from '@pagy0z/j2ocl';
import { MathKernels_matMul } from './kernels.j2ocl.js';

const SIZE = 4;

const a = FloatArray.from([
  1, 2, 3, 4,
  5, 6, 7, 8,
  9, 10, 11, 12,
  13, 14, 15, 16,
]);
const b = FloatArray.from([
  16, 15, 14, 13,
  12, 11, 10, 9,
  8, 7, 6, 5,
  4, 3, 2, 1,
]);
const out = FloatArray.from(new Array(SIZE * SIZE).fill(0) as number[]);

runKernel({
  source: MathKernels_matMul.source,
  name: MathKernels_matMul.name,
  args: [
    { value: a, access: 'readOnly' },
    { value: b, access: 'readOnly' },
    { value: out, access: 'writeOnly' },
    { value: UInt32.of(SIZE) },
  ],
  globalWorkSize: [SIZE, SIZE],
});

const result = Array.from({ length: SIZE * SIZE }, (_, i) =>
  out.get(UInt32.of(i)).valueOf(),
);
for (let row = 0; row < SIZE; row++) {
  console.log(result.slice(row * SIZE, row * SIZE + SIZE));
}
