
import React from 'react';
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
import { User, LogOut, Settings, Shield, ChevronDown, RefreshCw } from 'lucide-react';

const UserMenu = () => {
  const { user, isAdmin, signOut, forceSignOut } = useAuth();

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
            <span className="hidden md:inline max-w-32 truncate">{user.email}</span>
            {isAdmin && <Shield className="w-3 h-3 text-amber-500" />}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.email}</p>
              {isAdmin && (
                <p className="text-xs text-amber-600 font-medium flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrador
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            Perfil
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
    </div>
  );
};

export default UserMenu;
