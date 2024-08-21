import ObjectList from "@/components/object-list";
import Header from "@/components/header";

export default function S3ServerPage() {
  return (
    <div className="min-h-screen bg-primary text-textPrimary">
      <Header />
      <main className="container mx-auto max-w-container space-y-6 p-4 pt-24">
        <ObjectList type="storage" />
      </main>
    </div>
  );
}
