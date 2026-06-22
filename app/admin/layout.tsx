import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "后台管理",
  description: "管理产品、套装和网站文案。",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
