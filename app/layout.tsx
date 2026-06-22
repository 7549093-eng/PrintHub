import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | PrintHub",
    default: "PrintHub | 3D 打印模型下载平台",
  },
  description: "面向餐厅、派对、桌面和小商家的实用 3D 打印 STL / 3MF 模型下载网站。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
