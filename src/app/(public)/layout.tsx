export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{ backgroundColor: "#111", color: "#fff" }}>
          <div>Public</div>
        {children}
      </body>
    </html>
  );
}
