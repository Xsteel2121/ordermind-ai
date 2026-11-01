import type { Metadata } from "next";
import Workspace from "@/components/Workspace";
import "./globals.css";
export const metadata: Metadata = {
  title: "OrderMind AI — каждый заказ под контролем",
  description:
    "Заказы на русском и қазақша. Меню Coffee Boom: 249 позиций, проверка пожеланий, аналитика и экономика в тенге.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Workspace />
        {children}
      </body>
    </html>
  );
}
