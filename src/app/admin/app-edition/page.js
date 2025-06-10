import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import LogOut from "./LogOut";

export default function EditionPage() {
  const signOut = async () => {
    "use server";
    cookies().delete("SG_token");
    redirect("/");
  };
  return (
    <>
      <div>l&apos;éditeur</div>
      <LogOut signOut={signOut} />
      <Link
        href="/admin/app-edition/actionouverite"
        className="w-1/3 text-center border border-blue-300 bg-blue-100"
      >
        Action ou Vérité
      </Link>
      <Link
        href="/admin/app-edition/undercover"
        className="w-1/3 text-center border border-blue-300 bg-blue-100"
      >
        Undercover
      </Link>
      <Link
        href="/admin/app-edition/ptitbac"
        className="w-1/3 text-center border border-blue-300 bg-blue-100"
      >
        P&apos;tit bac
      </Link>
      <Link
        href="/admin/app-edition/drawing"
        className="w-1/3 text-center border border-blue-300 bg-blue-100"
      >
        Dessin
      </Link>
      <Link
        href="/admin/app-edition/triaction"
        className="w-1/3 text-center border border-blue-300 bg-blue-100"
      >
        Triaction
      </Link>
      <Link
        href="/admin/app-edition/admin-addFriend"
        className="w-1/3 text-center border border-blue-300 bg-blue-100"
      >
        Ajout d&apos;amis
      </Link>
    </>
  );
}
