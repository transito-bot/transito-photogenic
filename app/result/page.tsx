export default function ResultPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">결과를 찾을 수 없습니다.</p>
        <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">
          처음으로 돌아가기
        </a>
      </div>
    </main>
  );
}
