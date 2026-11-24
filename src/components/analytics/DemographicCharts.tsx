'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { DemographicMetric, EcommerceMetric } from '@/types/market';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useMapStore } from '@/store/useMapStore';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

interface Props {
  demographics?: DemographicMetric | null;
  ecommerce?: EcommerceMetric | null;
}

export function DemographicCharts({ demographics, ecommerce }: Props) {
  const { t, language } = useTranslation();
  const theme = useMapStore((state) => state.theme);

  const ageData = demographics ? [
    { name: '<18', value: demographics.ageGroups.under18 },
    { name: 'Gen Z (18-25)', value: demographics.ageGroups.genZ },
    { name: '26-45', value: demographics.ageGroups.workingAge },
    { name: '>45', value: demographics.ageGroups.above45 },
  ] : [];

  const categoryData = ecommerce?.topCategories.map(cat => ({
    name: cat.category,
    share: cat.marketShare,
  })) || [];

  const tooltipContentStyle = {
    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
    borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
    color: theme === 'dark' ? '#f4f4f5' : '#18181b',
    borderRadius: '0.75rem',
    fontSize: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Age distribution breakdown */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          {t.charts.ageTitle} (%)
        </h4>
        <div className="h-44 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2 flex items-center justify-center border border-zinc-100 dark:border-zinc-800/80">
          {ageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipContentStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-zinc-400">
              {language === 'vi' ? 'Không có dữ liệu nhân khẩu' : 'No demographic data available'}
            </span>
          )}
        </div>
      </div>

      {/* Top hot e-commerce product categories */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          {language === 'vi' ? 'Ngành hàng TMĐT nổi bật (%)' : 'Top E-Commerce Categories (%)'}
        </h4>
        <div className="h-48 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800/80">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={90} 
                  tick={{ fontSize: 10, fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }} 
                />
                <Tooltip contentStyle={tooltipContentStyle} />
                <Bar dataKey="share" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-zinc-400 flex items-center justify-center h-full">
              {language === 'vi' ? 'Không có dữ liệu ngành hàng' : 'No category data available'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
