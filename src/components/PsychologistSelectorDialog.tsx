import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Psychologist = {
  id: string;
  nombre: string;
  especialidad?: string | null;
  codigo_psicologo?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (psychologist: Psychologist) => void;
};

const PsychologistSelectorDialog: React.FC<Props> = ({ open, onOpenChange, onSelect }) => {
  const [loading, setLoading] = useState(false);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const fetchPsychologists = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, nombre, especialidad, codigo_psicologo")
        .eq("rol", "psicologo")
        .order("nombre", { ascending: true });

      if (!mounted) return;
      if (error) {
        toast.error("No se pudo cargar la lista de psicólogos. Intenta más tarde.");
        setPsychologists([]);
      } else {
        setPsychologists((data || []) as Psychologist[]);
      }
      setLoading(false);
    };

    fetchPsychologists();
    return () => { mounted = false; };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecciona tu psicólogo/a</DialogTitle>
          <DialogDescription>Escoge de la siguiente lista al profesional que te atiende.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3 max-h-[50vh] overflow-auto">
          {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {!loading && psychologists.length === 0 && (
            <p className="text-sm text-muted-foreground">No se encontraron psicólogos disponibles.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {psychologists.map((p) => (
              <Card key={p.id} className="p-3">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.nombre}</p>
                      <p className="text-sm text-muted-foreground">{p.especialidad || "--"}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {p.codigo_psicologo && <p className="text-xs text-muted-foreground">{p.codigo_psicologo}</p>}
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelect(p);
                          onOpenChange(false);
                        }}
                        className="mt-2"
                      >
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <div className="w-full flex justify-end">
            <DialogClose asChild>
              <Button variant="ghost">Cerrar</Button>
            </DialogClose>
          </div>
        </DialogFooter>
        <DialogClose className="sr-only" />
      </DialogContent>
    </Dialog>
  );
};

export default PsychologistSelectorDialog;
