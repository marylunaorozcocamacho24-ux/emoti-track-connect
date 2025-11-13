import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PatientMessaging = () => {
  const [psych, setPsych] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    init();
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, []);

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    setUserId(session.user.id);

    try {
      const { data: code } = await (supabase.rpc as any)('get_user_psychologist_code', { _user_id: session.user.id });
      if (!code) return;
      const { data: psychData } = await supabase.from('users').select('id, nombre, codigo_psicologo').eq('codigo_psicologo', code).maybeSingle();
      if (psychData) {
        setPsych(psychData);
        fetchMessages(psychData.id, session.user.id);
        pollRef.current = window.setInterval(() => fetchMessages(psychData.id, session.user.id), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (psychId?: string, myId?: string) => {
    if (!psychId) return;
    try {
      const { data } = await supabase
        .from('notas')
        .select('*')
        .eq('paciente_id', myId || userId)
        .eq('psicologo_id', psychId)
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
    if (!psych || !userId || !text.trim()) return;
    try {
      const payload = {
        paciente_id: userId,
        psicologo_id: psych.id,
        contenido: JSON.stringify({ type: 'chat_message', from: userId, role: 'paciente', text: text.trim(), ts: new Date().toISOString() }),
        fecha: new Date().toISOString()
      };
      const { error } = await supabase.from('notas').insert(payload);
      if (error) throw error;
      setText('');
      fetchMessages(psych.id, userId);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo enviar el mensaje' });
    }
  };

  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        {!psych ? (
          <Card className="p-4">No tienes un psicólogo asignado. Selecciona uno para comenzar a chatear.</Card>
        ) : (
          <Card className="p-4 flex flex-col h-[60vh]">
            <div className="mb-3">
              <h2 className="font-semibold">{psych.nombre}</h2>
              <div className="text-xs text-muted-foreground">Conversa con tu psicólogo</div>
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
          </Card>
        )}
      </div>
      <Navigation userType="patient" />
    </div>
  );
};

export default PatientMessaging;
