import { Karla } from "next/font/google";
import "./globals.css";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Initialize the Karla font with all available weights
const karla = Karla({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"], // Including all available weights
  display: "swap",
  variable: "--font-karla",
});

export const metadata = {
  title: "CK FormX",
  description: "Form application for CodeKaro",
};

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Removed the direct link tag as Next.js will handle font loading */}
      </head>
      <body className={`${karla.className} ${karla.variable} font-karla`}>
        {children}
      </body>
    </html>
  );
}
