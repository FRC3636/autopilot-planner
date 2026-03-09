import { writeFileSync } from "fs";

// ── WPILOG binary format writer ──────────────────────────────────────

class WPILOGWriter {
  private buffer: Buffer;
  private offset = 0;
  private nextEntryId = 1;

  constructor() {
    this.buffer = Buffer.alloc(4096);
    // File header
    this.buffer.write("WPILOG", this.offset, "ascii");
    this.offset += 6;
    this.buffer.writeUInt16LE(0x0100, this.offset);
    this.offset += 2; // version 1.0
    this.buffer.writeUInt32LE(0, this.offset);
    this.offset += 4; // no extra header
  }

  startEntry(
    name: string,
    type: string,
    metadata = "",
    timestampUs = 0,
  ): number {
    const id = this.nextEntryId++;
    const payload = Buffer.concat([
      Buffer.from([0]), // control type: Start
      uint32(id),
      encodedString(name),
      encodedString(type),
      encodedString(metadata),
    ]);
    this.writeRecord(0, timestampUs, payload);
    return id;
  }

  appendRaw(entryId: number, data: Buffer, timestampUs = 0) {
    this.writeRecord(entryId, timestampUs, data);
  }

  toBuffer(): Buffer {
    return this.buffer.subarray(0, this.offset);
  }

  private writeRecord(entryId: number, timestampUs: number, payload: Buffer) {
    const idBytes = neededBytes(entryId);
    const sizeBytes = neededBytes(payload.length);
    const tsBytes = neededBytes(timestampUs);

    this.ensureCapacity(1 + idBytes + sizeBytes + tsBytes + payload.length);

    this.buffer[this.offset++] =
      (idBytes - 1) | ((sizeBytes - 1) << 2) | ((tsBytes - 1) << 4);
    this.writeUIntLE(entryId, idBytes);
    this.writeUIntLE(payload.length, sizeBytes);
    this.writeUIntLE(timestampUs, tsBytes);
    payload.copy(this.buffer, this.offset);
    this.offset += payload.length;
  }

  private writeUIntLE(val: number, bytes: number) {
    for (let i = 0; i < bytes; i++) {
      this.buffer[this.offset++] = (val >>> (8 * i)) & 0xff;
    }
  }

  private ensureCapacity(bytes: number) {
    while (this.offset + bytes > this.buffer.length) {
      const next = Buffer.alloc(this.buffer.length * 2);
      this.buffer.copy(next);
      this.buffer = next;
    }
  }
}

function neededBytes(val: number): number {
  for (let n = 1; n <= 8; n++) {
    if (val < 2 ** (8 * n)) return n;
  }
  return 8;
}

function uint32(val: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(val);
  return b;
}

function encodedString(s: string): Buffer {
  const str = Buffer.from(s, "utf-8");
  const b = Buffer.alloc(4 + str.length);
  b.writeUInt32LE(str.length);
  str.copy(b, 4);
  return b;
}

// ── Pose2d helpers ───────────────────────────────────────────────────

interface Pose2dValue {
  x: number;
  y: number;
  rotation: number; // radians
}

function packPose2dArray(pose: Pose2dValue): Buffer {
  const buf = Buffer.alloc(24);
  buf.writeDoubleLE(pose.x, 0);
  buf.writeDoubleLE(pose.y, 8);
  buf.writeDoubleLE(pose.rotation, 16);
  return buf;
}

// ── Generate test file ───────────────────────────────────────────────

const writer = new WPILOGWriter();

const poseId = writer.startEntry("/test/pose", "double[]");
writer.appendRaw(
  poseId,
  packPose2dArray({ x: 4.60, y: 7.40, rotation: 3.14 }),
);

const outPath = new URL("test.wpilog", import.meta.url).pathname;
writeFileSync(outPath, writer.toBuffer());
console.log(`Created ${outPath}`);
