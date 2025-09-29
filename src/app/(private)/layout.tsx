export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{ backgroundColor: "#111", color: "#fff" }}>
          <div>Private</div>
        {children}
      </body>
    </html>
  );
}
