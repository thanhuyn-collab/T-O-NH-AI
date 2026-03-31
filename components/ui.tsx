
import React, { useRef, ChangeEvent } from 'react';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from '../constants';
import { AspectRatio, ImageData } from '../types';
import { UploadIcon, XMarkIcon } from './Icons';

interface ImageUploaderProps {
  image: ImageData | null;
  onImageChange: (imageData: ImageData | null) => void;
  label: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageChange, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert(`Loại tệp không hợp lệ. Vui lòng chọn JPG, PNG, hoặc WebP.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onImageChange({ base64, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-pink-500 transition-colors"
      >
        {image ? (
          <div className="relative group">
            <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Preview" className="max-h-32 rounded-lg mx-auto" />
            <div 
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
            >
              <XMarkIcon className="h-4 w-4" />
            </div>
            <p className="text-xs text-center text-gray-500 mt-1 truncate max-w-xs">{image.name}</p>
          </div>
        ) : (
          <div className="space-y-1 text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <span className="relative rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none">
                <span>Tải ảnh lên</span>
                <input ref={inputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={ACCEPTED_IMAGE_TYPES.join(',')} />
              </span>
            </div>
            <p className="text-xs text-gray-500">JPG, PNG, WebP tối đa 20MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ToggleSwitchProps {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
            type="button"
            className={`${enabled ? 'bg-pink-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
        >
            <span
                aria-hidden="true"
                className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);


interface AspectRatioSelectorProps {
    value: AspectRatio;
    onChange: (value: AspectRatio) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ value, onChange }) => {
    const options: { value: AspectRatio; label: string }[] = [
        { value: '1:1', label: 'Vuông (1:1)' },
        { value: '16:9', label: 'Ngang (16:9)' },
        { value: '9:16', label: 'Dọc (9:16)' },
    ];
    return (
        <div>
            <label className="text-sm font-medium text-gray-700">Tỷ lệ khung hình</label>
            <fieldset className="mt-2">
                <div className="flex space-x-4">
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center">
                            <input
                                id={option.value}
                                name="aspect-ratio"
                                type="radio"
                                checked={value === option.value}
                                onChange={() => onChange(option.value)}
                                className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                            />
                            <label htmlFor={option.value} className="ml-2 block text-sm text-gray-900">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div>
    );
};

export const Spinner: React.FC<{}> = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
);
