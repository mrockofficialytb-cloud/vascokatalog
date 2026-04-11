import Header from "@/components/Header";

export const metadata = {
  title: "Obchodní podmínky | DVEŘE VASCO",
  description: "Obchodní podmínky společnosti DVEŘE VASCO.",
};

export default function ObchodniPodminkyPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Header />

      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Obchodní podmínky
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Tyto obchodní podmínky upravují vztahy mezi provozovatelem webu a zákazníkem při
            používání online katalogu a při odeslání poptávky prostřednictvím webových stránek.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
            <section>
              <h2 className="text-lg font-semibold text-zinc-900">1. Provozovatel</h2>
              <div className="mt-3 space-y-1">
                <p>
                  <strong>DVEŘE VASCO & AUTOSERVIS ŠÁRA s.r.o.</strong>
                </p>
                <p>Vrchlického 838, 411 17 Libochovice</p>
                <p>IČO: 05699487</p>
                <p>DIČ: CZ05699487</p>
                <p>E-mail: bytovy-design@dvere-vasco.cz</p>
                <p>Telefon: +420 736 671 108</p>
                <p>Společnost s ručením omezeným DVEŘE VASCO & AUTOSERVIS ŠÁRA s.r.o., založena 11.1.2017, zapsána pod značkou C 38791/KSUL Krajským soudem v Ústí nad Labem.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">2. Předmět webu</h2>
              <p className="mt-3">
                Web slouží zejména jako online katalog produktů a jako nástroj pro odeslání
                nezávazné poptávky. Informace uvedené na webu mají informativní charakter, pokud
                není výslovně uvedeno jinak.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">3. Ceny a informace o produktech</h2>
              <p className="mt-3">
                Ceny uvedené na webu jsou informativní a jsou uvedeny bez DPH, pokud není výslovně
                uvedeno jinak. Konečná cenová nabídka může být upřesněna podle konkrétního rozsahu
                poptávky, dekoru, rozměrů, množství, způsobu dopravy, montáže nebo dalších
                individuálních požadavků zákazníka.
              </p>
              <p className="mt-3">
                Provozovatel si vyhrazuje právo měnit ceny, technické parametry, dostupnost i
                popisy produktů bez předchozího upozornění.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">4. Poptávka a uzavření smlouvy</h2>
              <p className="mt-3">
                Odesláním poptávky prostřednictvím webu nevzniká automaticky kupní smlouva ani jiná
                závazná objednávka. Odeslaná poptávka je pouze žádostí zákazníka o zpracování
                nabídky.
              </p>
              <p className="mt-3">
                Smluvní vztah vzniká až na základě individuálního potvrzení nabídky mezi
                provozovatelem a zákazníkem, a to zpravidla e-mailem, písemně nebo jiným
                prokazatelným způsobem.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">5. Uživatelský účet</h2>
              <p className="mt-3">
                Některé části webu mohou být přístupné pouze registrovaným uživatelům. Uživatel je
                povinen uvádět pravdivé a aktuální údaje a chránit své přístupové údaje před
                zneužitím.
              </p>
              <p className="mt-3">
                Provozovatel je oprávněn účet omezit, zablokovat nebo zrušit zejména v případě
                porušení těchto podmínek, uvedení nepravdivých údajů nebo zneužívání systému.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">6. Dodání, doprava a platba</h2>
              <p className="mt-3">
                Konkrétní podmínky dodání, dopravy, termíny plnění a platební podmínky jsou
                sjednávány individuálně podle konkrétní nabídky a typu produktu.
              </p>
              <p className="mt-3">
                Pokud nebude mezi stranami dohodnuto jinak, jsou rozhodující údaje uvedené
                v individuální cenové nabídce nebo ve smluvním potvrzení.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">7. Odpovědnost a dostupnost webu</h2>
              <p className="mt-3">
                Provozovatel neodpovídá za dočasnou nedostupnost webu, technické výpadky, chyby
                přenosu dat ani za škody vzniklé užíváním webu v rozporu s jeho určením.
              </p>
              <p className="mt-3">
                Fotografie a vizualizace produktů mohou mít ilustrativní charakter. Skutečný vzhled
                produktu se může lišit zejména podle dekoru, světelných podmínek, výrobní série
                nebo použitého zařízení zákazníka.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">8. Práva duševního vlastnictví</h2>
              <p className="mt-3">
                Veškeré texty, fotografie, grafika, loga, návrhy a další obsah webu jsou chráněny
                právními předpisy a bez předchozího souhlasu provozovatele je nelze dále šířit,
                kopírovat ani jinak komerčně využívat.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">9. Ochrana osobních údajů</h2>
              <p className="mt-3">
                Informace o zpracování osobních údajů jsou uvedeny na samostatné stránce
                „Zpracování osobních údajů“.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">10. Závěrečná ustanovení</h2>
              <p className="mt-3">
                Tyto obchodní podmínky nabývají účinnosti dnem jejich zveřejnění na webu.
              </p>
              <p className="mt-3">
                Provozovatel si vyhrazuje právo tyto obchodní podmínky přiměřeně měnit nebo
                doplňovat. Pro konkrétní smluvní vztah je rozhodující znění podmínek účinné ke dni
                odeslání poptávky nebo uzavření smlouvy.
              </p>
              <p className="mt-3">Datum poslední aktualizace: 11. 4. 2026</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}