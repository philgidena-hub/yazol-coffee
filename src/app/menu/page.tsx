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
      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20">
          <MenuContent menuItems={menuItems} categories={categories} />
        </div>
      </div>
    </main>
  );
}
