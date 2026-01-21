'use client';

import { RequireSuperAdmin } from '@/components/auth/RequirePermission';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Users, FileText, ChevronDown, Activity } from 'lucide-react';
import { useState } from 'react';
import { BotonCerrarSesion } from '@/components/logout-button';

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
  const [modulosOpen, setModulosOpen] = useState(false);

  const navItems = [
    { href: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/superadmin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/superadmin/sesiones', label: 'Sesiones', icon: Activity },
    { href: '/superadmin/auditoria', label: 'Auditoría', icon: FileText },
  ];

  const modulos = [
    { href: '/movilidad', label: 'Movilidad', descripcion: 'Gestión de movilidad vehicular' },
    // Agregar más módulos aquí en el futuro
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
          <BotonCerrarSesion />
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

          {/* Dropdown de Módulos */}
          <div className="relative">
            <button
              onClick={() => setModulosOpen(!modulosOpen)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                pathname.startsWith('/movilidad')
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              <span>Módulos</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${modulosOpen ? 'rotate-180' : ''}`} />
            </button>

            {modulosOpen && (
              <>
                {/* Overlay para cerrar */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setModulosOpen(false)}
                />

                {/* Dropdown menu */}
                <div className="absolute top-full left-0 mt-2 w-64 rounded-md border bg-popover shadow-lg z-20">
                  <div className="p-2">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      MÓDULOS DEL SISTEMA
                    </div>
                    {modulos.map((modulo) => (
                      <Link
                        key={modulo.href}
                        href={modulo.href}
                        onClick={() => setModulosOpen(false)}
                        className="flex flex-col gap-0.5 rounded-sm px-2 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <span className="text-sm font-medium">{modulo.label}</span>
                        <span className="text-xs text-muted-foreground">{modulo.descripcion}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
