/* eslint-disable @typescript-eslint/no-explicit-any,react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PageLayout from '@/components/PageLayout';

interface DoubanItem {
  id: string;
  title: string;
  poster: string;
  rate: string;
  year: string;
}

const THEMES = [
  { key: '纪录片', label: '全部' },
  { key: '自然', label: '自然' },
  { key: '历史', label: '历史' },
  { key: '科技', label: '科技' },
  { key: '美食', label: '美食' },
  { key: '社会', label: '社会' },
  { key: '人文', label: '人文' },
  { key: '动物', label: '动物' },
  { key: '军事', label: '军事' },
  { key: '犯罪', label: '犯罪' },
  { key: '音乐', label: '音乐' },
  { key: '运动', label: '运动' },
  { key: '探险', label: '探险' },
  { key: '宇宙', label: '宇宙' },
];

function DocumentaryPageClient() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme') || '纪录片';
  const [items, setItems] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rate' | 'year'>('rate');

  useEffect(() => {
    setLoading(true);
    setItems([]);
    Promise.all([
      fetch(`/api/douban?type=movie&tag=${encodeURIComponent(theme)}&pageSize=50`).then(r => r.json()),
      fetch(`/api/douban?type=tv&tag=${encodeURIComponent(theme)}&pageSize=50`).then(r => r.json()),
    ]).then(([movieData, tvData]) => {
      const all: DoubanItem[] = [
        ...(movieData.list || []).map((i: any) => ({ ...i, _type: 'movie' })),
        ...(tvData.list || []).map((i: any) => ({ ...i, _type: 'tv' })),
      ];
      setItems(all);
    }).catch(() => {
      setItems([]);
    }).finally(() => {
      setLoading(false);
    });
  }, [theme]);

  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'rate') {
      return parseFloat(b.rate || '0') - parseFloat(a.rate || '0');
    }
    return parseInt(b.year || '0') - parseInt(a.year || '0');
  });

  return (
    <PageLayout activePath="/documentary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          纪录片精选
        </h1>

        <div className="flex flex-wrap gap-2 mb-4">
          {THEMES.map((t) => {
            const isActive = theme === t.key;
            const href = t.key === '纪录片' ? '/documentary' : `/documentary?theme=${encodeURIComponent(t.key)}`;
            return (
              <Link
                key={t.key}
                href={href}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">排序：</span>
          <button
            onClick={() => setSortBy('rate')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'rate' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            评分 ↓
          </button>
          <button
            onClick={() => setSortBy('year')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'year' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            年份 ↓
          </button>
          {!loading && (
            <span className="text-sm text-gray-400 ml-2">共 {items.length} 部</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无该主题的纪录片数据</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sorted.map((item) => (
              <Link
                key={`${item.id}-${item.title}`}
                href={`/search?q=${encodeURIComponent(item.title)}`}
                className="group block rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.weserv.nl/?url=' + encodeURIComponent(item.poster); }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">暂无封面</div>
                  )}
                  {item.rate && parseFloat(item.rate) > 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      {item.rate}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</p>
                  {item.year && <p className="text-xs text-gray-400 mt-0.5">{item.year}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default function DocumentaryPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    }>
      <DocumentaryPageClient />
    </Suspense>
  );
}
