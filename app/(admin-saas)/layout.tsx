export default function AdminSaasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 bg-background">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
