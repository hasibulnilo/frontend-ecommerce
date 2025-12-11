// Fixed: src/components/Dashboard/TableRows/CustomerOrderDataRow.jsx
// Added: Cancel mutation with backend PATCH to update order status to 'canceled'
// Passed onConfirm to DeleteModal for actual cancel action
// Added refetch via queryClient.invalidateQueries for 'orders'
// Renamed modal to CancelModal? No, kept DeleteModal as per original, but updated logic
import { useState } from 'react'
import DeleteModal from '../../Modal/DeleteModal' // Consider renaming to CancelModal for clarity
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const CustomerOrderDataRow = ({ order }) => {
  let [isOpen, setIsOpen] = useState(false)
  const closeModal = () => setIsOpen(false)

  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  // Cancel mutation: Update order status to 'canceled'
  const { mutate: cancelOrder, isPending: isCanceling } = useMutation({
    mutationFn: async (orderId) => {
      return await axiosSecure.patch(`/orders/${orderId}`, { status: 'canceled' })
    },
    onSuccess: () => {
      toast.success('Order canceled successfully!')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      closeModal()
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel order')
    },
  })

  const handleCancelConfirm = () => {
    if (order?._id) {
      cancelOrder(order._id)
    }
  }

  const { image, name, category, price, quantity, status } = order || {}

  // Prevent cancel if already canceled or delivered
  const canCancel = status === 'pending' || status === 'In Progress'

  return (
    <tr>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <div className='flex items-center'>
          <div className='shrink-0'>
            <div className='block relative'>
              <img
                alt='profile'
                src={image}
                className='mx-auto object-cover rounded h-10 w-15 '
              />
            </div>
          </div>
        </div>
      </td>

      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900'>{name}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900'>{category}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900'>${price}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900'>{quantity}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900'>{status}</p>
      </td>

      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <button
          onClick={() => setIsOpen(true)}
          disabled={!canCancel || isCanceling}
          className='relative disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer inline-block px-3 py-1 font-semibold text-lime-900 leading-tight'
        >
          <span className='absolute cursor-pointer inset-0 bg-red-200 opacity-50 rounded-full'></span>
          <span className='relative cursor-pointer'>{isCanceling ? 'Canceling...' : 'Cancel'}</span>
        </button>

        <DeleteModal 
          isOpen={isOpen} 
          closeModal={closeModal} 
          onConfirm={handleCancelConfirm}
          isLoading={isCanceling}
          title="Cancel Order?" // Optional: Pass custom title if modal supports
          message="Are you sure you want to cancel this order? This action cannot be undone." // Optional: Custom message
        />
      </td>
    </tr>
  )
}

export default CustomerOrderDataRow