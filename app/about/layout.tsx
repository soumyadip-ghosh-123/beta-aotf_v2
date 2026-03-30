export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 mb-15">
      <div className="text-center justify-center w-full">
        {children}
      </div>
    </section>
  );
}
