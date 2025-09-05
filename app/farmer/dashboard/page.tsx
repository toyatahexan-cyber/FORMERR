import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Farmer from '@/lib/models/Farmer';
import Scheme from '@/lib/models/Scheme';
import Application from '@/lib/models/Application';
import Navbar from '@/components/ui/navbar';
import SchemeCard from '@/components/ui/scheme-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function FarmerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/farmer/login');
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'farmer') {
    redirect('/farmer/login');
  }

  await connectDB();
  
  // Fetch farmer data
  const farmer = await Farmer.findById(decoded.id);
  if (!farmer) {
    redirect('/farmer/login');
  }

  // Fetch active schemes
  const schemes = await Scheme.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  // Fetch farmer applications
  const applications = await Application.find({ farmerId: decoded.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Get schemes for applications
  const applicationSchemes = await Promise.all(
    applications.map(async (app) => {
      const scheme = await Scheme.findById(app.schemeId).lean();
      return {
        ...app,
        schemeTitle: scheme?.title || 'Unknown Scheme'
      };
    })
  );

  const stats = {
    totalApplications: applications.length,
    approvedApplications: applications.filter(app => app.status === 'approved').length,
    pendingApplications: applications.filter(app => app.status === 'submitted' || app.status === 'under-review').length,
    availableSchemes: schemes.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar user={{ name: farmer.name, role: 'farmer' }} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            स्वागत है, {farmer.name} जी
          </h1>
          <p className="text-gray-600">Welcome to your farmer dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                Available Schemes
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.availableSchemes}</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">
                Total Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.totalApplications}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Approved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.approvedApplications}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.pendingApplications}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recent Applications</h2>
              <Link href="/farmer/applications">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {applicationSchemes.length > 0 ? (
                applicationSchemes.map((application: any) => (
                  <Card key={application._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {application.schemeTitle}
                        </h3>
                        <Badge
                          className={
                            application.status === 'approved' ? 'bg-green-100 text-green-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            application.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Applied: {new Date(application.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No applications yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start by applying to available schemes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Available Schemes */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Available Schemes</h2>
              <Link href="/schemes">
                <Button variant="outline">Browse All</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {schemes.length > 0 ? (
                schemes.slice(0, 3).map((scheme: any) => (
                  <SchemeCard
                    key={scheme._id}
                    scheme={{
                      _id: scheme._id.toString(),
                      title: scheme.title,
                      description: scheme.description,
                      issuer: scheme.issuer,
                      cropTypes: scheme.cropTypes,
                      endDate: scheme.endDate.toISOString(),
                      isActive: scheme.isActive
                    }}
                  />
                ))
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No active schemes available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}