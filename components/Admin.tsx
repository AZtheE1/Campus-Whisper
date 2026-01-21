import React, { useEffect, useState } from 'react';
import { getReports, Report, dismissReport, deleteReportedPost } from '../services/reportService';
import { ShieldAlert, Trash2, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { auth } from '../services/firebase';

interface AdminProps {
    userEmail: string | null;
}

const Admin: React.FC<AdminProps> = ({ userEmail }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Strict Access Control
    if (userEmail !== 'jabu04753@gmail.com') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
                <Lock size={64} className="text-red-500 mb-6" />
                <h1 className="text-3xl font-black mb-2">Restricted Access</h1>
                <p className="text-slate-500 font-medium">This secure console is visible only to authorized administrators.</p>
                <p className="text-xs text-slate-400 mt-8 font-mono">ID: {auth.currentUser?.uid || 'ANONYMOUS'}</p>
            </div>
        );
    }

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        const data = await getReports();
        setReports(data);
        setLoading(false);
    };

    const handleDismiss = async (reportId: string) => {
        if (!confirm("Dismiss this report?")) return;
        setActionLoading(reportId);
        try {
            await dismissReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (e) {
            alert("Failed to dismiss");
        }
        setActionLoading(null);
    };

    const handleDeletePost = async (reportId: string, postId: string) => {
        if (!confirm("PERMANENTLY DELETE POST? This cannot be undone.")) return;
        setActionLoading(reportId);
        try {
            await deleteReportedPost(reportId, postId);
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (e) {
            alert("Failed to delete post");
        }
        setActionLoading(null);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldAlert className="text-indigo-600" size={32} />
                        Admin Console
                    </h1>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-wider">Moderation Queue</p>
                </div>
                <button
                    onClick={loadReports}
                    className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl font-bold shadow-sm text-sm hover:text-indigo-600 transition-colors"
                >
                    Refresh
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">All Clear!</h3>
                    <p className="text-slate-400">No pending reports to review.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reports.map(report => (
                        <div key={report.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex gap-6 relative overflow-hidden group">
                            {actionLoading === report.id && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            )}

                            <div className="w-1.5 bg-red-500 rounded-full shrink-0" />

                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-500/20">
                                        Reported
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                        {new Date(report.timestamp).toLocaleString()}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Reason</h4>
                                    <p className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        {report.reason}
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 mb-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Original Content</h4>
                                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                        "{report.postContent}"
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2 font-bold">— {report.postAuthor}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleDeletePost(report.id, report.postId)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/20"
                                    >
                                        <Trash2 size={16} />
                                        Delete Post
                                    </button>
                                    <button
                                        onClick={() => handleDismiss(report.id)}
                                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors border border-slate-200 dark:border-slate-700"
                                    >
                                        Dismiss Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Admin;
