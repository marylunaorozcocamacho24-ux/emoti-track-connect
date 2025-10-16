import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'paciente' | 'psicologo';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check role if required
    if (user && requiredRole) {
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', requiredRole)
        .maybeSingle()
        .then(({ data, error }) => {
          setHasRole(!error && !!data);
          setLoading(false);
        });
    } else if (user) {
      setHasRole(true);
      setLoading(false);
    }
  }, [user, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && !hasRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
