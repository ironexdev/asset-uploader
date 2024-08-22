import ObjectList from "@/components/object-list";
import Header from "@/components/header";

export default function S3ServerPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-container space-y-6 p-5 pt-[6.5rem]">
        <ObjectList type="storage" />
      </main>
    </div>
  );
}
