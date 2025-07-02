import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Edit, Trash } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { License } from "@/types";

export const Licenses = () => {
  const { getLicenses, addLicense, updateLicense, deleteLicense, getPeople, currentOrganization } = useDatabase();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [people, setPeople] = useState(getPeople());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    access_link: '',
    access_password: '',
    code: '',
    total_seats: 1,
    expiry_date: ''
  });

  useEffect(() => {
    setLicenses(getLicenses());
  }, [currentOrganization]);

  const resetForm = () => {
    setFormData({ name: '', access_link: '', access_password: '', code: '', total_seats: 1, expiry_date: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addLicense({
        organization_id: currentOrganization,
        name: formData.name,
        access_link: formData.access_link,
        access_password: formData.access_password,
        code: formData.code,
        total_seats: Number(formData.total_seats),
        expiry_date: formData.expiry_date
      });
      
      setLicenses(getLicenses());
      resetForm();
      setIsDialogOpen(false);
      
      toast({
        title: "Licença adicionada",
        description: `${formData.name} foi adicionada com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a licença.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    setFormData({
      name: license.name,
      access_link: license.access_link || '',
      access_password: license.access_password || '',
      code: license.code || '',
      total_seats: license.total_seats,
      expiry_date: license.expiry_date || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingLicense) return;
    
    try {
      updateLicense(editingLicense.id, {
        name: formData.name,
        access_link: formData.access_link,
        access_password: formData.access_password,
        code: formData.code,
        total_seats: Number(formData.total_seats),
        expiry_date: formData.expiry_date
      });
      
      setLicenses(getLicenses());
      resetForm();
      setIsEditDialogOpen(false);
      setEditingLicense(null);
      
      toast({
        title: "Licença atualizada",
        description: `${formData.name} foi atualizada com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a licença.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (license: License) => {
    if (confirm(`Tem certeza que deseja excluir ${license.name}?`)) {
      try {
        deleteLicense(license.id);
        setLicenses(getLicenses());
        
        toast({
          title: "Licença excluída",
          description: `${license.name} foi excluída com sucesso.`
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a licença.",
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
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Licenças</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Licença</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Licença</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nome da licença"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Link de acesso"
                value={formData.access_link}
                onChange={(e) => setFormData({ ...formData, access_link: e.target.value })}
              />
              <Input
                placeholder="Senha de acesso"
                value={formData.access_password}
                onChange={(e) => setFormData({ ...formData, access_password: e.target.value })}
              />
              <Input
                placeholder="Código da licença"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Total de seats"
                value={formData.total_seats}
                onChange={(e) => setFormData({ ...formData, total_seats: Number(e.target.value) })}
                required
              />
              <Input
                type="date"
                placeholder="Data de expiração"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
              <Button type="submit" className="w-full">Adicionar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Licença</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              placeholder="Nome da licença"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              placeholder="Link de acesso"
              value={formData.access_link}
              onChange={(e) => setFormData({ ...formData, access_link: e.target.value })}
            />
            <Input
              placeholder="Senha de acesso"
              value={formData.access_password}
              onChange={(e) => setFormData({ ...formData, access_password: e.target.value })}
            />
            <Input
              placeholder="Código da licença"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Total de seats"
              value={formData.total_seats}
              onChange={(e) => setFormData({ ...formData, total_seats: Number(e.target.value) })}
              required
            />
            <Input
              type="date"
              placeholder="Data de expiração"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
            <Button type="submit" className="w-full">Atualizar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {licenses.map((license) => (
          <Card key={license.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{license.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(license)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(license)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {license.used_seats} / {license.total_seats} seats usados
                </div>
                
                <div className="space-y-2">
                  {license.seats.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum seat nesta licença</p>
                  ) : (
                    license.seats.map((seat) => (
                      <div key={seat.id} className="flex items-center gap-2 p-2 border rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {seat.person_name ? seat.person_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'Disponível'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{seat.person_name || 'Disponível'}</div>
                          {seat.person_name && (
                            <div className="text-xs text-muted-foreground truncate">
                              Atribuído em: {new Date(seat.assigned_at).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
