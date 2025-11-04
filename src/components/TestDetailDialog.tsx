import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Users, Clock, ListChecks, Target } from "lucide-react";

interface Question {
  id: string;
  texto: string;
  tipo: string;
  orden: number;
  opciones?: any;
}

interface TestDetail {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  created_at: string;
  config_ia?: any;
}

interface TestDetailDialogProps {
  test: TestDetail | null;
  questions: Question[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TestDetailDialog = ({ test, questions, open, onOpenChange }: TestDetailDialogProps) => {
  if (!test) return null;

  const config = test.config_ia || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">{test.nombre}</DialogTitle>
            <Badge variant={test.activo ? "default" : "secondary"} className="ml-2">
              {test.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Descripción General */}
          {test.descripcion && (
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <p className="text-sm text-foreground/80 leading-relaxed">{test.descripcion}</p>
            </Card>
          )}

          {/* Información del Test */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Objetivos</p>
                  <p className="text-sm font-semibold text-foreground">
                    {config.objetivos || 'Evaluación psicológica general'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Población</p>
                  <p className="text-sm font-semibold text-foreground">
                    {config.poblacion || 'Todas las edades'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Método</p>
                  <p className="text-sm font-semibold text-foreground">
                    {config.metodo || 'Autoevaluación'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-secondary/5 to-accent/10 border-secondary/20">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Tiempo estimado</p>
                  <p className="text-sm font-semibold text-foreground">
                    {config.tiempo || '10-15 min'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tipo de Respuesta */}
          <Card className="p-4 bg-gradient-to-br from-accent/5 to-secondary/10 border-accent/20">
            <div className="flex items-center gap-3">
              <ListChecks className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Tipo de respuesta</p>
                <p className="text-sm font-semibold text-foreground">
                  {config.tipo_respuesta || 'Escala Likert (1-5)'}
                </p>
              </div>
            </div>
          </Card>

          <Separator className="my-4" />

          {/* Preguntas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Preguntas del Test
              </h3>
              <Badge variant="outline">{questions.length} pregunta{questions.length !== 1 ? 's' : ''}</Badge>
            </div>

            {questions.length === 0 ? (
              <Card className="p-6 text-center bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Este test aún no tiene preguntas configuradas.
                </p>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {questions.map((question, index) => (
                  <Card key={question.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium leading-relaxed">{question.texto}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {question.tipo === 'likert' ? 'Escala Likert' : 
                             question.tipo === 'boolean' ? 'Verdadero/Falso' : 
                             question.tipo === 'multiple' ? 'Opción múltiple' : 
                             'Texto abierto'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Creado el {new Date(test.created_at).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestDetailDialog;
