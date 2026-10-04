export interface Product {
  id: string;
  slug: string;
  name: string;
  genericGroup: string;
  manufacturer: string;
  brand: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice: number;
  discountPercent: number;
  badge?: "Best Seller" | "Flash Deal" | "Top Rated" | "New";
  inStock: boolean;
  stockCount?: number;
  requiresPrescription: boolean;
  composition?: string;
  dosage?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount: string;
  colorClass: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = "customer" | "pharmacist" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Address {
  id: string;
  label: "Home" | "Office";
  recipientName: string;
  addressLine: string;
  phone: string;
  isDefault: boolean;
}

export type PaymentMethod = "cod" | "bkash" | "nagad" | "card";

export type OrderStatus = "placed" | "processing" | "out-for-delivery" | "delivered";

export interface Rider {
  name: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string; // ISO timestamp
  items: OrderItem[];
  total: number;
  address: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  /** ISO timestamp for each status the order has reached */
  timeline: Partial<Record<OrderStatus, string>>;
  rider: Rider;
}

export type PrescriptionStatus = "pending" | "approved" | "rejected";

export interface Prescription {
  id: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: string;
  patientName: string;
  notes: string;
  uploadedAt: string; // ISO timestamp
  status: PrescriptionStatus;
  rejectionReason?: string;
  /** Whether a file is stored and can be viewed. */
  hasFile: boolean;
}

export interface StaffPrescription extends Prescription {
  customer: { name: string; email: string };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO timestamp
  /** Display name, shortened for privacy (e.g. "Rahim K."). */
  author: string;
  /** True when the reviewer is the signed-in user. */
  mine: boolean;
}

export interface ReviewsResponse {
  reviews: Review[];
  summary: { rating: number; count: number };
  /** Signed-in customer has received this product and may review it. */
  canReview: boolean;
  /** Why they can't review (shown in the UI), when canReview is false. */
  reason?: "login" | "not-purchased";
}
