'use client';

import { RequireSuperAdmin } from '@/components/auth/RequirePermission';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireSuperAdmin redirectTo="/sin-acceso">
      <div className="min-h-screen bg-gray-50">
        <SuperAdminNav />
        <main>{children}</main>
      </div>
    </RequireSuperAdmin>
  );
}

function SuperAdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/superadmin/roles', label: 'Gestión de Roles' },
    { href: '/movilidad', label: 'Ir a Movilidad' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="font-bold text-lg">SuperAdmin Panel</div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm ${
                  pathname === item.href
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
