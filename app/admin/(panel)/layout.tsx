import { redirect } from "next/navigation";
import { signOut } from "@/app/admin/(panel)/actions";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="admin">
      <header className="site-header">
        <div>
          <p className="firm-name">Ramos James Law</p>
          <p className="product-name">CasePath editor</p>
        </div>
        <form action={signOut}>
          <button className="header-button" type="submit">
            Sign out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
