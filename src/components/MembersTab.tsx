import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Calendar, 
  Home, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Utensils, 
  Wallet,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Member, MemberCalculation } from '../types';
import { formatTaka, toBnNum, formatMeals, formatBengaliDate } from '../utils/bengali';
import { ConfirmModal } from './ConfirmModal';

interface MembersTabProps {
  members: Member[];
  memberCalculations: MemberCalculation[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  members,
  memberCalculations,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roomOrNote, setRoomOrNote] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [active, setActive] = useState(true);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setPhone('');
    setRoomOrNote('');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setName(member.name);
    setPhone(member.phone);
    setRoomOrNote(member.roomOrNote || '');
    setJoinDate(member.joinDate);
    setActive(member.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        name: name.trim(),
        phone: phone.trim(),
        roomOrNote: roomOrNote.trim(),
        joinDate,
        active,
      });
    } else {
      onAddMember({
        name: name.trim(),
        phone: phone.trim(),
        roomOrNote: roomOrNote.trim(),
        joinDate,
        active: true,
      });
    }

    setIsModalOpen(false);
  };

  const getCalculation = (memberId: string) => {
    return memberCalculations.find((c) => c.memberId === memberId);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Banner & Add Button */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-orange-400 font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>মেস মেম্বার ব্যবস্থাপনা</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-1">
            মোট সদস্য: {toBnNum(members.length)} জন
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            সক্রিয় সদস্য: {toBnNum(members.filter((m) => m.active).length)} জন
          </div>
        </div>

        <button
          id="add-member-btn"
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>নতুন মেম্বার যুক্ত করুন</span>
        </button>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
            কোনো সদস্য তালিকাভুক্ত নেই। উপরে বোতামে ক্লিক করে নতুন সদস্য যোগ করুন।
          </div>
        ) : (
          members.map((member) => {
            const calc = getCalculation(member.id);

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">
                        {member.name}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          member.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> সক্রিয়
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> নিষ্ক্রিয়
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {member.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{member.phone}</span>
                        </span>
                      )}
                      {member.roomOrNote && (
                        <span className="flex items-center gap-1">
                          <Home className="w-3 h-3 text-slate-400" />
                          <span>{member.roomOrNote}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>যোগদান: {formatBengaliDate(member.joinDate)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="মেম্বার তথ্য পরিবর্তন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setMemberToDelete(member)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-700 transition-colors"
                      title="মেম্বার মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick stats for this member */}
                {calc && (
                  <div className="grid grid-cols-3 gap-2 pt-3 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                      <div className="text-slate-500 text-[11px] flex items-center justify-center gap-1">
                        <Utensils className="w-3 h-3 text-orange-500" />
                        <span>মাসের মিল</span>
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {formatMeals(calc.totalMeals)} টি
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                      <div className="text-slate-500 text-[11px] flex items-center justify-center gap-1">
                        <Wallet className="w-3 h-3 text-emerald-500" />
                        <span>মোট জমা</span>
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {formatTaka(calc.totalDeposit)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                      <div className="text-slate-500 text-[11px]">বর্তমান ব্যালেন্স</div>
                      <div
                        className={`font-extrabold mt-0.5 ${
                          calc.status === 'advance'
                            ? 'text-emerald-600'
                            : calc.status === 'due'
                            ? 'text-rose-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {calc.status === 'advance' && '+'}
                        {formatTaka(calc.netBalance.toFixed(0))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD / EDIT MEMBER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-600" />
                <span>{editingMember ? 'মেম্বার প্রোফাইল পরিবর্তন' : 'নতুন মেস মেম্বার যোগ'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মেম্বারের পূর্ণ নাম
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  required
                  autoFocus
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01711223344"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Room / Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  রুম নম্বর / সিট বা পদবী
                </label>
                <input
                  type="text"
                  value={roomOrNote}
                  onChange={(e) => setRoomOrNote(e.target.value)}
                  placeholder="যেমন: রুম ২০২ (ম্যানেজার) / সিট ২"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মেসে যোগদানের তারিখ
                </label>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Active Toggle (If editing) */}
              {editingMember && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-800">
                    মেম্বার স্ট্যাটাস:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActive(!active)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {active ? 'সক্রিয় সদস্য' : 'নিষ্ক্রিয় (মেস ছেড়েছে)'}
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition-colors"
                >
                  {editingMember ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(memberToDelete)}
        title="মেম্বার মুছে ফেলুন"
        message={`আপনি কি "${memberToDelete?.name || 'এই মেম্বার'}" কে স্থায়ীভাবে মুছে ফেলতে চান?\n\nসদস্য মুছে ফেললে তার সকল মিল, জমা ও খরচের রেকর্ড সম্পূর্ণরূপে মুছে যাবে এবং মেসের সদস্য সংখ্যা স্বয়ংক্রিয়ভাবে আপডেট হবে।`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        isDestructive={true}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete) {
            onDeleteMember(memberToDelete.id);
            setMemberToDelete(null);
          }
        }}
      />
    </div>
  );
};
