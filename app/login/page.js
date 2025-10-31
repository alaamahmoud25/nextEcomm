'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ توجيه المستخدم إذا كان مسجل دخول مسبقًا
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.ok) {
        toast.success('Login successful!');
        router.push(callbackUrl);
      } else {
        toast.error(res?.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="container">
        <div className="row d-flex justify-content-center align-items-center vh-100">
          <div className="col-lg-5 shadow bg-light p-5 rounded">
            <h2 className="mb-4 text-center">Login</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control mb-3"
                placeholder="Enter your email"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control mb-3"
                placeholder="Enter your password"
                required
              />

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={loading || !email || !password}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <button
              className="btn btn-danger w-100"
              onClick={() => signIn('google', { callbackUrl })}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
