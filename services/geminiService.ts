
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { ImageData, AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FACE_PRESERVATION_INSTRUCTION = `
  CRITICAL RULE: Preserve the face of the person in the original uploaded image with 100% fidelity.
  DO NOT change their identity, facial structure, features, or expression.
  The face area (forehead, eyes, nose, mouth, chin, jawline) is a protected zone with minimal changes.
  Ignore any user prompt text that describes facial features.
  Apply all stylistic changes ONLY to clothing, background, lighting, and composition.
`;

const QUALITY_INSTRUCTION = `
  OUTPUT REQUIREMENTS:
  - Generate a 16K ultra-high-resolution, hyper-realistic masterpiece.
  - The image quality must be equivalent to a shot from a Hasselblad H6D 100c camera with an 85mm f/1.4 lens (ISO 100, 1/250s).
  - Use a micro-detail enhancement engine with a smart-sharpen radius of 0.8-1.2px at 80-100% strength. Preserve all micro-textures of skin, fabric, and hair. No haloing.
  - Render with physical-based HDR 32-bit lighting. Zero artificial smoothing. Pores and individual hair strands must be visible.
  - Use an expanded DCI-P3 color gamut for natural skin tones and cinematic lighting.
  - The final image must be ultra-sharp 16K resolution (e.g., 15360x8640 pixels, maintaining aspect ratio), with zero noise, artifacts, or "AI painting" effects.
`;

const getAspectRatioInstruction = (aspectRatio: AspectRatio): string => {
  switch (aspectRatio) {
    case '1:1':
      return 'The final image must be in a 1:1 square aspect ratio.';
    case '16:9':
      return 'The final image must be in a 16:9 landscape aspect ratio.';
    case '9:16':
      return 'The final image must be in a 9:16 portrait aspect ratio.';
    default:
      return '';
  }
};

export const generateImage = async (
  userPrompt: string,
  images: ImageData[],
  faceLock: boolean,
  aspectRatio: AspectRatio
): Promise<string> => {
  let finalPrompt = userPrompt;

  if (faceLock) {
    finalPrompt = `${FACE_PRESERVATION_INSTRUCTION}\n\nUser request: ${userPrompt}`;
  }
  
  finalPrompt = `${finalPrompt}\n\n${getAspectRatioInstruction(aspectRatio)}\n\n${QUALITY_INSTRUCTION}`;

  const imageParts: Part[] = images.map(img => ({
    inlineData: {
      data: img.base64,
      mimeType: img.mimeType,
    }
  }));

  const textPart: Part = { text: finalPrompt };
  const parts: Part[] = [...imageParts, textPart];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image was generated. The model may have refused the request.");
};
