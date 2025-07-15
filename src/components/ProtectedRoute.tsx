"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Props = {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "editor")[];
};

type AdminRole = "admin" | "editor";

interface AdminData {
  role: AdminRole;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["admin"],
}: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: admin, error } = await supabase
        .from("admins")
        .select("role")
        .eq("id", user.id)
        .single<AdminData>();

      if (error || !admin || !allowedRoles.includes(admin.role)) {
        router.replace("/unauthorized");
        return;
      }

      setIsAuthorized(true);
    };

    checkAccess();
  }, [router, supabase, allowedRoles]);

  if (isAuthorized === null) {
    return <div className="p-8">Cargando...</div>;
  }

  return <>{children}</>;
}
