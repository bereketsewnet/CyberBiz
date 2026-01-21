import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import type { Transaction } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewProofModal, setViewProofModal] = useState<{ open: boolean; transaction: Transaction | null }>({ open: false, transaction: null });
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await apiService.getPendingPayments(undefined, 'ALL');
        setPayments(response.data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleApprove = async (transactionId: string) => {
    try {
      const response = await apiService.approvePayment(transactionId);
      setPayments(prev =>
        prev.map(p => (p.id === transactionId ? response.data : p))
      );
      toast.success('Payment approved successfully');
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const handleReject = async (transactionId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      const response = await apiService.rejectPayment(transactionId, reason || undefined);
      setPayments(prev =>
        prev.map(p => (p.id === transactionId ? response.data : p))
      );
      toast.success('Payment rejected');
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone and will also delete the payment proof file if it exists.')) {
      return;
    }

    try {
      await apiService.deletePayment(transactionId);
      setPayments(prev => prev.filter(p => p.id !== transactionId));
      toast.success('Transaction deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  const handleViewProof = async (transaction: Transaction) => {
    // If there is no stored proof path, avoid calling the API
    if (!transaction.gateway_ref) {
      toast.error('No payment proof uploaded for this transaction');
      return;
    }

    try {
      const response = await fetch(`${api.baseUrl}/admin/files/proof/${transaction.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Payment proof file not found on the server');
        } else if (response.status === 500) {
          toast.error('Server error while loading payment proof');
        } else if (response.status === 403) {
          toast.error('You are not authorized to view this proof');
        } else {
          toast.error('Failed to load proof');
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setProofImageUrl(url);
      setViewProofModal({ open: true, transaction });
    } catch (error) {
      toast.error('Failed to load proof');
    }
  };

  const closeProofModal = () => {
    setViewProofModal({ open: false, transaction: null });
    if (proofImageUrl) {
      window.URL.revokeObjectURL(proofImageUrl);
      setProofImageUrl(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return <Badge variant="secondary">Pending Approval</Badge>;
      case 'APPROVED': return <Badge className="bg-success">Approved</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const formatPrice = (amount: number) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Payment Management</h1>
            <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Review all manual payment submissions and their status</p>
          </motion.div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input type="text" placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 border-slate-300" />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : payments.filter(p => 
            !searchQuery || 
            p.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200" style={{ fontFamily: 'Inter, sans-serif' }}>
              <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>No payments found</h3>
              <p className="text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>Try adjusting your search</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.filter(p => 
                !searchQuery || 
                p.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((payment, index) => (
                <motion.div key={payment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{payment.user?.full_name || 'Unknown User'}</h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="space-y-1 text-sm text-slate-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <p>Product: {payment.product?.title || 'Unknown'}</p>
                        <p>Amount: <span className="font-medium text-slate-900">{formatPrice(payment.amount)}</span></p>
                        <p>Date: {new Date(payment.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProof(payment)}
                        className="border-slate-300"
                        disabled={!payment.gateway_ref}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {payment.gateway_ref ? 'View Proof' : 'No Proof'}
                      </Button>
                      {payment.status === 'PENDING_APPROVAL' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 transition-colors"
                            onClick={() => handleApprove(payment.id)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(payment.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(payment.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Payment Proof View Modal */}
      <Dialog open={viewProofModal.open} onOpenChange={(open) => !open && closeProofModal()}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            {viewProofModal.transaction && (
              <DialogDescription>
                Transaction ID: {viewProofModal.transaction.id}
              </DialogDescription>
            )}
          </DialogHeader>
          {viewProofModal.transaction && (
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="font-semibold">{viewProofModal.transaction.user?.full_name || 'Unknown User'}</p>
                <p className="text-sm text-muted-foreground">{viewProofModal.transaction.user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product</p>
                <p className="font-semibold">{viewProofModal.transaction.product?.title || 'Unknown Product'}</p>
                <p className="text-sm text-muted-foreground">{viewProofModal.transaction.product?.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="font-semibold">{formatPrice(viewProofModal.transaction.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                <p className="font-semibold">{new Date(viewProofModal.transaction.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
          {proofImageUrl && (
            <div className="flex items-center justify-center">
              {/* Fixed rectangle viewport for all proofs */}
              <div className="w-[420px] h-[320px] max-w-full max-h-[60vh] bg-slate-100 rounded-lg border border-border overflow-hidden flex items-center justify-center">
                <img
                  src={proofImageUrl}
                  alt="Payment proof"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
