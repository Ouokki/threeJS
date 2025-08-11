import "./globals.css";

export const metadata = { title: "Your Company", description: "Creative 3D site" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

