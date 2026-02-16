import { getAllMenuItems, getAllCategories } from "@/lib/dynamodb";
import MenuContent from "@/components/menu/MenuContent";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [menuItems, categories] = await Promise.all([
    getAllMenuItems(),
    getAllCategories(),
  ]);

  return (
    <main className="min-h-screen bg-bg pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <MenuContent menuItems={menuItems} categories={categories} />
      </div>
    </main>
  );
}
