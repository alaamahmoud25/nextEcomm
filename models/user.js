import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // ✅ هذا وحده كافٍ الآن
      trim: true,
      lowercase: true,
      minlength: 5,
      maxlength: 255,
      index: true, // لتسريع البحث
    },
    password: {
      type: String,
      required: function () {
        // ✅ مطلوب فقط إذا المستخدم ما عنده حساب Google
        return !this.image;
      },
    },
    role: {
      type: String,
      default: 'user',
    },
    image: String,
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

// ❌ احذف هذا السطر
// userSchema.plugin(uniqueValidator);

export default mongoose.models.User || mongoose.model('User', userSchema);
