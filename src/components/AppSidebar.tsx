
import { Home, Users, UserGroup, Shield, Laptop, FileText } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Pessoas", url: "/people", icon: Users },
  { title: "Times", url: "/teams", icon: UserGroup },
  { title: "Licenças", url: "/licenses", icon: Shield },
  { title: "Ativos", url: "/assets", icon: Laptop },
  { title: "Documentos", url: "/documents", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-lg font-bold text-white">PS</span>
          </div>
          {state === "expanded" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pipa Studios</h2>
              <p className="text-sm text-gray-500">Sistema de Gestão</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={`
                      group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                      ${
                        isActive(item.url)
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3 w-full">
                      <item.icon
                        className={`h-5 w-5 transition-colors ${
                          isActive(item.url) ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      />
                      {state === "expanded" && (
                        <span className="transition-colors">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
