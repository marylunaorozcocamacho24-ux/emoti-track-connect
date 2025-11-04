import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PsychologistSidebar } from "@/components/PsychologistSidebar";

const PsychologistTemplates = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PsychologistSidebar />
        <main className="flex-1 p-6 space-y-4">
          <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-primary">Plantillas</h1>
            </div>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground">Esta sección estará disponible pronto. Aquí podrás crear y gestionar plantillas de evaluaciones y contenidos.</p>
            <div className="mt-4">
              <Button disabled>Crear plantilla</Button>
            </div>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PsychologistTemplates;
