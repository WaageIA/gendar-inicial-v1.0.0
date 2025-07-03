
import { Client, Appointment } from '@/types';
import { format } from 'date-fns';

export interface BackupData {
  clients: Client[];
  appointments: Appointment[];
  exportDate: string;
  version: string;
}

export class BackupService {
  private static readonly VERSION = '1.0.0';

  // Exportar dados para JSON
  static exportToJSON(clients: Client[], appointments: Appointment[]): string {
    const backupData: BackupData = {
      clients,
      appointments,
      exportDate: new Date().toISOString(),
      version: this.VERSION
    };

    return JSON.stringify(backupData, null, 2);
  }

  // Exportar dados para CSV
  static exportClientsToCSV(clients: Client[]): string {
    const headers = [
      'ID', 'Nome', 'Telefone', 'Email', 'Data Nascimento', 
      'Avaliação', 'Pontos Fidelidade', 'Nível', 'Observações'
    ];

    const rows = clients.map(client => [
      client.id,
      client.name,
      client.phone,
      client.email || '',
      client.birthDate || '',
      client.rating.toString(),
      client.loyaltyPoints?.toString() || '0',
      client.loyaltyLevel || 'Bronze',
      client.notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  static exportAppointmentsToCSV(appointments: Appointment[]): string {
    const headers = [
      'ID', 'Cliente', 'Data', 'Serviço', 'Duração (min)', 
      'Preço', 'Status', 'Observações'
    ];

    const rows = appointments.map(appointment => [
      appointment.id || '',
      appointment.clientName,
      format(new Date(appointment.date), 'dd/MM/yyyy HH:mm'),
      appointment.service,
      appointment.duration.toString(),
      appointment.price?.toString() || '0',
      appointment.status,
      appointment.notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Download de arquivo
  static downloadFile(content: string, filename: string, type: 'json' | 'csv'): void {
    const mimeType = type === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Backup automático para localStorage
  static createLocalBackup(clients: Client[], appointments: Appointment[]): void {
    const backupData = this.exportToJSON(clients, appointments);
    const backupKey = `nail-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm')}`;
    
    try {
      localStorage.setItem(backupKey, backupData);
      
      // Manter apenas os últimos 5 backups
      const allKeys = Object.keys(localStorage).filter(key => key.startsWith('nail-backup-'));
      if (allKeys.length > 5) {
        const sortedKeys = allKeys.sort().slice(0, -5);
        sortedKeys.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Erro ao criar backup local:', error);
    }
  }

  // Listar backups locais
  static getLocalBackups(): Array<{ key: string; date: string; size: string }> {
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('nail-backup-'));
    
    return backupKeys.map(key => {
      const data = localStorage.getItem(key);
      const sizeKB = data ? Math.round(data.length / 1024) : 0;
      const dateStr = key.replace('nail-backup-', '').replace(/-/g, '/');
      
      return {
        key,
        date: dateStr,
        size: `${sizeKB} KB`
      };
    }).sort((a, b) => b.date.localeCompare(a.date));
  }

  // Restaurar backup
  static restoreFromJSON(jsonContent: string): BackupData | null {
    try {
      const backupData: BackupData = JSON.parse(jsonContent);
      
      // Validar estrutura básica
      if (!backupData.clients || !backupData.appointments || !backupData.version) {
        throw new Error('Formato de backup inválido');
      }

      return backupData;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return null;
    }
  }

  // Validar dados do backup
  static validateBackupData(data: BackupData): boolean {
    try {
      // Validar clientes
      if (!Array.isArray(data.clients)) return false;
      for (const client of data.clients) {
        if (!client.id || !client.name || !client.phone) return false;
      }

      // Validar agendamentos
      if (!Array.isArray(data.appointments)) return false;
      for (const appointment of data.appointments) {
        if (!appointment.clientName || !appointment.date || !appointment.service) return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
