
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDatabase } from "@/hooks/useDatabase";
import { useState, useEffect } from "react";
import { Users, Laptop, Calendar, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";

export const Dashboard = () => {
  const { getDashboardStats, currentOrganization } = useDatabase();
  const [stats, setStats] = useState<DashboardStats>({ recent_people: [], recent_assets: [], expiring_licenses: [] });

  useEffect(() => {
    setStats(getDashboardStats());
  }, [currentOrganization]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos dados organizacionais</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent People */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Últimas pessoas adicionadas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recent_people.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhuma pessoa adicionada recentemente</p>
              </div>
            ) : (
              stats.recent_people.map((person) => (
                <div key={person.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium text-sm">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{person.name}</p>
                    <p className="text-sm text-gray-600 truncate">{person.email}</p>
                    {person.position && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {person.position}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <Laptop className="h-4 w-4 text-green-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Últimos ativos adicionados
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recent_assets.length === 0 ? (
              <div className="text-center py-8">
                <Laptop className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhum ativo adicionado recentemente</p>
              </div>
            ) : (
              stats.recent_assets.map((asset) => (
                <div key={asset.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                    <Laptop className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                    {asset.serial_number && (
                      <p className="text-sm text-gray-600">SN: {asset.serial_number}</p>
                    )}
                    {asset.person_name && (
                      <p className="text-sm text-blue-600 mt-1">Atribuído a: {asset.person_name}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Expiring Licenses */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Licenças com vencimento próximo
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.expiring_licenses.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhuma licença vencendo nos próximos 30 dias</p>
              </div>
            ) : (
              stats.expiring_licenses.map((license) => (
                <div key={license.id} className="p-4 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{license.name}</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Vence em: {new Date(license.expiry_date!).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                          {license.used_seats}/{license.total_seats} seats usados
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
