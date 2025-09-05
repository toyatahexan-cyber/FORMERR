import mongoose from 'mongoose';

export interface IFarmer {
  _id?: string;
  name: string;
  phone: string;
  password: string;
  village: string;
  district: string;
  state: string;
  crops: string[];
  bankAccount: string;
  ifscCode: string;
  role: 'farmer';
  createdAt?: Date;
}

const FarmerSchema = new mongoose.Schema<IFarmer>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  village: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  crops: [{ type: String }],
  bankAccount: { type: String, required: true },
  ifscCode: { type: String, required: true },
  role: { type: String, default: 'farmer' },
}, { timestamps: true });

export default mongoose.models.Farmer || mongoose.model<IFarmer>('Farmer', FarmerSchema);