
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Edit, Trash, Upload } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@/types";

export const Documents = () => {
  const { getDocuments, addDocument, updateDocument, deleteDocument, getPeople, currentOrganization, uploadDocument } = useDatabase();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [people, setPeople] = useState(getPeople());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    file_path: '',
    person_id: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDocuments(getDocuments());
    setPeople(getPeople());
  }, [currentOrganization]);

  const resetForm = () => {
    setFormData({ name: '', file_path: '', person_id: '' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Erro",
        description: "Apenas arquivos PDF são permitidos.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const filePath = await uploadDocument(file, formData.person_id ? Number(formData.person_id) : undefined);
      setFormData(prev => ({ 
        ...prev, 
        file_path: filePath,
        name: prev.name || file.name.replace('.pdf', '')
      }));
      
      toast({
        title: "Upload concluído",
        description: "Arquivo carregado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar o arquivo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file_path) {
      toast({
        title: "Erro",
        description: "É necessário fazer upload de um arquivo PDF.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      addDocument({
        organization_id: currentOrganization,
        name: formData.name,
        file_path: formData.file_path,
        person_id: formData.person_id ? Number(formData.person_id) : undefined
      });
      
      setDocuments(getDocuments());
      resetForm();
      setIsDialogOpen(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      name: document.name,
      file_path: document.file_path,
      person_id: document.person_id?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDocument) return;
    
    try {
      updateDocument(editingDocument.id, {
        name: formData.name,
        file_path: formData.file_path,
        person_id: formData.person_id ? Number(formData.person_id) : undefined
      });
      
      setDocuments(getDocuments());
      resetForm();
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      
      toast({
        title: "Documento atualizado",
        description: `${formData.name} foi atualizado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o documento.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (document: Document) => {
    if (confirm(`Tem certeza que deseja excluir ${document.name}?`)) {
      try {
        deleteDocument(document.id);
        setDocuments(getDocuments());
        
        // Remover arquivo do localStorage
        localStorage.removeItem(`document_${document.file_path}`);
        
        toast({
          title: "Documento excluído",
          description: `${document.name} foi excluído com sucesso.`
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o documento.",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileDownload = (filePath: string, fileName: string) => {
    const fileData = localStorage.getItem(`document_${filePath}`);
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      link.click();
      
      toast({
        title: "Download iniciado",
        description: `Download de ${fileName} iniciado.`
      });
    } else {
      toast({
        title: "Erro",
        description: "Arquivo não encontrado.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
        </div>
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload PDF</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    required={!formData.file_path}
                  />
                  {isUploading && <span className="text-sm text-gray-500">Carregando...</span>}
                  {formData.file_path && <Upload className="h-4 w-4 text-green-500" />}
                </div>
              </div>
              
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
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? 'Carregando...' : 'Adicionar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              placeholder="Nome do documento"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Button type="submit" className="w-full">Atualizar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{document.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(document)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(document)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFileDownload(document.file_path, document.name)}
                >
                  <FileText className="h-4 w-4 mr-1" /> Visualizar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFileDownload(document.file_path, document.name)}
                >
                  Baixar
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
