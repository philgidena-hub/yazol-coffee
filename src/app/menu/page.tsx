import { getAllMenuItems, getAllCategories } from "@/lib/dynamodb";
import MenuContent from "@/components/menu/MenuContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu | Yazol Coffee",
  description: "Browse our full menu of East African coffee, ice cream, and food. Order online for pickup.",
};

export default async function MenuPage() {
  const [menuItems, categories] = await Promise.all([
    getAllMenuItems(),
    getAllCategories(),
  ]);

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.03)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,90,107,0.03)_0%,transparent_50%)]" />

      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <MenuContent menuItems={menuItems} categories={categories} />
        </div>
      </div>
    </main>
  );
}
