'use client';

import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Sparkles, X, Bot, Loader2 } from 'lucide-react';

export function AiConsultantDialog() {
  const { 
    isAiModalOpen, 
    setAiModalOpen, 
    selectedRegion, 
    selectedDemographics, 
    selectedEcommerce 
  } = useMapStore();
  const { t, language } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  if (!isAiModalOpen) return null;

  const handleRunAnalysis = async () => {
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: selectedRegion,
          demographics: selectedDemographics,
          ecommerce: selectedEcommerce,
          language,
        }),
      });

      const data = await response.json();
      setAnalysisResult(data.advice || (language === 'vi' ? 'Đã tạo báo cáo phân tích thành công.' : 'Report generated successfully.'));
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAnalysisResult(t.aiDialog.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                {t.aiDialog.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.aiDialog.currentRegion}: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedRegion?.name || (language === 'vi' ? 'Toàn quốc' : 'Nationwide')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setAiModalOpen(false)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {language === 'vi'
              ? 'Hệ thống tổng hợp 4 lớp dữ liệu (Dân số nhân khẩu, Sức mua EBI, Thị phần sàn TMĐT và Hạ tầng logistics) để đề xuất chiến lược phát triển kinh doanh tối ưu.'
              : 'The system synthesizes 4 spatial layers (Demographics, EBI purchasing power, E-commerce market share, and Logistics infrastructure) to formulate strategic business recommendations.'}
          </p>

          {!selectedRegion && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
              {t.aiDialog.selectPrompt}
            </div>
          )}

          {analysisResult && (
            <div className="bg-zinc-50 dark:bg-zinc-800/80 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs leading-relaxed space-y-2 whitespace-pre-line text-zinc-800 dark:text-zinc-200 max-h-60 overflow-y-auto">
              <div className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
                <Bot className="w-4 h-4 shrink-0" />
                <span>{t.aiDialog.strategicReport}:</span>
              </div>
              <p>{analysisResult}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setAiModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            {t.aiDialog.close}
          </button>
          <button
            disabled={loading}
            onClick={handleRunAnalysis}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.aiDialog.analyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.aiDialog.requestAnalysis}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
