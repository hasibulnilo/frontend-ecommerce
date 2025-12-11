// Fixed: src/components/Dashboard/Statistics/CustomerStatistics.jsx
// Corrected: Separate imports for FaDollarSign (fa) and BsFillCartPlusFill (bs)
import { useQuery } from '@tanstack/react-query'
import useAuth from '../../../hooks/useAuth'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import LoadingSpinner from '../../../components/Shared/LoadingSpinner'
import { FaDollarSign } from 'react-icons/fa'
import { BsFillCartPlusFill } from 'react-icons/bs'

const CustomerStatistics = () => {
  const { user } = useAuth()
  const axiosSecure = useAxiosSecure()

  // Total Spent: Sum of customer's completed orders
  const { data: spent = 0 } = useQuery({
    queryKey: ['customerSpent', user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/customer/revenue/${user?.email}`)
      return data.revenue || 0
    },
  })

  // Total Orders: Count of customer's orders
  const { data: totalOrders = 0 } = useQuery({
    queryKey: ['customerOrders', user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/customer/orders/${user?.email}`)
      return data.orders || 0
    },
  })

  if (!spent && !totalOrders) {
    return <LoadingSpinner />
  }

  return (
    <div className='mt-12'>
      <div className='mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 grow'>
        {/* Total Spent */}
        <div className='relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md'>
          <div
            className={`bg-clip-border mx-4 rounded-xl overflow-hidden bg-linear-to-tr shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center from-orange-600 to-orange-400 text-white shadow-orange-500/40`}
          >
            <FaDollarSign className='w-6 h-6 text-white' />
          </div>
          <div className='p-4 text-right'>
            <p className='block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600'>
              Total Spent
            </p>
            <h4 className='block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900'>
              ${spent.toFixed(2)}
            </h4>
          </div>
        </div>
        {/* Total Orders */}
        <div className='relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md'>
          <div
            className={`bg-clip-border mx-4 rounded-xl overflow-hidden bg-linear-to-tr shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center from-blue-600 to-blue-400 text-white shadow-blue-500/40`}
          >
            <BsFillCartPlusFill className='w-6 h-6 text-white' />
          </div>
          <div className='p-4 text-right'>
            <p className='block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600'>
              Total Orders
            </p>
            <h4 className='block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900'>
              {totalOrders}
            </h4>
          </div>
        </div>
      </div>
      <div className='mb-4 grid grid-cols-1 gap-6'>
        {/* Chart Placeholder */}
        <div className='relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md overflow-hidden'>
          <p className='p-4'>Customer Spending Chart Placeholder</p>
        </div>
      </div>
    </div>
  )
}

export default CustomerStatistics