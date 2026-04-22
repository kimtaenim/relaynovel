import Link from "next/link";
import { BrassPlaque } from "@/components/BrassPlaque";

export const dynamic = "force-static";

export const metadata = {
  title: "전박사의 릴레이노블 · 소개",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <BrassPlaque title="전박사의 릴레이노블" subtitle="이야기의 시작과 지금" />

        <div className="mb-4 text-center font-script text-xs italic text-parchment-light/70">
          <Link href="/" className="underline decoration-dotted underline-offset-4 hover:text-parchment-light">
            ← 서재로
          </Link>
        </div>

        <article className="parchment rounded-3xl p-6 shadow-parchment sm:p-10">
          <section className="mb-6">
            <h2 className="mb-2 font-display text-lg text-ink">
              1. 2013년의 밑그림
            </h2>
            <p className="handwritten leading-loose text-ink">
              이 앱은 <strong>전혜정</strong> 박사의 2013년 박사학위 논문
              「SNS에서의 비선형·다중참여 스토리텔링을 이용한 콘텐츠 디자인 연구 — 페이스북
              집단창작 애플리케이션 개발을 통해」 (이화여자대학교 대학원 디자인학부)에서
              설계된 릴레이 노벨 프로토타입을 2026년의 기술과 AI 환경에서 재해석한 것입니다.
              원 논문의 프로토타입은 페이스북 앱 <code className="font-mono text-[11px]">relaynov.appspot.com</code>으로 구현됐으나 현재는 운영되지 않습니다.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 font-display text-lg text-ink">
              2. 14년 전의 제안, 지금의 구현
            </h2>
            <p className="handwritten leading-loose text-ink">
              논문에는 세 명의 스토리텔링 전문가가 평가자로 참여했습니다. 그중 C 평가자는
              매우 긍정적인 평가를 남기면서도 세 가지 제안을 덧붙였습니다.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 handwritten text-ink">
              <li>전체 스토리를 조망할 수 있는 맵 같은 내비게이션</li>
              <li>조셉 캠벨의 원형 플롯을 저작 가이드라인으로</li>
              <li>융·보글러의 아르케타입을 인물 가이드라인으로</li>
            </ul>
            <p className="mt-3 handwritten leading-loose text-ink">
              이 C 평가자는 시사만화가 <strong>김태권</strong>이었습니다.
              14년이 지난 지금, 김태권은 이 프로젝트의 오너로서 당시 자신이 제안했던
              기능들을 직접 구현하고, 전혜정 박사는 재구현의 관리자로서 초기 사용자로 함께 참여하고 있습니다.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 font-display text-lg text-ink">
              3. 지금의 앱은 이렇게 생겼습니다
            </h2>
            <ul className="list-disc space-y-2 pl-5 handwritten text-ink">
              <li>
                <strong>트리 구조의 이야기</strong>: 한 토막을 쓰면 그 아래로
                이어지고(↓), 같은 지점에 다른 갈래(→)를 나란히 쓸 수 있어 나뭇가지처럼 뻗어갑니다.
              </li>
              <li>
                <strong>캐러셀 읽기</strong>: 같은 분기점의 형제 갈래는 큰 카드 캐러셀로
                좌우 스와이프, 위엔 작은 탭으로 요약이 뜹니다.
              </li>
              <li>
                <strong>AI 참여자 4종</strong>: 이야기 이어가기 / 이야기 반전 / 의외의 전개 /
                한편 다른 등장인물은 — 누구나 이 넷 중 하나를 불러 3갈래의 제안을 받을 수 있습니다.
                AI도 사람 참여자와 동등하게 트리의 한 자리를 차지합니다.
              </li>
              <li>
                <strong>실시간 공유</strong>: 여러 명이 같은 책에 접속해 서로의 토막을 보고
                이어씁니다. 누가 접속해 있는지 상단 표시로 알 수 있습니다.
              </li>
              <li>
                <strong>비용</strong>: AI 호출마다 누적 토큰과 원화 비용을 좌하단에 노출합니다.
              </li>
              <li>
                <strong>수정·삭제</strong>: 본인이 쓴(또는 부른) 토막은 수정·삭제 가능.
                자식이 있는 토막은 고아화 방지를 위해 삭제 불가.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 font-display text-lg text-ink">
              4. 아직 담지 못한 것
            </h2>
            <ul className="list-disc space-y-1 pl-5 handwritten text-ink">
              <li>전체 나무를 한눈에 보는 <strong>트리 맵</strong> (Stage 5)</li>
              <li>책 모드별 가이드 (단순 플롯 / 복합 플롯 / TRPG) 와 캠벨 12단계 판정 (Stage 6)</li>
              <li>엔딩 선언, PDF 내보내기, 추천·별 (Stage 7)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-ink">5. 코드와 저작권</h2>
            <p className="handwritten leading-loose text-ink">
              이 애플리케이션의 소스 코드는{" "}
              <a
                href="https://github.com/kimtaenim/relaynovel"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted underline-offset-2 hover:text-seal"
              >
                github.com/kimtaenim/relaynovel
              </a>
              에 공개되어 있습니다. 참여자들이 함께 쓴 글의 저작권은 집합적으로 귀속되며,
              상업적 이용은 별도 협의가 필요합니다.
            </p>
          </section>
        </article>

        <p className="mt-8 text-center font-script text-xs italic text-parchment-light/50">
          14년 전 이 이야기는 여기서 끝나지 않았다.
        </p>
      </div>
    </main>
  );
}
