import { withAuth } from "@/domains/core/auth";
import type { WithAuthProps } from "@/domains/core/auth";
import Link from "next/link";

const DashboardPage = async ({user}: WithAuthProps) => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/logout"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
        >
          Logout
        </Link>
      </div>
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/dashboard/demo"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
        >
          Demo page
        </Link>
      </div>
      <p>You are in a private route, {user.name}!</p>
    </div>
  );
}

export default withAuth(DashboardPage);