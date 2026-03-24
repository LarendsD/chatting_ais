// TODO Описать
export enum WorkflowElementType {
  CheckpointLoaderSimple = 'CheckpointLoaderSimple',
  ClipTextEncode = 'CLIPTextEncode',
  LoadImage = 'LoadImage',
  ImageScaleToTotalPixels = 'ImageScaleToTotalPixels',
  VaeEncode = 'VAEEncode',
  KSampler = 'KSampler',
  EmptyLatentImage = 'EmptyLatentImage',
  VaeDecode = 'VAEDecode',
  SaveImage = 'SaveImage',

  SaveVideo = 'SaveVideo',
  ADELoadAnimateDiffModel = 'ADE_LoadAnimateDiffModel',
  ADEApplyAnimateDiffModelSimple = 'ADE_ApplyAnimateDiffModelSimple',
  ADEStandardUniformContextOptions = 'ADE_StandardUniformContextOptions',
  ADEUseEvolvedSampling = 'ADE_UseEvolvedSampling',
  CreateVideo = 'CreateVideo',
}
