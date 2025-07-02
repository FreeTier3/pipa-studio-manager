
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@/types";

export const Documents = () => {
  const { getDocuments, addDocument, getPeople, currentOrganization } = useDatabase();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [people, setPeople] = useState(getPeople());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    file_path: '',
    person_id: ''
  });

  useEffect(() => {
    setDocuments(getDocuments());
    setPeople(getPeople());
  }, [currentOrganization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addDocument({
        organization_id: currentOrganization,
        name: formData.name,
        file_path: formData.file_path,
        person_id: formData.person_id ? Number(formData.person_id) : undefined
      });
      
      setDocuments(getDocuments());
      setFormData({ name: '', file_path: '', person_id: '' });
      setIsDialogOpen(false);
      
      toast({
        title: "Documento adicionado",
        description: `${formData.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o documento.",
        variant: "destructive"
      });
    }
  };

  const handleFileDownload = (filePath: string, fileName: string) => {
    // Simulação de download - em uma aplicação real, seria necessário implementar o upload e armazenamento de arquivos
    toast({
      title: "Download",
      description: `Iniciando download de ${fileName}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📄 Documentos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Documento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nome do documento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Caminho do arquivo PDF"
                value={formData.file_path}
                onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                required
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
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <CardTitle className="text-lg">{document.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFileDownload(document.file_path, document.name)}
                >
                  📄 Visualizar PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFileDownload(document.file_path, document.name)}
                >
                  ⬇️ Baixar
                </Button>
              </div>
              
              {document.person_name ? (
                <Badge variant="secondary">Associado a: {document.person_name}</Badge>
              ) : (
                <Badge variant="outline">Documento geral</Badge>
              )}
              
              <div className="text-xs text-muted-foreground">
                Adicionado em: {new Date(document.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
