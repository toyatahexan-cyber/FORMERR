import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Calendar, MapPin, Wheat } from 'lucide-react';
import { format } from 'date-fns';

interface SchemeCardProps {
  scheme: {
    _id: string;
    title: string;
    description: string;
    issuer: 'central' | 'state';
    cropTypes: string[];
    endDate: string;
    isActive: boolean;
  };
  showApplyButton?: boolean;
}

export default function SchemeCard({ scheme, showApplyButton = true }: SchemeCardProps) {
  const isExpired = new Date(scheme.endDate) < new Date();
  
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge 
            variant={scheme.issuer === 'central' ? 'default' : 'secondary'}
            className={scheme.issuer === 'central' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
          >
            {scheme.issuer === 'central' ? 'Central Scheme' : 'State Scheme'}
          </Badge>
          {isExpired && (
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              Expired
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
          {scheme.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {scheme.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-500">
            <Wheat className="h-4 w-4 mr-2" />
            <span className="truncate">
              Crops: {scheme.cropTypes.slice(0, 2).join(', ')}
              {scheme.cropTypes.length > 2 && ` +${scheme.cropTypes.length - 2} more`}
            </span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              Last Date: {format(new Date(scheme.endDate), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex gap-2 w-full">
          <Link href={`/schemes/${scheme._id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          {showApplyButton && !isExpired && scheme.isActive && (
            <Link href={`/farmer/apply/${scheme._id}`} className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Apply Now
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}