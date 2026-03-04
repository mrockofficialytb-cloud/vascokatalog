import "./globals.css";

export const metadata = {
  title: "VASCO – katalog",
  description: "B2B katalog s řízeným přístupem k cenám",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}