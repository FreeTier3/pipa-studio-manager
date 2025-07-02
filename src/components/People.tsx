
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Users, Laptop, Shield, FileText, Trash, edit } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { Person } from "@/types";

export const People = () => {
  const { 
    getPeople, 
    addPerson, 
    updatePerson, 
    deletePerson, 
    currentOrganization 
  } = useDatabase();
  const { toast } = useToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    manager_id: ''
  });

  useEffect(() => {
    setPeople(getPeople());
  }, [currentOrganization]);

  const resetForm = () => {
    setFormData({ name: '', email: '', position: '', manager_id: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addPerson({
        organization_id: currentOrganization,
        name: formData.name,
        email: formData.email,
        position: formData.position || undefined,
        manager_id: formData.manager_id ? Number(formData.manager_id) : undefined
      });
      
      setPeople(getPeople());
      resetForm();
      setIsDialogOpen(false);
      
      toast({
        title: "Pessoa adicionada",
        description: `${formData.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a pessoa.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      email: person.email,
      position: person.position || '',
      manager_id: person.manager_id?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPerson) return;
    
    try {
      updatePerson(editingPerson.id, {
        name: formData.name,
        email: formData.email,
        position: formData.position || undefined,
        manager_id: formData.manager_id ? Number(formData.manager_id) : undefined
      });
      
      setPeople(getPeople());
      resetForm();
      setIsEditDialogOpen(false);
      setEditingPerson(null);
      
      toast({
        title: "Pessoa atualizada",
        description: `${formData.name} foi atualizado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a pessoa.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (person: Person) => {
    if (confirm(`Tem certeza que deseja excluir ${person.name}?`)) {
      try {
        deletePerson(person.id);
        setPeople(getPeople());
        
        toast({
          title: "Pessoa excluída",
          description: `${person.name} foi excluído com sucesso.`
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a pessoa.",
          variant: "destructive"
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "E-mail copiado para a área de transferência."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pessoas</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Pessoa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Pessoa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                placeholder="Cargo"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
              <Select value={formData.manager_id} onValueChange={(value) => setFormData({ ...formData, manager_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Superior imediato (opcional)" />
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
            <DialogTitle>Editar Pessoa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              placeholder="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              placeholder="Cargo"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
            <Select value={formData.manager_id} onValueChange={(value) => setFormData({ ...formData, manager_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Superior imediato (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {people.filter(p => p.id !== editingPerson?.id).map((person) => (
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
        {people.map((person) => (
          <Card key={person.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{person.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(person)}
                  >
                    <edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(person)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground flex-1">{person.email}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(person.email)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              {person.position && (
                <Badge variant="secondary">{person.position}</Badge>
              )}
              
              {person.manager_name && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Superior: </span>
                  <span>{person.manager_name}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{person.subordinates_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Laptop className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{person.assets_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{person.licenses_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{person.documents_count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
