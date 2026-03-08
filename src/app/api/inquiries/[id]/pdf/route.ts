import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

function formatCzk(amountCzk: number | null | undefined) {
  if (amountCzk == null) return "—";
  const val = amountCzk / 100;
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
  }).format(val);
}

function drawText(
  page: any,
  text: string,
  x: number,
  y: number,
  opts: {
    font: any;
    size?: number;
    color?: ReturnType<typeof rgb>;
    maxWidth?: number;
    lineHeight?: number;
  }
) {
  page.drawText(text, {
    x,
    y,
    font: opts.font,
    size: opts.size ?? 10,
    color: opts.color ?? rgb(0, 0, 0),
    maxWidth: opts.maxWidth,
    lineHeight: opts.lineHeight,
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const processedBy =
    session?.user?.name?.trim() ||
    session?.user?.email?.trim() ||
    "Administrátor";

  const { id } = await params;

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!inquiry) {
    return new NextResponse("Poptávka nebyla nalezena.", { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const regularFontBytes = await fs.readFile(
    path.join(process.cwd(), "src", "assets", "fonts", "SKODANext-Regular.otf")
  );
  const boldFontBytes = await fs.readFile(
    path.join(process.cwd(), "src", "assets", "fonts", "SKODANext-Bold.otf")
  );

  const font = await pdfDoc.embedFont(regularFontBytes);
  const bold = await pdfDoc.embedFont(boldFontBytes);

  const logoPath = path.join(process.cwd(), "public", "vascologo.png");
  let logoImage: any = null;
  try {
    const logoBytes = await fs.readFile(logoPath);
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch {
    logoImage = null;
  }

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const colors = {
    black: rgb(0.07, 0.07, 0.08),
    dark: rgb(0.12, 0.12, 0.14),
    text: rgb(0.15, 0.16, 0.18),
    muted: rgb(0.45, 0.47, 0.5),
    line: rgb(0.87, 0.88, 0.9),
    soft: rgb(0.97, 0.97, 0.98),
    white: rgb(1, 1, 1),
  };

  const margin = 38;
  let y = height - margin;

  const orderLabel = `VASCO-${String(inquiry.orderNumber).padStart(4, "0")}`;

  // Header
  const headerHeight = 92;

  page.drawRectangle({
    x: margin,
    y: y - headerHeight,
    width: width - margin * 2,
    height: headerHeight,
    color: colors.black,
  });

  let logoBlockWidth = 0;

  if (logoImage) {
    const targetLogoWidth = 120;
    const logoScale = targetLogoWidth / logoImage.width;
    const logoWidth = logoImage.width * logoScale;
    const logoHeight = logoImage.height * logoScale;

    logoBlockWidth = logoWidth;

    page.drawImage(logoImage, {
      x: width - margin - logoWidth - 22,
      y: y - headerHeight / 2 - logoHeight / 2,
      width: logoWidth,
      height: logoHeight,
    });
  }

  drawText(page, "Poptávka", margin + 18, y - 28, {
    font,
    size: 10,
    color: rgb(0.82, 0.84, 0.86),
  });

  drawText(page, orderLabel, margin + 18, y - 54, {
    font: bold,
    size: 24,
    color: colors.white,
    maxWidth: width - margin * 2 - logoBlockWidth - 60,
  });

  drawText(
    page,
    `Vytvořeno: ${new Date(inquiry.createdAt).toLocaleString("cs-CZ")}`,
    margin + 18,
    y - 72,
    {
      font,
      size: 9,
      color: rgb(0.72, 0.74, 0.77),
      maxWidth: width - margin * 2 - logoBlockWidth - 60,
    }
  );

  y -= 118;

  // Two-column info blocks
  const colGap = 16;
  const colWidth = (width - margin * 2 - colGap) / 2;
  const boxHeight = 148;

  page.drawRectangle({
    x: margin,
    y: y - boxHeight,
    width: colWidth,
    height: boxHeight,
    color: colors.soft,
    borderColor: colors.line,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: margin + colWidth + colGap,
    y: y - boxHeight,
    width: colWidth,
    height: boxHeight,
    color: colors.soft,
    borderColor: colors.line,
    borderWidth: 1,
  });

  drawText(page, "Odběratel", margin + 14, y - 18, {
    font: bold,
    size: 12,
    color: colors.dark,
  });

  const customerName =
    inquiry.user.name ||
    [inquiry.user.firstName, inquiry.user.lastName].filter(Boolean).join(" ").trim() ||
    "—";

  const street =
    inquiry.user.invoiceStreet ||
    inquiry.user.street ||
    "";

  const houseNumber =
    inquiry.user.invoiceHouseNumber ||
    inquiry.user.houseNumber ||
    "";

  const city =
    inquiry.user.invoiceCity ||
    inquiry.user.city ||
    "";

  const zip =
    inquiry.user.invoiceZip ||
    inquiry.user.zip ||
    "";

  const fullStreet = [street, houseNumber].filter(Boolean).join(" ").trim();
  const fullCity = [zip, city].filter(Boolean).join(" ").trim();

  const customerLines = [
    customerName || null,
    inquiry.user.email || null,
    inquiry.user.phone || null,
    inquiry.user.companyName || null,
    inquiry.user.ico ? `IČO: ${inquiry.user.ico}` : null,
    inquiry.user.dic ? `DIČ: ${inquiry.user.dic}` : null,
    fullStreet || null,
    fullCity || null,
  ].filter(Boolean) as string[];

  let leftY = y - 38;
  for (const line of customerLines) {
    drawText(page, line, margin + 14, leftY, {
      font,
      size: 10,
      color: colors.text,
      maxWidth: colWidth - 28,
      lineHeight: 13,
    });
    leftY -= 15;
  }

  const supplierX = margin + colWidth + colGap + 14;

  drawText(page, "Dodavatel", supplierX, y - 18, {
    font: bold,
    size: 12,
    color: colors.dark,
  });

  const supplierLines = [
    "Dveře VASCO & Autoservis Šára s.r.o.",
    "IČO: 05699487",
    "DIČ: CZ05699487",
    "Vrchlického 838",
    "411 17 Libochovice",
  ];

  let rightY = y - 38;
  for (const line of supplierLines) {
    drawText(page, line, supplierX, rightY, {
      font,
      size: 10,
      color: colors.text,
      maxWidth: colWidth - 28,
      lineHeight: 13,
    });
    rightY -= 15;
  }

  y -= boxHeight + 28;

  // Section title
  drawText(page, "Položky", margin, y, {
    font: bold,
    size: 14,
    color: colors.dark,
  });

  y -= 22;

  // Table header
  page.drawRectangle({
    x: margin,
    y: y - 24,
    width: width - margin * 2,
    height: 24,
    color: colors.soft,
    borderColor: colors.line,
    borderWidth: 1,
  });

  drawText(page, "Název", margin + 12, y - 16, {
    font: bold,
    size: 10,
    color: colors.dark,
  });
  drawText(page, "Ks", 355, y - 16, {
    font: bold,
    size: 10,
    color: colors.dark,
  });
  drawText(page, "Cena / ks", 405, y - 16, {
    font: bold,
    size: 10,
    color: colors.dark,
  });
  drawText(page, "Celkem", 494, y - 16, {
    font: bold,
    size: 10,
    color: colors.dark,
  });

  y -= 34;

  let total = 0;

  for (const item of inquiry.items) {
    const lineTotal = (item.unitPriceCzkSnapshot ?? 0) * item.quantity;
    total += lineTotal;

    const rowHeight = 54 + (item.decorSnapshot ? 12 : 0) + (item.feltSnapshot ? 12 : 0);

    page.drawRectangle({
      x: margin,
      y: y - rowHeight + 8,
      width: width - margin * 2,
      height: rowHeight,
      color: colors.white,
      borderColor: colors.line,
      borderWidth: 1,
    });

    drawText(page, item.nameSnapshot, margin + 12, y - 10, {
      font: bold,
      size: 11,
      color: colors.dark,
      maxWidth: 270,
    });

    let metaY = y - 27;

    if (item.decorSnapshot) {
      drawText(page, `Dekor: ${item.decorSnapshot}`, margin + 18, metaY, {
        font,
        size: 9.5,
        color: colors.muted,
      });
      metaY -= 12;
    }

    if (item.feltSnapshot) {
      drawText(page, `Varianta: ${item.feltSnapshot}`, margin + 18, metaY, {
        font,
        size: 9.5,
        color: colors.muted,
      });
    }

    drawText(page, String(item.quantity), 358, y - 10, {
      font,
      size: 10.5,
      color: colors.text,
    });

    drawText(page, formatCzk(item.unitPriceCzkSnapshot), 405, y - 10, {
      font,
      size: 10.5,
      color: colors.text,
    });

    drawText(page, formatCzk(lineTotal), 494, y - 10, {
      font: bold,
      size: 10.5,
      color: colors.dark,
    });

    y -= rowHeight + 10;
  }

  // Total box
  page.drawRectangle({
    x: width - margin - 188,
    y: y - 42,
    width: 188,
    height: 42,
    color: colors.black,
  });

  drawText(page, "Celkem", width - margin - 168, y - 15, {
    font,
    size: 10,
    color: rgb(0.82, 0.84, 0.86),
  });

  drawText(page, formatCzk(total), width - margin - 92, y - 27, {
    font: bold,
    size: 16,
    color: colors.white,
  });

  y -= 62;

  if (inquiry.note) {
    drawText(page, "Poznámka", margin, y, {
      font: bold,
      size: 12,
      color: colors.dark,
    });

    y -= 18;

    page.drawRectangle({
      x: margin,
      y: y - 56,
      width: width - margin * 2,
      height: 56,
      color: colors.soft,
      borderColor: colors.line,
      borderWidth: 1,
    });

    drawText(page, inquiry.note, margin + 12, y - 18, {
      font,
      size: 10,
      color: colors.text,
      maxWidth: width - margin * 2 - 24,
      lineHeight: 13,
    });
  }

  // Footer
  const footerText = `Zpracoval: ${processedBy}`;
  const footerWidth = bold.widthOfTextAtSize(footerText, 9);

  drawText(page, footerText, (width - footerWidth) / 2, 22, {
    font: bold,
    size: 9,
    color: colors.muted,
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${orderLabel}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}