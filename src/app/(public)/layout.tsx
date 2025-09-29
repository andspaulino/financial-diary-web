export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ backgroundColor: "#111", color: "#fff" }}>
      <div>Public</div>
      {children}
    </div>
  );
}
