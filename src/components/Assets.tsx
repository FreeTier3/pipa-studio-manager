
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { Asset } from "@/types";

export const Assets = () => {
  const { getAssets, addAsset, getPeople, currentOrganization } = useDatabase();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [people, setPeople] = useState(getPeople());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    person_id: ''
  });

  useEffect(() => {
    setAssets(getAssets());
    setPeople(getPeople());
  }, [currentOrganization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addAsset({
        organization_id: currentOrganization,
        name: formData.name,
        serial_number: formData.serial_number || undefined,
        person_id: formData.person_id ? Number(formData.person_id) : undefined
      });
      
      setAssets(getAssets());
      setFormData({ name: '', serial_number: '', person_id: '' });
      setIsDialogOpen(false);
      
      toast({
        title: "Ativo adicionado",
        description: `${formData.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o ativo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">💻 Ativos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Ativo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Ativo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nome do ativo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Número de série (opcional)"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              />
              <Select value={formData.person_id} onValueChange={(value) => setFormData({ ...formData, person_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pessoa associada (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">Adicionar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardHeader>
              <CardTitle className="text-lg">{asset.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {asset.serial_number && (
                <div>
                  <span className="text-sm text-muted-foreground">Número de série: </span>
                  <span className="text-sm font-mono">{asset.serial_number}</span>
                </div>
              )}
              
              {asset.person_name ? (
                <Badge variant="secondary">Atribuído a: {asset.person_name}</Badge>
              ) : (
                <Badge variant="outline">Disponível</Badge>
              )}
              
              <div className="text-xs text-muted-foreground">
                Adicionado em: {new Date(asset.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
