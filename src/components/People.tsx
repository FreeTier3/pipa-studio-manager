
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { Person } from "@/types";

export const People = () => {
  const { getPeople, addPerson, currentOrganization } = useDatabase();
  const { toast } = useToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    manager_id: ''
  });

  useEffect(() => {
    setPeople(getPeople());
  }, [currentOrganization]);

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
      setFormData({ name: '', email: '', position: '', manager_id: '' });
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
        <h2 className="text-2xl font-bold">👤 Pessoas</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person) => (
          <Card key={person.id}>
            <CardHeader>
              <CardTitle className="text-lg">{person.name}</CardTitle>
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
                <div>
                  <span className="text-muted-foreground">Subordinados: </span>
                  <span className="font-medium">{person.subordinates_count || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ativos: </span>
                  <span className="font-medium">{person.assets_count || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Licenças: </span>
                  <span className="font-medium">{person.licenses_count || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Documentos: </span>
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
