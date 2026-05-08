declare module "onnxruntime-web" {
  export const env: {
    wasm: {
      numThreads: number;
      wasmPaths?: string;
    };
  };

  export class Tensor {
    constructor(type: string, data: Float32Array | Int32Array, dims: number[]);
    data: Float32Array;
    dims: number[];
    cpuData: Float32Array;
  }

  export class InferenceSession {
    static create(
      uri: string,
      options?: { executionProviders?: string[] }
    ): Promise<InferenceSession>;
    run(
      feeds: Record<string, Tensor>
    ): Promise<Record<string, Tensor>>;
  }
}
