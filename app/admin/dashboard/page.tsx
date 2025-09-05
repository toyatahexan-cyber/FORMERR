import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import Farmer from '@/lib/models/Farmer';
import Scheme from '@/lib/models/Scheme';
import Application from '@/lib/models/Application';
import Navbar from '@/components/ui/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Award, TrendingUp, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    redirect('/admin/login');
  }

  await connectDB();
  
  // Fetch admin data
  const admin = await Admin.findById(decoded.id);
  if (!admin) {
    redirect('/admin/login');
  }

  // Fetch statistics
  const [
    totalFarmers,
    totalSchemes,
    activeSchemes,
    totalApplications,
    submittedApplications,
    underReviewApplications,
    approvedApplications,
    rejectedApplications
  ] = await Promise.all([
    Farmer.countDocuments(),
    Scheme.countDocuments(),
    Scheme.countDocuments({ isActive: true }),
    Application.countDocuments(),
    Application.countDocuments({ status: 'submitted' }),
    Application.countDocuments({ status: 'under-review' }),
    Application.countDocuments({ status: 'approved' }),
    Application.countDocuments({ status: 'rejected' })
  ]);

  // Recent applications
  const recentApplications = await Application.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const applicationsWithDetails = await Promise.all(
    recentApplications.map(async (app) => {
      const [farmer, scheme] = await Promise.all([
        Farmer.findById(app.farmerId).lean(),
        Scheme.findById(app.schemeId).lean()
      ]);
      return {
        ...app,
        farmerName: farmer?.name || 'Unknown',
        schemeTitle: scheme?.title || 'Unknown'
      };
    })
  );

  const stats = {
    totalFarmers,
    totalSchemes,
    activeSchemes,
    totalApplications,
    submittedApplications,
    underReviewApplications,
    approvedApplications,
    rejectedApplications,
    pendingApplications: submittedApplications + underReviewApplications
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar user={{ username: admin.username, role: 'admin' }} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage schemes and applications</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                Total Farmers
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalFarmers}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Active Schemes
              </CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.activeSchemes}</div>
              <p className="text-xs text-green-600 mt-1">of {stats.totalSchemes} total</p>
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

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">
                Pending Review
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.pendingApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">Submitted</span>
              </div>
              <div className="text-xl font-bold text-blue-900">{stats.submittedApplications}</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-600">Under Review</span>
              </div>
              <div className="text-xl font-bold text-yellow-900">{stats.underReviewApplications}</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">Approved</span>
              </div>
              <div className="text-xl font-bold text-green-900">{stats.approvedApplications}</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-600">Rejected</span>
              </div>
              <div className="text-xl font-bold text-red-900">{stats.rejectedApplications}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recent Applications</h2>
              <Link href="/admin/applications">
                <Button>View All</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {applicationsWithDetails.length > 0 ? (
                applicationsWithDetails.map((application: any) => (
                  <Card key={application._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {application.schemeTitle}
                          </h3>
                          <p className="text-sm text-gray-600">
                            by {application.farmerName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          application.status === 'approved' ? 'bg-green-100 text-green-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          application.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No applications yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            
            <div className="space-y-4">
              <Link href="/admin/schemes/new">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Add New Scheme</h3>
                        <p className="text-sm text-green-700">Create a new government scheme</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/applications?status=pending">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-orange-50 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900">Review Applications</h3>
                        <p className="text-sm text-orange-700">
                          {stats.pendingApplications} applications pending
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/schemes">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Manage Schemes</h3>
                        <p className="text-sm text-blue-700">View and edit existing schemes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">Farmer Statistics</h3>
                      <p className="text-sm text-purple-700">
                        {stats.totalFarmers} farmers registered
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}