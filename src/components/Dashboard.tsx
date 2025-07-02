
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDatabase } from "@/hooks/useDatabase";
import { useState, useEffect } from "react";
import type { DashboardStats } from "@/types";

export const Dashboard = () => {
  const { getDashboardStats, currentOrganization } = useDatabase();
  const [stats, setStats] = useState<DashboardStats>({ recent_people: [], recent_assets: [], expiring_licenses: [] });

  useEffect(() => {
    setStats(getDashboardStats());
  }, [currentOrganization]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Últimas pessoas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">👥 Últimas pessoas adicionadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recent_people.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma pessoa adicionada recentemente</p>
            ) : (
              stats.recent_people.map((person) => (
                <div key={person.id} className="flex flex-col gap-1 p-3 border rounded-lg">
                  <span className="font-medium">{person.name}</span>
                  <span className="text-sm text-muted-foreground">{person.email}</span>
                  {person.position && (
                    <Badge variant="secondary" className="text-xs w-fit">{person.position}</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Últimos ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🖥️ Últimos ativos adicionados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recent_assets.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum ativo adicionado recentemente</p>
            ) : (
              stats.recent_assets.map((asset) => (
                <div key={asset.id} className="flex flex-col gap-1 p-3 border rounded-lg">
                  <span className="font-medium">{asset.name}</span>
                  {asset.serial_number && (
                    <span className="text-sm text-muted-foreground">SN: {asset.serial_number}</span>
                  )}
                  {asset.person_name && (
                    <span className="text-sm text-blue-600">Atribuído a: {asset.person_name}</span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Licenças vencendo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📅 Licenças com vencimento próximo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.expiring_licenses.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma licença vencendo nos próximos 30 dias</p>
            ) : (
              stats.expiring_licenses.map((license) => (
                <div key={license.id} className="flex flex-col gap-1 p-3 border rounded-lg border-orange-200 bg-orange-50">
                  <span className="font-medium">{license.name}</span>
                  <span className="text-sm text-orange-600">
                    Vence em: {new Date(license.expiry_date!).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">{license.used_seats}/{license.total_seats} seats usados</Badge>
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
