import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";

interface Question {
  id?: string;
  orden: number;
  texto: string;
  tipo: string;
  opciones: string[];
}

const CreateEditTest = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [preguntas, setPreguntas] = useState<Question[]>([
    { orden: 1, texto: "", tipo: "likert", opciones: ["1", "2", "3", "4", "5"] }
  ]);

  useEffect(() => {
    if (testId) {
      loadTest();
    }
  }, [testId]);

  const loadTest = async () => {
    try {
      const { data: test, error: testError } = await supabase
        .from('tests_psicologicos')
        .select('*')
        .eq('id', testId)
        .single();

      if (testError) throw testError;

      setNombre(test.nombre);
      setDescripcion(test.descripcion || "");

      const { data: questions, error: questionsError } = await supabase
        .from('preguntas_test')
        .select('*')
        .eq('test_id', testId)
        .order('orden');

      if (questionsError) throw questionsError;

      if (questions && questions.length > 0) {
        setPreguntas(questions.map(q => ({
          id: q.id,
          orden: q.orden,
          texto: q.texto,
          tipo: q.tipo,
          opciones: Array.isArray(q.opciones) ? q.opciones as string[] : ["1", "2", "3", "4", "5"]
        })));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el test",
        variant: "destructive"
      });
      navigate('/psicologo/tests');
    }
  };

  const addQuestion = () => {
    setPreguntas([
      ...preguntas,
      { orden: preguntas.length + 1, texto: "", tipo: "likert", opciones: ["1", "2", "3", "4", "5"] }
    ]);
  };

  const removeQuestion = (index: number) => {
    const newPreguntas = preguntas.filter((_, i) => i !== index);
    setPreguntas(newPreguntas.map((p, i) => ({ ...p, orden: i + 1 })));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newPreguntas = [...preguntas];
    newPreguntas[index] = { ...newPreguntas[index], [field]: value };
    setPreguntas(newPreguntas);
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del test es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (preguntas.length === 0 || preguntas.some(p => !p.texto.trim())) {
      toast({
        title: "Error",
        description: "Debes agregar al menos una pregunta con texto",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      let finalTestId = testId;

      if (testId) {
        // Actualizar test existente
        const { error: updateError } = await supabase
          .from('tests_psicologicos')
          .update({ nombre, descripcion })
          .eq('id', testId);

        if (updateError) throw updateError;

        // Eliminar preguntas antiguas
        const { error: deleteError } = await supabase
          .from('preguntas_test')
          .delete()
          .eq('test_id', testId);

        if (deleteError) throw deleteError;
      } else {
        // Crear nuevo test
        const { data: newTest, error: insertError } = await supabase
          .from('tests_psicologicos')
          .insert({
            psicologo_id: user.id,
            nombre,
            descripcion
          })
          .select()
          .single();

        if (insertError) throw insertError;
        finalTestId = newTest.id;
      }

      // Insertar preguntas
      const { error: questionsError } = await supabase
        .from('preguntas_test')
        .insert(
          preguntas.map(p => ({
            test_id: finalTestId,
            orden: p.orden,
            texto: p.texto,
            tipo: p.tipo,
            opciones: p.opciones
          }))
        );

      if (questionsError) throw questionsError;

      toast({
        title: "Éxito",
        description: `Test ${testId ? 'actualizado' : 'creado'} correctamente`
      });

      navigate('/psicologo/tests');
    } catch (error: any) {
      toast({
        title: "Error",
        description: `No se pudo ${testId ? 'actualizar' : 'crear'} el test`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/psicologo/tests')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {testId ? 'Editar Test' : 'Crear Nuevo Test'}
            </h1>
            <p className="text-sm text-primary-foreground/80">
              Configura las preguntas y opciones
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Información del Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del Test *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Evaluación de Ansiedad"
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el objetivo de este test"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preguntas</CardTitle>
              <Button onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Pregunta
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {preguntas.map((pregunta, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="min-w-fit">Pregunta {index + 1}</Label>
                        <Input
                          value={pregunta.texto}
                          onChange={(e) => updateQuestion(index, 'texto', e.target.value)}
                          placeholder="Escribe la pregunta aquí"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Escala Likert: 1 (Nada) - 5 (Mucho)
                      </div>
                    </div>
                    {preguntas.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Guardando...' : (testId ? 'Actualizar Test' : 'Crear Test')}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/psicologo/tests')}
          >
            Cancelar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CreateEditTest;