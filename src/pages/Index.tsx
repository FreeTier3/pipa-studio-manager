
import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Dashboard } from "@/components/Dashboard";
import { People } from "@/components/People";
import { Teams } from "@/components/Teams";
import { Licenses } from "@/components/Licenses";
import { Assets } from "@/components/Assets";
import { Documents } from "@/components/Documents";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <AppHeader />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/people" element={<People />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/licenses" element={<Licenses />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/documents" element={<Documents />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
