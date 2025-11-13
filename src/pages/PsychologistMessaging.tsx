import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PsychologistSidebar } from "@/components/PsychologistSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const PsychologistMessaging = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    loadSession();
    loadPatients();
  }, []);

  useEffect(() => {
    // Start polling messages when a patient is selected
    if (selected) {
      fetchMessages();
      pollRef.current = window.setInterval(() => fetchMessages(), 3000);
    }
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [selected]);

  const loadSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUserId(session?.user.id ?? null);
  };

  const loadPatients = async () => {
    try {
      const { data } = await (supabase.rpc as any)('get_psychologist_patients');
      setPatients(data || []);
    } catch (err) {
      console.error('Error loading patients', err);
    }
  };

  const fetchMessages = async () => {
    if (!selected || !userId) return;
    try {
      const { data } = await supabase
        .from('notas')
        .select('*')
        .eq('paciente_id', selected.id)
        .eq('psicologo_id', userId)
        .order('fecha', { ascending: true });

      const parsed = (data || [])
        .map((n: any) => {
          try {
            const content = JSON.parse(n.contenido);
            if (content?.type === 'chat_message') {
              return {
                id: n.id,
                from: content.from,
                role: content.role,
                text: content.text,
                fecha: n.fecha || content.ts || null,
              };
            }
            return null;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      setMessages(parsed as any[]);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const sendMessage = async () => {
    if (!selected || !userId || !text.trim()) return;
    try {
      const payload = {
        paciente_id: selected.id,
        psicologo_id: userId,
        contenido: JSON.stringify({ type: 'chat_message', from: userId, role: 'psicologo', text: text.trim(), ts: new Date().toISOString() }),
        fecha: new Date().toISOString()
      };
      const { error } = await supabase.from('notas').insert(payload);
      if (error) throw error;
      setText('');
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo enviar el mensaje' });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PsychologistSidebar />
        <main className="flex-1 p-6 space-y-4">
          <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-primary">Mensajería</h1>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-4">
              <Card className="p-4 space-y-3">
                <h3 className="font-semibold">Pacientes</h3>
                <div className="space-y-2 mt-2">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`w-full text-left p-2 rounded-md hover:bg-muted/50 ${selected?.id === p.id ? 'bg-primary/10' : ''}`}
                    >
                      <div className="font-medium">{p.nombre}</div>
                      <div className="text-xs text-muted-foreground">Edad: {p.edad || '--'}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </aside>

            <section className="col-span-8">
              <Card className="p-4 flex flex-col h-[70vh]">
                {!selected ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecciona un paciente para ver la conversación</div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4 border-b pb-2">
                      <h2 className="text-lg font-semibold">{selected.nombre}</h2>
                      <div className="text-xs text-muted-foreground">Conversación</div>
                    </div>

                    <div className="flex-1 overflow-auto space-y-3 mb-4 p-2">
                      {messages.map((m) => (
                        <div key={m.id} className={`p-3 rounded-lg max-w-[70%] ${m.from === userId ? 'ml-auto bg-primary/10' : 'bg-muted/10'}`}>
                          <div className="text-sm">{m.text}</div>
                          <div className="text-xs text-muted-foreground mt-1">{m.fecha ? new Date(m.fecha).toLocaleString() : ''}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto flex items-start gap-2">
                      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="flex-1" placeholder="Escribe un mensaje..." />
                      <Button onClick={sendMessage}>Enviar</Button>
                    </div>
                  </div>
                )}
              </Card>
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PsychologistMessaging;
