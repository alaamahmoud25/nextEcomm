import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

// تعريف الـ Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 5,
      maxlength: 255,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      default: 'user',
    },
    image: {
      type: String,
    },
    resetCode: {
      data: String,
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000), // بعد 10 دقائق
      },
    },
  },
  { timestamps: true }
);

// إضافة الـ plugin للـ Schema
userSchema.plugin(uniqueValidator);

// تصدير الموديل (لتجنب الخطأ في إعادة التحميل في Next.js)
export default mongoose.models.User || mongoose.model('User', userSchema);
