import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import SwipeNavigator from "@/components/layout/SwipeNavigator";
import { AuthProvider } from "@/contexts/auth-context";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Travel Manager",
  description: "가족 여행 관리 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-[var(--color-bg)]">
        <AuthProvider>
          <div className="mx-auto max-w-lg min-h-screen pb-20">
            <Header />
            <SwipeNavigator>
              <main className="px-4 pt-2">
                {children}
              </main>
            </SwipeNavigator>
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
