
import React, { useState, useCallback } from 'react';
import { analyzeFoodImage } from '../../services/geminiService';
import type { AnalysisResult, FoodEntry, MealType } from '../../types';
import { MEAL_TYPES } from '../../env';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import AnalysisDetail from '../AnalysisDetail';

interface FoodAnalysisPageProps {
  addFoodEntry: (entry: FoodEntry) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-3 py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    <p className="text-primary font-medium">AI 營養師分析中，請稍候...</p>
  </div>
);

const FoodAnalysisPage: React.FC<FoodAnalysisPageProps> = ({ addFoodEntry }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('請上傳有效的圖片檔案 (PNG, JPG, GIF)。');
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAnalysisResult(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const resizeAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 512;
                const MAX_HEIGHT = 512;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Get base64 string, remove data URL prefix
                resolve(canvas.toDataURL('image/jpeg').split(',')[1]);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError('請先選擇一張圖片');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Image = await resizeAndConvertToBase64(imageFile);
      const result = await analyzeFoodImage(base64Image);
      setAnalysisResult(result);
      const newEntry: FoodEntry = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        mealType,
        analysis: result,
      };
      addFoodEntry(newEntry);
    } catch (err) {
      setError('分析失敗，請稍後再試。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, addFoodEntry, mealType]);

  return (
    <div className="container mx-auto p-5 animate-fadeIn">
      <h1 className="text-3xl font-bold text-text-primary mb-6">食物分析</h1>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card>
          <div className="space-y-6">
            <Select label="餐飲類型" name="mealType" value={mealType} onChange={e => setMealType(e.target.value as MealType)}>
              {MEAL_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </Select>
            <div>
              <label className="block mb-2 text-sm font-medium text-text-secondary">上傳食物圖片</label>
              <div 
                className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${isDragging ? 'border-primary bg-primary-light' : 'border-gray-900/25'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                   {imagePreview ? 
                    <img src={imagePreview} alt="Food preview" className="mx-auto h-48 w-auto rounded-md object-contain" /> :
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                   }
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-green-600">
                      <span>上傳檔案</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">或拖曳至此</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            
            <Button onClick={handleAnalyze} disabled={isLoading || !imageFile}>
              {isLoading ? '分析中...' : '分析食物圖片'}
            </Button>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-primary mb-4">分析結果</h2>
          {isLoading && <LoadingSpinner />}
          {analysisResult && <AnalysisDetail analysis={analysisResult} />}
          {!isLoading && !analysisResult && <p className="text-text-secondary text-center py-10">請上傳圖片以查看分析結果。</p>}
        </Card>
      </div>
    </div>
  );
};

export default FoodAnalysisPage;
