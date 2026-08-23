import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customer: { name: String, email: String, phone: String, address: String },
  items: [{ productId: String, name: String, price: Number, quantity: Number, size: String, image: String }],
  subtotal: { type: Number, required: true },
  status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending", index: true },
  paymentMethod: { type: String, enum: ["cod", "card"], default: "cod" },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
}, { timestamps: true });

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const Order = (models.Order as Model<OrderDocument>) || model<OrderDocument>("Order", orderSchema);
