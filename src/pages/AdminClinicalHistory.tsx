import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, FileText, Eye, BookOpen } from "lucide-react";
import { SeedClinicalHistoryButton } from "@/components/SeedClinicalHistoryButton";
import { CreateEditClinicalHistoryDialog } from "@/components/CreateEditClinicalHistoryDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClinicalHistoryTemplate {
  id: string;
  nombre: string;
  enfoque_terapeutico: string;
  descripcion: string;
  estructura: any;
  activo: boolean;
  created_at: string;
}

const AdminClinicalHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ClinicalHistoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ClinicalHistoryTemplate | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ClinicalHistoryTemplate | null>(null);
  const [createEditDialogOpen, setCreateEditDialogOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<ClinicalHistoryTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('plantillas_historia_clinica')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const { error } = await supabase
        .from('plantillas_historia_clinica')
        .delete()
        .eq('id', templateToDelete.id);

      if (error) throw error;

      toast({
        title: "Plantilla eliminada",
        description: "La plantilla ha sido eliminada correctamente",
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleToggleActive = async (template: ClinicalHistoryTemplate) => {
    try {
      const { error } = await supabase
        .from('plantillas_historia_clinica')
        .update({ activo: !template.activo })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Plantilla actualizada",
        description: `La plantilla ha sido ${!template.activo ? 'activada' : 'desactivada'}`,
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la plantilla",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (template: ClinicalHistoryTemplate) => {
    setSelectedTemplate(template);
    setDetailDialogOpen(true);
  };

  const handleEdit = (template: ClinicalHistoryTemplate) => {
    setTemplateToEdit(template);
    setCreateEditDialogOpen(true);
  };

  const handleCreateNew = () => {
    setTemplateToEdit(null);
    setCreateEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted">Cargando plantillas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground p-6 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="mb-4 hover:bg-background/10 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestión de Historias Clínicas</h1>
                <p className="text-sm opacity-90">Plantillas de historias clínicas disponibles para psicólogos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Plantillas Disponibles</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona las plantillas de historias clínicas del sistema
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SeedClinicalHistoryButton onSuccess={fetchTemplates} />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {templates.length} plantilla{templates.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.length === 0 ? (
            <Card className="col-span-full p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay plantillas creadas todavía</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Comienza creando tu primera plantilla de historia clínica para el sistema
              </p>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="p-5 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/30">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg text-foreground">{template.nombre}</h3>
                      </div>
                      <Badge variant={template.activo ? "default" : "secondary"} className="mb-3">
                        {template.activo ? '✓ Activo' : '○ Inactivo'}
                      </Badge>
                      {template.enfoque_terapeutico && (
                        <div className="mb-2">
                          <Badge variant="outline" className="bg-secondary/10">
                            {template.enfoque_terapeutico}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {template.descripcion && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {template.descripcion}
                    </p>
                  )}

                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-4">
                      📅 Creado: {new Date(template.created_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(template)}
                        className="flex-1 min-w-[120px] hover:bg-primary/10 hover:border-primary/50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                        className="hover:bg-accent/10 hover:border-accent/50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(template)}
                        className="hover:bg-secondary/10 hover:border-secondary/50"
                      >
                        {template.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setTemplateToDelete(template);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={handleCreateNew}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl gradient-button border-0 hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Create/Edit Dialog */}
      <CreateEditClinicalHistoryDialog
        open={createEditDialogOpen}
        onOpenChange={setCreateEditDialogOpen}
        template={templateToEdit}
        onSuccess={fetchTemplates}
      />

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {selectedTemplate?.nombre}
            </DialogTitle>
            <DialogDescription>
              Detalles de la plantilla de historia clínica
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Enfoque Terapéutico</p>
                  <p className="text-base text-foreground">{selectedTemplate.enfoque_terapeutico || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Estado</p>
                  <Badge variant={selectedTemplate.activo ? "default" : "secondary"}>
                    {selectedTemplate.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Descripción</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedTemplate.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Estructura de la Plantilla</p>
                <Card className="p-4 bg-muted/30">
                  {selectedTemplate.estructura && selectedTemplate.estructura.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTemplate.estructura.map((section: any, index: number) => (
                        <div key={index} className="p-3 bg-background rounded-lg border">
                          <p className="font-semibold text-sm">{section.titulo || `Sección ${index + 1}`}</p>
                          {section.campos && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {section.campos.length} campo(s)
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin estructura definida</p>
                  )}
                </Card>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar "{templateToDelete?.nombre}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminClinicalHistory;
