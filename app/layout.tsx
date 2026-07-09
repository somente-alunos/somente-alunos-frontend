import type { Metadata } from "next";
//import { Inter } from "next/font/google";
import "./globals.css";
import { Component_PaymentStatusWatcherClient } from "./payment_status_watcher_client";
import { Component_DeviceReportClient } from "./device_report_client";

//const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Somente Alunos",
  description: "Feito para e por alunos de várias Universidades com intuito de compartilhar informação. 2026 Redes De Computadores - Somente Alunos",
  icons: "/icon-branco-c-96x96.png"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <meta name="facebook-domain-verification" content="o8hhyl17535fubkuojgsju8cdqoi22" />
      </head>
      <body /* className={inter.className} */>
        <Component_PaymentStatusWatcherClient />
        <Component_DeviceReportClient />
        {children}
      </body>
    </html>
  );
}
