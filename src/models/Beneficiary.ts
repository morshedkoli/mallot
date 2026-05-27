import mongoose, { Schema, Document } from 'mongoose';

export interface IBeneficiary extends Document {
  name: string;
  tokenNumber: string;
  phone?: string;
  address?: string;
  isDistributed: boolean;
  distributedAt?: Date;
  receivedBy: 'self' | 'other';
  receiverName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BeneficiarySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    tokenNumber: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    isDistributed: { type: Boolean, default: false },
    distributedAt: { type: Date },
    receivedBy: { type: String, enum: ['self', 'other'], default: 'self' },
    receiverName: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Beneficiary || mongoose.model<IBeneficiary>('Beneficiary', BeneficiarySchema);
