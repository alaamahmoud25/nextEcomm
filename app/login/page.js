'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; 
import {signIn} from "next-auth/react"
export default function login() {
  const router = useRouter(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      setLoading(true);
      const res = await signIn("credentials",{
        redirect:false,
        email,
        password
      });

      if (res?.ok) {
        toast.success('Login successful!');
        router.push('/');
      } else {
        toast.error(res?.error || 'Login failed.');
        setLoading(false);
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
          <div className="col-lg-5 shadow bg-light p-5">
            <h2 className="mb-4 text-center">Login</h2>
            <form onSubmit={handleSubmit}>
              

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control mb-4"
                placeholder="Enter your email"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control mb-4"
                placeholder="Enter your password"
              />

              <button
                type="submit"
                className="btn btn-primary btn-raised"
                disabled={loading  || !email || !password}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}