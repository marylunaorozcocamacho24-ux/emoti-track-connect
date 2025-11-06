import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PsychologistSidebar } from "@/components/PsychologistSidebar";
import { FileText, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ClinicalHistoryTemplate {
  id: string;
  nombre: string;
  enfoque_terapeutico: string;
  descripcion: string;
  estructura: any;
  activo: boolean;
  created_at: string;
}

const PsychologistTemplates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ClinicalHistoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ClinicalHistoryTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();

    // Set up realtime subscription for templates
    const channel = supabase
      .channel('templates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plantillas_historia_clinica'
        },
        (payload) => {
          console.log('Template change detected:', payload);
          // Refetch templates when any change occurs
          fetchTemplates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('plantillas_historia_clinica')
        .select('*')
        .eq('activo', true)
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

  const handleViewDetails = (template: ClinicalHistoryTemplate) => {
    setSelectedTemplate(template);
    setDetailDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PsychologistSidebar />
        <main className="flex-1 p-6 space-y-4">
          <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-primary">Plantillas de Historias Clínicas</h1>
                <p className="text-sm text-muted-foreground">Plantillas activas disponibles para uso</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {templates.length} plantilla{templates.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {loading ? (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Cargando plantillas...</p>
              </div>
            </Card>
          ) : templates.length === 0 ? (
            <Card className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay plantillas activas</h3>
              <p className="text-sm text-muted-foreground">
                Las plantillas de historias clínicas estarán disponibles cuando el administrador las active
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="p-5 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-2 hover:border-primary/30">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-lg text-foreground">{template.nombre}</h3>
                        </div>
                        <Badge variant="default" className="mb-3">
                          ✓ Activo
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
                          Ver Estructura
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {selectedTemplate?.nombre}
            </DialogTitle>
            <DialogDescription>
              Estructura de la plantilla de historia clínica
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
                  <Badge variant="default">Activo</Badge>
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
                    <Accordion type="single" collapsible className="w-full">
                      {selectedTemplate.estructura.map((section: any, index: number) => (
                        <AccordionItem key={index} value={`section-${index}`} className="border-border">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <p className="font-semibold text-sm text-foreground">
                                {section.titulo || `Sección ${index + 1}`}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {section.campos?.length || 0} campo{section.campos?.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2 pl-4">
                              {section.campos && section.campos.length > 0 ? (
                                section.campos.map((campo: any, campoIndex: number) => (
                                  <div key={campoIndex} className="flex items-center gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                    <span className="text-foreground/80">{campo.nombre}</span>
                                    <Badge variant="outline" className="text-xs ml-auto">
                                      {campo.tipo || 'texto'}
                                    </Badge>
                                    {campo.requerido && (
                                      <span className="text-xs text-destructive">*</span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground italic">Sin campos definidos</p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
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
    </SidebarProvider>
  );
};

export default PsychologistTemplates;
