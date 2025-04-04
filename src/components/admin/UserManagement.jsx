import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Edit2, Lock, Unlock, X } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'MANAGER',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  // Исправляем функцию fetchUsers
  const fetchUsers = async () => {
    try {
      setError('')
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Требуется авторизация')
        setLoading(false)
        return
      }

      console.log('Запрос на получение пользователей...')
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('Статус ответа:', response.status)

      if (!response.ok) {
        let errorMessage = 'Ошибка при загрузке пользователей'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // Возможно, ответ не JSON
          const errorText = await response.text()
          console.error('Текст ошибки:', errorText)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Полученные данные:', data)

      // Убедимся, что data - массив
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        console.error('Сервер вернул не массив:', data)
        setUsers([]) // Устанавливаем пустой массив
        setError('Получены некорректные данные с сервера')
      }
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err)
      setError(err.message || 'Ошибка при загрузке пользователей')
      setUsers([]) // Убедимся, что users - массив
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) throw new Error('Ошибка при обновлении роли')

      fetchUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  const toggleUserBlock = async (userId, isBlocked) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blocked: !isBlocked }),
      })

      if (!response.ok) throw new Error('Ошибка при блокировке/разблокировке')

      fetchUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  const createUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Ошибка при создании пользователя')

      fetchUsers()
      setShowForm(false)
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'MANAGER',
      })
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-center">Загрузка...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Управление пользователями</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          <UserPlus className="w-5 h-5 mr-2" />
          Добавить менеджера
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 mb-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Создание менеджера</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Имя</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Фамилия</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Пароль</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={createUser} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Создать менеджера
            </button>
          </div>
        </motion.div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Пользователь
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Роль</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={e => updateUserRole(user.id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md">
                    <option value="CLIENT">Клиент</option>
                    <option value="MANAGER">Менеджер</option>
                    <option value="ADMIN">Администратор</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {user.blocked ? 'Заблокирован' : 'Активен'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-900">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleUserBlock(user.id, user.blocked)}
                      className={`${
                        user.blocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'
                      }`}>
                      {user.blocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
