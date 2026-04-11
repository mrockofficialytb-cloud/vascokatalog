import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-[1800px] px-6 py-12">
        <div className="grid gap-10 text-center md:text-left md:grid-cols-4">
          
          {/* LOGO */}
          <div className="flex flex-col items-center md:items-start">
            <Image
              src="/vascologo.png"
              alt="VASCO"
              width={160}
              height={160}
              className="h-28 sm:h-32 w-auto object-contain"
            />

            <p className="mt-3 max-w-xs text-sm text-zinc-500">
              Moderní lamelové panely a doplňky pro váš interiér.
            </p>
          </div>

          {/* NAVIGACE */}
          <div>
            <div className="text-sm font-semibold text-zinc-900">Navigace</div>

            <div className="mt-3 flex flex-col items-center md:items-start gap-2 text-sm text-zinc-500">
              <Link href="/catalog" className="transition hover:text-black">
                Katalog
              </Link>

              <Link
                href="https://dvere-vasco.cz/onas.html"
                target="_blank"
                className="transition hover:text-black"
              >
                O nás
              </Link>

              <Link
                href="https://dvere-vasco.cz/interierove-dvere.html"
                target="_blank"
                className="transition hover:text-black"
              >
                Interiérové dveře
              </Link>
			   <Link
                href="/obchodni-podminky"
                className="transition hover:text-black"
              >
                Obchodní podmínky
              </Link>

              <Link
                href="/zpracovani-osobnich-udaju"
                className="transition hover:text-black"
              >
                Zpracování osobních údajů
              </Link>
            </div>
          </div>

          {/* KOLEKCE */}
          <div>
            <div className="text-sm font-semibold text-zinc-900">Kolekce</div>

            <div className="mt-3 flex flex-col items-center md:items-start gap-2 text-sm text-zinc-500">
              <Link href="/catalog/classic-lamelovy-panel" className="transition hover:text-black">
                CLASSIC
              </Link>

              <Link href="/catalog/modullo-lamelovy-panel" className="transition hover:text-black">
                MODULLO
              </Link>

              <Link href="/catalog/premium-lamelovy-panel" className="transition hover:text-black">
                PREMIUM
              </Link>

              <Link href="/catalog/spazio-lamelovy-panel" className="transition hover:text-black">
                SPAZIO
              </Link>

              <Link href="/catalog/riffcello-sestava-standard" className="transition hover:text-black">
                RIFFCELLO
              </Link>
            </div>
          </div>

          {/* KONTAKT */}
          <div>
            <div className="text-sm font-semibold text-zinc-900">Kontakt</div>

            <div className="mt-3 flex flex-col items-center md:items-start gap-2 text-sm text-zinc-500">
              <a
                href="mailto:bytovy-design@dvere-vasco.cz"
                className="transition hover:text-black"
              >
                bytovy-design@dvere-vasco.cz
              </a>

              <a
                href="tel:+420736671108"
                className="transition hover:text-black"
              >
                +420 736 671 108
              </a>

              <span>Vrchlického 838</span>
              <span>411 17 Libochovice</span>
              <span>Česká republika</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} DVEŘE VASCO. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}