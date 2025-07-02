
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { useDatabase } from "@/hooks/useDatabase";

export function AppHeader() {
  const { currentOrganization, setCurrentOrganization } = useDatabase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" />
        
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">Sistema de Gestão Organizacional</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <OrganizationSelector 
              currentOrganization={currentOrganization}
              onOrganizationChange={setCurrentOrganization}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
