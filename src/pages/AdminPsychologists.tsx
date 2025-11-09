import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  UserCheck, 
  Search, 
  Eye, 
  UserX, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Psychologist {
  id: string;
  nombre: string;
  email: string;
  cuenta_activa: boolean;
  especialidad?: string;
  numero_licencia?: string;
  institucion?: string;
  codigo_psicologo?: string;
  created_at: string;
}

interface Subscription {
  id: string;
  psicologo_id: string;
  estado: string;
  fecha_inicio: string | null;
  fecha_vencimiento: string | null;
  plan?: {
    nombre: string;
    duracion_dias: number;
  };
}

interface Payment {
  id: string;
  psicologo_id: string;
  monto: number;
  estado: string;
  metodo_pago?: string;
  fecha_pago: string;
  suscripcion_id: string;
}

interface PsychologistDetail extends Psychologist {
  subscription?: Subscription;
  payments?: Payment[];
  patientCount?: number;
}

const AdminPsychologists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<PsychologistDetail | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [psychologistToDelete, setPsychologistToDelete] = useState<Psychologist | null>(null);

  useEffect(() => {
    fetchPsychologists();
    
    // Realtime subscription
    const channel = supabase
      .channel('admin-psychologists-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          fetchPsychologists();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suscripciones_psicologo'
        },
        () => {
          fetchPsychologists();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pagos_psicologo'
        },
        () => {
          fetchPsychologists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPsychologists = async () => {
    try {
      // Fetch psychologists with their roles
      const { data: psychologistsData, error: psychoError } = await supabase
        .from('users')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .eq('user_roles.role', 'psicologo')
        .order('created_at', { ascending: false });

      if (psychoError) throw psychoError;
      
      setPsychologists(psychologistsData || []);
    } catch (error) {
      console.error('Error fetching psychologists:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los psicólogos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (psychologist: Psychologist) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ cuenta_activa: !psychologist.cuenta_activa })
        .eq('id', psychologist.id);

      if (error) throw error;

      toast({
        title: "Cuenta actualizada",
        description: `La cuenta ha sido ${!psychologist.cuenta_activa ? 'activada' : 'desactivada'}`,
      });

      fetchPsychologists();
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cuenta",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = async (psychologist: Psychologist) => {
    try {
      // Fetch subscription
      const { data: subData } = await supabase
        .from('suscripciones_psicologo')
        .select(`
          *,
          plan:planes_suscripcion(nombre, duracion_dias)
        `)
        .eq('psicologo_id', psychologist.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('pagos_psicologo')
        .select('*')
        .eq('psicologo_id', psychologist.id)
        .order('fecha_pago', { ascending: false });

      // Count patients
      const { count: patientCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('codigo_psicologo', psychologist.codigo_psicologo);

      setSelectedPsychologist({
        ...psychologist,
        subscription: subData || undefined,
        payments: paymentsData || [],
        patientCount: patientCount || 0
      });
      
      setDetailDialogOpen(true);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles",
        variant: "destructive"
      });
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.rpc('aprobar_pago_y_renovar_suscripcion', {
        _pago_id: paymentId,
        _admin_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Pago aprobado",
        description: "El pago ha sido aprobado y la suscripción renovada",
      });

      fetchPsychologists();
      if (selectedPsychologist) {
        handleViewDetails(selectedPsychologist);
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar el pago",
        variant: "destructive"
      });
    }
  };

  const handleDeletePsychologist = async () => {
    if (!psychologistToDelete) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(
        psychologistToDelete.id
      );

      if (error) throw error;

      toast({
        title: "Psicólogo eliminado",
        description: "La cuenta ha sido eliminada correctamente",
      });

      fetchPsychologists();
    } catch (error) {
      console.error('Error deleting psychologist:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setPsychologistToDelete(null);
    }
  };

  const filteredPsychologists = psychologists.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && p.cuenta_activa) ||
                         (filterStatus === "inactive" && !p.cuenta_activa);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted">Cargando psicólogos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="mb-4 hover:bg-background/10 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestionar Psicólogos</h1>
                <p className="text-sm opacity-90">Administra las cuentas y suscripciones de los profesionales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                size="sm"
              >
                Activos
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
                size="sm"
              >
                Inactivos
              </Button>
            </div>
          </div>
        </Card>

        {/* Psychologists Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Estado Cuenta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPsychologists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron psicólogos
                  </TableCell>
                </TableRow>
              ) : (
                filteredPsychologists.map((psychologist) => (
                  <TableRow key={psychologist.id}>
                    <TableCell className="font-medium">{psychologist.nombre}</TableCell>
                    <TableCell>{psychologist.email}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {psychologist.codigo_psicologo || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={psychologist.cuenta_activa ? "default" : "secondary"}>
                        {psychologist.cuenta_activa ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Activa</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Inactiva</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(psychologist)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(psychologist)}
                        >
                          {psychologist.cuenta_activa ? (
                            <UserX className="w-4 h-4 text-amber-600" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPsychologistToDelete(psychologist);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Psicólogo</DialogTitle>
            <DialogDescription>
              Información completa del profesional
            </DialogDescription>
          </DialogHeader>
          
          {selectedPsychologist && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Datos Personales</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nombre</p>
                    <p className="font-medium">{selectedPsychologist.nombre}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedPsychologist.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Especialidad</p>
                    <p className="font-medium">{selectedPsychologist.especialidad || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Licencia</p>
                    <p className="font-medium">{selectedPsychologist.numero_licencia || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Institución</p>
                    <p className="font-medium">{selectedPsychologist.institucion || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Código</p>
                    <p className="font-medium">{selectedPsychologist.codigo_psicologo || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Suscripción</h3>
                {selectedPsychologist.subscription ? (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estado</span>
                      <Badge variant={selectedPsychologist.subscription.estado === 'activa' ? 'default' : 'secondary'}>
                        {selectedPsychologist.subscription.estado}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <span className="font-medium">{selectedPsychologist.subscription.plan?.nombre || 'N/A'}</span>
                    </div>
                    {selectedPsychologist.subscription.fecha_vencimiento && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Vence</span>
                        <span className="font-medium">
                          {new Date(selectedPsychologist.subscription.fecha_vencimiento).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin suscripción activa</p>
                )}
              </div>

              {/* Payments */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Historial de Pagos</h3>
                {selectedPsychologist.payments && selectedPsychologist.payments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPsychologist.payments.map((payment) => (
                      <div key={payment.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium">${payment.monto}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.fecha_pago).toLocaleDateString('es-ES')}
                            {payment.metodo_pago && ` - ${payment.metodo_pago}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={payment.estado === 'aprobado' ? 'default' : 'secondary'}>
                            {payment.estado}
                          </Badge>
                          {payment.estado === 'pendiente' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprovePayment(payment.id)}
                            >
                              Aprobar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Estadísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Pacientes Asociados</p>
                    <p className="text-2xl font-bold text-primary">{selectedPsychologist.patientCount}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedPsychologist.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar psicólogo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la cuenta de "{psychologistToDelete?.nombre}"? 
              Esta acción no se puede deshacer y eliminará todos los datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePsychologist} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPsychologists;
