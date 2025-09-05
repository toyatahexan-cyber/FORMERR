import mongoose from 'mongoose';

export interface IApplication {
  _id?: string;
  farmerId: string;
  schemeId: string;
  formData: {
    name: string;
    phone: string;
    village: string;
    district: string;
    state: string;
    crops: string[];
    bankAccount: string;
    ifscCode: string;
  };
  documents: string[];
  status: 'submitted' | 'under-review' | 'approved' | 'rejected';
  remarks?: string;
  submittedAt: Date;
  updatedAt?: Date;
}

const ApplicationSchema = new mongoose.Schema<IApplication>({
  farmerId: { type: String, required: true },
  schemeId: { type: String, required: true },
  formData: {
    name: String,
    phone: String,
    village: String,
    district: String,
    state: String,
    crops: [String],
    bankAccount: String,
    ifscCode: String,
  },
  documents: [String],
  status: { 
    type: String, 
    enum: ['submitted', 'under-review', 'approved', 'rejected'],
    default: 'submitted' 
  },
  remarks: String,
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);