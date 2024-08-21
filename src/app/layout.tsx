import "./globals.css";
import MyToaster from "@/components/my-toaster";
import QueryProvider from "@/components/query-provider";

export const metadata = {
  title: "Image Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-textPrimar bg-primary">
        <QueryProvider>
          <MyToaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
