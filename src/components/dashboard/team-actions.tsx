'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Shield, Loader2 } from 'lucide-react';
import { deleteTeamMemberAction, updateTeamMemberRoleAction } from '@/app/actions/team';

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
      <div className="relative w-full">
        <select 
          disabled={loading}
          onChange={(e) => {
            if (e.target.value) {
              handleRoleChange(e.target.value);
              e.target.value = ""; // reset after selection
            }
          }}
          defaultValue=""
          className="flex h-8 w-full items-center justify-between rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-xs font-medium text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:opacity-50 appearance-none cursor-pointer"
        >
          <option value="" disabled hidden>Permissões</option>
          <option value="admin">Administrador</option>
          <option value="planner">Cerimonialista</option>
          <option value="assistant">Assistente</option>
          <option value="team">Staff Operacional</option>
        </select>
        {loading ? (
          <Loader2 className="absolute left-2.5 top-2 h-4 w-4 text-zinc-900 animate-spin pointer-events-none" />
        ) : (
          <Shield className="absolute left-2.5 top-2 h-4 w-4 text-zinc-900 pointer-events-none" />
        )}
      </div>

      <Button variant="destructive" size="sm" className="w-full text-xs h-8 bg-red-50 text-red-600 hover:bg-red-100 border-red-200" onClick={handleDelete} disabled={loading}>
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir
      </Button>
    </div>
  );
}
