import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Laptop, Edit, Trash } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { Asset } from "@/types";

export const Assets = () => {
  const { getAssets, addAsset, updateAsset, deleteAsset, getPeople, currentOrganization } = useDatabase();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [people, setPeople] = useState(getPeople());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    person_id: ''
  });

  useEffect(() => {
    setAssets(getAssets());
    setPeople(getPeople());
  }, [currentOrganization]);

  const resetForm = () => {
    setFormData({ name: '', serial_number: '', person_id: '' });
  };

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
      resetForm();
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

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      serial_number: asset.serial_number || '',
      person_id: asset.person_id?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAsset) return;
    
    try {
      updateAsset(editingAsset.id, {
        name: formData.name,
        serial_number: formData.serial_number || undefined,
        person_id: formData.person_id ? Number(formData.person_id) : undefined
      });
      
      setAssets(getAssets());
      resetForm();
      setIsEditDialogOpen(false);
      setEditingAsset(null);
      
      toast({
        title: "Ativo atualizado",
        description: `${formData.name} foi atualizado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o ativo.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (asset: Asset) => {
    if (confirm(`Tem certeza que deseja excluir o ativo ${asset.name}?`)) {
      try {
        deleteAsset(asset.id);
        setAssets(getAssets());
        
        toast({
          title: "Ativo excluído",
          description: `${asset.name} foi excluído com sucesso.`
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o ativo.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Laptop className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Ativos</h2>
        </div>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ativo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
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
            <Button type="submit" className="w-full">Atualizar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{asset.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(asset)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(asset)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {asset.serial_number && (
                  <div className="text-sm text-muted-foreground">Série: {asset.serial_number}</div>
                )}
                {asset.person_name ? (
                  <Badge variant="secondary">Associado a: {asset.person_name}</Badge>
                ) : (
                  <Badge variant="outline">Ativo geral</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
