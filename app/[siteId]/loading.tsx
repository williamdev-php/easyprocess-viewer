export default function SiteLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <section className="flex min-h-screen items-center justify-center bg-gray-200">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-4 h-8 w-48 rounded-full bg-gray-300" />
          <div className="mx-auto mb-6 h-14 w-[600px] max-w-full rounded-lg bg-gray-300" />
          <div className="mx-auto mb-8 h-6 w-96 max-w-full rounded bg-gray-300" />
          <div className="mx-auto h-12 w-40 rounded-2xl bg-gray-300" />
        </div>
      </section>

      {/* Content sections skeleton */}
      <div className="space-y-20 px-5 py-20 sm:px-8">
        {/* Section 1 */}
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-4 h-4 w-24 rounded bg-gray-200" />
          <div className="mx-auto mb-12 h-10 w-80 max-w-full rounded-lg bg-gray-200" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-8">
                <div className="mb-5 h-12 w-12 rounded-xl bg-gray-200" />
                <div className="mb-3 h-6 w-40 rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-4 h-4 w-20 rounded bg-gray-200" />
          <div className="mx-auto mb-12 h-10 w-64 max-w-full rounded-lg bg-gray-200" />
          <div className="flex flex-col gap-14 lg:flex-row lg:items-center">
            <div className="lg:w-1/2">
              <div className="mb-4 h-8 w-72 max-w-full rounded-lg bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-2/3 rounded bg-gray-100" />
              </div>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-gray-200 lg:w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
