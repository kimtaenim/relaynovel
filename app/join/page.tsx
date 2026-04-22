import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { JoinForm } from "./JoinForm";

export const dynamic = "force-dynamic";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { inviteToken?: string; redirect?: string };
}) {
  const session = await getSession();
  if (session) {
    redirect(searchParams.redirect ?? "/");
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="parchment w-full max-w-md rounded-3xl p-10 shadow-parchment">
        <h1 className="mb-2 font-display text-2xl text-ink">
          당신의 이름을 지어주세요
        </h1>
        <p className="mb-6 font-script text-sm italic text-ink-faded">
          이 서재 안에서 당신이 남길 글과 선택에 붙을 이름입니다.
          <br />
          본명일 필요는 없습니다.
        </p>
        <JoinForm
          inviteToken={searchParams.inviteToken}
          redirectTo={searchParams.redirect}
        />
      </div>
    </main>
  );
}
