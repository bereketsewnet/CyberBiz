import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Search } from 'lucide-react';
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
        const response = await apiService.getPendingPayments();
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
      await apiService.approvePayment(transactionId);
      setPayments(payments.filter(p => p.id !== transactionId));
      toast.success('Payment approved successfully');
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const handleReject = async (transactionId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      await apiService.rejectPayment(transactionId, reason || undefined);
      setPayments(payments.filter(p => p.id !== transactionId));
      toast.success('Payment rejected');
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  const handleViewProof = async (transaction: Transaction) => {
    try {
      const response = await fetch(`${api.baseUrl}/admin/files/proof/${transaction.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load proof');
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Payment Management</h1>
            <p className="text-muted-foreground">Review and approve pending payment submissions</p>
          </motion.div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="text" placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : payments.filter(p => 
            !searchQuery || 
            p.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No pending payments</h3>
              <p className="text-muted-foreground">All payment submissions have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.filter(p => 
                !searchQuery || 
                p.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((payment, index) => (
                <motion.div key={payment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display font-semibold text-foreground">{payment.user?.full_name || 'Unknown User'}</h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground mb-3">
                        <p>Product: {payment.product?.title || 'Unknown'}</p>
                        <p>Amount: <span className="font-medium text-foreground">{formatPrice(payment.amount)}</span></p>
                        <p>Date: {new Date(payment.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewProof(payment)}><Eye className="w-4 h-4 mr-2" />View Proof</Button>
                      <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleApprove(payment.id)}><Check className="w-4 h-4 mr-2" />Approve</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReject(payment.id)}><X className="w-4 h-4 mr-2" />Reject</Button>
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            {viewProofModal.transaction && (
              <DialogDescription className="space-y-2">
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
                <p className="text-xs text-muted-foreground mt-2">Transaction ID: {viewProofModal.transaction.id}</p>
              </DialogDescription>
            )}
          </DialogHeader>
          {proofImageUrl && (
            <div className="max-h-[80vh] overflow-auto">
              <img
                src={proofImageUrl}
                alt="Payment proof"
                className="w-full h-auto rounded-lg border border-border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
