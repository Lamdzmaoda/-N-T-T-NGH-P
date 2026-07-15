import { useState, useEffect } from 'react'
import { Edit, Trash2, X, Loader2 } from 'lucide-react'
import authService from '../../../services/authService'

const UserTab = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [userModal, setUserModal] = useState({ open: false, data: null })
  const [userForm, setUserForm] = useState({
    full_name: '',
    phone: '',
    dob: '',
    roles: [],
    bio: '',
    avatarUrl: ''
  })

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await authService.getUsers()
      setUsers(res.data || [])
    } catch (err) {
      console.error('Lỗi tải thành viên:', err)
      alert('Không thể tải danh sách thành viên.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleOpenUserModal = (data) => {
    setUserModal({ open: true, data })
    setUserForm({
      full_name: data.full_name || '',
      phone: data.phone || '',
      dob: data.dob || '',
      roles: data.roles ? data.roles.map(r => r.name) : [],
      bio: data.bio || '',
      avatarUrl: data.avatarUrl || ''
    })
  }

  const handleCloseUserModal = () => {
    setUserModal({ open: false, data: null })
  }

  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value })
  }

  const handleRoleCheckboxChange = (roleName, checked) => {
    let updatedRoles = [...userForm.roles]
    if (checked) {
      if (!updatedRoles.includes(roleName)) updatedRoles.push(roleName)
    } else {
      updatedRoles = updatedRoles.filter(r => r !== roleName)
    }
    setUserForm({ ...userForm, roles: updatedRoles })
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    try {
      await authService.updateUser(userModal.data.id, userForm)
      loadUsers()
      handleCloseUserModal()
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật thành viên thất bại')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi hệ thống?')) return
    try {
      await authService.deleteUser(id)
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thành viên thất bại')
    }
  }

  return (
    <div>
      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>Danh sách Thành viên</h2>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderWrap}>
            <Loader2 size={36} color="#185FA5" className="animate-spin" />
            <span style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>Đang tải danh sách thành viên...</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Avatar</th>
                <th style={styles.th}>Tên đăng nhập</th>
                <th style={styles.th}>Họ và tên</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Số điện thoại</th>
                <th style={styles.th}>Vai trò (Roles)</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                      alt={user.username}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
                      }}
                    />
                  </td>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#F8FAFC' }}>{user.username}</td>
                  <td style={{ ...styles.td, color: '#E2E8F0' }}>{user.full_name || '-'}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.phone || '-'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {user.roles?.map(r => (
                        <span
                          key={r.name}
                          style={{
                            ...styles.badge,
                            backgroundColor: r.name === 'ADMIN' ? 'rgba(244,63,94,0.1)' : 'rgba(56,189,248,0.1)',
                            color: r.name === 'ADMIN' ? '#F43F5E' : '#38BDF8',
                            border: r.name === 'ADMIN' ? '1px solid rgba(244,63,94,0.2)' : '1px solid rgba(56,189,248,0.2)'
                          }}
                        >
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      <button style={styles.btnActionEdit} onClick={() => handleOpenUserModal(user)} title="Sửa vai trò/thông tin">
                        <Edit size={14} />
                      </button>
                      <button style={styles.btnActionDelete} onClick={() => handleDeleteUser(user.id)} title="Xóa tài khoản">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" style={styles.tdEmpty}>Không có thành viên nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL USER */}
      {userModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>Chỉnh sửa vai trò & thông tin</h3>
              <button style={styles.btnCloseModal} onClick={handleCloseUserModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Họ và tên</label>
                <input
                  style={styles.modalInput}
                  name="full_name"
                  value={userForm.full_name}
                  onChange={handleUserFormChange}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Số điện thoại</label>
                <input
                  style={styles.modalInput}
                  name="phone"
                  value={userForm.phone}
                  onChange={handleUserFormChange}
                  placeholder="0912345678"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Ngày sinh</label>
                <input
                  style={styles.modalInput}
                  type="date"
                  name="dob"
                  value={userForm.dob}
                  onChange={handleUserFormChange}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Vai trò (Roles)</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={userForm.roles.includes('USER')}
                      onChange={(e) => handleRoleCheckboxChange('USER', e.target.checked)}
                    />
                    USER
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={userForm.roles.includes('ADMIN')}
                      onChange={(e) => handleRoleCheckboxChange('ADMIN', e.target.checked)}
                    />
                    ADMIN
                  </label>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Giới thiệu ngắn (Bio)</label>
                <textarea
                  style={styles.modalTextarea}
                  name="bio"
                  value={userForm.bio}
                  onChange={handleUserFormChange}
                  rows="3"
                  placeholder="Thông tin giới thiệu ngắn..."
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={handleCloseUserModal}>Hủy</button>
                <button type="submit" style={styles.btnConfirm}>Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  tabHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  tabTitle: { fontSize: '20px', fontWeight: '800', color: '#F8FAFC', letterSpacing: '-0.5px' },
  card: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  loaderWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: {
    padding: '12px 16px',
    borderBottom: '2px solid rgba(255,255,255,0.08)',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '16px', fontSize: '13px', color: '#94A3B8', verticalAlign: 'middle' },
  tdEmpty: { padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '14px' },
  badge: {
    fontSize: '10px',
    padding: '3px 8px',
    borderRadius: '20px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  actionsCell: { display: 'flex', gap: '8px' },
  btnActionEdit: {
    border: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#F8FAFC',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  btnActionDelete: {
    border: '1px solid rgba(244,63,94,0.15)',
    backgroundColor: 'rgba(244,63,94,0.1)',
    color: '#F43F5E',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  modalCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    padding: '28px',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '14px',
    marginBottom: '18px',
  },
  btnCloseModal: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#64748B',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  modalLabel: { fontSize: '11px', fontWeight: '600', color: '#64748B', letterSpacing: '0.03em' },
  modalInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '13px',
    color: '#F8FAFC',
    outline: 'none',
    fontFamily: 'inherit',
  },
  modalTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: '13px',
    color: '#F8FAFC',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  btnCancel: {
    padding: '8px 18px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'inherit',
  },
  btnConfirm: {
    padding: '8px 18px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'inherit',
    boxShadow: '0 0 16px rgba(56,189,248,0.2)',
  },
}

export default UserTab
