"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  if (pathname === "/login") return null;
  if (!user) return null;

  const isAdmin = user.email === ADMIN_EMAIL;
  const displayName = user.email?.split("@")[0] ?? "사용자";

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[var(--color-text-secondary)]">
          👤 {displayName}
        </span>
        {isAdmin && (
          <Link
            href="/admin"
            className="rounded-lg px-2 py-0.5 text-[9px] font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 transition-colors"
          >
            관리자
          </Link>
        )}
      </div>
      <button
        onClick={handleSignOut}
        className="rounded-lg px-2.5 py-1 text-[10px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-white hover:border-white/30 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}
