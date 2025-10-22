"use client"
import Link from 'next/link'
import React from 'react'
import { useSession, signOut } from 'next-auth/react';

function TopNav() {
  const { data, status, loading } = useSession();

  return (
    <nav className="nav shadow  p-2 justify-content-between mb-3">
      <Link href="/" className="nav-brand">
        NEXTECOM
      </Link>
      {status === 'authenticated' ? (
        <div className="d-flex">
          <Link className="nav-link" href="/dashboard/user">
            {data?.user?.name}
          </Link>
          <a
            className="nav-link pointer"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Logout
          </a>
        </div>
      ) : (
        <div className="d-flex">
          <Link className="nav-link" href="/login">
            Login
          </Link>
          <Link className="nav-link" href="/register">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}


export default TopNav;