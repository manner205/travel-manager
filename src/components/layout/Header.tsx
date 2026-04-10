"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  // 로그인 페이지에서는 헤더 숨김
  if (pathname === "/login") return null;
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  // 이메일에서 이름 부분만 추출
  const displayName = user.email?.split("@")[0] ?? "사용자";

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <span className="text-[11px] text-[var(--color-text-secondary)]">
        👤 {displayName}
      </span>
      <button
        onClick={handleSignOut}
        className="rounded-lg px-2.5 py-1 text-[10px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-white hover:border-white/30 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}
