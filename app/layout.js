import { Karla } from "next/font/google";
import "./globals.css";

// Initialize the Karla font with only regular weight
const karla = Karla({
  subsets: ["latin"],
  weight: ["400"], // Only using regular weight (400)
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
        <link
          href="https://fonts.googleapis.com/css2?family=Karla&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${karla.className} ${karla.variable} font-karla`}>
        {children}
      </body>
    </html>
  );
}
