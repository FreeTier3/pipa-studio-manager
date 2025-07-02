
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";

interface OrganizationSelectorProps {
  currentOrganization: number;
  onOrganizationChange: (organizationId: number) => void;
}

export const OrganizationSelector = ({ currentOrganization, onOrganizationChange }: OrganizationSelectorProps) => {
  const { getOrganizations, addOrganization } = useDatabase();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState(getOrganizations());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const currentOrg = organizations.find(org => org.id === currentOrganization);

  const handleAddOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOrgName.trim()) return;
    
    try {
      const result = addOrganization(newOrgName);
      const updatedOrgs = getOrganizations();
      setOrganizations(updatedOrgs);
      
      // Selecionar a nova organização
      if (result.lastInsertRowid) {
        onOrganizationChange(result.lastInsertRowid as number);
      }
      
      setNewOrgName('');
      setIsDialogOpen(false);
      
      toast({
        title: "Organização criada",
        description: `${newOrgName} foi criada com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a organização.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-gray-500" />
      <Select 
        value={currentOrganization.toString()} 
        onValueChange={(value) => onOrganizationChange(Number(value))}
      >
        <SelectTrigger className="w-48 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
          <SelectValue>
            {currentOrg?.name || "Selecionar organização"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id.toString()}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Organização</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrganization} className="space-y-4">
            <Input
              placeholder="Nome da organização"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">Criar Organização</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
