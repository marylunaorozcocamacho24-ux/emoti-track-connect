import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import { useState } from "react";

const CLINICAL_HISTORY_TEMPLATES = [
  {
    nombre: "Historia Clínica Estándar (General)",
    enfoque_terapeutico: "General",
    descripcion: "Plantilla base obligatoria que incluye información general del paciente, motivo de consulta, antecedentes personales y familiares, historia del problema actual, observaciones clínicas y plan de intervención.",
    estructura: [
      {
        titulo: "Información General del Paciente",
        campos: [
          { nombre: "Nombre completo", tipo: "texto", requerido: true },
          { nombre: "Fecha de nacimiento", tipo: "fecha", requerido: true },
          { nombre: "Edad", tipo: "numero", requerido: true },
          { nombre: "Género", tipo: "texto", requerido: false },
          { nombre: "Estado civil", tipo: "texto", requerido: false },
          { nombre: "Ocupación", tipo: "texto", requerido: false },
          { nombre: "Dirección", tipo: "texto", requerido: false },
          { nombre: "Teléfono de contacto", tipo: "texto", requerido: true }
        ]
      },
      {
        titulo: "Motivo de Consulta",
        campos: [
          { nombre: "Descripción del problema principal", tipo: "textarea", requerido: true },
          { nombre: "Duración del problema", tipo: "texto", requerido: false },
          { nombre: "Evento desencadenante", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Antecedentes Personales",
        campos: [
          { nombre: "Enfermedades médicas previas", tipo: "textarea", requerido: false },
          { nombre: "Tratamientos psicológicos previos", tipo: "textarea", requerido: false },
          { nombre: "Tratamientos psiquiátricos previos", tipo: "textarea", requerido: false },
          { nombre: "Medicación actual", tipo: "textarea", requerido: false },
          { nombre: "Consumo de sustancias", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Antecedentes Familiares",
        campos: [
          { nombre: "Historia psiquiátrica familiar", tipo: "textarea", requerido: false },
          { nombre: "Dinámica familiar actual", tipo: "textarea", requerido: false },
          { nombre: "Relaciones significativas", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Historia del Problema Actual",
        campos: [
          { nombre: "Evolución del problema", tipo: "textarea", requerido: true },
          { nombre: "Factores precipitantes", tipo: "textarea", requerido: false },
          { nombre: "Factores mantenedores", tipo: "textarea", requerido: false },
          { nombre: "Intentos previos de solución", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Observaciones Clínicas",
        campos: [
          { nombre: "Apariencia general", tipo: "textarea", requerido: false },
          { nombre: "Estado de ánimo", tipo: "texto", requerido: false },
          { nombre: "Afecto", tipo: "texto", requerido: false },
          { nombre: "Pensamiento", tipo: "textarea", requerido: false },
          { nombre: "Orientación", tipo: "texto", requerido: false },
          { nombre: "Memoria", tipo: "texto", requerido: false }
        ]
      },
      {
        titulo: "Plan de Intervención",
        campos: [
          { nombre: "Diagnóstico provisional", tipo: "textarea", requerido: false },
          { nombre: "Objetivos terapéuticos", tipo: "textarea", requerido: true },
          { nombre: "Estrategias de intervención", tipo: "textarea", requerido: true },
          { nombre: "Frecuencia de sesiones", tipo: "texto", requerido: false },
          { nombre: "Seguimiento y evaluación", tipo: "textarea", requerido: false }
        ]
      }
    ],
    activo: true
  },
  {
    nombre: "Historia Clínica – Enfoque Cognitivo-Conductual",
    enfoque_terapeutico: "Cognitivo-Conductual",
    descripcion: "Plantilla orientada al análisis funcional de conductas, pensamientos automáticos, creencias irracionales y esquemas cognitivos.",
    estructura: [
      {
        titulo: "Datos de Identificación",
        campos: [
          { nombre: "Nombre completo", tipo: "texto", requerido: true },
          { nombre: "Edad", tipo: "numero", requerido: true },
          { nombre: "Ocupación", tipo: "texto", requerido: false },
          { nombre: "Fecha de primera consulta", tipo: "fecha", requerido: true }
        ]
      },
      {
        titulo: "Motivo de Consulta y Demanda",
        campos: [
          { nombre: "Problema presentado", tipo: "textarea", requerido: true },
          { nombre: "Expectativas del tratamiento", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Análisis Funcional de la Conducta",
        campos: [
          { nombre: "Conducta problema (descripción operacional)", tipo: "textarea", requerido: true },
          { nombre: "Antecedentes (situaciones desencadenantes)", tipo: "textarea", requerido: true },
          { nombre: "Consecuencias (reforzadores)", tipo: "textarea", requerido: true },
          { nombre: "Frecuencia e intensidad", tipo: "texto", requerido: false },
          { nombre: "Variables organísmicas", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Pensamientos Automáticos",
        campos: [
          { nombre: "Pensamientos automáticos negativos identificados", tipo: "textarea", requerido: true },
          { nombre: "Situaciones que los activan", tipo: "textarea", requerido: false },
          { nombre: "Emociones asociadas", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Creencias Irracionales y Esquemas",
        campos: [
          { nombre: "Creencias nucleares", tipo: "textarea", requerido: false },
          { nombre: "Creencias intermedias (reglas, actitudes)", tipo: "textarea", requerido: false },
          { nombre: "Distorsiones cognitivas identificadas", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Recursos y Fortalezas",
        campos: [
          { nombre: "Habilidades de afrontamiento", tipo: "textarea", requerido: false },
          { nombre: "Red de apoyo social", tipo: "textarea", requerido: false },
          { nombre: "Logros previos", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Objetivos Terapéuticos",
        campos: [
          { nombre: "Objetivos conductuales", tipo: "textarea", requerido: true },
          { nombre: "Objetivos cognitivos", tipo: "textarea", requerido: true },
          { nombre: "Objetivos emocionales", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Plan de Tratamiento",
        campos: [
          { nombre: "Técnicas cognitivas a utilizar", tipo: "textarea", requerido: true },
          { nombre: "Técnicas conductuales a utilizar", tipo: "textarea", requerido: true },
          { nombre: "Tareas entre sesiones", tipo: "textarea", requerido: false },
          { nombre: "Criterios de evaluación del progreso", tipo: "textarea", requerido: false }
        ]
      }
    ],
    activo: true
  },
  {
    nombre: "Historia Clínica – Enfoque Humanista",
    enfoque_terapeutico: "Humanista",
    descripcion: "Plantilla centrada en la persona, exploración del autoconcepto, congruencia, autorrealización y experiencia subjetiva del paciente.",
    estructura: [
      {
        titulo: "Datos Personales",
        campos: [
          { nombre: "Nombre", tipo: "texto", requerido: true },
          { nombre: "Edad", tipo: "numero", requerido: true },
          { nombre: "Contexto de vida actual", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Motivo de Consulta",
        campos: [
          { nombre: "¿Qué te trae aquí?", tipo: "textarea", requerido: true },
          { nombre: "¿Cómo te sientes con respecto a esto?", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Exploración del Autoconcepto",
        campos: [
          { nombre: "¿Cómo te describes a ti mismo/a?", tipo: "textarea", requerido: true },
          { nombre: "¿Cómo crees que te ven los demás?", tipo: "textarea", requerido: false },
          { nombre: "Diferencias entre cómo te ves y cómo te gustaría ser", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Congruencia e Incongruencia",
        campos: [
          { nombre: "Áreas de incongruencia (yo real vs. yo ideal)", tipo: "textarea", requerido: false },
          { nombre: "Experiencias de autenticidad", tipo: "textarea", requerido: false },
          { nombre: "Situaciones donde no te sientes tú mismo/a", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Experiencia Subjetiva Actual",
        campos: [
          { nombre: "¿Cómo vives tu día a día?", tipo: "textarea", requerido: true },
          { nombre: "Emociones predominantes", tipo: "textarea", requerido: false },
          { nombre: "Sensaciones corporales significativas", tipo: "textarea", requerido: false },
          { nombre: "Significado personal de la experiencia", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Relaciones Significativas",
        campos: [
          { nombre: "Personas importantes en tu vida", tipo: "textarea", requerido: false },
          { nombre: "Calidad de las relaciones", tipo: "textarea", requerido: false },
          { nombre: "Necesidades no satisfechas en las relaciones", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Tendencia Actualizante y Crecimiento",
        campos: [
          { nombre: "Aspiraciones y metas personales", tipo: "textarea", requerido: false },
          { nombre: "Áreas de crecimiento personal deseadas", tipo: "textarea", requerido: true },
          { nombre: "Obstáculos percibidos para el crecimiento", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Recursos Personales",
        campos: [
          { nombre: "Fortalezas personales", tipo: "textarea", requerido: false },
          { nombre: "Experiencias positivas recientes", tipo: "textarea", requerido: false },
          { nombre: "Momentos de autorrealización", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Proceso Terapéutico",
        campos: [
          { nombre: "¿Qué esperas del proceso terapéutico?", tipo: "textarea", requerido: true },
          { nombre: "Disposición para la exploración personal", tipo: "texto", requerido: false },
          { nombre: "Áreas de enfoque acordadas", tipo: "textarea", requerido: true }
        ]
      }
    ],
    activo: true
  },
  {
    nombre: "Historia Clínica – Enfoque Psicodinámico",
    enfoque_terapeutico: "Psicodinámico",
    descripcion: "Plantilla orientada al análisis de conflictos inconscientes, mecanismos de defensa, relaciones de objeto y patrones relacionales tempranos.",
    estructura: [
      {
        titulo: "Datos de Identificación",
        campos: [
          { nombre: "Nombre completo", tipo: "texto", requerido: true },
          { nombre: "Edad", tipo: "numero", requerido: true },
          { nombre: "Ocupación", tipo: "texto", requerido: false }
        ]
      },
      {
        titulo: "Motivo de Consulta Manifiesto",
        campos: [
          { nombre: "Síntoma o problema presentado", tipo: "textarea", requerido: true },
          { nombre: "Momento de inicio", tipo: "texto", requerido: false }
        ]
      },
      {
        titulo: "Historia Evolutiva",
        campos: [
          { nombre: "Desarrollo temprano (embarazo, parto, primeros años)", tipo: "textarea", requerido: false },
          { nombre: "Relación con figuras parentales", tipo: "textarea", requerido: true },
          { nombre: "Relaciones con hermanos", tipo: "textarea", requerido: false },
          { nombre: "Eventos traumáticos o pérdidas significativas", tipo: "textarea", requerido: false },
          { nombre: "Desarrollo psicosexual", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Relaciones de Objeto",
        campos: [
          { nombre: "Representaciones internalizadas de sí mismo", tipo: "textarea", requerido: false },
          { nombre: "Representaciones internalizadas de otros", tipo: "textarea", requerido: false },
          { nombre: "Patrones de relación recurrentes", tipo: "textarea", requerido: true },
          { nombre: "Relaciones significativas actuales", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Mecanismos de Defensa",
        campos: [
          { nombre: "Mecanismos de defensa identificados", tipo: "textarea", requerido: false },
          { nombre: "Función adaptativa o desadaptativa", tipo: "textarea", requerido: false },
          { nombre: "Situaciones que los activan", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Material Inconsciente",
        campos: [
          { nombre: "Sueños recurrentes o significativos", tipo: "textarea", requerido: false },
          { nombre: "Fantasías conscientes", tipo: "textarea", requerido: false },
          { nombre: "Lapsus, actos fallidos", tipo: "textarea", requerido: false },
          { nombre: "Asociaciones libres relevantes", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Conflictos Psíquicos",
        campos: [
          { nombre: "Conflictos inconscientes identificados", tipo: "textarea", requerido: false },
          { nombre: "Manifestaciones sintomáticas", tipo: "textarea", requerido: true },
          { nombre: "Ansiedad asociada", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Transferencia y Contratransferencia",
        campos: [
          { nombre: "Manifestaciones transferenciales observadas", tipo: "textarea", requerido: false },
          { nombre: "Sentimientos contratransferenciales del terapeuta", tipo: "textarea", requerido: false },
          { nombre: "Patrón relacional en la díada terapéutica", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Formulación Dinámica",
        campos: [
          { nombre: "Hipótesis sobre el conflicto central", tipo: "textarea", requerido: true },
          { nombre: "Relación entre historia y síntoma actual", tipo: "textarea", requerido: true },
          { nombre: "Objetivos de insight", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Plan de Tratamiento",
        campos: [
          { nombre: "Enfoque terapéutico (psicoterapia psicoanalítica, psicoanálisis)", tipo: "texto", requerido: false },
          { nombre: "Frecuencia de sesiones", tipo: "texto", requerido: false },
          { nombre: "Áreas de trabajo terapéutico", tipo: "textarea", requerido: true }
        ]
      }
    ],
    activo: true
  },
  {
    nombre: "Historia Clínica – Enfoque Sistémico",
    enfoque_terapeutico: "Sistémico",
    descripcion: "Plantilla orientada al análisis de patrones relacionales, estructura familiar, roles, límites, comunicación y ciclo vital familiar.",
    estructura: [
      {
        titulo: "Datos de Identificación del Paciente Identificado",
        campos: [
          { nombre: "Nombre", tipo: "texto", requerido: true },
          { nombre: "Edad", tipo: "numero", requerido: true },
          { nombre: "Rol en la familia", tipo: "texto", requerido: false }
        ]
      },
      {
        titulo: "Composición del Sistema Familiar",
        campos: [
          { nombre: "Miembros del núcleo familiar", tipo: "textarea", requerido: true },
          { nombre: "Otros miembros significativos", tipo: "textarea", requerido: false },
          { nombre: "Genograma (descripción)", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Motivo de Consulta",
        campos: [
          { nombre: "Problema presentado", tipo: "textarea", requerido: true },
          { nombre: "Quién solicita la consulta", tipo: "texto", requerido: false },
          { nombre: "Acuerdo o desacuerdo familiar sobre el problema", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Estructura Familiar",
        campos: [
          { nombre: "Subsistemas (parental, conyugal, fraterno)", tipo: "textarea", requerido: false },
          { nombre: "Jerarquías y límites", tipo: "textarea", requerido: true },
          { nombre: "Alianzas y coaliciones", tipo: "textarea", requerido: false },
          { nombre: "Roles de cada miembro", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Patrones de Comunicación",
        campos: [
          { nombre: "Estilo de comunicación predominante", tipo: "textarea", requerido: true },
          { nombre: "Comunicación funcional vs disfuncional", tipo: "textarea", requerido: false },
          { nombre: "Temas evitados o tabúes", tipo: "textarea", requerido: false },
          { nombre: "Metacomunicación (dobles mensajes)", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Ciclo Vital Familiar",
        campos: [
          { nombre: "Etapa actual del ciclo vital", tipo: "texto", requerido: false },
          { nombre: "Transiciones recientes", tipo: "textarea", requerido: false },
          { nombre: "Tareas de desarrollo pendientes", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Reglas y Mitos Familiares",
        campos: [
          { nombre: "Reglas explícitas", tipo: "textarea", requerido: false },
          { nombre: "Reglas implícitas", tipo: "textarea", requerido: false },
          { nombre: "Mitos familiares", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Patrones Transgeneracionales",
        campos: [
          { nombre: "Repetición de patrones en generaciones previas", tipo: "textarea", requerido: false },
          { nombre: "Mandatos familiares", tipo: "textarea", requerido: false },
          { nombre: "Lealtades invisibles", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Recursos del Sistema",
        campos: [
          { nombre: "Fortalezas familiares", tipo: "textarea", requerido: false },
          { nombre: "Red de apoyo externa", tipo: "textarea", requerido: false },
          { nombre: "Estrategias de afrontamiento previas", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Hipótesis Sistémica",
        campos: [
          { nombre: "Función del síntoma en el sistema", tipo: "textarea", requerido: true },
          { nombre: "Secuencias interaccionales mantenedoras", tipo: "textarea", requerido: true },
          { nombre: "Relación entre problema y estructura familiar", tipo: "textarea", requerido: false }
        ]
      },
      {
        titulo: "Plan de Intervención",
        campos: [
          { nombre: "Objetivos terapéuticos sistémicos", tipo: "textarea", requerido: true },
          { nombre: "Miembros que participarán en la terapia", tipo: "textarea", requerido: false },
          { nombre: "Estrategias de intervención", tipo: "textarea", requerido: true },
          { nombre: "Frecuencia de sesiones", tipo: "texto", requerido: false }
        ]
      }
    ],
    activo: true
  }
];

export const SeedClinicalHistoryButton = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSeedTemplates = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('plantillas_historia_clinica')
        .insert(CLINICAL_HISTORY_TEMPLATES);

      if (error) throw error;

      toast({
        title: "Plantillas cargadas",
        description: `Se han cargado ${CLINICAL_HISTORY_TEMPLATES.length} plantillas del catálogo base.`,
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error seeding templates:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las plantillas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSeedTemplates}
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      {loading ? "Cargando..." : "Cargar Plantilla del Catálogo"}
    </Button>
  );
};
