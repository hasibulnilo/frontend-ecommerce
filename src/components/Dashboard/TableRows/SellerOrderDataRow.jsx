// Updated: src/components/Dashboard/TableRows/SellerOrderDataRow.jsx
// Enhanced: Seller can cancel orders (sets to 'canceled', removes from both views via filter)
// Added: Prevent cancel if 'Delivered' or already 'canceled'
import { useState } from 'react'
import DeleteModal from '../../Modal/DeleteModal'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const SellerOrderDataRow = ({ order }) => {
  let [isOpen, setIsOpen] = useState(false)
  const closeModal = () => setIsOpen(false)

  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  // Update status mutation (for seller progress/deliver)
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      return await axiosSecure.patch(`/orders/${orderId}`, { status: newStatus })
    },
    onSuccess: () => {
      toast.success('Order status updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update status')
    },
  })

  // Cancel mutation (seller can cancel)
  const { mutate: cancelOrder, isPending: isCanceling } = useMutation({
    mutationFn: async (orderId) => {
      return await axiosSecure.patch(`/orders/${orderId}`, { status: 'canceled' })
    },
    onSuccess: () => {
      toast.success('Order canceled successfully! It will be removed from customer\'s view.')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      closeModal()
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel order')
    },
  })

  const handleStatusChange = (e) => {
    const newStatus = e.target.value
    if (newStatus !== order.status) {
      updateStatus({ orderId: order._id, newStatus })
    }
  }

  const handleCancelConfirm = () => {
    if (order?._id) {
      cancelOrder(order._id)
    }
  }

  const { name, price, quantity, status, customer } = order || {}

  // Seller can cancel if not 'Delivered' or 'canceled'
  const canCancel = status !== 'Delivered' && status !== 'canceled'

  return (
    <tr>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 '>{name}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 '>{customer?.name || customer}</p> {/* Handle customer object */}
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 '>${price}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 '>{quantity}</p>
      </td>

      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 '>{status}</p>
      </td>

      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <div className='flex items-center gap-2'>
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={isUpdating || status === 'canceled'}
            className='p-1 border-2 border-lime-300 focus:outline-lime-500 rounded-md text-gray-900  bg-white disabled:opacity-50'
            name='status'
          >
            <option value='Pending'>Pending</option>
            <option value='In Progress'>Start Processing</option>
            <option value='Delivered'>Deliver</option>
            <option value='canceled' disabled>Canceled</option> {/* Disabled option for clarity */}
          </select>
          <button
            onClick={() => setIsOpen(true)}
            disabled={!canCancel || isCanceling}
            className='relative disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer inline-block px-3 py-1 font-semibold text-red-900 leading-tight'
          >
            <span
              aria-hidden='true'
              className='absolute inset-0 bg-red-200 opacity-50 rounded-full'
            ></span>
            <span className='relative'>{isCanceling ? 'Canceling...' : 'Cancel'}</span>
          </button>
        </div>
        <DeleteModal 
          isOpen={isOpen} 
          closeModal={closeModal} 
          onConfirm={handleCancelConfirm}
          isLoading={isCanceling}
          title="Cancel Order?"
          message="Are you sure? This will remove the order from customer's view too."
        />
      </td>
    </tr>
  )
}

export default SellerOrderDataRow