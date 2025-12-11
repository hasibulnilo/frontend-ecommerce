// Fixed: src/pages/Dashboard/Common/Profile.jsx
// Issue: signIn for re-auth sets global loading=true, causing full-screen spinner.
// Fixed: Use reauthenticateWithCredential with EmailAuthProvider for silent re-auth (no global loading).
// Added: Imports for reauth, better error handling. Spinner now only in button/modal.
import useAuth from '../../../hooks/useAuth'
import coverImg from '../../../assets/images/cover.jpg'
import useRole from '../../../hooks/useRole'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { imageUpload, saveOrUpdateUser } from '../../../utils'
import { TbFidgetSpinner } from 'react-icons/tb'
import LoadingSpinner from '../../../components/Shared/LoadingSpinner'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import {
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '../../../firebase/firebase.config'

const Profile = () => {
  const { user, loading, updateUserProfile } = useAuth()  // Removed signIn from destructuring
  const [role, isRoleLoading] = useRole()
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('') // For re-auth

  console.log(role, isRoleLoading)

  // Update Profile Form
  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errorsUpdate },
    reset: resetUpdate,
  } = useForm({
    defaultValues: {
      name: user?.displayName || '',
      photo: null,
    },
  })

  const handleUpdateProfile = async (data) => {
    setIsUpdating(true)
    try {
      let photoURL = user?.photoURL
      if (data.photo && data.photo[0]) {
        photoURL = await imageUpload(data.photo[0])
      }

      // Update Firebase profile via custom function (expects separate args)
      await updateUserProfile(data.name, photoURL)

      // Save to backend
      await saveOrUpdateUser({
        name: data.name,
        email: user?.email,
        image: photoURL,
      })

      toast.success('Profile updated successfully!')
      resetUpdate()
      setIsUpdateOpen(false)
    } catch (err) {
      console.log(err)
      toast.error(err?.message || 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  // Change Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm()

  const handleChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match!')
      return
    }

    setIsChangingPassword(true)
    try {
      // Re-authenticate silently with EmailAuthProvider (no global loading)
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, data.newPassword)

      toast.success('Password changed successfully!')
      resetPassword()
      setIsPasswordOpen(false)
      setCurrentPassword('') // Clear current password
    } catch (err) {
      console.log(err)
      if (err.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect!')
      } else {
        toast.error(err?.message || 'Failed to change password.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading || isRoleLoading) return <LoadingSpinner />

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='bg-white shadow-lg rounded-2xl md:w-4/5 lg:w-3/5'>
        <img
          alt='cover photo'
          src={coverImg}
          className='w-full mb-4 rounded-t-lg h-56'
        />
        <div className='flex flex-col items-center justify-center p-4 -mt-16'>
          <a href='#' className='relative block'>
            <img
              alt='profile'
              src={user?.photoURL}
              className='mx-auto object-cover rounded-full h-24 w-24  border-2 border-white '
            />
          </a>

          <p className='p-2 px-4 text-xs text-white bg-lime-500 rounded-full'>
            {role}
          </p>
          <p className='mt-2 text-xl font-medium text-gray-800 '>
            User Id: {user?.uid}
          </p>
          <div className='w-full p-2 mt-4 rounded-lg'>
            <div className='flex flex-wrap items-center justify-between text-sm text-gray-600 '>
              <p className='flex flex-col'>
                Name
                <span className='font-bold text-gray-600 '>
                  {user?.displayName}
                </span>
              </p>
              <p className='flex flex-col'>
                Email
                <span className='font-bold text-gray-600 '>{user?.email}</span>
              </p>

              <div>
                <button 
                  onClick={() => setIsUpdateOpen(true)}
                  className='bg-lime-500  px-10 py-1 rounded-lg text-white cursor-pointer hover:bg-lime-800 block mb-1'
                >
                  Update Profile
                </button>
                <button 
                  onClick={() => setIsPasswordOpen(true)}
                  className='bg-lime-500 px-7 py-1 rounded-lg text-white cursor-pointer hover:bg-lime-800'
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      <Dialog
        open={isUpdateOpen}
        as='div'
        className='relative z-50'
        onClose={() => setIsUpdateOpen(false)}
      >
        <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
        <div className='fixed inset-0 flex items-center justify-center p-4'>
          <DialogPanel className='mx-auto max-w-md rounded bg-white p-6'>
            <DialogTitle className='text-lg font-medium text-gray-900 mb-4'>
              Update Profile
            </DialogTitle>
            <form onSubmit={handleSubmitUpdate(handleUpdateProfile)}>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Name
                  </label>
                  <input
                    {...registerUpdate('name', { required: 'Name is required' })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500'
                    placeholder='Enter new name'
                  />
                  {errorsUpdate.name && (
                    <p className='text-xs text-red-500 mt-1'>{errorsUpdate.name.message}</p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Profile Photo (Optional)
                  </label>
                  <input
                    type='file'
                    accept='image/*'
                    {...registerUpdate('photo')}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none'
                  />
                </div>
                <button
                  type='submit'
                  disabled={isUpdating}
                  className='w-full bg-lime-500 text-white py-2 rounded-md hover:bg-lime-600 disabled:opacity-50'
                >
                  {isUpdating ? <TbFidgetSpinner className='animate-spin mx-auto' /> : 'Update'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog
        open={isPasswordOpen}
        as='div'
        className='relative z-50'
        onClose={() => setIsPasswordOpen(false)}
      >
        <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
        <div className='fixed inset-0 flex items-center justify-center p-4'>
          <DialogPanel className='mx-auto max-w-md rounded bg-white p-6'>
            <DialogTitle className='text-lg font-medium text-gray-900 mb-4'>
              Change Password
            </DialogTitle>
            <form onSubmit={handleSubmitPassword(handleChangePassword)}>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Current Password
                  </label>
                  <input
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500'
                    placeholder='Enter current password'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    New Password
                  </label>
                  <input
                    type='password'
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'At least 6 characters' },
                    })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500'
                    placeholder='Enter new password'
                  />
                  {errorsPassword.newPassword && (
                    <p className='text-xs text-red-500 mt-1'>{errorsPassword.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Confirm New Password
                  </label>
                  <input
                    type='password'
                    {...registerPassword('confirmPassword', { required: 'Please confirm password' })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500'
                    placeholder='Confirm new password'
                  />
                  {errorsPassword.confirmPassword && (
                    <p className='text-xs text-red-500 mt-1'>{errorsPassword.confirmPassword.message}</p>
                  )}
                </div>
                <button
                  type='submit'
                  disabled={isChangingPassword}
                  className='w-full bg-lime-500 text-white py-2 rounded-md hover:bg-lime-600 disabled:opacity-50'
                >
                  {isChangingPassword ? <TbFidgetSpinner className='animate-spin mx-auto' /> : 'Change Password'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

export default Profile