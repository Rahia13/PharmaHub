import { describe, it, expect } from "vitest";
import { detectFileType } from "@/lib/fileType";

function bytes(...values: number[]) {
  return Buffer.from(values);
}

describe("detectFileType", () => {
  it("identifies JPEG by its magic bytes", () => {
    const buf = Buffer.concat([bytes(0xff, 0xd8, 0xff, 0xe0), Buffer.alloc(20)]);
    expect(detectFileType(buf)?.mime).toBe("image/jpeg");
  });

  it("identifies PNG by its signature", () => {
    const sig = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    const buf = Buffer.concat([sig, Buffer.alloc(10)]);
    expect(detectFileType(buf)?.mime).toBe("image/png");
  });

  it("identifies WebP via the RIFF/WEBP markers", () => {
    const buf = Buffer.concat([
      Buffer.from("RIFF", "ascii"),
      bytes(0, 0, 0, 0),
      Buffer.from("WEBP", "ascii"),
      Buffer.alloc(4),
    ]);
    expect(detectFileType(buf)?.mime).toBe("image/webp");
  });

  it("identifies PDF by its header", () => {
    const buf = Buffer.concat([Buffer.from("%PDF-1.4", "ascii"), Buffer.alloc(10)]);
    expect(detectFileType(buf)?.mime).toBe("application/pdf");
  });

  it("rejects a renamed text file (trusts bytes, not the extension or claimed MIME type)", () => {
    const buf = Buffer.concat([Buffer.from("not really a pdf, just text", "ascii"), Buffer.alloc(5)]);
    expect(detectFileType(buf)).toBeNull();
  });

  it("rejects buffers that are too short to contain a signature", () => {
    expect(detectFileType(Buffer.from([0xff, 0xd8]))).toBeNull();
  });
});
