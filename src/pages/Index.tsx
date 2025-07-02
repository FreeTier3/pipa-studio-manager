
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationSelector } from '@/components/OrganizationSelector';
import { Dashboard } from '@/components/Dashboard';
import { People } from '@/components/People';
import { Teams } from '@/components/Teams';
import { Licenses } from '@/components/Licenses';
import { Assets } from '@/components/Assets';
import { Documents } from '@/components/Documents';
import { useDatabase } from '@/hooks/useDatabase';

const Index = () => {
  const { currentOrganization, setCurrentOrganization } = useDatabase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Sistema de Gestão Organizacional</h1>
          <OrganizationSelector 
            currentOrganization={currentOrganization}
            onOrganizationChange={setCurrentOrganization}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="people">👤 Pessoas</TabsTrigger>
            <TabsTrigger value="teams">👥 Times</TabsTrigger>
            <TabsTrigger value="licenses">🧾 Licenças</TabsTrigger>
            <TabsTrigger value="assets">💻 Ativos</TabsTrigger>
            <TabsTrigger value="documents">📄 Documentos</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>

            <TabsContent value="people">
              <People />
            </TabsContent>

            <TabsContent value="teams">
              <Teams />
            </TabsContent>

            <TabsContent value="licenses">
              <Licenses />
            </TabsContent>

            <TabsContent value="assets">
              <Assets />
            </TabsContent>

            <TabsContent value="documents">
              <Documents />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
