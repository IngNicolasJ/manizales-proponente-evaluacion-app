
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Shield, ChevronDown, RefreshCw, Edit } from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';
import { supabase } from '@/integrations/supabase/client';

const UserMenu = () => {
  const { user, isAdmin, signOut, forceSignOut } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({ full_name: '' });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleForceSignOut = async () => {
    try {
      await forceSignOut();
    } catch (error) {
      console.error('Error force signing out:', error);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Force Logout Button for troubleshooting */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleForceSignOut}
        className="flex items-center space-x-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="hidden md:inline">Reiniciar Sesión</span>
      </Button>

      {/* Regular Logout Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
        className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden md:inline">Cerrar Sesión</span>
      </Button>
      
      {/* User Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 bg-muted hover:bg-muted/80">
            <User className="w-4 h-4" />
            <span className="hidden md:inline max-w-32 truncate">
              {userProfile.full_name || user.email}
            </span>
            {isAdmin && <Shield className="w-3 h-3 text-amber-500" />}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">
                {userProfile.full_name || user.email}
              </p>
              {userProfile.full_name && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
              {isAdmin && (
                <p className="text-xs text-amber-600 font-medium flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrador
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)} className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleForceSignOut} className="text-orange-600 cursor-pointer focus:bg-orange-50 focus:text-orange-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reiniciar Sesión
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdate={fetchUserProfile}
      />
    </div>
  );
};

export default UserMenu;
