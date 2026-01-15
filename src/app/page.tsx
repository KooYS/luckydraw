export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-theme-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-primary mb-4">
          LuckyDraw
        </h1>
        <p className="text-theme-text opacity-70 mb-8">version.1.0.0-beta</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/admin"
            className="px-6 py-3 bg-secondary text-black rounded-lg hover:bg-theme-secondary transition"
          >
            관리자 대시보드
          </a>
          <a
            href="/draw"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            럭키드로우 실행
          </a>
        </div>
      </div>
    </main>
  );
}
