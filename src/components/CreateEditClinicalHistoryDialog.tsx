import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ClinicalHistoryTemplate {
  id?: string;
  nombre: string;
  enfoque_terapeutico: string;
  descripcion: string;
  estructura: any[];
  activo: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ClinicalHistoryTemplate | null;
  onSuccess: () => void;
}

export const CreateEditClinicalHistoryDialog = ({ open, onOpenChange, template, onSuccess }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClinicalHistoryTemplate>({
    nombre: "",
    enfoque_terapeutico: "",
    descripcion: "",
    estructura: [],
    activo: true
  });

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        nombre: "",
        enfoque_terapeutico: "",
        descripcion: "",
        estructura: [],
        activo: true
      });
    }
  }, [template, open]);

  const handleSave = async () => {
    if (!formData.nombre || !formData.enfoque_terapeutico) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre y el enfoque terapéutico",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        nombre: formData.nombre,
        enfoque_terapeutico: formData.enfoque_terapeutico,
        descripcion: formData.descripcion,
        estructura: formData.estructura,
        activo: formData.activo
      };

      if (template?.id) {
        // Update existing
        const { error } = await supabase
          .from('plantillas_historia_clinica')
          .update(dataToSave)
          .eq('id', template.id);

        if (error) throw error;

        toast({
          title: "Plantilla actualizada",
          description: "La plantilla se ha actualizado correctamente",
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('plantillas_historia_clinica')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Plantilla creada",
          description: "La nueva plantilla se ha creado correctamente",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la plantilla",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    setFormData({
      ...formData,
      estructura: [
        ...formData.estructura,
        { titulo: "", campos: [] }
      ]
    });
  };

  const removeSection = (index: number) => {
    const newEstructura = formData.estructura.filter((_, i) => i !== index);
    setFormData({ ...formData, estructura: newEstructura });
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newEstructura = [...formData.estructura];
    newEstructura[index] = { ...newEstructura[index], [field]: value };
    setFormData({ ...formData, estructura: newEstructura });
  };

  const addField = (sectionIndex: number) => {
    const newEstructura = [...formData.estructura];
    newEstructura[sectionIndex].campos = [
      ...(newEstructura[sectionIndex].campos || []),
      { nombre: "", tipo: "texto", requerido: false }
    ];
    setFormData({ ...formData, estructura: newEstructura });
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const newEstructura = [...formData.estructura];
    newEstructura[sectionIndex].campos = newEstructura[sectionIndex].campos.filter(
      (_: any, i: number) => i !== fieldIndex
    );
    setFormData({ ...formData, estructura: newEstructura });
  };

  const updateField = (sectionIndex: number, fieldIndex: number, field: string, value: any) => {
    const newEstructura = [...formData.estructura];
    newEstructura[sectionIndex].campos[fieldIndex] = {
      ...newEstructura[sectionIndex].campos[fieldIndex],
      [field]: value
    };
    setFormData({ ...formData, estructura: newEstructura });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {template ? "Editar Plantilla" : "Nueva Plantilla"}
          </DialogTitle>
          <DialogDescription>
            {template ? "Modifica los datos de la plantilla" : "Crea una nueva plantilla de historia clínica"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre de la Plantilla *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Historia Clínica General"
              />
            </div>
            <div>
              <Label htmlFor="enfoque">Enfoque Terapéutico *</Label>
              <Input
                id="enfoque"
                value={formData.enfoque_terapeutico}
                onChange={(e) => setFormData({ ...formData, enfoque_terapeutico: e.target.value })}
                placeholder="Ej: Cognitivo-Conductual"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Breve descripción de la plantilla..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Estructura de la Plantilla</Label>
              <Button type="button" onClick={addSection} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Sección
              </Button>
            </div>

            <div className="space-y-4">
              {formData.estructura.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-4">
                      <Input
                        value={section.titulo}
                        onChange={(e) => updateSection(sectionIndex, 'titulo', e.target.value)}
                        placeholder="Título de la sección"
                        className="font-semibold"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(sectionIndex)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 ml-4">
                    {section.campos?.map((campo: any, fieldIndex: number) => (
                      <div key={fieldIndex} className="flex items-center gap-2 bg-background p-2 rounded">
                        <Input
                          value={campo.nombre}
                          onChange={(e) => updateField(sectionIndex, fieldIndex, 'nombre', e.target.value)}
                          placeholder="Nombre del campo"
                          className="flex-1"
                        />
                        <select
                          value={campo.tipo}
                          onChange={(e) => updateField(sectionIndex, fieldIndex, 'tipo', e.target.value)}
                          className="px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="texto">Texto</option>
                          <option value="textarea">Área de texto</option>
                          <option value="numero">Número</option>
                          <option value="fecha">Fecha</option>
                        </select>
                        <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={campo.requerido}
                            onChange={(e) => updateField(sectionIndex, fieldIndex, 'requerido', e.target.checked)}
                          />
                          Requerido
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(sectionIndex, fieldIndex)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addField(sectionIndex)}
                      size="sm"
                      variant="outline"
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Campo
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : template ? "Actualizar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
