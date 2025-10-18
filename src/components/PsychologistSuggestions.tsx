import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  mensaje: string;
  fecha: string;
  psicologo_id: string;
  psychologist_name?: string;
}

interface PsychologistSuggestionsProps {
  patientId?: string;
}

const PsychologistSuggestions = ({ patientId }: PsychologistSuggestionsProps) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeComponent();
  }, [patientId]);

  const initializeComponent = async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const effectivePatientId = patientId || user.id;
    setCurrentUserId(effectivePatientId);

    // Fetch suggestions
    await fetchSuggestions(effectivePatientId);

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sugerencias-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sugerencias',
          filter: `paciente_id=eq.${effectivePatientId}`
        },
        async (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Fetch the psychologist name for the new/updated suggestion
            const { data: psyData } = await supabase
              .from('users')
              .select('nombre')
              .eq('id', payload.new.psicologo_id)
              .single();

            const updatedSuggestion = {
              ...payload.new,
              psychologist_name: psyData?.nombre
            } as Suggestion;

            setSuggestions(prev => {
              const exists = prev.find(s => s.id === updatedSuggestion.id);
              if (exists) {
                return prev.map(s => s.id === updatedSuggestion.id ? updatedSuggestion : s);
              }
              return [updatedSuggestion, ...prev];
            });

            if (payload.eventType === 'INSERT') {
              toast({
                title: "Nueva sugerencia",
                description: "Tu psicólogo ha compartido un nuevo consejo",
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setSuggestions(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchSuggestions = async (effectivePatientId: string) => {
    try {
      const { data, error } = await supabase
        .from('sugerencias')
        .select(`
          id,
          mensaje,
          fecha,
          psicologo_id
        `)
        .eq('paciente_id', effectivePatientId)
        .order('fecha', { ascending: false });

      if (error) throw error;

      // Fetch psychologist names
      const suggestionsWithNames = await Promise.all(
        (data || []).map(async (sugg) => {
          const { data: psyData } = await supabase
            .from('users')
            .select('nombre')
            .eq('id', sugg.psicologo_id)
            .single();

          return {
            ...sugg,
            psychologist_name: psyData?.nombre || 'Psicólogo'
          };
        })
      );

      setSuggestions(suggestionsWithNames);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las sugerencias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="card-soft">
        <div className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">Cargando sugerencias...</div>
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="card-soft">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Lightbulb className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Aún no tienes sugerencias de tu psicólogo
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-soft">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-primary">
          Consejos de tu Psicólogo
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {suggestions.length}
        </Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className="p-4 bg-gradient-to-br from-accent/5 to-secondary/5 border-accent/20 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Header with psychologist and date */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-primary">
                      {suggestion.psychologist_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(suggestion.fecha)}
                  </div>
                </div>

                {/* Suggestion message */}
                <p className="text-foreground leading-relaxed pl-6">
                  {suggestion.mensaje}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PsychologistSuggestions;
