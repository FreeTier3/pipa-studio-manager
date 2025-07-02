
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Edit, Trash } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { Team } from "@/types";

export const Teams = () => {
  const { getTeams, addTeam, updateTeam, deleteTeam, currentOrganization } = useDatabase();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    setTeams(getTeams());
  }, [currentOrganization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addTeam(teamName);
      setTeams(getTeams());
      setTeamName('');
      setIsDialogOpen(false);
      
      toast({
        title: "Time criado",
        description: `${teamName} foi criado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o time.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTeam) return;
    
    try {
      updateTeam(editingTeam.id, teamName);
      setTeams(getTeams());
      setTeamName('');
      setIsEditDialogOpen(false);
      setEditingTeam(null);
      
      toast({
        title: "Time atualizado",
        description: `${teamName} foi atualizado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o time.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (team: Team) => {
    if (confirm(`Tem certeza que deseja excluir o time ${team.name}?`)) {
      try {
        deleteTeam(team.id);
        setTeams(getTeams());
        
        toast({
          title: "Time excluído",
          description: `${team.name} foi excluído com sucesso.`
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o time.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Times</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Criar Time</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Time</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nome do time"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Criar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Time</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              placeholder="Nome do time"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">Atualizar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(team)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {team.members.length} {team.members.length === 1 ? 'membro' : 'membros'}
                </div>
                
                <div className="space-y-2">
                  {team.members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum membro neste time</p>
                  ) : (
                    team.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 border rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{member.name}</div>
                          {member.position && (
                            <div className="text-xs text-muted-foreground truncate">{member.position}</div>
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
