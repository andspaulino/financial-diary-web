export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ backgroundColor: "#111", color: "#fff" }}>
      <div>Private</div>
      {children}
    </div>
  );
}
