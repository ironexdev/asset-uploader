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
      <body className="bg-body">
        <QueryProvider>
          <MyToaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
