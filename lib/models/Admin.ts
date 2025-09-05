import mongoose from 'mongoose';

export interface IAdmin {
  _id?: string;
  username: string;
  password: string;
  role: 'admin';
  createdAt?: Date;
}

const AdminSchema = new mongoose.Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);