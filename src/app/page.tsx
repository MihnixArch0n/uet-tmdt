'use client';

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { DetailDrawer } from '@/components/analytics/DetailDrawer';
import { AiConsultantDialog } from '@/components/decision/AiConsultantDialog';
import { Loader2 } from 'lucide-react';

// Dynamically import BaseMap with ssr: false to prevent MapLibre GL 'window is not defined' error
const BaseMap = dynamic(() => import('@/components/map/BaseMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <span className="text-sm font-medium">Khởi tạo Bản Đồ Số GIS...</span>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* 1. Header & Navigation Toolbar */}
      <Navbar />

      {/* 2. Fullscreen Digital Map Canvas & Floating Overlays */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* MapLibre GL Base Map */}
        <BaseMap />

        {/* Region Detail Inspector Drawer (Member 3) */}
        <DetailDrawer />

        {/* Strategic AI Consultant Modal (Member 1) */}
        <AiConsultantDialog />
      </main>
    </div>
  );
}
