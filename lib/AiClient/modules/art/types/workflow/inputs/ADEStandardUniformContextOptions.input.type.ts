export type ADEStandardUniformContextOptions = {
  context_length: number;
  context_stride: number;
  context_overlap: number;
  closed_loop: boolean;
  fuse_method: string;
  use_on_equal_length: boolean;
  start_percent: number;
  guarantee_steps: number;
};
