import { WorkflowElementType } from '../../enums/workflowElementType.enum.js';
import { ADEApplyAnimateDiffModelSimple } from './inputs/ADEApplyAnimateDiffModelSimple.input.type.js';
import { ADELoadAnimateDiffModelInput } from './inputs/ADELoadAnimateDiffModel.input.type.js';
import { ADEStandardUniformContextOptions } from './inputs/ADEStandardUniformContextOptions.input.type.js';
import { ADEUseEvolvedSampling } from './inputs/ADEUseEvolvedSampling.input.type.js';
import { CheckPointLoaderInput } from './inputs/CheckpointLoader.input.type.js';
import { ClipTextEncodeInput } from './inputs/ClipTextEncode.input.type.js';
import { CreateVideoInput } from './inputs/CreateVideo.input.type.js';
import { EmptyLatentImageInput } from './inputs/EmptyLatentImage.input.type.js';
import { ImageScaleToTotalPixelsInput } from './inputs/ImageScaleToTotalPixels.input.type.js';
import { KSamplerInput } from './inputs/KSampler.input.type.js';
import { LoadImageInput } from './inputs/LoadImage.input.type.js';
import { SaveImageInput } from './inputs/SaveImage.input.type.js';
import { SaveVideoInput } from './inputs/SaveVideo.input.type.js';
import { VaeDecodeInput } from './inputs/VaeDecode.input.type.js';
import { VaeEncodeInput } from './inputs/VaeEncode.input.type.js';

type WorkflowInputMap = {
  [WorkflowElementType.CheckpointLoaderSimple]: CheckPointLoaderInput;
  [WorkflowElementType.ClipTextEncode]: ClipTextEncodeInput;
  [WorkflowElementType.EmptyLatentImage]: EmptyLatentImageInput;
  [WorkflowElementType.ImageScaleToTotalPixels]: ImageScaleToTotalPixelsInput;
  [WorkflowElementType.KSampler]: KSamplerInput;
  [WorkflowElementType.LoadImage]: LoadImageInput;
  [WorkflowElementType.SaveImage]: SaveImageInput;
  [WorkflowElementType.VaeDecode]: VaeDecodeInput;
  [WorkflowElementType.VaeEncode]: VaeEncodeInput;
  [WorkflowElementType.SaveVideo]: SaveVideoInput;
  [WorkflowElementType.ADELoadAnimateDiffModel]: ADELoadAnimateDiffModelInput;
  [WorkflowElementType.ADEApplyAnimateDiffModelSimple]: ADEApplyAnimateDiffModelSimple;
  [WorkflowElementType.ADEStandardUniformContextOptions]: ADEStandardUniformContextOptions;
  [WorkflowElementType.ADEUseEvolvedSampling]: ADEUseEvolvedSampling;
  [WorkflowElementType.CreateVideo]: CreateVideoInput;
};

type WorkflowInputByElementType<T extends keyof WorkflowInputMap> = WorkflowInputMap[T];

type WorkflowElementBase<T extends keyof WorkflowInputMap> = {
  class_type: T;
  inputs: WorkflowInputByElementType<T>;
  _meta?: {
    [key in string]: string;
  };
};

type WorkflowElement = {
  [K in keyof WorkflowInputMap]: WorkflowElementBase<K>;
}[keyof WorkflowInputMap];

export type Workflow = {
  [key in number]: WorkflowElement;
};
