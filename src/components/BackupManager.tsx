
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  Save, 
  Trash2, 
  FileJson, 
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { BackupService } from '@/utils/backup';
import { useAppState } from '@/contexts/AppStateContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BackupManager: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const localBackups = BackupService.getLocalBackups();

  // Exportar dados completos (JSON)
  const handleExportJSON = () => {
    try {
      const jsonContent = BackupService.exportToJSON(state.clients, state.appointments);
      const filename = `studio-anisy-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      BackupService.downloadFile(jsonContent, filename, 'json');
      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar backup');
    }
  };

  // Exportar clientes (CSV)
  const handleExportClientsCSV = () => {
    try {
      const csvContent = BackupService.exportClientsToCSV(state.clients);
      const filename = `clientes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      BackupService.downloadFile(csvContent, filename, 'csv');
      toast.success('Clientes exportados para CSV!');
    } catch (error) {
      toast.error('Erro ao exportar clientes');
    }
  };

  // Exportar agendamentos (CSV)
  const handleExportAppointmentsCSV = () => {
    try {
      const csvContent = BackupService.exportAppointmentsToCSV(state.appointments);
      const filename = `agendamentos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      BackupService.downloadFile(csvContent, filename, 'csv');
      toast.success('Agendamentos exportados para CSV!');
    } catch (error) {
      toast.error('Erro ao exportar agendamentos');
    }
  };

  // Criar backup local
  const handleCreateLocalBackup = () => {
    try {
      BackupService.createLocalBackup(state.clients, state.appointments);
      toast.success('Backup local criado com sucesso!');
      // Força re-render para mostrar novo backup
      setSelectedFile(null);
    } catch (error) {
      toast.error('Erro ao criar backup local');
    }
  };

  // Restaurar backup
  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para restaurar');
      return;
    }

    setIsRestoring(true);
    
    try {
      const fileContent = await selectedFile.text();
      const backupData = BackupService.restoreFromJSON(fileContent);
      
      if (!backupData) {
        toast.error('Arquivo de backup inválido');
        return;
      }

      if (!BackupService.validateBackupData(backupData)) {
        toast.error('Dados do backup estão corrompidos');
        return;
      }

      // Restaurar dados no estado
      dispatch({ type: 'SET_CLIENTS', clients: backupData.clients });
      dispatch({ type: 'SET_APPOINTMENTS', appointments: backupData.appointments });

      toast.success(`Backup restaurado com sucesso! ${backupData.clients.length} clientes e ${backupData.appointments.length} agendamentos restaurados.`);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Erro ao restaurar backup');
      console.error('Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  // Restaurar backup local
  const handleRestoreLocalBackup = (backupKey: string) => {
    try {
      const backupContent = localStorage.getItem(backupKey);
      if (!backupContent) {
        toast.error('Backup não encontrado');
        return;
      }

      const backupData = BackupService.restoreFromJSON(backupContent);
      if (!backupData || !BackupService.validateBackupData(backupData)) {
        toast.error('Backup local corrompido');
        return;
      }

      dispatch({ type: 'SET_CLIENTS', clients: backupData.clients });
      dispatch({ type: 'SET_APPOINTMENTS', appointments: backupData.appointments });

      toast.success('Backup local restaurado com sucesso!');
    } catch (error) {
      toast.error('Erro ao restaurar backup local');
    }
  };

  // Remover backup local
  const handleRemoveLocalBackup = (backupKey: string) => {
    try {
      localStorage.removeItem(backupKey);
      toast.success('Backup removido');
      setSelectedFile(null); // Força re-render
    } catch (error) {
      toast.error('Erro ao remover backup');
    }
  };

  return (
    <div className="space-y-6">
      {/* Exportar Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleExportJSON} className="nail-button">
              <FileJson className="h-4 w-4 mr-2" />
              Backup Completo (JSON)
            </Button>
            
            <Button onClick={handleExportClientsCSV} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Clientes (CSV)
            </Button>
            
            <Button onClick={handleExportAppointmentsCSV} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Agendamentos (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Local */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Backup Local
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCreateLocalBackup} className="nail-button">
            <Save className="h-4 w-4 mr-2" />
            Criar Backup Local
          </Button>
          
          {localBackups.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Backups Disponíveis:</h4>
              {localBackups.map(backup => (
                <div key={backup.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileJson className="h-4 w-4 text-nail-primary" />
                    <div>
                      <p className="font-medium">{backup.date}</p>
                      <p className="text-sm text-muted-foreground">{backup.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRestoreLocalBackup(backup.key)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemoveLocalBackup(backup.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restaurar Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Restaurar Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Atenção: Restaurar um backup substituirá todos os dados atuais.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="backup-file">Selecionar arquivo de backup (JSON)</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>
          
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{selectedFile.name}</span>
            </div>
          )}
          
          <Button 
            onClick={handleRestoreBackup}
            disabled={!selectedFile || isRestoring}
            className="nail-button"
          >
            {isRestoring ? 'Restaurando...' : 'Restaurar Backup'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManager;
