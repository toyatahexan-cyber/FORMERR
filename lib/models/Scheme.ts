import mongoose from 'mongoose';

export interface IScheme {
  _id?: string;
  title: string;
  description: string;
  issuer: 'central' | 'state';
  eligibility: string[];
  requiredDocuments: string[];
  cropTypes: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt?: Date;
}

const SchemeSchema = new mongoose.Schema<IScheme>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  issuer: { type: String, enum: ['central', 'state'], required: true },
  eligibility: [{ type: String }],
  requiredDocuments: [{ type: String }],
  cropTypes: [{ type: String }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Scheme || mongoose.model<IScheme>('Scheme', SchemeSchema);