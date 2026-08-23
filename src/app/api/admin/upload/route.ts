import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { forbidden, requireAdminApi } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxUploadSize = 5 * 1024 * 1024;
const imageTypes = {
  "image/jpeg": { extension: "jpg", matches: (buffer: Buffer) => buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
  "image/png": { extension: "png", matches: (buffer: Buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { extension: "webp", matches: (buffer: Buffer) => buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP" },
} as const;

export async function POST(request: Request) {
  if (!await requireAdminApi()) return forbidden();
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  if (file.size === 0 || file.size > maxUploadSize) return NextResponse.json({ error: "Images must be smaller than 5MB." }, { status: 400 });

  const imageType = imageTypes[file.type as keyof typeof imageTypes];
  if (!imageType) return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image." }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!imageType.matches(buffer)) return NextResponse.json({ error: "The uploaded file is not a valid image." }, { status: 400 });

  const filename = `${randomUUID()}.${imageType.extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
