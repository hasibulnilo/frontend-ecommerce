// Updated: src/components/Dashboard/TableRows/PlantDataRow.jsx
// Added: Delete mutation, Update modal with plant prop passing, refetch on success
import { useState } from 'react'
import DeleteModal from '../../Modal/DeleteModal'
import UpdatePlantModal from '../../Modal/UpdatePlantModal'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const PlantDataRow = ({ plant }) => {
  let [isOpen, setIsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPlant, setSelectedPlant] = useState(null)

  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  // Delete mutation
  const { mutate: deletePlant, isPending: isDeleting } = useMutation({
    mutationFn: async (plantId) => {
      return await axiosSecure.delete(`/plants/${plantId}`)
    },
    onSuccess: () => {
      toast.success('Plant deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      closeModal()
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete plant')
    },
  })

  function openModal() {
    setIsOpen(true)
  }
  function closeModal() {
    setIsOpen(false)
  }

  function openEditModal(selectedPlantData) {
    setSelectedPlant(selectedPlantData)
    setIsEditModalOpen(true)
  }

  function closeEditModal() {
    setIsEditModalOpen(false)
    setSelectedPlant(null)
  }

  const handleDeleteConfirm = () => {
    deletePlant(plant._id)
  }

  const { image, name, category, quantity, price } = plant
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
        <p className='text-gray-900 '>{name}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 '>{category}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 '>${price}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 '>{quantity}</p>
      </td>

      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <span
          onClick={openModal}
          disabled={isDeleting}
          className='relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight'
        >
          <span
            aria-hidden='true'
            className='absolute inset-0 bg-red-200 opacity-50 rounded-full'
          ></span>
          <span className='relative'>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </span>
        <DeleteModal 
          isOpen={isOpen} 
          closeModal={closeModal} 
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
        />
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <span
          onClick={() => openEditModal(plant)}
          className='relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight'
        >
          <span
            aria-hidden='true'
            className='absolute inset-0 bg-green-200 opacity-50 rounded-full'
          ></span>
          <span className='relative'>Update</span>
        </span>
        <UpdatePlantModal
          isOpen={isEditModalOpen}
          setIsEditModalOpen={closeEditModal}
          plant={selectedPlant}
        />
      </td>
    </tr>
  )
}

export default PlantDataRow