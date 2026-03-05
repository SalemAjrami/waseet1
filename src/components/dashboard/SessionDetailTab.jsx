
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft, User, Calendar, Mail, Clock, CheckCircle, AlertCircle, ArrowRight,
    Handshake, Eye, CreditCard, Upload, RotateCcw, Lock, FileText, Shield, Wallet, DollarSign,
    Loader2, Trash2, MessageCircle, X, Download, RefreshCw, Package, Copy, Hash
} from 'lucide-react';
import { StatusBadge } from './DashboardWidgets';
import {
    getSessionById, getSessionDeliverables, createDeliverable,
    approveDeliverable, requestRevision, disputeDeliverable,
    deleteDeliverable, confirmPayment, regenerateJoinCode, getWalletOverview, completeSession
} from '../../services/api';

const SessionDetailTab = ({
    selectedSession,
    setSelectedSession,
    viewRole,
    setViewRole,
    userData,
    setActiveTab,
    onRefreshSessions
}) => {
    const [session, setSession] = useState(selectedSession);
    const [sessionLoading, setSessionLoading] = useState(true); // block render until live data loaded
    const [deliverables, setDeliverables] = useState([]);
    const [loadingDeliverables, setLoadingDeliverables] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadName, setUploadName] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [showRevisionModal, setShowRevisionModal] = useState(null);
    const [revisionNotes, setRevisionNotes] = useState('');
    const [showDisputeModal, setShowDisputeModal] = useState(null);
    const [disputeReason, setDisputeReason] = useState('');
    const [termsAccepted, setTermsAccepted] = useState([false, false, false]);
    const [walletBalance, setWalletBalance] = useState(null); // null = not yet fetched
    const [walletLoading, setWalletLoading] = useState(false);
    const [showingPaymentSuccess, setShowingPaymentSuccess] = useState(false);
    // Prevents the session.status watcher from snapping step back when freelancer
    // has manually advanced (e.g. after upload → waiting_approval)
    const [lockStep, setLockStep] = useState(false);

    const sessionId = session._id || session.id;

    // Compute step based on session status and role
    // Official statuses: CREATED → JOINED → PENDING_CONFIRMATION → HELD → AWAITING_CLIENT_APPROVAL → COMPLETED
    const computeStep = (role, status) => {
        const s = (status || '').toUpperCase();
        if (s === 'COMPLETED' || s === 'EXPIRED') return 'completed';

        // CREATED: only freelancer sees their own created session (agreement/details)
        if (s === 'CREATED') return 'agreement';

        // JOINED: client accepts agreement; freelancer waits for payment
        if (s === 'JOINED') {
            return role === 'client' ? 'agreement' : 'waiting_payment';
        }

        // PENDING_CONFIRMATION: client is on payment screen; freelancer waits
        if (s === 'PENDING_CONFIRMATION') {
            return role === 'client' ? 'payment' : 'waiting_payment';
        }

        // HELD: payment confirmed — freelancer uploads, client waits
        if (s === 'HELD') {
            return 'deliverables';
        }

        // AWAITING_CLIENT_APPROVAL: freelancer uploaded, waiting for client action
        if (s === 'AWAITING_CLIENT_APPROVAL') {
            return role === 'freelancer' ? 'waiting_approval' : 'deliverables';
        }

        // REVISION_REQUESTED: client wants changes — freelancer re-uploads
        if (s === 'REVISION_REQUESTED') {
            return role === 'freelancer' ? 'deliverables' : 'deliverables';
        }

        // Fallback: if status is unrecognised but we know role, make safe guess
        return role === 'client' ? 'payment' : 'deliverables';
    };

    const [step, setStep] = useState(() => computeStep(viewRole, session.status));

    // Auto-detect role: creator (user1) = freelancer, joiner (user2) = client
    const detectRole = (s) => {
        // Get user ID from JWT token (userData doesn't include _id)
        let myId = '';
        let myEmail = '';
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                myId = (payload._id || payload.sub || payload.id || payload.userId || '').toString();
                myEmail = (payload.email || '').toLowerCase();
            }
        } catch (e) { console.error('JWT decode error:', e); }

        // user1 = session creator = freelancer, user2 = session joiner = client
        const u1Id = (typeof s.user1 === 'string' ? s.user1 : (s.user1?._id || '')).toString();
        const u2Id = (typeof s.user2 === 'string' ? s.user2 : (s.user2?._id || '')).toString();

        const clientEmail = (s.clientEmail || s.user2?.email || '').toLowerCase();
        const freelancerEmail = (s.freelancerEmail || s.user1?.email || '').toLowerCase();

        console.log(`detectRole => myId: ${myId} | u1Id: ${u1Id} | u2Id: ${u2Id}`);

        if (myId && myId === u2Id) {
            console.log('DETECTED: client by ID');
            return 'client';
        }
        if (myEmail && myEmail === clientEmail) {
            console.log('DETECTED: client by Email');
            return 'client';
        }

        if (myId && myId === u1Id) {
            console.log('DETECTED: freelancer by ID');
            return 'freelancer';
        }
        if (myEmail && myEmail === freelancerEmail) {
            console.log('DETECTED: freelancer by Email');
            return 'freelancer';
        }

        console.log('FALLBACK: keeping:', viewRole);
        return viewRole;
    };

    // Poll session status:
    // - when freelancer is on waiting_payment: detect client has paid (HELD) → go to deliverables
    // - when freelancer is on waiting_approval: detect client approved/revised/disputed
    // - when freelancer is on deliverables: detect client has approved all (COMPLETED)
    useEffect(() => {
        const shouldPoll =
            step === 'waiting_payment' ||
            step === 'waiting_approval' ||
            (step === 'deliverables' && viewRole === 'freelancer');
        if (!shouldPoll) return;

        const pollSession = async () => {
            try {
                const liveSession = await getSessionById(sessionId);
                const s = liveSession.session || liveSession.data || liveSession;
                setSession(s);
                const detectedRole = detectRole(s);
                if (detectedRole !== viewRole) setViewRole(detectedRole);

                const liveStatus = (s.status || '').toUpperCase();

                // Freelancer on waiting_payment: client just paid → go to deliverables
                if (step === 'waiting_payment' && viewRole === 'freelancer' &&
                    ['HELD', 'AWAITING_CLIENT_APPROVAL', 'REVISION_REQUESTED'].includes(liveStatus)) {
                    setStep('deliverables');
                    setActionSuccess('Payment received! You can now upload your deliverables.');
                }

                // Freelancer on waiting_approval: client action detected
                if (step === 'waiting_approval' && viewRole === 'freelancer') {
                    if (liveStatus === 'COMPLETED') {
                        setLockStep(false);
                        setStep('completed');
                        setActionSuccess('The client approved all deliverables. Funds have been released to your wallet!');
                    } else if (liveStatus === 'REVISION_REQUESTED') {
                        setLockStep(false);
                        setStep('deliverables');
                        setActionSuccess('The client has requested a revision. Please review their notes and re-upload.');
                    }
                }


                // Freelancer on deliverables: client approved all → show completed
                if (liveStatus === 'COMPLETED' && step === 'deliverables') {
                    setStep('completed');
                    setActionSuccess('The client approved all deliverables. Funds have been released to your wallet!');
                }
            } catch (e) { /* silent */ }
        };

        const interval = setInterval(pollSession, 10000); // every 10s
        return () => clearInterval(interval);
    }, [step, viewRole, sessionId]);


    useEffect(() => {
        const fetchSessionDetails = async () => {
            try {
                const liveSession = await getSessionById(sessionId);
                const s = liveSession.session || liveSession.data || liveSession;
                setSession(s);
                const detectedRole = detectRole(s);
                const resolvedRole = detectedRole !== viewRole ? detectedRole : viewRole;
                if (detectedRole !== viewRole) setViewRole(detectedRole);

                // Explicitly restore the correct step on re-entry (lockStep may be false after navigation)
                const restoredStep = computeStep(resolvedRole, s.status);
                setStep(restoredStep);
                // If the restored step is waiting_approval we need to lock so status watcher doesn't override
                if (restoredStep === 'waiting_approval') setLockStep(true);
                else setLockStep(false);
            } catch (err) {
                console.error('Failed to fetch session details:', err);
            } finally {
                setSessionLoading(false);
            }
        };
        fetchSessionDetails();
        fetchDeliverables();
    }, [sessionId]);


    // Fetch wallet balance when on payment step
    useEffect(() => {
        if (step !== 'payment') return;
        const fetchWallet = async () => {
            setWalletLoading(true);
            try {
                const res = await getWalletOverview(session.currency || 'USD');
                // Same extraction logic as WalletTab.jsx
                const data = res?.data?.data ? res.data.data : (res?.data || res);
                const bal = data?.available ?? data?.availableAmount ?? data?.balance ?? null;
                if (bal !== null) setWalletBalance(parseFloat(bal));
            } catch (e) {
                console.warn('Could not fetch wallet balance:', e.message);
            } finally {
                setWalletLoading(false);
            }
        };
        fetchWallet();
    }, [step]);

    // Update step when session status OR role changes
    // Guards: don't override paymentSuccess (user must click through),
    //         and don't override a manually-locked step (e.g. waiting_approval after upload)
    useEffect(() => {
        if (showingPaymentSuccess) return;
        if (lockStep) return; // freelancer manually advanced; don't override
        const newStep = computeStep(viewRole, session.status);
        console.log(`Step update => role: ${viewRole} | status: ${session.status} | step: ${newStep}`);
        setStep(newStep);
    }, [session.status, viewRole, showingPaymentSuccess, lockStep]);

    const fetchDeliverables = async () => {
        setLoadingDeliverables(true);
        try {
            const res = await getSessionDeliverables(sessionId);
            console.log('API getSessionDeliverables raw response:', res);

            // Handle { data: [...] } or { data: { data: [...] } } or flat arrays
            let data = res;
            if (res?.data?.data) data = res.data.data;
            else if (res?.data) data = res.data;

            console.log('API getSessionDeliverables extracted data:', data);

            const apiList = Array.isArray(data) ? data : (data.deliverables || []);
            // Merge with locally stored deliverables
            const localDeliverables = JSON.parse(localStorage.getItem(`waseet_deliverables_${sessionId}`) || '[]');
            const apiIds = new Set(apiList.map(d => d._id || d.id));
            const merged = [...apiList, ...localDeliverables.filter(d => !apiIds.has(d._id))];

            console.log('Final merged tracking array for Client deliverables rendering:', merged);
            setDeliverables(merged);
        } catch (err) {
            console.error('Failed to fetch deliverables from API:', err);
            // Fallback to local deliverables
            const localDeliverables = JSON.parse(localStorage.getItem(`waseet_deliverables_${sessionId}`) || '[]');
            setDeliverables(localDeliverables);
        } finally {
            setLoadingDeliverables(false);
        }
    };

    useEffect(() => {
        if (actionSuccess || actionError) {
            const t = setTimeout(() => { setActionSuccess(''); setActionError(''); }, 4000);
            return () => clearTimeout(t);
        }
    }, [actionSuccess, actionError]);

    const mapSessionStatus = (status) => {
        const s = (status || '').toUpperCase();
        const statusMap = {
            'CREATED': 'Created',
            'HELD': 'Active/Funds Held',
            'REVISION_REQUESTED': 'Revision Requested',
            'EXPIRED': 'Expired',
            'JOINED': 'Joined',
            'PENDING_CONFIRMATION': 'Pending Confirmation',
            'COMPLETED': 'Completed',
            'AWAITING_CLIENT_APPROVAL': 'Awaiting Client Approval'
        };
        return statusMap[s] || status;
    };

    const getStatusColor = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'HELD': return 'bg-blue-100 text-[#3B82F6]';
            case 'COMPLETED': return 'bg-green-100 text-green-600';
            case 'CREATED': case 'JOINED': case 'PENDING_CONFIRMATION': case 'AWAITING_CLIENT_APPROVAL': return 'bg-amber-100 text-amber-600';
            case 'EXPIRED': case 'REVISION_REQUESTED': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const getDeliverableStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return 'bg-green-100 text-green-600';
            case 'PENDING': case 'SUBMITTED': return 'bg-amber-100 text-amber-600';
            case 'REVISION_REQUESTED': return 'bg-orange-100 text-orange-600';
            case 'DISPUTED': return 'bg-red-100 text-red-600';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const sessionStatus = mapSessionStatus(session.status);
    const escrowFeePercent = 5;
    const amount = parseFloat(session.amount) || 0;
    const escrowFee = amount * (escrowFeePercent / 100);
    const total = amount + escrowFee;

    // === ACTION HANDLERS ===
    const handleConfirmPayment = async () => {
        setActionLoading('payment');
        setActionError('');
        try {
            // Call the real backend API: POST /api/v1/sessions/{id}/confirm-payment
            await confirmPayment(sessionId);
            // Refresh session — status will now be HELD
            const updated = await getSessionById(sessionId);
            const s = updated.session || updated.data || updated;
            setSession(s);
            if (onRefreshSessions) onRefreshSessions();
            // Show success screen — guard flag prevents the status useEffect from overriding it
            setShowingPaymentSuccess(true);
            setStep('paymentSuccess');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Payment failed. Please try again.';
            setActionError(msg);
        } finally {
            setActionLoading('');
        }
    };

    const handleRegenerateCode = async () => {
        setActionLoading('regenerate');
        setActionError('');
        try {
            const result = await regenerateJoinCode(sessionId);
            setActionSuccess(`New join code: ${result.joinCode || result.code || 'Generated!'}`);
            const updated = await getSessionById(sessionId);
            setSession(updated.session || updated.data || updated);
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to regenerate code.');
        } finally {
            setActionLoading('');
        }
    };

    const handleUploadDeliverable = async (e) => {
        e.preventDefault();
        if (!uploadFile) { setActionError('Please select a file to upload.'); return; }
        setActionLoading('upload');
        setActionError('');
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('sessionId', sessionId);
            // API expects 'name', not 'title'
            formData.append('name', uploadName || uploadFile.name);
            if (uploadDescription) formData.append('description', uploadDescription);
            // Auto-detect type from file extension
            const ext = (uploadFile.name || '').split('.').pop().toLowerCase();
            let fileType = 'OTHER';
            if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext)) fileType = 'DOCUMENT';
            else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) fileType = 'IMAGE';
            else if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv'].includes(ext)) fileType = 'VIDEO';
            else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) fileType = 'ZIP_FILE';
            formData.append('type', fileType);
            // Try API upload
            let apiDeliverable = null;
            try {
                apiDeliverable = await createDeliverable(formData);
            } catch (apiErr) {
                console.warn('API deliverable upload failed (saving locally):', apiErr.response?.data?.message || apiErr.message);
            }
            // Save to localStorage as fallback (visible to both roles if on the same browser)
            // or to show instantly before checking API.
            const localDeliverable = apiDeliverable?.data || apiDeliverable || {
                _id: `local_${Date.now()}`,
                id: `local_${Date.now()}`,
                name: uploadName || uploadFile.name,
                fileName: uploadFile.name,
                type: fileType,
                description: uploadDescription || '',
                status: 'SUBMITTED',
                createdAt: new Date().toISOString(),
                fileSize: uploadFile.size,
                sessionId: sessionId,
            };
            const localDeliverables = JSON.parse(localStorage.getItem(`waseet_deliverables_${sessionId}`) || '[]');
            localDeliverables.push(localDeliverable);
            localStorage.setItem(`waseet_deliverables_${sessionId}`, JSON.stringify(localDeliverables));
            setActionSuccess('Deliverable uploaded successfully! Waiting for client review.');
            setShowUploadForm(false);
            setUploadFile(null);
            setUploadName('');
            setUploadDescription('');
            fetchDeliverables();
            // Lock step so the session.status watcher can't snap us back
            setLockStep(true);
            setStep('waiting_approval');
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to upload deliverable.');
        } finally {
            setActionLoading('');
        }
    };

    const handleApproveDeliverable = async (deliverableId) => {
        setActionLoading(`approve-${deliverableId}`);
        setActionError('');
        try {
            await approveDeliverable(deliverableId);
            setActionSuccess('Deliverable approved!');

            // Re-fetch deliverables to get updated statuses
            let updatedDeliverables = deliverables;
            try {
                const res = await getSessionDeliverables(sessionId);
                const data = res?.data?.data ? res.data.data : (res?.data || res);
                updatedDeliverables = Array.isArray(data) ? data : (data.deliverables || deliverables);
                setDeliverables(updatedDeliverables);
            } catch (e) { /* use existing list */ }

            // Check if all (non-local) deliverables are now APPROVED
            const realDeliverables = updatedDeliverables.filter(d => !String(d._id || d.id).startsWith('local_'));
            const allApproved = realDeliverables.length > 0 &&
                realDeliverables.every(d => (d.status || '').toUpperCase() === 'APPROVED');

            // Refresh session to get new status from backend
            const updated = await getSessionById(sessionId);
            const s = updated.session || updated.data || updated;
            setSession(s);
            if (onRefreshSessions) onRefreshSessions();

            const newStatus = (s.status || '').toUpperCase();
            if (newStatus === 'COMPLETED' || allApproved) {
                // If backend hasn't marked COMPLETED yet, explicitly call complete API
                if (newStatus !== 'COMPLETED') {
                    try {
                        await completeSession(sessionId);
                        // Re-fetch session to confirm COMPLETED status and fund release
                        const finalRes = await getSessionById(sessionId);
                        const finalSession = finalRes.session || finalRes.data || finalRes;
                        setSession(finalSession);
                    } catch (completionErr) {
                        console.warn('completeSession API error:', completionErr.response?.data?.message || completionErr.message);
                    }
                }
                setStep('completed');
                setActionSuccess('All deliverables approved! Funds released to the freelancer.');
            }
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to approve deliverable.');
        } finally {
            setActionLoading('');
        }
    };

    const handleRequestRevision = async (deliverableId) => {
        if (!revisionNotes.trim()) { setActionError('Please provide revision notes.'); return; }
        setActionLoading(`revision-${deliverableId}`);
        setActionError('');
        try {
            await requestRevision(deliverableId, revisionNotes);
            setActionSuccess('Revision requested!');
            setShowRevisionModal(null);
            setRevisionNotes('');
            fetchDeliverables();
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to request revision.');
        } finally {
            setActionLoading('');
        }
    };

    const handleDisputeDeliverable = async (deliverableId) => {
        if (!disputeReason.trim()) { setActionError('Please provide a reason for the dispute.'); return; }
        setActionLoading(`dispute-${deliverableId}`);
        setActionError('');
        try {
            await disputeDeliverable(deliverableId, disputeReason);
            setActionSuccess('Dispute filed successfully.');
            setShowDisputeModal(null);
            setDisputeReason('');
            fetchDeliverables();
            const updated = await getSessionById(sessionId);
            setSession(updated.session || updated.data || updated);
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to file dispute.');
        } finally {
            setActionLoading('');
        }
    };

    const handleDeleteDeliverable = async (deliverableId) => {
        setActionLoading(`delete-${deliverableId}`);
        setActionError('');
        try {
            // If it's a local fallback, just remove it from localStorage
            if (String(deliverableId).startsWith('local_')) {
                const localDeliverables = JSON.parse(localStorage.getItem(`waseet_deliverables_${sessionId}`) || '[]');
                const filtered = localDeliverables.filter(d => (d._id || d.id) !== deliverableId);
                localStorage.setItem(`waseet_deliverables_${sessionId}`, JSON.stringify(filtered));
            } else {
                // Otherwise try remote backend delete
                await deleteDeliverable(deliverableId);
            }
            setActionSuccess('Deliverable deleted.');
            fetchDeliverables();
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to delete deliverable.');
        } finally {
            setActionLoading('');
        }
    };

    const allTermsAccepted = termsAccepted.every(Boolean);

    // ===================== RENDER HELPERS =====================

    const renderMessages = () => (
        <>
            {actionSuccess && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-3">
                    <CheckCircle size={18} className="flex-shrink-0" />{actionSuccess}
                </motion.div>
            )}
            {actionError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
                    <AlertCircle size={18} className="flex-shrink-0" />{actionError}
                </motion.div>
            )}
        </>
    );

    const renderBackButton = () => (
        <button
            onClick={() => { setSelectedSession(null); setActiveTab('sessions'); }}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#3B82F6] transition-colors self-start"
        >
            <ChevronLeft size={15} /> Back to Sessions
        </button>
    );

    // Shared page-level header used by all steps
    const renderPageHeader = (subtitle) => (
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User size={22} className="text-[#3B82F6]" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Session Details</h2>
                <p className="text-sm text-slate-400">{subtitle}</p>
            </div>
        </div>
    );

    // Shared Session ID block
    const renderSessionIdBlock = () => (
        <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 mb-2">Session ID</p>
            <div className="w-full bg-[#F0F4FF] border border-blue-100 rounded-xl px-4 py-2.5">
                <span className="font-mono font-bold text-[#3B82F6] text-sm tracking-widest">
                    {sessionId?.substring(0, 8)?.toUpperCase() || '—'}
                </span>
            </div>
        </div>
    );

    // Legacy alias (still used by renderPaymentSuccess)
    const renderSessionHeader = () => null;

    // Helper: extract user display info from session data (handles flat strings and nested objects)
    const getClientDisplay = () => {
        if (session.user2EmailOrIdentificationName) return session.user2EmailOrIdentificationName;
        if (session.clientEmail) return session.clientEmail;
        if (session.user2?.email) return session.user2.email;
        if (typeof session.user2 === 'string' && session.user2.includes('@')) return session.user2;
        if (session.user2?.firstName) return `${session.user2.firstName} ${session.user2.lastName || ''}`.trim();
        if (selectedSession.clientEmail) return selectedSession.clientEmail;
        if (selectedSession.user2EmailOrIdentificationName) return selectedSession.user2EmailOrIdentificationName;
        return '—';
    };
    const getFreelancerDisplay = () => {
        if (session.user1EmailOrIdentificationName) return session.user1EmailOrIdentificationName;
        if (session.freelancerEmail) return session.freelancerEmail;
        if (session.user1?.email) return session.user1.email;
        if (typeof session.user1 === 'string' && session.user1.includes('@')) return session.user1;
        if (session.user1?.firstName) return `${session.user1.firstName} ${session.user1.lastName || ''}`.trim();
        if (selectedSession.freelancerEmail) return selectedSession.freelancerEmail;
        if (selectedSession.user1EmailOrIdentificationName) return selectedSession.user1EmailOrIdentificationName;
        return '—';
    };

    // ===================== STEP: AGREEMENT =====================
    const renderAgreement = () => (
        <div className="space-y-4">
            {renderPageHeader(viewRole === 'client' ? 'Review the details and confirm to proceed with the escrow.' : 'Review the details and confirm to proceed with the session.')}
            {renderSessionIdBlock()}

            {/* Project Agreement card */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Project Agreement</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-5">
                        <div className="flex items-start gap-3">
                            <FileText size={15} className="text-slate-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Project</p>
                                <p className="text-sm font-bold text-slate-800">{session.title || selectedSession.title || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User size={15} className="text-slate-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Client</p>
                                <p className="text-sm font-bold text-[#3B82F6]">{getClientDisplay()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <DollarSign size={15} className="text-slate-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Amount</p>
                                <p className="text-sm font-bold text-slate-800">${parseFloat(session.amount || 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User size={15} className="text-slate-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Freelancer</p>
                                <p className="text-sm font-bold text-[#3B82F6]">{getFreelancerDisplay()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar size={15} className="text-slate-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Deadline</p>
                                <p className="text-sm font-bold text-slate-800">{session.deadline ? new Date(session.deadline).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'No Deadline'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle size={15} className="text-slate-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Status</p>
                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${getStatusColor(sessionStatus)}`}>{sessionStatus}</span>
                            </div>
                        </div>
                    </div>

                    {session.description && (
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-[11px] font-semibold text-slate-400 mb-1">Project Description</p>
                            <p className="text-sm text-[#3B82F6] leading-relaxed">{session.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">Terms &amp; Conditions</h3>
                <div className="space-y-3">
                    {[
                        'Payment will be held securely in escrow until project completion',
                        'Funds will be released upon client approval of deliverables',
                        'Both parties agree to the project scope and timeline'
                    ].map((term, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={termsAccepted[i]}
                                onChange={() => { const n = [...termsAccepted]; n[i] = !n[i]; setTermsAccepted(n); }}
                                className="w-4 h-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                            <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">{term}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-1">
                <button onClick={() => { setSelectedSession(null); setActiveTab('sessions'); }}
                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
                    Back To Sessions
                </button>
                <button onClick={() => { setStep(viewRole === 'client' ? 'payment' : 'waiting_payment'); }}
                    disabled={!allTermsAccepted}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {viewRole === 'client' ? 'Confirm & Proceed to Deliverables' : 'Confirm & Wait for Payment'}
                    <ArrowRight size={15} />
                </button>
            </div>
        </div>
    );

    // ===================== STEP: WAITING FOR PAYMENT (Freelancer) =====================
    const renderWaitingForPayment = () => {
        const handleRefreshStatus = async () => {
            setActionLoading('refresh');
            try {
                const liveSession = await getSessionById(sessionId);
                const s = liveSession.session || liveSession.data || liveSession;
                setSession(s);
                const st = (s.status || '').toUpperCase();
                if (st === 'HELD' || st === 'AWAITING_CLIENT_APPROVAL') {
                    setActionSuccess('Payment confirmed! You can now upload deliverables.');
                    setTimeout(() => { setStep('deliverables'); setActionSuccess(''); }, 1500);
                } else {
                    setActionSuccess('Still waiting for client payment...');
                    setTimeout(() => setActionSuccess(''), 3000);
                }
            } catch (e) {
                setActionError('Failed to check status.');
            } finally {
                setActionLoading('');
            }
        };

        return (
            <div className="space-y-4">
                {renderPageHeader('Waiting for the client to complete payment.')}
                {renderSessionIdBlock()}

                {/* Info row */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-[11px] font-semibold text-slate-400 mb-1">Project</p>
                            <p className="text-sm font-bold text-slate-800 truncate">{session.title || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-400 mb-1">Client</p>
                            <p className="text-sm font-bold text-slate-800 truncate">{getClientDisplay()}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-400 mb-1">Amount</p>
                            <p className="text-sm font-bold text-slate-800">${parseFloat(session.amount || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Status card */}
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
                        <Clock size={30} className="text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Waiting for Client Payment</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">
                        The client needs to complete the escrow payment before you can upload deliverables.
                    </p>

                    {/* Progress */}
                    <div className="flex items-center justify-center gap-3 mb-7">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle size={13} className="text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-green-600">Session Created</span>
                        </div>
                        <div className="w-8 h-0.5 bg-amber-300"></div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center animate-pulse">
                                <CreditCard size={13} className="text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-600">Client Payment</span>
                        </div>
                        <div className="w-8 h-0.5 bg-slate-200"></div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                <Upload size={13} className="text-slate-400" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Upload Work</span>
                        </div>
                    </div>

                    <button onClick={handleRefreshStatus} disabled={actionLoading === 'refresh'}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all mx-auto disabled:opacity-50">
                        {actionLoading === 'refresh' ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                        {actionLoading === 'refresh' ? 'Checking...' : 'Check Payment Status'}
                    </button>
                </div>
            </div>
        );
    };

    // ===================== STEP: PAYMENT (Client) =====================
    const renderPayment = () => {
        const balance = walletBalance ?? 0;
        const hasSufficientFunds = walletBalance !== null && balance >= total;
        return (
            <div className="space-y-4">
                {renderPageHeader('Complete your payment to fund the escrow.')}
                {renderSessionIdBlock()}

                {/* Wallet Balance */}
                <div className={`bg-white rounded-2xl p-5 border shadow-sm ${walletLoading ? 'border-slate-100' : hasSufficientFunds ? 'border-emerald-100' : 'border-red-100'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${walletLoading ? 'bg-slate-100' : hasSufficientFunds ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {walletLoading ? <Loader2 size={15} className="animate-spin text-slate-400" /> : <Wallet size={15} className={hasSufficientFunds ? 'text-emerald-600' : 'text-red-500'} />}
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400">Wallet Balance</p>
                                <p className={`text-lg font-bold ${walletLoading ? 'text-slate-400' : hasSufficientFunds ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {walletLoading ? 'Loading...' : `$${balance.toFixed(2)}`}
                                </p>
                            </div>
                        </div>
                        {!walletLoading && (
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${hasSufficientFunds ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                {hasSufficientFunds ? 'Sufficient' : 'Insufficient'}
                            </span>
                        )}
                    </div>
                    {!walletLoading && !hasSufficientFunds && walletBalance !== null && (
                        <p className="text-xs text-red-500 mt-2">You need ${(total - balance).toFixed(2)} more. Please add funds to your wallet first.</p>
                    )}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-800">Order Summary</h3>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Session</span>
                            <span className="font-bold text-slate-700 font-mono">#{sessionId?.substring(0, 8)?.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                            <span className="text-slate-400">Amount</span>
                            <span className="font-bold text-slate-700">${amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Escrow Fee ({escrowFeePercent}%)</span>
                            <span className="font-bold text-slate-700">${escrowFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t-2 border-slate-200 pt-3">
                            <span className="font-bold text-slate-800">Total</span>
                            <span className="font-bold text-slate-800 text-lg">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-dashed border-slate-100 pt-3">
                            <span className="text-slate-400">Remaining After Payment</span>
                            <span className={`font-bold ${hasSufficientFunds ? 'text-emerald-600' : 'text-red-500'}`}>
                                ${hasSufficientFunds ? (balance - total).toFixed(2) : '0.00'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Security notice */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100/80 shadow-sm flex items-center gap-3">
                    <Shield size={15} className="text-[#3B82F6] flex-shrink-0" />
                    <p className="text-xs text-slate-500">Your payment is protected with end-to-end encryption and held securely in escrow.</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 justify-end pt-1">
                    <button onClick={() => setStep('agreement')}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                    <button onClick={handleConfirmPayment} disabled={actionLoading === 'payment' || !hasSufficientFunds || walletLoading}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        {actionLoading === 'payment' ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
                        {actionLoading === 'payment' ? 'Processing...' : walletLoading ? 'Loading...' : hasSufficientFunds ? 'Pay from Wallet' : 'Insufficient Funds'}
                    </button>
                </div>
            </div>
        );
    };

    // ===================== STEP: PAYMENT SUCCESS =====================
    const renderPaymentSuccess = () => (
        <div className="space-y-4">
            {renderPageHeader('Your payment has been secured in escrow.')}
            {renderSessionIdBlock()}

            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} className="text-green-500" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Payment Secured</h2>
                <p className="text-sm text-slate-400 mb-7">Your payment of ${total.toFixed(2)} has been held in escrow safely.</p>

                <div className="bg-[#F8FAFF] rounded-xl p-5 mb-6 text-left border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Payment Receipt</h4>
                    <div className="space-y-2.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Session ID</span>
                            <span className="font-mono font-bold text-[#3B82F6]">{sessionId?.substring(0, 8)?.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Amount</span>
                            <span className="font-bold text-slate-700">${amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-slate-200 pt-2.5">
                            <span className="font-bold text-slate-800">Total Paid</span>
                            <span className="font-bold text-[#3B82F6]">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => { setSelectedSession(null); setActiveTab('sessions'); }}
                        className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
                        View Sessions
                    </button>
                    <button onClick={() => { setShowingPaymentSuccess(false); setStep('deliverables'); }}
                        className="flex-1 flex items-center gap-2 justify-center px-5 py-3 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all">
                        View Deliverables <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );

    // ===================== STEP: DELIVERABLES (shared header block) =====================
    const renderDeliverablePageHeader = () => (
        <div className="space-y-4">
            {/* Session ID block */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 mb-2">Session ID</p>
                <div className="w-full bg-[#F0F4FF] border border-blue-100 rounded-xl px-4 py-2.5">
                    <span className="font-mono font-bold text-[#3B82F6] text-sm tracking-widest">
                        {sessionId?.substring(0, 8)?.toUpperCase() || '—'}
                    </span>
                </div>
            </div>

            {/* Project info row */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Project</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{session.title || '—'}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Project Date</p>
                        <p className="text-sm font-bold text-slate-800">
                            {session.deadline ? new Date(session.deadline).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : (session.createdAt ? new Date(session.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '—')}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Amount</p>
                        <p className="text-sm font-bold text-slate-800">${parseFloat(session.amount || 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // ===================== STEP: WAITING FOR CLIENT APPROVAL (freelancer) =====================
    const renderWaitingForApproval = () => (
        <div className="space-y-4">
            {renderPageHeader('Your deliverables are under client review.')}
            {renderSessionIdBlock()}

            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Clock size={28} className="text-[#3B82F6]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Waiting for Client Review</h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    Your deliverables have been submitted. The client will review them and either approve, request a revision, or open a dispute.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm mx-auto">
                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 border border-green-100">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Approve</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <RotateCcw size={16} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Revision</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-red-50 border border-red-100">
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Dispute</span>
                    </div>
                </div>

                <p className="text-[10px] text-slate-300 mt-5 flex items-center justify-center gap-1.5">
                    <Loader2 size={11} className="animate-spin" /> Checking for updates every 10 seconds...
                </p>

                <button onClick={() => setStep('deliverables')}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all">
                    View / Add Deliverables
                </button>
            </div>
        </div>
    );

    // ===================== FREELANCER DELIVERABLES =====================
    const renderFreelancerDeliverables = () => (
        <div className="space-y-4">
            {renderPageHeader('Upload and manage your project deliverables.')}
            {renderDeliverablePageHeader()}

            {/* Upload form (inline, slides in) */}
            {showUploadForm && (
                <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleUploadDeliverable}
                    className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-700">New Deliverable</h4>
                        <button type="button" onClick={() => { setShowUploadForm(false); setUploadFile(null); setUploadName(''); setUploadDescription(''); }}
                            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400"><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Deliverable Name</label>
                            <input type="text" value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="e.g. Final Logo Files"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">File</label>
                            <input type="file" onChange={(e) => setUploadFile(e.target.files[0])}
                                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3B82F6] file:text-white hover:file:bg-blue-600 file:cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Description (optional)</label>
                        <textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)}
                            placeholder="Describe the deliverable…" rows={2}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={actionLoading === 'upload'}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-50">
                            {actionLoading === 'upload' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {actionLoading === 'upload' ? 'Uploading…' : 'Upload'}
                        </button>
                    </div>
                </motion.form>
            )}

            {/* Deliverables card */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Uploaded Deliverables</h3>
                    <button onClick={() => setShowUploadForm(!showUploadForm)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm shadow-blue-200">
                        <span className="text-base leading-none">+</span> Add Deliverables
                    </button>
                </div>

                <div className="p-6">
                    {loadingDeliverables ? (
                        <div className="flex justify-center py-16 text-slate-300"><Loader2 size={32} className="animate-spin" /></div>
                    ) : deliverables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                                <FileText size={26} className="text-slate-400" />
                            </div>
                            <p className="text-base font-bold text-slate-700 mb-1">No Deliverables Yet</p>
                            <p className="text-sm text-slate-400 mb-6">Upload your first deliverable to get started.</p>
                            <button onClick={() => setShowUploadForm(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all">
                                <span className="text-base leading-none">+</span> Add Deliverables
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-end">
                                <button onClick={fetchDeliverables} className="p-1.5 rounded-lg text-slate-300 hover:text-[#3B82F6] hover:bg-blue-50 transition-all">
                                    <RefreshCw size={14} className={loadingDeliverables ? 'animate-spin' : ''} />
                                </button>
                            </div>
                            {deliverables.map((d) => {
                                const dId = d._id || d.id;
                                const dStatus = d.status || 'SUBMITTED';
                                return (
                                    <motion.div key={dId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl border border-slate-100 bg-[#FAFBFF] hover:border-blue-100 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{d.name || d.title || d.fileName || 'Deliverable'}</p>
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${getDeliverableStatusColor(dStatus)}`}>
                                                        {dStatus.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                {d.description && <p className="text-xs text-slate-400 line-clamp-2">{d.description}</p>}
                                                <p className="text-[10px] text-slate-300 mt-1">{d.createdAt ? new Date(d.createdAt).toLocaleString() : ''}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                                {d.fileUrl && (
                                                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-300 hover:text-[#3B82F6] transition-all">
                                                        <Download size={15} />
                                                    </a>
                                                )}
                                                {(dStatus === 'PENDING' || dStatus === 'SUBMITTED' || dStatus === 'REVISION_REQUESTED') && (
                                                    <button onClick={() => handleDeleteDeliverable(dId)} disabled={actionLoading === `delete-${dId}`}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all disabled:opacity-50">
                                                        {actionLoading === `delete-${dId}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {d.revisionNotes && (
                                            <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Revision Notes</p>
                                                <p className="text-xs text-orange-700">{d.revisionNotes}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // ===================== CLIENT: REVIEW DELIVERABLES =====================
    const renderClientDeliverables = () => {
        const approvedCount = deliverables.filter(d => (d.status || '').toUpperCase() === 'APPROVED').length;
        const pendingCount = deliverables.filter(d => ['PENDING', 'SUBMITTED'].includes((d.status || '').toUpperCase())).length;
        const allApproved = deliverables.length > 0 && approvedCount === deliverables.length;

        return (
            <div className="space-y-4">
                {renderPageHeader('Review and approve the submitted deliverables.')}
                {renderDeliverablePageHeader()}

                {/* All Approved Banner */}
                {allApproved && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl px-6 py-4 border border-green-100 shadow-sm flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-green-700 text-sm">All Deliverables Approved!</p>
                            <p className="text-xs text-green-500">All submitted work has been reviewed and approved.</p>
                        </div>
                    </motion.div>
                )}

                {/* Progress summary (when there are deliverables) */}
                {deliverables.length > 0 && (
                    <div className="bg-white rounded-2xl px-6 py-4 border border-slate-100/80 shadow-sm flex items-center gap-5">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            <span className="text-slate-500">Approved: <strong className="text-slate-700">{approvedCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span className="text-slate-500">Pending: <strong className="text-slate-700">{pendingCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            <span className="text-slate-500">Total: <strong className="text-slate-700">{deliverables.length}</strong></span>
                        </div>
                    </div>
                )}

                {/* Submitted Deliverables card */}
                <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-800">Submitted Deliverables</h3>
                        <button onClick={fetchDeliverables} className="p-2 rounded-lg text-slate-300 hover:text-[#3B82F6] hover:bg-blue-50 transition-all">
                            <RefreshCw size={15} className={loadingDeliverables ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="p-6">
                        {loadingDeliverables ? (
                            <div className="flex justify-center py-16 text-slate-300"><Loader2 size={32} className="animate-spin" /></div>
                        ) : deliverables.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                                    <Clock size={26} className="text-slate-400" />
                                </div>
                                <p className="text-base font-bold text-slate-700 mb-1">Waiting for Deliverables</p>
                                <p className="text-sm text-slate-400">The freelancer hasn't submitted any work yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {deliverables.map((d, index) => {
                                    const dId = d._id || d.id;
                                    const dStatus = d.status || 'SUBMITTED';
                                    const isApproved = dStatus.toUpperCase() === 'APPROVED';
                                    const isPending = ['PENDING', 'SUBMITTED'].includes(dStatus.toUpperCase());
                                    const isRevision = dStatus.toUpperCase() === 'REVISION_REQUESTED';
                                    return (
                                        <motion.div key={dId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`p-4 rounded-xl border transition-all ${isApproved ? 'border-green-200 bg-green-50/40' : isRevision ? 'border-orange-200 bg-orange-50/30' : 'border-slate-100 bg-[#FAFBFF] hover:border-blue-100'}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold text-slate-300">#{index + 1}</span>
                                                        <p className="text-sm font-bold text-slate-700 truncate">{d.name || d.title || d.fileName || 'Deliverable'}</p>
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${getDeliverableStatusColor(dStatus)}`}>
                                                            {isApproved ? '✓ Approved' : isRevision ? '↻ Revision' : dStatus.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    {d.description && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{d.description}</p>}
                                                    <p className="text-[10px] text-slate-300 mt-1">{d.createdAt ? new Date(d.createdAt).toLocaleString() : ''}</p>
                                                </div>
                                                {d.fileUrl && (
                                                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-[#3B82F6] text-xs font-bold hover:bg-blue-100 transition-all flex-shrink-0 ml-3">
                                                        <Download size={13} /> Download
                                                    </a>
                                                )}
                                            </div>

                                            {isPending && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                                    <button onClick={() => handleApproveDeliverable(dId)} disabled={actionLoading === `approve-${dId}`}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 shadow-sm transition-all disabled:opacity-50">
                                                        {actionLoading === `approve-${dId}` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Approve
                                                    </button>
                                                    <button onClick={() => { setShowRevisionModal(dId); setRevisionNotes(''); }}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold hover:bg-orange-100 transition-all">
                                                        <RotateCcw size={12} /> Revision
                                                    </button>
                                                    <button onClick={() => { setShowDisputeModal(dId); setDisputeReason(''); }}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-500 border border-red-200 text-xs font-bold hover:bg-red-100 transition-all">
                                                        <AlertCircle size={12} /> Dispute
                                                    </button>
                                                </div>
                                            )}
                                            {d.revisionNotes && (
                                                <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                                                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Your Revision Notes</p>
                                                    <p className="text-xs text-orange-700">{d.revisionNotes}</p>
                                                </div>
                                            )}
                                            {isApproved && (
                                                <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2">
                                                    <CheckCircle size={13} className="text-green-500" />
                                                    <p className="text-xs font-bold text-green-600">You approved this deliverable</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ===================== STEP: DELIVERABLES (role router) =====================
    const renderDeliverables = () => viewRole === 'client' ? renderClientDeliverables() : renderFreelancerDeliverables();

    // ===================== STEP: COMPLETED =====================
    const renderCompleted = () => (
        <div className="space-y-4">
            {renderPageHeader('This project has been completed successfully.')}
            {renderSessionIdBlock()}

            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} className="text-green-500" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Project Completed!</h2>
                <p className="text-sm text-slate-400 mb-7">
                    {viewRole === 'freelancer'
                        ? 'The client has approved all deliverables. Your funds have been released!'
                        : 'You approved all deliverables. Funds have been released to the freelancer.'}
                </p>

                <div className="bg-[#F8FAFF] rounded-xl p-5 mb-5 text-left border border-slate-100 space-y-2.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Project</span>
                        <span className="font-bold text-slate-700">{session.title || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Amount</span>
                        <span className="font-bold text-slate-700">${parseFloat(session.amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-slate-100 pt-2.5">
                        <span className="text-slate-400">Status</span>
                        <span className="font-bold text-green-600">✅ Completed</span>
                    </div>
                </div>

                <div className={`rounded-xl p-4 mb-6 text-left border ${viewRole === 'freelancer' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                    <p className={`text-xs font-bold flex items-center gap-2 mb-1 ${viewRole === 'freelancer' ? 'text-blue-700' : 'text-green-700'}`}>
                        <Wallet size={13} />
                        {viewRole === 'freelancer' ? '🎉 Funds Released to Your Wallet' : 'Escrow Funds Released'}
                    </p>
                    <p className={`text-xs ${viewRole === 'freelancer' ? 'text-blue-600' : 'text-green-600'}`}>
                        {viewRole === 'freelancer'
                            ? `$${parseFloat(session.amount || 0).toFixed(2)} has been transferred to your wallet.`
                            : `The escrow of $${parseFloat(session.amount || 0).toFixed(2)} has been released to the freelancer.`}
                    </p>
                </div>

                <button onClick={() => { setSelectedSession(null); setActiveTab('sessions'); }}
                    className="w-full px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-bold text-sm hover:bg-blue-600 shadow-sm shadow-blue-200 transition-all">
                    Back to Sessions
                </button>
            </div>
        </div>
    );

    // ===================== MAIN RENDER =====================
    // Block rendering until live session data is fetched — prevents stale step flashing
    if (sessionLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-[#3B82F6]" />
                <p className="text-sm font-medium">Loading session...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="space-y-6">
            {renderMessages()}
            {renderBackButton()}

            {step === 'agreement' && renderAgreement()}
            {step === 'waiting_payment' && renderWaitingForPayment()}
            {step === 'payment' && renderPayment()}
            {step === 'paymentSuccess' && renderPaymentSuccess()}
            {step === 'deliverables' && renderDeliverables()}
            {step === 'waiting_approval' && renderWaitingForApproval()}
            {step === 'completed' && renderCompleted()}

            {/* Revision Modal */}
            {showRevisionModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRevisionModal(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[28px] p-6 lg:p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Request Revision</h3>
                            <button onClick={() => setShowRevisionModal(null)} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400"><X size={18} /></button>
                        </div>
                        <textarea value={revisionNotes} onChange={(e) => setRevisionNotes(e.target.value)}
                            placeholder="Describe what changes are needed..." rows={4} autoFocus
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 text-sm resize-none mb-4" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowRevisionModal(null)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={() => handleRequestRevision(showRevisionModal)} disabled={actionLoading.startsWith('revision')}
                                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {actionLoading.startsWith('revision') ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Submit
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Dispute Modal */}
            {showDisputeModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDisputeModal(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[28px] p-6 lg:p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-red-600 text-lg">File a Dispute</h3>
                            <button onClick={() => setShowDisputeModal(null)} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400"><X size={18} /></button>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs mb-4">
                            <p className="font-bold mb-1">⚠️ This action is serious</p>
                            <p>Filing a dispute will put this session under review. Please describe the issue clearly.</p>
                        </div>
                        <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}
                            placeholder="Describe the issue in detail..." rows={4} autoFocus
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm resize-none mb-4" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowDisputeModal(null)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={() => handleDisputeDeliverable(showDisputeModal)} disabled={actionLoading.startsWith('dispute')}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {actionLoading.startsWith('dispute') ? <Loader2 size={14} className="animate-spin" /> : <AlertCircle size={14} />} File Dispute
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default SessionDetailTab;
