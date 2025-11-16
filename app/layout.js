"use client"
import TopNav from "@/components/nav/TopNav";
import "./globals.css";
import "bootstrap-material-design/dist/css/bootstrap-material-design.min.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from 'next-auth/react';
import { CategoryProvider } from '@/context/category';
import { TagProvider } from '@/context/Tag';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <SessionProvider>
        <CategoryProvider>
          <TagProvider>

          <body>
            <TopNav />
            <Toaster />
            {/* children props/components can be server rendered */}
            {children}
            </body>
          </TagProvider>
        </CategoryProvider>
      </SessionProvider>
    </html>
  );
}
