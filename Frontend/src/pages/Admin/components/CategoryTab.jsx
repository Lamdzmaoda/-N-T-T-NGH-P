import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import placeService from '../../../services/placeService'

const CategoryTab = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'create', data: null })
  const [categoryName, setCategoryName] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await placeService.getCategories()
      setCategories(res.data.result || [])
    } catch (err) {
      console.error('Lỗi tải danh mục:', err)
      alert('Không thể tải danh sách danh mục.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleOpenCategoryModal = (mode, data = null) => {
    setCategoryModal({ open: true, mode, data })
    setCategoryName(data ? data.name : '')
  }

  const handleCloseCategoryModal = () => {
    setCategoryModal({ open: false, mode: 'create', data: null })
    setCategoryName('')
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    try {
      if (categoryModal.mode === 'create') {
        await placeService.createCategory({ name: categoryName })
      } else {
        await placeService.updateCategory(categoryModal.data.id, { name: categoryName })
      }
      loadCategories()
      handleCloseCategoryModal()
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu danh mục thất bại')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
    try {
      await placeService.deleteCategory(id)
      loadCategories()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa danh mục thất bại')
    }
  }

  return (
    <div>
      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>Danh mục Địa điểm</h2>
        <button style={styles.btnAdd} onClick={() => handleOpenCategoryModal('create')}>
          <Plus size={16} /> Thêm Danh mục
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderWrap}>
            <span style={{ fontSize: '14px', color: '#666' }}>Đang tải danh mục...</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>STT</th>
                <th style={styles.th}>Tên danh mục</th>
                <th style={styles.th}>ID danh mục</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id} style={styles.tr}>
                  <td style={{ ...styles.td, width: '80px' }}>{index + 1}</td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600', color: '#F8FAFC' }}>{cat.name}</span>
                  </td>
                  <td style={{ ...styles.td, color: '#64748B', fontSize: '12px' }}>{cat.id}</td>
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      <button style={styles.btnActionEdit} onClick={() => handleOpenCategoryModal('edit', cat)} title="Sửa">
                        <Edit size={14} />
                      </button>
                      <button style={styles.btnActionDelete} onClick={() => handleDeleteCategory(cat.id)} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4" style={styles.tdEmpty}>Không có danh mục nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DANH MỤC */}
      {categoryModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>{categoryModal.mode === 'create' ? 'Thêm Danh mục mới' : 'Sửa Danh mục'}</h3>
              <button style={styles.btnCloseModal} onClick={handleCloseCategoryModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Tên danh mục</label>
                <input
                  style={styles.modalInput}
                  required
                  placeholder="Nhập tên (ví dụ: Khách sạn, Ẩm thực...)"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={handleCloseCategoryModal}>Hủy</button>
                <button type="submit" style={styles.btnConfirm}>Lưu lại</button>
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
  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
    color: '#0A0F1E',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 0 16px rgba(56,189,248,0.25)',
    transition: 'all 0.2s',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  loaderWrap: {
    display: 'flex',
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

export default CategoryTab
