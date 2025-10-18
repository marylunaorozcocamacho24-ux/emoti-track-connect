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
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Check role after auth state changes
        if (currentUser && requiredRole) {
          setTimeout(() => {
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentUser.id)
              .eq('role', requiredRole)
              .maybeSingle()
              .then(({ data }) => {
                if (mounted) {
                  setHasRole(!!data);
                  setLoading(false);
                }
              });
          }, 0);
        } else if (currentUser) {
          setHasRole(true);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    // Check for existing session on mount
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser && requiredRole) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .eq('role', requiredRole)
          .maybeSingle();
        
        if (mounted) {
          setHasRole(!!data);
          setLoading(false);
        }
      } else if (currentUser) {
        setHasRole(true);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole]);

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
