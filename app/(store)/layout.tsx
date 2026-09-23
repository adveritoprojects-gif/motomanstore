import { Navbar, MobileBottomNav } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawerProvider } from "@/components/cart";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartDrawerProvider />
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
