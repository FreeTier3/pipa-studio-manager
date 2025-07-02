
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Shield, edit, Trash } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { License } from "@/types";

export const Licenses = () => {
  const { getLicenses, addLicense, updateLicense, deleteLicense, currentOrganization } = useDatabase();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
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
        ...formData,
        access_link: formData.access_link || undefined,
        access_password: formData.access_password || undefined,
        code: formData.code || undefined,
        expiry_date: formData.expiry_date || undefined
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
        ...formData,
        access_link: formData.access_link || undefined,
        access_password: formData.access_password || undefined,
        code: formData.code || undefined,
        expiry_date: formData.expiry_date || undefined
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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência.`
    });
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', text: 'Vencida', variant: 'destructive' as const };
    if (diffDays <= 30) return { status: 'expiring', text: `Vence em ${diffDays} dias`, variant: 'secondary' as const };
    return { status: 'active', text: `Vence em ${Math.floor(diffDays / 30)} meses`, variant: 'outline' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Licenças</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Licença</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
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
                type="password"
                placeholder="Senha de acesso"
                value={formData.access_password}
                onChange={(e) => setFormData({ ...formData, access_password: e.target.value })}
              />
              <Input
                placeholder="Código (opcional)"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Total de seats"
                min="1"
                value={formData.total_seats}
                onChange={(e) => setFormData({ ...formData, total_seats: Number(e.target.value) })}
                required
              />
              <Input
                type="date"
                placeholder="Data de vencimento"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
              <Button type="submit" className="w-full">Adicionar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
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
              type="password"
              placeholder="Senha de acesso"
              value={formData.access_password}
              onChange={(e) => setFormData({ ...formData, access_password: e.target.value })}
            />
            <Input
              placeholder="Código (opcional)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Total de seats"
              min="1"
              value={formData.total_seats}
              onChange={(e) => setFormData({ ...formData, total_seats: Number(e.target.value) })}
              required
            />
            <Input
              type="date"
              placeholder="Data de vencimento"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
            <Button type="submit" className="w-full">Atualizar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {licenses.map((license) => {
          const expiryStatus = getExpiryStatus(license.expiry_date);
          
          return (
            <Card key={license.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{license.name}</CardTitle>
                    {expiryStatus && (
                      <Badge variant={expiryStatus.variant}>{expiryStatus.text}</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(license)}
                    >
                      <edit className="h-4 w-4" />
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
              <CardContent className="space-y-4">
                {license.access_link && (
                  <div>
                    <label className="text-sm text-muted-foreground">Link de acesso:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <a 
                        href={license.access_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex-1 truncate text-sm"
                      >
                        {license.access_link}
                      </a>
                    </div>
                  </div>
                )}
                
                {license.access_password && (
                  <div>
                    <label className="text-sm text-muted-foreground">Senha:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex-1 text-sm font-mono">••••••••</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(license.access_password!, "Senha")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {license.code && (
                  <div>
                    <label className="text-sm text-muted-foreground">Código:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex-1 text-sm font-mono">{license.code}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(license.code!, "Código")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Seats:</span>
                    <Badge variant="outline">{license.used_seats}/{license.total_seats}</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {license.seats.slice(0, 3).map((seat, index) => (
                      <div key={seat.id} className="text-xs p-2 border rounded">
                        <span className="text-muted-foreground">Seat {index + 1}: </span>
                        <span>{seat.person_name || 'Disponível'}</span>
                      </div>
                    ))}
                    {license.seats.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{license.seats.length - 3} seats adicionais
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
