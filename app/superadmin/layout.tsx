'use client';

import { RequireSuperAdmin } from '@/components/auth/RequirePermission';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Users, UserCog, FileText, Car } from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireSuperAdmin redirectTo="/sin-acceso">
      <div className="min-h-screen bg-muted/30">
        <SuperAdminNav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </RequireSuperAdmin>
  );
}

function SuperAdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/superadmin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/superadmin/roles', label: 'Roles', icon: UserCog },
    { href: '/superadmin/auditoria', label: 'Auditoría', icon: FileText },
    { href: '/movilidad', label: 'Ir a Movilidad', icon: Car },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none">SuperAdmin</h1>
                <p className="text-xs text-muted-foreground">Panel de administración</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-1 -mb-px">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-primary hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
