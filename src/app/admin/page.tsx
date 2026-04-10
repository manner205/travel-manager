"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface UserItem {
  id: string;
  email: string;
  createdAt: string;
  lastSignIn: string | null;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.status === 403) {
      setError("관리자 권한이 없어요");
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, password: newPassword }),
    });
    const data = await res.json();

    if (data.error) {
      setCreateError(data.error);
    } else {
      setCreateSuccess(`${data.user.email} 계정이 생성됐어요!`);
      setNewEmail("");
      setNewPassword("");
      fetchUsers();
    }
    setCreating(false);
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`${email} 계정을 삭제할까요?`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      fetchUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-[var(--color-text-secondary)]">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="text-4xl">🔒</div>
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={() => router.back()} className="text-xs text-[var(--color-accent)]">돌아가기</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">가족 계정 관리</h2>
        <button onClick={() => router.back()} className="text-xs text-[var(--color-text-secondary)]">← 뒤로</button>
      </div>

      {/* 새 계정 추가 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">새 가족 계정 추가</h3>
        <form onSubmit={handleCreate} className="space-y-2">
          <input
            type="email"
            placeholder="이메일"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-white placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          <input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-white placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)] transition-colors"
          />
          {createError && <p className="text-xs text-red-400">{createError}</p>}
          {createSuccess && <p className="text-xs text-emerald-400">{createSuccess}</p>}
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-bold text-black disabled:opacity-50 transition-opacity"
          >
            {creating ? "생성 중..." : "계정 추가"}
          </button>
        </form>
      </div>

      {/* 가족 계정 목록 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-4 py-2.5">
          <h3 className="text-sm font-semibold text-white">전체 계정 ({users.length}명)</h3>
        </div>
        {users.map((u, i) => {
          const isMe = u.email === user?.email;
          return (
            <div
              key={u.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < users.length - 1 ? "border-b border-[var(--color-border)]" : ""}`}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-dim)] text-sm">
                {u.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white truncate">{u.email}</span>
                  {isMe && (
                    <span className="flex-shrink-0 rounded-full bg-[var(--color-accent)]/20 px-1.5 py-0.5 text-[9px] text-[var(--color-accent)]">나</span>
                  )}
                </div>
                <div className="text-[10px] text-[var(--color-text-secondary)]">
                  {u.lastSignIn
                    ? `마지막 로그인: ${new Date(u.lastSignIn).toLocaleDateString("ko-KR")}`
                    : "아직 로그인 안 함"}
                </div>
              </div>
              {!isMe && (
                <button
                  onClick={() => handleDelete(u.id, u.email)}
                  className="flex-shrink-0 rounded-lg border border-red-400/30 px-2.5 py-1 text-[10px] text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
