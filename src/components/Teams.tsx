
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { Team } from "@/types";

export const Teams = () => {
  const { getTeams, addTeam, currentOrganization } = useDatabase();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">👥 Times</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="text-lg">{team.name}</CardTitle>
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
