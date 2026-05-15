import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check user role in the database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  });

  if (user?.role !== "ADMIN") {
    console.log(`Unauthorized admin access attempt by user: ${userId}`);
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      <div className="flex-grow flex flex-col min-w-0">
        <AdminHeader />

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}


