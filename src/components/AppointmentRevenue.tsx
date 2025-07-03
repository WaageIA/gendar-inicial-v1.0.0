
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinancialTransaction } from '@/types';
import { financialService } from '@/services/financialService';

interface AppointmentRevenueProps {
  startDate?: Date;
  endDate?: Date;
}

const AppointmentRevenue: React.FC<AppointmentRevenueProps> = ({
  startDate,
  endDate
}) => {
  const [appointmentTransactions, setAppointmentTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointmentTransactions();
  }, [startDate, endDate]);

  const loadAppointmentTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await financialService.getTransactions();
      if (!error) {
        // Filter only transactions from appointments (have appointment_id)
        const appointmentRevenue = data.filter(transaction => 
          transaction.appointment_id && 
          transaction.type === 'income' &&
          (!startDate || new Date(transaction.transaction_date) >= startDate) &&
          (!endDate || new Date(transaction.transaction_date) <= endDate)
        );
        setAppointmentTransactions(appointmentRevenue);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalRevenue = appointmentTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading) {
    return (
      <Card className="border-nail-secondary">
        <CardHeader className="bg-nail-light/50">
          <CardTitle className="text-nail-dark">Receitas de Agendamentos Concluídos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-nail-secondary">
      <CardHeader className="bg-nail-light/50">
        <CardTitle className="flex items-center justify-between text-nail-dark">
          <span>Receitas de Agendamentos Concluídos</span>
          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
            Total: {formatCurrency(totalRevenue)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {appointmentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma receita de agendamento encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-nail-secondary">
            {appointmentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-nail-light/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="font-medium text-nail-dark">{transaction.description}</p>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        Agendamento
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(transaction.transaction_date, 'PPP', { locale: ptBR })}
                      </span>
                      {transaction.payment_method && (
                        <span>Pagamento: {transaction.payment_method}</span>
                      )}
                      {transaction.appointment_id && (
                        <span className="text-xs text-blue-600">
                          ID: {transaction.appointment_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">
                      +{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentRevenue;
