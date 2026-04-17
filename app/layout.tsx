import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'pua_memorial',
  description: '渋谷の夜を舞台にした会話シミュレーションゲーム',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
