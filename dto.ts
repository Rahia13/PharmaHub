import type { Prisma, Address as AddressRow, Prescription as PrescriptionRow } from "@prisma/client";
import type {
  Address,
  Order,
  OrderStatus,
  PaymentMethod,
  Prescription,
  PrescriptionStatus,
  StaffPrescription,
} from "@/types";

export type OrderRow = Prisma.OrderGetPayload<{
  include: { items: true; events: true; address: true };
}>;

export function toAddress(a: AddressRow): Address {
  return {
    id: a.id,
    label: a.label as Address["label"],
    recipientName: a.recipientName,
    addressLine: a.addressLine,
    phone: a.phone,
    isDefault: a.isDefault,
  };
}

/** The public order id is the human-friendly code (e.g. PH-69501700). */
export function toOrderDto(o: OrderRow): Order {
  const timeline: Order["timeline"] = {};
  for (const e of [...o.events].sort((a, b) => a.at.getTime() - b.at.getTime())) {
    const status = e.status as OrderStatus;
    if (!timeline[status]) timeline[status] = e.at.toISOString();
  }
  return {
    id: o.code,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      image: i.image,
      price: i.unitPrice,
      quantity: i.quantity,
    })),
    total: o.total,
    address: toAddress(o.address),
    paymentMethod: o.paymentMethod as PaymentMethod,
    status: o.status as OrderStatus,
    timeline,
    rider: { name: o.riderName ?? "", phone: o.riderPhone ?? "" },
  };
}

export function toPrescriptionDto(p: PrescriptionRow): Prescription {
  return {
    id: p.code,
    fileName: p.fileName,
    fileSize: p.fileSize,
    fileType: p.fileType,
    patientName: p.patientName,
    notes: p.notes,
    uploadedAt: p.createdAt.toISOString(),
    status: p.status as PrescriptionStatus,
    rejectionReason: p.rejectionReason ?? undefined,
    hasFile: Boolean(p.storageKey),
  };
}

export function toStaffPrescriptionDto(
  p: PrescriptionRow & { user: { name: string; email: string } }
): StaffPrescription {
  return { ...toPrescriptionDto(p), customer: { name: p.user.name, email: p.user.email } };
}
