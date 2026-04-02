import AdminSidebar from "@/components/admin/admin-sidebar";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar />
      <div className="flex-grow flex flex-col">
        <header className="h-16 border-b bg-background/95 backdrop-blur sticky top-0 z-40 px-8 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Ecommerce AI / Admin Console
          </h2>
          <div className="flex items-center space-x-4">
            <UserButton />
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
