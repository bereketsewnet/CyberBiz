import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Building, Calendar, User, Search, Edit, Trash2, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { ServiceInquiry, Service } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminServiceInquiriesPage() {
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [editingInquiry, setEditingInquiry] = useState<ServiceInquiry | null>(null);
  const [editFormData, setEditFormData] = useState({
    status: 'new' as ServiceInquiry['status'],
    admin_notes: '',
  });
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [respondingInquiry, setRespondingInquiry] = useState<ServiceInquiry | null>(null);
  const [responseFormData, setResponseFormData] = useState({
    status: 'new' as ServiceInquiry['status'],
    admin_notes: '',
  });
  const [isSavingResponse, setIsSavingResponse] = useState(false);

  useEffect(() => {
    fetchInquiries();
    fetchServices();
  }, [currentPage, statusFilter, serviceFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1);
        fetchInquiries();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchServices = async () => {
    try {
      const response = await apiService.getAdminServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getServiceInquiries({
        page: currentPage,
        per_page: 15,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        service_id: serviceFilter !== 'all' ? parseInt(serviceFilter) : undefined,
        q: searchQuery || undefined,
      });
      setInquiries(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId: number, newStatus: ServiceInquiry['status']) => {
    try {
      await apiService.updateServiceInquiry(inquiryId.toString(), {
        status: newStatus,
      });
      toast.success('Inquiry status updated');
      fetchInquiries();
      setEditingInquiry(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update inquiry');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingInquiry) return;

    try {
      await apiService.updateServiceInquiry(editingInquiry.id.toString(), editFormData);
      toast.success('Inquiry updated successfully');
      fetchInquiries();
      setEditingInquiry(null);
      setEditFormData({ status: 'new', admin_notes: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update inquiry');
    }
  };

  const handleOpenResponseModal = (inquiry: ServiceInquiry) => {
    setRespondingInquiry(inquiry);
    setResponseFormData({
      status: inquiry.status,
      admin_notes: inquiry.admin_notes || '',
    });
    setResponseModalOpen(true);
  };

  const handleSendResponse = async () => {
    if (!respondingInquiry) return;

    if (!responseFormData.admin_notes.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    setIsSavingResponse(true);
    try {
      await apiService.updateServiceInquiry(respondingInquiry.id.toString(), responseFormData);
      toast.success('Response sent successfully');
      fetchInquiries();
      setResponseModalOpen(false);
      setRespondingInquiry(null);
      setResponseFormData({ status: 'new', admin_notes: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send response');
    } finally {
      setIsSavingResponse(false);
    }
  };

  const handleDelete = async (inquiryId: number) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      await apiService.deleteServiceInquiry(inquiryId.toString());
      toast.success('Inquiry deleted successfully');
      fetchInquiries();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete inquiry');
    }
  };

  const getStatusBadge = (status: ServiceInquiry['status']) => {
    const variants: Record<ServiceInquiry['status'], { className: string; label: string }> = {
      new: { className: 'bg-blue-100 text-blue-800', label: 'New' },
      contacted: { className: 'bg-yellow-100 text-yellow-800', label: 'Contacted' },
      in_progress: { className: 'bg-purple-100 text-purple-800', label: 'In Progress' },
      completed: { className: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { className: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const variant = variants[status] || variants.new;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Service Inquiries
              </h1>
              <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                Manage service and consulting inquiries
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full md:w-48 border-slate-300">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-slate-300">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-lg p-6 h-32 animate-pulse" />
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No inquiries found</h3>
                <p className="text-slate-600">No inquiries match your search criteria</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <motion.div
                      key={inquiry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                      {editingInquiry?.id === inquiry.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Status</label>
                            <Select
                              value={editFormData.status}
                              onValueChange={(value) => setEditFormData({ ...editFormData, status: value as ServiceInquiry['status'] })}
                            >
                              <SelectTrigger className="mt-1 border-slate-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Admin Notes</label>
                            <Textarea
                              value={editFormData.admin_notes}
                              onChange={(e) => setEditFormData({ ...editFormData, admin_notes: e.target.value })}
                              rows={3}
                              className="mt-1 border-slate-300"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit} className="bg-primary hover:bg-accent">
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingInquiry(null);
                                setEditFormData({ status: 'new', admin_notes: '' });
                              }}
                              className="border-slate-300"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-slate-900">{inquiry.name}</h3>
                                {getStatusBadge(inquiry.status)}
                              </div>
                              {inquiry.service && (
                                <p className="text-sm text-slate-600 mb-2">
                                  Service: <span className="font-medium">{inquiry.service.title}</span>
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {inquiry.email}
                                </span>
                                {inquiry.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {inquiry.phone}
                                  </span>
                                )}
                                {inquiry.company && (
                                  <span className="flex items-center gap-1">
                                    <Building className="w-4 h-4" />
                                    {inquiry.company}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(inquiry.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-4 mb-3">
                                <p className="text-slate-700 whitespace-pre-wrap">{inquiry.message}</p>
                              </div>
                              {inquiry.admin_notes && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-3 border-l-4 border-blue-500">
                                  <p className="text-sm font-medium text-blue-900 mb-1">Admin Notes:</p>
                                  <p className="text-sm text-blue-700 whitespace-pre-wrap">{inquiry.admin_notes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Select
                                value={inquiry.status}
                                onValueChange={(value) => handleStatusUpdate(inquiry.id, value as ServiceInquiry['status'])}
                              >
                                <SelectTrigger className="w-40 border-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => handleOpenResponseModal(inquiry)}
                                className="bg-primary hover:bg-accent"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send Response
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingInquiry(inquiry);
                                  setEditFormData({
                                    status: inquiry.status,
                                    admin_notes: inquiry.admin_notes || '',
                                  });
                                }}
                                className="border-slate-300"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(inquiry.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Response Modal */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Response</DialogTitle>
            <DialogDescription>
              Update status and send a response message to {respondingInquiry?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="response-status">Status *</Label>
              <Select
                value={responseFormData.status}
                onValueChange={(value) => setResponseFormData({ ...responseFormData, status: value as ServiceInquiry['status'] })}
              >
                <SelectTrigger className="mt-1 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="response-message">Response Message *</Label>
              <Textarea
                id="response-message"
                value={responseFormData.admin_notes}
                onChange={(e) => setResponseFormData({ ...responseFormData, admin_notes: e.target.value })}
                placeholder="Enter your response message to the client (e.g., 'Yes, come to get our services')"
                rows={6}
                className="mt-1 border-slate-300"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                This message will be saved as admin notes and can be viewed in the inquiry details.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResponseModalOpen(false);
                setRespondingInquiry(null);
                setResponseFormData({ status: 'new', admin_notes: '' });
              }}
              disabled={isSavingResponse}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={isSavingResponse}
              className="bg-primary hover:bg-accent"
            >
              {isSavingResponse ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

