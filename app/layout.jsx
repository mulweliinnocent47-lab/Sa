import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

// Icons come from app/icon.png, app/apple-icon.png and app/favicon.ico (Next.js picks them up by itself).
export const metadata = {
  title: "SA Student",
  description: "NSC past papers, study notes and AI practice for South African students.",
  applicationName: "SA Student",
  appleWebApp: { capable: true, title: "SA Student", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#012066",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
