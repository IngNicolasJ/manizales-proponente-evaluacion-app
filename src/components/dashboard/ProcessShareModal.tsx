
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, Trash2, UserPlus } from 'lucide-react';

interface ProcessShareModalProps {
  process: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProcessShareModal: React.FC<ProcessShareModalProps> = ({
  process,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessList, setAccessList] = useState<any[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && process) {
      loadProcessAccess();
    }
  }, [isOpen, process]);

  const loadProcessAccess = async () => {
    if (!process) return;
    
    setLoadingAccess(true);
    try {
      const { data, error } = await supabase
        .from('process_access')
        .select(`
          id,
          granted_at,
          profiles!process_access_user_id_fkey (
            id,
            email,
            full_name
          )
        `)
        .eq('process_data_id', process.id);

      if (error) throw error;
      setAccessList(data || []);
    } catch (error) {
      console.error('Error loading process access:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de accesos",
        variant: "destructive"
      });
    } finally {
      setLoadingAccess(false);
    }
  };

  const handleShareProcess = async () => {
    if (!email.trim() || !process) return;

    setLoading(true);
    try {
      // Primero buscar el usuario por email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.trim())
        .single();

      if (userError || !userData) {
        toast({
          title: "Usuario no encontrado",
          description: "No existe un usuario registrado con ese email",
          variant: "destructive"
        });
        return;
      }

      // Otorgar acceso al proceso
      const { error: accessError } = await supabase
        .from('process_access')
        .insert({
          process_data_id: process.id,
          user_id: userData.id,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (accessError) {
        if (accessError.code === '23505') { // Unique constraint violation
          toast({
            title: "Acceso duplicado",
            description: "Este usuario ya tiene acceso al proceso",
            variant: "destructive"
          });
        } else {
          throw accessError;
        }
        return;
      }

      toast({
        title: "Acceso otorgado",
        description: `Se ha otorgado acceso a ${userData.email}`,
      });

      setEmail('');
      await loadProcessAccess();
      onUpdate();

    } catch (error) {
      console.error('Error sharing process:', error);
      toast({
        title: "Error",
        description: "No se pudo otorgar el acceso",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (accessId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('process_access')
        .delete()
        .eq('id', accessId);

      if (error) throw error;

      toast({
        title: "Acceso revocado",
        description: `Se ha revocado el acceso a ${userEmail}`,
      });

      await loadProcessAccess();
      onUpdate();

    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "No se pudo revocar el acceso",
        variant: "destructive"
      });
    }
  };

  if (!process) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Compartir Proceso</span>
          </DialogTitle>
          <DialogDescription>
            Gestiona el acceso de usuarios al proceso {process.process_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Otorgar nuevo acceso */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Otorgar Acceso</h3>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="userEmail">Email del Usuario</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleShareProcess()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleShareProcess}
                  disabled={loading || !email.trim()}
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Otorgando...' : 'Otorgar'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de usuarios con acceso */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usuarios con Acceso</h3>
            {loadingAccess ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : accessList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay usuarios con acceso a este proceso</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accessList.map((access) => (
                  <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{access.profiles?.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {access.profiles?.full_name || 'Sin nombre'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {new Date(access.granted_at).toLocaleDateString('es-CO')}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeAccess(access.id, access.profiles?.email)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Revocar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
