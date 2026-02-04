"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  HardHat,
  Wallet,
  MessageCircle,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Smartphone,
  CreditCard,
  Package,
  Building2,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/dashboard/clientes", icon: Users },
  { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { label: "Ordens de Servico", href: "/dashboard/ordens", icon: ClipboardList },
  { label: "Tecnicos", href: "/dashboard/tecnicos", icon: HardHat },
  { label: "Financeiro", href: "/dashboard/financeiro", icon: Wallet },
  { label: "Comunicacao", href: "/dashboard/comunicacao", icon: MessageCircle },
  { label: "Cobrancas", href: "/dashboard/cobrancas", icon: CreditCard },
  { label: "Estoque", href: "/dashboard/estoque", icon: Package },
  { label: "Filiais", href: "/dashboard/filiais", icon: Building2 },
  { label: "App Tecnico", href: "/dashboard/tecnico-app", icon: Smartphone },
  { label: "Configuracoes", href: "/dashboard/configuracoes", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/clientes": "Clientes",
  "/dashboard/agenda": "Agenda",
  "/dashboard/ordens": "Ordens de Servico",
  "/dashboard/tecnicos": "Tecnicos",
  "/dashboard/financeiro": "Financeiro",
  "/dashboard/comunicacao": "Comunicacao",
  "/dashboard/cobrancas": "Cobrancas",
  "/dashboard/estoque": "Estoque",
  "/dashboard/filiais": "Filiais",
  "/dashboard/tecnico-app": "App Tecnico",
  "/dashboard/configuracoes": "Configuracoes",
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const user = session?.user as any;
  const currentTitle = pageTitles[pathname] || "Dashboard";

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-dark-950 border-r border-dark-800
          flex flex-col transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-dark-800 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-white whitespace-nowrap">
              ServiPro
            </span>
          )}
          {/* Close on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-dark-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors relative group
                  ${
                    isActive
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-dark-400 hover:text-white hover:bg-dark-800/60"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-brand-500" />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-dark-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-dark-700">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex px-3 py-2 border-t border-dark-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/60 transition-colors text-sm"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>

        {/* User info */}
        <div className="border-t border-dark-800 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user?.name || "Usuario"}
                </div>
                <div className="text-xs text-dark-500 truncate">
                  {user?.role === "admin" ? "Administrador" : "Usuario"}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-dark-500 hover:text-red-400 transition-colors flex-shrink-0"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-dark-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
            {user?.tenantNome && (
              <span className="hidden sm:block text-xs text-dark-500 bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-700">
                {user.tenantNome}
              </span>
            )}
            <button className="relative text-dark-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Onboarding Banner */}
        {user && !user.onboardingCompleto && !bannerDismissed && pathname !== "/dashboard/onboarding" && (
          <div className="mx-4 sm:mx-6 mt-4">
            <div className="relative bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Complete seu cadastro
                  </p>
                  <p className="text-xs text-dark-400">
                    Configure sua empresa, adicione tecnicos e clientes para comecar a usar o sistema.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href="/dashboard/onboarding"
                  className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap"
                >
                  Configurar
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="text-dark-500 hover:text-dark-300 transition-colors p-1"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
