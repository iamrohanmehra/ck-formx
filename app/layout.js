import { Karla } from "next/font/google";
import "./globals.css";

// Initialize the Karla font with all available weights
const karla = Karla({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"], // Including all available weights
  display: "swap",
  variable: "--font-karla",
});

export const metadata = {
  title: "Multi-Step Form",
  description: "A beautiful multi-step form with animations",
};

export default function RootLayout({ children }) {
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
