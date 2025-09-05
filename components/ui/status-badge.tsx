import { Badge } from './badge';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'submitted' | 'under-review' | 'approved' | 'rejected';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          className: 'bg-blue-100 text-blue-800',
          icon: <Clock className="h-3 w-3 mr-1" />
        };
      case 'under-review':
        return {
          label: 'Under Review',
          className: 'bg-yellow-100 text-yellow-800',
          icon: <AlertCircle className="h-3 w-3 mr-1" />
        };
      case 'approved':
        return {
          label: 'Approved',
          className: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-3 w-3 mr-1" />
        };
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-3 w-3 mr-1" />
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800',
          icon: null
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`${config.className} flex items-center`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}