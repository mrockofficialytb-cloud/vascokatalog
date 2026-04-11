import Header from "@/components/Header";

export const metadata = {
  title: "Zpracování osobních údajů | DVEŘE VASCO",
  description: "Informace o zpracování osobních údajů společnosti DVEŘE VASCO.",
};

export default function ZpracovaniOsobnichUdajuPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Header />

      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Zpracování osobních údajů
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Tento dokument shrnuje, jakým způsobem zpracováváme osobní údaje při používání webu,
            registraci uživatelského účtu, odesílání poptávky a při vzájemné komunikaci.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
            <section>
              <h2 className="text-lg font-semibold text-zinc-900">1. Správce osobních údajů</h2>
              <div className="mt-3 space-y-1">
                <p>
                  <strong>DVEŘE VASCO</strong>
                </p>
                <p>Vrchlického 838, 411 17 Libochovice</p>
                <p>IČO: 05699487</p>
                <p>E-mail: bytovy-design@dvere-vasco.cz</p>
                <p>Telefon: +420 736 671 108</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">2. Jaké údaje zpracováváme</h2>
              <p className="mt-3">Můžeme zpracovávat zejména tyto osobní údaje:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>identifikační a kontaktní údaje, například jméno, příjmení, e-mail, telefon, adresa,</li>
                <li>firemní údaje, například název společnosti, IČO a DIČ, pokud je uvedete,</li>
                <li>údaje zadané v poptávkovém formuláři nebo v uživatelském účtu,</li>
                <li>komunikační údaje obsažené v e-mailu nebo jiné zprávě,</li>
                <li>technické údaje související s provozem webu a zabezpečením systému.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">3. Účely zpracování</h2>
              <p className="mt-3">Osobní údaje zpracováváme zejména za účelem:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>registrace a správy uživatelského účtu,</li>
                <li>vyřízení poptávky a přípravy cenové nabídky,</li>
                <li>komunikace se zákazníkem a poskytování zákaznické podpory,</li>
                <li>plnění smluvních a zákonných povinností,</li>
                <li>ochrany našich oprávněných zájmů, například zabezpečení webu a vymáhání nároků.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">4. Právní základy zpracování</h2>
              <p className="mt-3">
                Osobní údaje zpracováváme zejména na základě:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>plnění smlouvy nebo provedení opatření před uzavřením smlouvy na vaši žádost,</li>
                <li>plnění právních povinností, které se na nás vztahují,</li>
                <li>našeho oprávněného zájmu, zejména při ochraně práv, bezpečnosti a provozu webu,</li>
                <li>souhlasu, pokud je v konkrétním případě vyžadován.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">5. Doba uchování údajů</h2>
              <p className="mt-3">
                Údaje uchováváme pouze po dobu nezbytnou pro naplnění příslušného účelu, po dobu
                trvání smluvního vztahu, po dobu vedení uživatelského účtu nebo po dobu stanovenou
                právními předpisy. Pokud odpadne důvod zpracování, údaje vymažeme nebo
                anonymizujeme.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">6. Příjemci osobních údajů</h2>
              <p className="mt-3">
                Osobní údaje mohou být zpřístupněny našim smluvním partnerům a zpracovatelům,
                například poskytovatelům hostingu, technické správy webu, e-mailových služeb,
                účetních nebo právních služeb, pokud je to nezbytné pro splnění uvedených účelů.
              </p>
              <p className="mt-3">
                Údaje nepředáváme třetím osobám bez právního důvodu a nepředáváme je mimo Evropskou
                unii, ledaže by takové předání bylo zajištěno v souladu s platnými právními
                předpisy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">7. Vaše práva</h2>
              <p className="mt-3">Máte zejména právo:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>požadovat přístup ke svým osobním údajům,</li>
                <li>požadovat opravu nepřesných nebo neúplných údajů,</li>
                <li>požadovat výmaz údajů, pokud jsou splněny zákonné podmínky,</li>
                <li>požadovat omezení zpracování,</li>
                <li>vznést námitku proti zpracování v případech stanovených právními předpisy,</li>
                <li>na přenositelnost údajů, pokud se toto právo použije,</li>
                <li>podat stížnost u Úřadu pro ochranu osobních údajů.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">8. Zabezpečení údajů</h2>
              <p className="mt-3">
                Přijímáme přiměřená technická a organizační opatření, aby nedošlo k neoprávněnému
                přístupu k osobním údajům, jejich ztrátě, změně nebo zneužití.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">9. Kontakt pro uplatnění práv</h2>
              <p className="mt-3">
                Pokud chcete uplatnit svá práva nebo máte dotaz ke zpracování osobních údajů,
                kontaktujte nás na e-mailu{" "}
                <a
                  href="mailto:bytovy-design@dvere-vasco.cz"
                  className="font-semibold text-zinc-900 underline"
                >
                  bytovy-design@dvere-vasco.cz
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900">10. Závěrečná ustanovení</h2>
              <p className="mt-3">
                Tento dokument můžeme průběžně aktualizovat, zejména pokud se změní naše procesy,
                technické řešení nebo právní požadavky.
              </p>
              <p className="mt-3">Datum poslední aktualizace: 11. 4. 2026</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}