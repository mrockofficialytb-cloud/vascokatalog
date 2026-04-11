import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Dveře VASCO - e-katalog",
  description: "E-katalog akustických lamel a panelů",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className="bg-white text-zinc-900 antialiased">
        <div className="flex min-h-screen flex-col">
          
          {/* CONTENT */}
          <main className="flex-1">
            {children}
          </main>

          {/* FOOTER */}
          <Footer />

        </div>
      </body>
    </html>
  );
}