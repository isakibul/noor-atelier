import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  category: { type: String, enum: ["Women", "Men"], required: true },
  collection: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  tone: { type: String, default: "bg-[#e8ddd2]" },
  image: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  sizes: { type: [String], default: ["S", "M", "L", "XL"] },
  featured: { type: Boolean, default: false, index: true },
  active: { type: Boolean, default: true, index: true },
  stock: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export type ProductDocument = InferSchemaType<typeof productSchema>;
export const Product = (models.Product as Model<ProductDocument>) || model<ProductDocument>("Product", productSchema);
