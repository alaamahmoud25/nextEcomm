import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { name, email, password } = body;

  try {
    // تأكد إن المستخدم غير موجود مسبقًا
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // إنشاء المستخدم
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new User({
      name,
      email,
      password: hashedPassword,
    }).save();

    console.log('✅ User created =>', user);

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
