import { getAllMenuItems, getAllCategories, getAllMainCategories } from "@/lib/dynamodb";
import MenuContent from "@/components/menu/MenuContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu | Yazol Coffee",
  description: "Browse our full menu of East African coffee, ice cream, and food. Order online for pickup.",
};

interface MenuPageProps {
  searchParams: Promise<{ section?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const [menuItems, categories, mainCategories, params] = await Promise.all([
    getAllMenuItems(),
    getAllCategories(),
    getAllMainCategories(),
    searchParams,
  ]);

  const sortedMainCategories = mainCategories.sort((a, b) => a.sortOrder - b.sortOrder);
  const initialSection = params.section || sortedMainCategories[0]?.slug || "";

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 lg:px-20">
          <MenuContent
            menuItems={menuItems}
            categories={categories}
            mainCategories={sortedMainCategories}
            initialSection={initialSection}
          />
        </div>
      </div>
    </main>
  );
}
