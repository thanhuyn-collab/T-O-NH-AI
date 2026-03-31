
import React, { useState, useEffect } from 'react';
import { Tab, AspectRatio, ImageData, ToastMessage } from './types';
import { generateImage } from './services/geminiService';
import { ImageUploader, ToggleSwitch, AspectRatioSelector, Spinner } from './components/ui';
import { WandIcon, DownloadIcon, CopyIcon } from './components/Icons';
import { MAX_PROMPT_LENGTH } from './constants';

const Toast: React.FC<{ toast: ToastMessage, onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const bgColor = toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed bottom-5 right-5 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-up`}>
      {toast.message}
    </div>
  );
};

const EditTabPanel: React.FC<{ onGenerate: Function, isLoading: boolean }> = ({ onGenerate, isLoading }) => {
  const [image, setImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [faceLock, setFaceLock] = useState(true);

  const handleSubmit = () => {
    onGenerate({
      prompt,
      images: image ? [image] : [],
      aspectRatio,
      faceLock,
      requiredImages: 1
    });
  };

  return (
    <div className="space-y-6">
      <ImageUploader image={image} onImageChange={setImage} label="Tải ảnh gốc" />
      <div>
        <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-700">Prompt mô tả</label>
        <textarea
          id="edit-prompt"
          rows={4}
          maxLength={MAX_PROMPT_LENGTH}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          placeholder="Chỉ mô tả trang phục / bối cảnh / ánh sáng; KHÔNG mô tả đặc điểm gương mặt khi bật Khóa khuôn mặt."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">{prompt.length} / {MAX_PROMPT_LENGTH}</p>
      </div>
      <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
      <ToggleSwitch label="Khóa khuôn mặt" enabled={faceLock} onChange={setFaceLock} />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300"
      >
        {isLoading ? <Spinner /> : 'Tạo ảnh'}
      </button>
    </div>
  );
};

const CreateTabPanel: React.FC<{ onGenerate: Function, isLoading: boolean }> = ({ onGenerate, isLoading }) => {
  const [personImage, setPersonImage] = useState<ImageData | null>(null);
  const [productImage, setProductImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [faceLock, setFaceLock] = useState(true);

  const handleSubmit = () => {
    const images = [personImage, productImage].filter((img): img is ImageData => img !== null);
    onGenerate({
      prompt,
      images,
      aspectRatio,
      faceLock,
      requiredImages: 2
    });
  };

  return (
    <div className="space-y-6">
      <ImageUploader image={personImage} onImageChange={setPersonImage} label="Upload Ảnh người (gốc)" />
      <ImageUploader image={productImage} onImageChange={setProductImage} label="Upload Ảnh sản phẩm" />
      <div>
        <label htmlFor="create-prompt" className="block text-sm font-medium text-gray-700">Prompt mô tả</label>
        <textarea
          id="create-prompt"
          rows={6}
          maxLength={MAX_PROMPT_LENGTH}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          placeholder="Hãy mô tả chi tiết để ghép ảnh người với sản phẩm sao cho tự nhiên...&#10;• Trang phục: ví dụ váy dạ hội đỏ...&#10;• Bối cảnh: ví dụ phòng studio...&#10;• Ánh sáng: ví dụ ánh sáng mềm...&#10;Lưu ý: KHÔNG mô tả đặc điểm gương mặt khi bật Khóa khuôn mặt."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">{prompt.length} / {MAX_PROMPT_LENGTH}</p>
      </div>
      <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
      <ToggleSwitch label="Khóa khuôn mặt" enabled={faceLock} onChange={setFaceLock} />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300"
      >
        {isLoading ? <Spinner /> : 'Tạo ảnh'}
      </button>
    </div>
  );
};


export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Edit);
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultPrompt, setResultPrompt] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  interface GenerateParams {
    prompt: string;
    images: ImageData[];
    aspectRatio: AspectRatio;
    faceLock: boolean;
    requiredImages: number;
  }

  const handleGenerate = async ({ prompt, images, aspectRatio, faceLock, requiredImages }: GenerateParams) => {
    if (!prompt.trim()) {
      addToast('⚠️ Vui lòng nhập prompt mô tả.', 'error');
      return;
    }
    if (images.length < requiredImages) {
      addToast(`⚠️ Vui lòng tải lên đủ ${requiredImages} ảnh.`, 'error');
      return;
    }

    setIsLoading(true);
    setResultImage(null);
    setResultPrompt(prompt);
    addToast('🎨 Đang tạo kiệt tác...', 'info');

    try {
      const generatedImageBase64 = await generateImage(prompt, images, faceLock, aspectRatio);
      setResultImage(generatedImageBase64);
      addToast('✨ Kiệt tác được tạo thành công!', 'success');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      addToast(`⚠️ Có lỗi xảy ra: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${resultImage}`;
    link.download = `anh_ai_pro_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopyPrompt = () => {
    if (!resultPrompt) return;
    navigator.clipboard.writeText(resultPrompt)
      .then(() => addToast('Sao chép Prompt thành công!', 'success'))
      .catch(() => addToast('Sao chép Prompt thất bại.', 'error'));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-600 tracking-tight">
            ẢNH AI PRO
          </h1>
          <p className="mt-2 text-lg text-gray-500">Tạo nên kiệt tác</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab(Tab.Edit)}
                  className={`${activeTab === Tab.Edit ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Chỉnh sửa & Kết Hợp Ảnh
                </button>
                <button
                  onClick={() => setActiveTab(Tab.Create)}
                  className={`${activeTab === Tab.Create ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Tạo ảnh mới
                </button>
              </nav>
            </div>
            {activeTab === Tab.Edit ? <EditTabPanel onGenerate={handleGenerate} isLoading={isLoading} /> : <CreateTabPanel onGenerate={handleGenerate} isLoading={isLoading} />}
          </div>

          {/* Right Column: Result */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-center min-h-[600px] sticky top-8">
            {isLoading ? (
              <div className="text-center space-y-4">
                 <div role="status">
                    <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="text-lg font-medium text-gray-700">🎨 Đang tạo kiệt tác của bạn...</p>
                <p className="text-sm text-gray-500">Quá trình này có thể mất một vài phút.</p>
              </div>
            ) : resultImage ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex-grow flex items-center justify-center">
                    <img src={`data:image/jpeg;base64,${resultImage}`} alt="Generated masterpiece" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-md" />
                </div>
                <div className="flex-shrink-0 flex items-center justify-center gap-4 mt-4">
                  <button onClick={handleDownload} className="flex items-center gap-2 bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    <DownloadIcon className="h-5 w-5" />
                    Tải về
                  </button>
                  <button onClick={handleCopyPrompt} className="flex items-center gap-2 bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    <CopyIcon className="h-5 w-5" />
                    Sao chép Prompt
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <WandIcon className="mx-auto h-20 w-20" />
                <p className="mt-4 text-lg font-medium">Kiệt tác của bạn sẽ xuất hiện ở đây</p>
                <p className="mt-1 text-sm">Sử dụng bảng điều khiển bên trái để bắt đầu.</p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          Bản quyền thuộc về Thanh Uyên & Team Better
        </footer>
      </div>
      <div className="fixed bottom-5 right-5 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  );
}
