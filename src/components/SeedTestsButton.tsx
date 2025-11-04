import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";

interface SeedTestsButtonProps {
  onComplete: () => void;
}

const SeedTestsButton = ({ onComplete }: SeedTestsButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const catalogTests = [
    {
      nombre: "Evaluación de Ansiedad EmotiTrack",
      descripcion: "Instrumento para evaluar síntomas de ansiedad en diferentes situaciones cotidianas",
      objetivo: "Medir la intensidad y frecuencia de síntomas relacionados con la ansiedad en adolescentes y adultos",
      poblacion: "Adolescentes a partir de 13 años y adultos",
      metodo_aplicacion: "Autoadministrado con supervisión profesional",
      tiempo_estimado: "10-15 minutos",
      tipo_respuesta: "Escala Likert de 0 a 3 (0=Nada, 1=Levemente, 2=Moderadamente, 3=Severamente)",
      preguntas: [
        "Me siento nervioso(a) o tenso(a)",
        "Siento temor sin razón aparente",
        "Me cuesta trabajo relajarme",
        "Tengo miedo de que pase algo terrible",
        "Me siento inquieto(a) o intranquilo(a)",
        "Siento palpitaciones o latidos rápidos del corazón",
        "Tengo sensaciones de hormigueo o entumecimiento",
        "Me tiemblan las manos",
        "Tengo dificultad para respirar",
        "Siento mareos o vértigo",
        "Sudo excesivamente sin razón física",
        "Me preocupo demasiado por todo",
        "Tengo dificultad para concentrarme",
        "Me siento irritable o de mal humor",
        "Tengo problemas para dormir o quedarme dormido(a)",
        "Evito situaciones que me causan ansiedad",
        "Siento opresión en el pecho",
        "Tengo pensamientos negativos recurrentes",
        "Me cuesta tomar decisiones",
        "Siento que algo malo va a suceder",
        "Me siento abrumado(a) por mis responsabilidades"
      ]
    },
    {
      nombre: "Evaluación de Estado de Ánimo EmotiTrack",
      descripcion: "Herramienta para valorar síntomas relacionados con el estado de ánimo y la depresión",
      objetivo: "Evaluar la presencia e intensidad de síntomas depresivos en adolescentes y adultos",
      poblacion: "Adolescentes a partir de 13 años y adultos",
      metodo_aplicacion: "Autoadministrado con supervisión profesional",
      tiempo_estimado: "10-15 minutos",
      tipo_respuesta: "Escala Likert de 0 a 3 (0=Nunca, 1=A veces, 2=Frecuentemente, 3=Casi siempre)",
      preguntas: [
        "Me siento triste o desanimado(a)",
        "He perdido interés en actividades que antes disfrutaba",
        "Me siento cansado(a) sin razón aparente",
        "Tengo dificultad para concentrarme en tareas",
        "He experimentado cambios en mi apetito",
        "Duermo más o menos de lo habitual",
        "Me siento culpable o inútil",
        "Tengo pensamientos negativos sobre mí mismo(a)",
        "Me cuesta levantarme por las mañanas",
        "Siento que no tengo energía para nada",
        "He perdido o ganado peso sin proponérmelo",
        "Siento que las cosas no mejorarán",
        "Me alejo de amigos y familiares",
        "Lloro con facilidad o sin razón",
        "Me siento vacío(a) por dentro",
        "Tengo dificultad para disfrutar momentos agradables",
        "Me irrito con facilidad",
        "Siento que soy una carga para los demás",
        "He tenido pensamientos sobre la muerte",
        "Me cuesta realizar actividades cotidianas",
        "Siento que nada tiene sentido"
      ]
    },
    {
      nombre: "Escala de Estrés Cotidiano EmotiTrack",
      descripcion: "Evaluación del nivel de estrés percibido en la vida diaria",
      objetivo: "Medir el grado en que las situaciones de la vida son percibidas como estresantes",
      poblacion: "Adolescentes a partir de 15 años y adultos",
      metodo_aplicacion: "Autoadministrado",
      tiempo_estimado: "8-10 minutos",
      tipo_respuesta: "Escala Likert de 0 a 4 (0=Nunca, 1=Casi nunca, 2=A veces, 3=Frecuentemente, 4=Muy frecuentemente)",
      preguntas: [
        "Me he sentido molesto(a) por cosas inesperadas",
        "He sentido que no puedo controlar cosas importantes",
        "Me he sentido nervioso(a) o estresado(a)",
        "He manejado con éxito problemas difíciles",
        "Siento que las cosas van como yo quiero",
        "He podido controlar mi tiempo efectivamente",
        "He sentido que tengo demasiadas cosas por hacer",
        "Me he sentido capaz de manejar mis problemas",
        "Las dificultades se acumulan tanto que no puedo superarlas",
        "Me he sentido confiado(a) en mi capacidad de resolver problemas",
        "He sentido que todo me sale mal",
        "He podido mantener la calma ante situaciones difíciles",
        "Me molesto cuando las cosas están fuera de mi control",
        "Siento que puedo afrontar mis responsabilidades"
      ]
    },
    {
      nombre: "Inventario de Autoestima EmotiTrack",
      descripcion: "Evaluación de la percepción personal y autoestima",
      objetivo: "Medir el nivel de autoestima global y autopercepción positiva",
      poblacion: "Adolescentes a partir de 12 años y adultos",
      metodo_aplicacion: "Autoadministrado",
      tiempo_estimado: "5-8 minutos",
      tipo_respuesta: "Escala Likert de 1 a 4 (1=Totalmente en desacuerdo, 2=En desacuerdo, 3=De acuerdo, 4=Totalmente de acuerdo)",
      preguntas: [
        "Siento que soy una persona valiosa, al menos tanto como los demás",
        "Creo que tengo cualidades positivas",
        "En general, me siento un fracaso (inverso)",
        "Puedo hacer las cosas tan bien como la mayoría de las personas",
        "Siento que no tengo mucho de qué estar orgulloso(a) (inverso)",
        "Tengo una actitud positiva hacia mí mismo(a)",
        "En general, estoy satisfecho(a) conmigo mismo(a)",
        "Me gustaría tener más respeto por mí mismo(a) (inverso)",
        "A veces me siento inútil (inverso)",
        "Creo que soy una buena persona"
      ]
    },
    {
      nombre: "Cuestionario de Bienestar Emocional EmotiTrack",
      descripcion: "Evaluación del estado general de salud mental y bienestar",
      objetivo: "Detectar posibles indicadores de malestar emocional o psicológico",
      poblacion: "Adultos mayores de 18 años",
      metodo_aplicacion: "Autoadministrado",
      tiempo_estimado: "5-7 minutos",
      tipo_respuesta: "Escala Likert de 0 a 3 (0=Mejor que lo habitual, 1=Igual que siempre, 2=Peor que lo habitual, 3=Mucho peor)",
      preguntas: [
        "¿Ha podido concentrarse bien en lo que hace?",
        "¿Ha perdido mucho sueño por preocupaciones?",
        "¿Ha sentido que está desempeñando un papel útil en la vida?",
        "¿Se ha sentido capaz de tomar decisiones?",
        "¿Se ha sentido constantemente agobiado(a) y bajo tensión?",
        "¿Ha sentido que no puede superar sus dificultades?",
        "¿Ha sido capaz de disfrutar sus actividades normales?",
        "¿Ha sido capaz de enfrentarse a sus problemas?",
        "¿Se ha sentido infeliz y deprimido(a)?",
        "¿Ha perdido confianza en sí mismo(a)?",
        "¿Ha pensado que es una persona sin valor?",
        "¿Se siente razonablemente feliz considerando todas las circunstancias?"
      ]
    }
  ];

  const handleSeedTests = async () => {
    setLoading(true);
    try {
      // Verificar si ya existen tests del catálogo
      const { data: existingTests } = await supabase
        .from('tests_psicologicos')
        .select('id')
        .is('psicologo_id', null);

      if (existingTests && existingTests.length > 0) {
        toast({
          title: "Tests ya cargados",
          description: "El catálogo de tests ya ha sido inicializado",
          variant: "default"
        });
        setLoading(false);
        return;
      }

      // Insertar cada test con sus preguntas
      for (const test of catalogTests) {
        const { data: newTest, error: testError } = await supabase
          .from('tests_psicologicos')
          .insert({
            nombre: test.nombre,
            descripcion: test.descripcion,
            objetivo: test.objetivo,
            poblacion: test.poblacion,
            metodo_aplicacion: test.metodo_aplicacion,
            tiempo_estimado: test.tiempo_estimado,
            tipo_respuesta: test.tipo_respuesta,
            activo: true,
            psicologo_id: null // Tests globales del catálogo
          })
          .select()
          .single();

        if (testError) throw testError;

        // Insertar preguntas del test
        const preguntas = test.preguntas.map((pregunta, index) => ({
          test_id: newTest.id,
          orden: index + 1,
          texto: pregunta,
          tipo: 'likert',
          opciones: ['0', '1', '2', '3']
        }));

        const { error: preguntasError } = await supabase
          .from('preguntas_test')
          .insert(preguntas);

        if (preguntasError) throw preguntasError;
      }

      toast({
        title: "¡Catálogo cargado!",
        description: `Se han añadido ${catalogTests.length} tests psicológicos al catálogo`,
      });

      onComplete();
    } catch (error) {
      console.error('Error seeding tests:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tests del catálogo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSeedTests}
      disabled={loading}
      variant="outline"
      className="border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Cargando catálogo...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Cargar Tests del Catálogo
        </>
      )}
    </Button>
  );
};

export default SeedTestsButton;
