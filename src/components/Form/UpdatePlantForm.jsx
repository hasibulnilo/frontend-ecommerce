// Fixed: src/components/Form/UpdatePlantForm.jsx
// Corrected import path for LoadingSpinner: from "../../Shared/LoadingSpinner" to "../Shared/LoadingSpinner"
import { useForm } from 'react-hook-form'
import { imageUpload } from '../../utils'
import useAuth from '../../hooks/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import LoadingSpinner from '../Shared/LoadingSpinner'
import toast from 'react-hot-toast'
import { TbFidgetSpinner } from 'react-icons/tb'
import useAxiosSecure from '../../hooks/useAxiosSecure'
import { useEffect } from 'react'

const UpdatePlantForm = ({ plant, onSuccess }) => {
  const { user } = useAuth()
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  // Update mutation
  const {
    isPending,
    mutateAsync: updatePlant,
    reset: mutationReset,
  } = useMutation({
    mutationFn: async (payload) => {
      return await axiosSecure.patch(`/plants/${plant?._id}`, payload)
    },
    onSuccess: (data) => {
      console.log(data)
      toast.success('Plant updated successfully')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      mutationReset()
      if (onSuccess) onSuccess()
    },
    onError: (error) => {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Failed to update plant')
    },
  })

  // React Hook Form with initial values
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: plant?.name || '',
      category: plant?.category || '',
      description: plant?.description || '',
      price: plant?.price || 0,
      quantity: plant?.quantity || 0,
      image: null, // New image file
    },
  })

  // Set initial values when plant prop changes
  useEffect(() => {
    if (plant) {
      setValue('name', plant.name)
      setValue('category', plant.category)
      setValue('description', plant.description)
      setValue('price', plant.price)
      setValue('quantity', plant.quantity)
    }
  }, [plant, setValue])

  const onSubmit = async (data) => {
    const { name, description, quantity, price, category, image } = data
    let imageUrl = plant?.image // Keep existing image if no new upload

    // If new image uploaded, upload it
    if (image && image[0]) {
      try {
        imageUrl = await imageUpload(image[0])
      } catch (err) {
        toast.error('Image upload failed')
        return
      }
    }

    const updatedPlantData = {
      image: imageUrl,
      name,
      description,
      quantity: Number(quantity),
      price: Number(price),
      category,
      seller: {
        image: user?.photoURL,
        name: user?.displayName,
        email: user?.email,
      },
    }

    try {
      await updatePlant(updatedPlantData)
      reset()
    } catch (err) {
      console.log(err)
    }
  }

  if (isPending) return <LoadingSpinner smallHeight />

  return (
    <div className='w-full flex flex-col justify-center items-center text-gray-800 rounded-xl bg-gray-50'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 gap-10'>
          <div className='space-y-6'>
            {/* Name */}
            <div className='space-y-1 text-sm'>
              <label htmlFor='name' className='block text-gray-600'>
                Name
              </label>
              <input
                className='w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                name='name'
                id='name'
                type='text'
                placeholder='Plant Name'
                required
                {...register('name', {
                  required: 'Name is required',
                  maxLength: {
                    value: 20,
                    message: 'Name cannot be too long',
                  },
                })}
              />
              {errors.name && (
                <p className='text-xs text-red-500 mt-1'>{errors.name.message}</p>
              )}
            </div>
            {/* Category */}
            <div className='space-y-1 text-sm'>
              <label htmlFor='category' className='block text-gray-600 '>
                Category
              </label>
              <select
                required
                className='w-full px-4 py-3 border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                name='category'
                {...register('category', { required: 'Category is required' })}
              >
                <option value='Indoor'>Indoor</option>
                <option value='Outdoor'>Outdoor</option>
                <option value='Succulent'>Succulent</option>
                <option value='Flowering'>Flowering</option>
              </select>
              {errors.category && (
                <p className='text-xs text-red-500 mt-1'>
                  {errors.category.message}
                </p>
              )}
            </div>
            {/* Description */}
            <div className='space-y-1 text-sm'>
              <label htmlFor='description' className='block text-gray-600'>
                Description
              </label>
              <textarea
                id='description'
                placeholder='Write plant description here...'
                className='block rounded-md focus:lime-300 w-full h-32 px-4 py-3 text-gray-800  border border-lime-300 bg-white focus:outline-lime-500 '
                name='description'
                {...register('description', {
                  required: 'Description is required',
                })}
              ></textarea>
              {errors.description && (
                <p className='text-xs text-red-500 mt-1'>
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
          <div className='space-y-6 flex flex-col'>
            {/* Price & Quantity */}
            <div className='flex justify-between gap-2'>
              {/* Price */}
              <div className='space-y-1 text-sm'>
                <label htmlFor='price' className='block text-gray-600 '>
                  Price
                </label>
                <input
                  className='w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                  name='price'
                  id='price'
                  type='number'
                  placeholder='Price per unit'
                  required
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' },
                  })}
                />
                {errors.price && (
                  <p className='text-xs text-red-500 mt-1'>
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className='space-y-1 text-sm'>
                <label htmlFor='quantity' className='block text-gray-600'>
                  Quantity
                </label>
                <input
                  className='w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white'
                  name='quantity'
                  id='quantity'
                  type='number'
                  placeholder='Available quantity'
                  required
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1' },
                  })}
                />
                {errors.quantity && (
                  <p className='text-xs text-red-500 mt-1'>
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>
            {/* Image (optional for update) */}
            <div className=' p-4  w-full  m-auto rounded-lg grow'>
              <div className='file_upload px-5 py-3 relative border-4 border-dotted border-gray-300 rounded-lg'>
                <div className='flex flex-col w-max mx-auto text-center'>
                  <label>
                    <input
                      className='text-sm cursor-pointer w-36 hidden'
                      type='file'
                      name='image'
                      id='image'
                      accept='image/*'
                      hidden
                      {...register('image')} // Optional for update
                    />
                    <div className='bg-lime-500 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-lime-500'>
                      {plant?.image ? 'Change Image (Optional)' : 'Upload Image'}
                    </div>
                  </label>
                </div>
                {plant?.image && (
                  <div className='mt-2'>
                    <img src={plant.image} alt='Current' className='w-20 h-20 object-cover rounded' />
                    <p className='text-xs text-gray-500'>Current Image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isPending}
              className='w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed p-3 mt-5 text-center font-medium text-white transition duration-200 rounded shadow-md bg-lime-500 '
            >
              {isPending ? (
                <TbFidgetSpinner className='animate-spin m-auto' />
              ) : (
                'Update Plant'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UpdatePlantForm