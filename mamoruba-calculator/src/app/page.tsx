import { FeeCalculatorForm } from "@/components/FeeCalculatorForm";

export default function HomePage() {
  return (
    <>
      <header className="mc-page-header px-4 py-8 text-center sm:px-6 sm:py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold sm:text-4xl">マモルバ料金計算</h1>
          <p className="mt-3 text-base leading-relaxed text-white/90 sm:text-lg">
            稼働時間と往復交通費を入力すると、料金の目安を計算できます。
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-10 pt-6 sm:px-6">
        <section className="mc-card rounded-2xl p-5 sm:p-7">
          <FeeCalculatorForm />
        </section>
      </main>
    </>
  );
}
