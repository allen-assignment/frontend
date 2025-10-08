import React, { useState } from 'react';
import { Search, UserPlus, Mail, Phone, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';

const MerchantMembers: React.FC = () => {
    const { state } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [showMemberDetail, setShowMemberDetail] = useState(false);

    // Filter members based on search term
    const filteredMembers = state.members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
    );

    const handleViewMember = (member: any) => {
        setSelectedMember(member);
        setShowMemberDetail(true);
    };

    // Calculate total stats
    const totalMembers = state.members.length;

    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="bg-gray-800 text-white w-full">
                <div className="py-4">
                    <h1 className="text-xl font-bold text-center">Members Management</h1>
                </div>
                <div className="h-px bg-gray-300"></div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-6 pb-24">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Members</p>
                                <p className="text-xl font-bold text-gray-800">{totalMembers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="space-y-4">
                    {filteredMembers.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 text-center">
                            <p className="text-gray-500">
                                {searchTerm ? 'No members found matching your search' : 'No members yet'}
                            </p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => (
                            <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-800">{member.name}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {member.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                {member.phone}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewMember(member)}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Member Detail Modal */}
            {showMemberDetail && selectedMember && (
                <MemberDetailModal
                    member={selectedMember}
                    onClose={() => setShowMemberDetail(false)}
                />
            )}
        </div>
    );
};

// Member Detail Modal Component
const MemberDetailModal: React.FC<{
    member: any;
    onClose: () => void;
}> = ({ member, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold">{member.name}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">Contact Information</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{member.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">{member.totalOrders}</div>
                                <div className="text-sm text-gray-600">Total Orders</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">¥{member.totalSpent}</div>
                                <div className="text-sm text-gray-600">Total Spent</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MerchantMembers;