
export enum Tab {
  Edit = 'edit',
  Create = 'create',
}

export type AspectRatio = '1:1' | '16:9' | '9:16';

export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};
