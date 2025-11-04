import { Card } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PsychologistSidebar } from "@/components/PsychologistSidebar";

const PsychologistAgenda = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PsychologistSidebar />
        <main className="flex-1 p-6 space-y-4">
          <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-primary">Agenda</h1>
            </div>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground">Aquí podrás ver y gestionar tus citas. Próximamente.</p>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PsychologistAgenda;
