'use client';

import React, { useState } from 'react';
import { useRace } from '../../context/RaceContext';
import { CreateTeamModal } from './CreateTeamModal';

export const AdminDashboard: React.FC = () => {
  const {
    race,
    rules,
    teams,
    appeals,
    financeLedger,
    auditLogs,
    reviewAppeal,
    confirmPayment,
    waivePenalty,
    setRaceLifecycle,
    recalculateAll,
    exportData,
  } = useRace();

  const [activeTab, setActiveTab] = useState<'appeals' | 'finance' | 'lifecycle' | 'teams' | 'audit'>('appeals');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [recalcResult, setRecalcResult] = useState<{
    totalActivities: number;
    validCount: number;
    rejectedCount: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingAppeals = appeals.filter((a) => a.status === 'PENDING');

  const handleApproveAppeal = (appId: string, originalKm: number) => {
    const kmStr = prompt(`Nhập số cự ly công nhận cho VĐV (km):`, originalKm.toString());
    if (kmStr === null) return;
    const km = parseFloat(kmStr) || originalKm;
    const note = prompt('Ghi chú của Ban Tổ Chức:', 'Chấp thuận khiếu nại sau khi đối soát GPS.');
    reviewAppeal(appId, 'APPROVED', km, note || undefined);
    showToast(`Đã chấp thuận khiếu nại #${appId} (+${km} km)!`);
  };

  const handleRejectAppeal = (appId: string) => {
    const note = prompt('Lý do từ chối khiếu nại:', 'Dữ liệu không đủ cơ sở xác minh.');
    if (note === null) return;
    reviewAppeal(appId, 'REJECTED', 0, note);
    showToast(`Đã từ chối khiếu nại #${appId}.`);
  };

  const handleWaivePenalty = (ledgerId: string) => {
    const reason = prompt('Nhập lý do miễn trừ tiền phạt:', 'VĐV có giấy xác nhận chấn thương y tế');
    if (!reason) return;
    waivePenalty(ledgerId, reason);
    showToast(`Đã miễn phạt cho VĐV thành công!`);
  };

  const handleRecalculate = () => {
    const res = recalculateAll();
    setRecalcResult(res);
    showToast(`Đã tính toán lại toàn giải: ${res.validCount}/${res.totalActivities} bài hợp lệ!`);
    setTimeout(() => setRecalcResult(null), 5000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER & RACE METRICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5B26]">Admin Console (M13)</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-white uppercase font-mono">
              Role: Race Admin
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">{race.name}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Điều hành giải đấu, xử lý khiếu nại, đối soát tài chính và chuyển vòng đời giải chạy.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRecalculate}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1.5"
            title="Tính lại toàn bộ các bài chạy theo luật hiện hành"
          >
            <span>🔄</span>
            <span>Tính lại toàn giải</span>
          </button>

          <button
            onClick={() => exportData('activities', 'csv')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Xuất Dữ Liệu</span>
          </button>
        </div>
      </div>

      {recalcResult && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
          <div>
            <strong>✓ Kết quả tính toán lại toàn giải:</strong> Tổng cộng {recalcResult.totalActivities} bài chạy •{' '}
            <span className="text-emerald-700 font-bold">{recalcResult.validCount} bài hợp lệ</span> •{' '}
            <span className="text-rose-700 font-bold">{recalcResult.rejectedCount} bài bị loại</span>
          </div>
          <button onClick={() => setRecalcResult(null)} className="text-blue-500 font-bold hover:text-blue-800">
            ✕
          </button>
        </div>
      )}

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100 text-xs font-bold">
        <button
          onClick={() => setActiveTab('appeals')}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'appeals'
              ? 'border-[#FF5B26] text-[#FF5B26]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Khiếu nại</span>
          {pendingAppeals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
              {pendingAppeals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'finance'
              ? 'border-[#FF5B26] text-[#FF5B26]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Đối soát nộp quỹ
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'teams'
              ? 'border-[#FF5B26] text-[#FF5B26]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quản lý đội thi ({teams.length})
        </button>

        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'lifecycle'
              ? 'border-[#FF5B26] text-[#FF5B26]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Vòng đời giải đấu
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-[#FF5B26] text-[#FF5B26]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Nhật ký Audit ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: APPEALS MANAGEMENT */}
      {activeTab === 'appeals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Hàng đợi xử lý khiếu nại ({pendingAppeals.length} bài chờ duyệt)
            </h3>
          </div>

          {appeals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">Hiện tại không có khiếu nại nào.</div>
          ) : (
            <div className="space-y-3">
              {appeals.map((app) => {
                const isPending = app.status === 'PENDING';
                return (
                  <div
                    key={app.id}
                    className="p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{app.runnerName}</span>
                          <span className="text-xs text-slate-400 font-mono">#{app.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : app.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPending ? 'Chờ duyệt' : app.status === 'APPROVED' ? 'Đã chấp thuận' : 'Bị từ chối'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 mt-0.5">{app.activityTitle}</div>
                      </div>

                      <div className="text-right text-xs text-slate-400 font-mono">
                        {new Date(app.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <div className="text-slate-700">
                        <strong>Lý do của VĐV:</strong> {app.reason}
                      </div>
                      {app.evidenceUrl && (
                        <div className="text-slate-500">
                          <strong>Bằng chứng:</strong>{' '}
                          <a
                            href={app.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#FF5B26] underline font-mono text-[11px]"
                          >
                            {app.evidenceUrl}
                          </a>
                        </div>
                      )}
                      {app.adminNote && (
                        <div className="text-emerald-800 pt-1 border-t border-slate-100">
                          <strong>Phản hồi Admin:</strong> {app.adminNote}
                          {app.adjustedKm ? ` (+${app.adjustedKm} km)` : ''}
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleRejectAppeal(app.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                        >
                          ✕ Từ chối
                        </button>
                        <button
                          onClick={() => handleApproveAppeal(app.id, app.originalKm)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5"
                        >
                          <span>✓</span>
                          <span>Chấp thuận (+km)</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FINANCE SETTLEMENT */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Sổ cái công nợ VĐV toàn giải</h3>
              <p className="text-xs text-slate-500">Xác nhận thu nộp quỹ và miễn trừ tiền phạt</p>
            </div>
            <button
              onClick={() => exportData('finance', 'csv')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Xuất sổ cái CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">VĐV & Đội</th>
                  <th className="py-2.5 px-3">Quỹ theo hạng</th>
                  <th className="py-2.5 px-3">Phạt thiếu km</th>
                  <th className="py-2.5 px-3">Tổng phải nộp</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {financeLedger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.runnerName}</div>
                      <div className="text-[11px] text-slate-500">{item.teamName}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">{item.tieredFee.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-3 font-mono text-rose-600">
                      {item.penaltyFee > 0 ? `${item.penaltyFee.toLocaleString('vi-VN')}đ` : '0đ'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {item.totalDue.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'PENDING_CONFIRMATION'
                            ? 'bg-amber-50 text-amber-700'
                            : item.status === 'WAIVED'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status === 'PAID'
                          ? 'Đã thu'
                          : item.status === 'PENDING_CONFIRMATION'
                          ? 'Chờ xác nhận'
                          : item.status === 'WAIVED'
                          ? 'Đã miễn phạt'
                          : 'Chưa nộp'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      {item.status !== 'PAID' && (
                        <button
                          onClick={() => confirmPayment(item.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                        >
                          Xác nhận thu
                        </button>
                      )}
                      {item.penaltyFee > 0 && item.status !== 'WAIVED' && (
                        <button
                          onClick={() => handleWaivePenalty(item.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        >
                          Miễn phạt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TEAMS MANAGEMENT */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Danh sách các đội thi đấu</h3>
            <button
              onClick={() => setIsCreateTeamOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF5B26] text-white hover:bg-[#e04800] transition"
            >
              + Tạo Đội Mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {teams.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-slate-900 text-xs">{t.name}</h4>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    Hạng #{t.rank}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 italic">"{t.slogan}"</p>
                <div className="pt-2 border-t border-slate-200/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sĩ số:</span>
                    <strong className="font-mono">{t.currentMembers} / {t.maxMembers} VĐV</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tổng km:</span>
                    <strong className="font-mono text-slate-900">{t.totalKm.toFixed(1)} km</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RACE LIFECYCLE */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-4 max-w-xl">
          <h3 className="text-sm font-extrabold text-slate-900">Vòng đời và Trạng thái Giải đấu</h3>
          <p className="text-xs text-slate-500">
            Chuyển trạng thái ảnh hưởng đến việc ghi nhận bài chạy và chốt sổ cái tài chính.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800">Trạng thái hiện tại:</label>
            <select
              value={race.status}
              onChange={(e) => setRaceLifecycle(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            >
              <option value="draft">Bản nháp (draft) - Chỉ Admin xem & sửa luật</option>
              <option value="open">Mở đăng ký (open) - VĐV gia nhập đội</option>
              <option value="running">Đang diễn ra (running) - Tự động nhận webhook & tính điểm</option>
              <option value="finalizing">Ân hạn & Khiếu nại (finalizing) - Dừng nhận bài mới</option>
              <option value="closed">Đã đóng giải (closed) - Chốt thứ hạng & phân tầng nộp quỹ</option>
            </select>

            <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <div>• <strong>running:</strong> Hệ thống mở cổng Strava Webhook tiếp nhận liên tục.</div>
              <div>• <strong>closed:</strong> Tự động chốt Đội vô địch đóng 100k, Đồng hạng 2 đóng 200k.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">Nhật ký kiểm toán hệ thống (Audit Trail)</h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-800 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded mr-2">
                    {log.action}
                  </span>
                  <span className="text-slate-600">{log.details}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">Tác nhân: {log.actor}</div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
