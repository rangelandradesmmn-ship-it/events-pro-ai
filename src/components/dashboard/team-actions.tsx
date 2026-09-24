'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Shield, Loader2 } from 'lucide-react';
import { deleteTeamMemberAction, updateTeamMemberRoleAction } from '@/app/actions/team';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export function TeamActions({ member }: { member: any }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${member.full_name}? Essa ação não pode ser desfeita.`)) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('userId', member.id);
    const result = await deleteTeamMemberAction(formData);
    setLoading(false);
    
    if (result.error) {
      alert("Erro ao excluir usuário: " + result.error);
    }
  };

  const handleRoleChange = async (role: string) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('userId', member.id);
    formData.append('role', role);
    const result = await updateTeamMemberRoleAction(formData);
    setLoading(false);
    
    if (result.error) {
      alert("Erro ao alterar cargo: " + result.error);
    }
  };

  return (
    <div className="flex w-full gap-2 mt-4 pt-4 border-t">
      <DropdownMenu>
        <div>
          <DropdownMenuTrigger className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs h-8" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              Permissões
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Alterar Cargo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleRoleChange('admin')}>Administrador</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange('planner')}>Cerimonialista</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange('assistant')}>Assistente</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange('team')}>Staff Operacional</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="destructive" size="sm" className="w-full text-xs h-8 bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={handleDelete} disabled={loading}>
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir
      </Button>
    </div>
  );
}
