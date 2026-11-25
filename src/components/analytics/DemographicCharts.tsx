'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DemographicMetric, EcommerceMetric } from '@/types/market';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useMapStore } from '@/store/useMapStore';

const AGE_COLORS = ['#94a3b8', '#6366f1', '#10b981', '#f59e0b'];
const GENDER_COLORS = ['#3b82f6', '#ec4899'];

interface Props {
  demographics?: DemographicMetric | null;
  ecommerce?: EcommerceMetric | null;
}

interface AgeDatum {
  key: string;
  label: string;
  pct: number;
  count: number;
  isTarget: boolean;
}

interface GenderDatum {
  key: 'male' | 'female';
  name: string;
  value: number;
  count: number;
}

interface CategoryDatum {
  name: string;
  share: number;
  growthRate: number;
}

/**
 * =============================================================================
 * DEMOGRAPHIC & MARKET CHARTS (Recharts v3)
 * OWNED BY: MEMBER 3
 * Visualizations:
 * 1. Age Distribution / Pyramid Bar Chart (Under 18, Gen Z, Working Age, >45)
 * 2. Gender Ratio Donut Chart (Male vs Female + Sex Ratio per 100 females)
 * 3. Urban vs Rural Distribution Split Bar
 * 4. Top E-Commerce Categories Breakdown (when ecommerce data is available)
 * =============================================================================
 */
export function DemographicCharts({ demographics, ecommerce }: Props) {
  const { t, language } = useTranslation();
  const theme = useMapStore((state) => state.theme);

  const numberFormatter = new Intl.NumberFormat('vi-VN');
  const totalPop = demographics?.population ?? 0;

  const ageData: AgeDatum[] = demographics
    ? [
        {
          key: 'under18',
          label: language === 'vi' ? 'Dưới 18' : 'Under 18',
          pct: demographics.ageGroups.under18,
          count: Math.round((totalPop * demographics.ageGroups.under18) / 100),
          isTarget: false,
        },
        {
          key: 'genZ',
          label: 'Gen Z (18–25)',
          pct: demographics.ageGroups.genZ,
          count: Math.round((totalPop * demographics.ageGroups.genZ) / 100),
          isTarget: true,
        },
        {
          key: 'workingAge',
          label: language === 'vi' ? 'Lao động (26–45)' : 'Working (26–45)',
          pct: demographics.ageGroups.workingAge,
          count: Math.round((totalPop * demographics.ageGroups.workingAge) / 100),
          isTarget: true,
        },
        {
          key: 'above45',
          label: language === 'vi' ? 'Trên 45' : 'Above 45',
          pct: demographics.ageGroups.above45,
          count: Math.round((totalPop * demographics.ageGroups.above45) / 100),
          isTarget: false,
        },
      ]
    : [];

  const genderData: GenderDatum[] = demographics
    ? [
        {
          key: 'male',
          name: language === 'vi' ? 'Nam' : 'Male',
          value: demographics.genderRatio.male,
          count: Math.round((totalPop * demographics.genderRatio.male) / 100),
        },
        {
          key: 'female',
          name: language === 'vi' ? 'Nữ' : 'Female',
          value: demographics.genderRatio.female,
          count: Math.round((totalPop * demographics.genderRatio.female) / 100),
        },
      ]
    : [];

  const sexRatioPer100Female =
    demographics && demographics.genderRatio.female > 0
      ? ((demographics.genderRatio.male / demographics.genderRatio.female) * 100).toFixed(1)
      : null;

  const urbanRate = demographics?.urbanizationRate ?? 0;
  const ruralRate = demographics ? Number(Math.max(0, 100 - urbanRate).toFixed(1)) : 0;

  const categoryData: CategoryDatum[] =
    ecommerce?.topCategories.map((cat) => ({
      name: cat.category,
      share: cat.marketShare,
      growthRate: cat.growthRate,
    })) ?? [];

  const tooltipContentStyle = {
    backgroundColor: 'var(--popover)',
    borderColor: 'var(--border)',
    borderRadius: '8px',
    color: 'var(--popover-foreground)',
    fontSize: '12px',
  };

  const axisTickColor = theme === 'dark' ? '#a1a1aa' : '#52525b';
  const gridStrokeColor = theme === 'dark' ? '#27272a' : '#e4e4e7';

  return (
    <div className="space-y-5 mt-2 pb-2">
      {/* 1. Age Distribution / Population Pyramid Style Horizontal BarChart */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t.charts.ageTitle} (%)
          </h4>
          {demographics && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
              {language === 'vi' ? 'Mục tiêu TMĐT: 18–45' : 'Target: 18–45'}
            </span>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/80">
          {ageData.length > 0 ? (
            <>
              <div className="h-[185px] w-full">
                <ResponsiveContainer width="100%" height={185}>
                  <BarChart
                    data={ageData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke={gridStrokeColor}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 60]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 10, fill: axisTickColor }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={96}
                      tick={{ fontSize: 11, fill: axisTickColor }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(value, _name, item) => {
                        const datum = item.payload as AgeDatum | undefined;
                        const countText = datum
                          ? ` (~${numberFormatter.format(datum.count)} ${
                              language === 'vi' ? 'người' : 'ppl'
                            })`
                          : '';
                        return [`${value}%${countText}`, t.charts.populationShare];
                      }}
                    />
                    <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={20}>
                      {ageData.map((entry, index) => (
                        <Cell
                          key={entry.key}
                          fill={AGE_COLORS[index % AGE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Compact numerical legend under chart */}
              <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                {ageData.map((entry, index) => (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded bg-white/70 dark:bg-zinc-900/50"
                  >
                    <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: AGE_COLORS[index % AGE_COLORS.length] }}
                      />
                      <span className="truncate">{entry.label}</span>
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 ml-1">
                      {entry.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-36 flex items-center justify-center text-xs text-zinc-400">
              {language === 'vi'
                ? 'Không có dữ liệu cơ cấu độ tuổi'
                : 'No age demographic data available'}
            </div>
          )}
        </div>
      </section>

      {/* 2. Gender Ratio Donut Chart (Male / Female) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {language === 'vi' ? 'Tỷ lệ giới tính (Nam / Nữ)' : 'Gender Ratio (Male / Female)'}
          </h4>
          {sexRatioPer100Female && (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {sexRatioPer100Female}{' '}
              {language === 'vi' ? 'nam / 100 nữ' : 'male / 100 female'}
            </span>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/80">
          {genderData.length > 0 ? (
            <div className="grid grid-cols-5 items-center gap-2">
              <div className="col-span-2 h-[140px]">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={34}
                      outerRadius={54}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={entry.key}
                          fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(value, name, item) => {
                        const datum = item.payload as GenderDatum | undefined;
                        const countText = datum
                          ? ` (~${numberFormatter.format(datum.count)})`
                          : '';
                        return [`${value}%${countText}`, String(name)];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Male / Female Cards & Split Bar */}
              <div className="col-span-3 space-y-2.5">
                {genderData.map((entry, index) => (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: GENDER_COLORS[index % GENDER_COLORS.length] }}
                      />
                      <div>
                        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {entry.name}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          ~{numberFormatter.format(entry.count)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {entry.value}%
                    </span>
                  </div>
                ))}

                {/* Urban vs Rural Quick Split */}
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">
                    <span>
                      {language === 'vi' ? 'Đô thị' : 'Urban'}: <strong>{urbanRate}%</strong>
                    </span>
                    <span>
                      {language === 'vi' ? 'Nông thôn' : 'Rural'}: <strong>{ruralRate}%</strong>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${Math.min(urbanRate, 100)}%` }}
                    />
                    <div
                      className="h-full bg-emerald-400/80"
                      style={{ width: `${Math.min(ruralRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-zinc-400">
              {language === 'vi'
                ? 'Không có dữ liệu tỷ lệ giới tính'
                : 'No gender ratio data available'}
            </div>
          )}
        </div>
      </section>

      {/* 3. Top Hot E-Commerce Product Categories */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          {language === 'vi' ? 'Ngành hàng TMĐT nổi bật (%)' : 'Top E-Commerce Categories (%)'}
        </h4>
        <div className="h-[185px] w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 border border-zinc-100 dark:border-zinc-800/80">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={165}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 6, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={gridStrokeColor}
                />
                <XAxis
                  type="number"
                  domain={[0, 50]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fill: axisTickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={108}
                  tick={{ fontSize: 10, fill: axisTickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(value, _name, item) => {
                    const datum = item.payload as CategoryDatum | undefined;
                    const growth = datum
                      ? ` (+${datum.growthRate}% YoY)`
                      : '';
                    return [
                      `${value}%${growth}`,
                      language === 'vi' ? 'Thị phần' : 'Market Share',
                    ];
                  }}
                />
                <Bar dataKey="share" fill="#6366f1" radius={[0, 5, 5, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-zinc-400 flex items-center justify-center h-full">
              {language === 'vi'
                ? 'Không có dữ liệu ngành hàng cho khu vực này'
                : 'No category data available for this region'}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
