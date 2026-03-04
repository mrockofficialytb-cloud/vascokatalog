import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

function s(v: any) {
  return (v ?? "").toString().trim();
}

function splitName(full: string) {
  const parts = full
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length < 2) return null;

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const userId = s(body.userId);
    if (!userId) return NextResponse.json({ error: "Chybí userId." }, { status: 400 });

    const name = s(body.name);
    if (!name) return NextResponse.json({ error: "Vyplň jméno a příjmení." }, { status: 400 });

    const nameParts = splitName(name);
    if (!nameParts) {
      return NextResponse.json(
        { error: "Vyplň jméno a příjmení (např. „Jan Novák“)." },
        { status: 400 }
      );
    }

    const phone = s(body.phone);
    const companyName = s(body.companyName);
    const ico = s(body.ico);
    const dic = s(body.dic);
    const street = s(body.street);
    const houseNumber = s(body.houseNumber);
    const city = s(body.city);
    const zip = s(body.zip);

    // Sestav data – aktualizuj jen to, co máme v schématu.
    // (Pokud některé pole neexistuje, Prisma hodí chybu – pak mi pošli model User a upravíme to přesně.)
    const data: any = {
      name,
      phone: phone || null,
      companyName: companyName || null,
      ico: ico || null,
      dic: dic || null,
      street: street || null,
      houseNumber: houseNumber || null,
      city: city || null,
      zip: zip || null,

      // pokud existují sloupce firstName/lastName, naplníme je taky:
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
    };

    // Pokud u tebe firstName/lastName neexistují, Prisma by spadlo.
    // Proto je bezpečně odstraníme, pokud by update failnul na unknown field.
    try {
      await prisma.user.update({ where: { id: userId }, data });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("Unknown argument") && (msg.includes("firstName") || msg.includes("lastName"))) {
        delete data.firstName;
        delete data.lastName;
        await prisma.user.update({ where: { id: userId }, data });
      } else {
        throw e;
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Chyba serveru." }, { status: 500 });
  }
}