import { Dialog, Transition } from '@headlessui/react';
import React, { FC, Fragment } from 'react';
import GitHubIcon from './GitHubIcon';

interface LoginModalProps {
  isOpen: boolean
  onClose: () => any
  login: () => any
}

const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose, login }) => (
  <Transition appear show={isOpen} as={Fragment}>

    <Dialog
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black bg-opacity-30" />
        <div className="bg-white rounded border max-w-sm mx-auto z-10 p-2">

          <Dialog.Title className="font-bold text-lg">Login With Github?</Dialog.Title>
          <p className="text-sm my-2">
            To display user emails you must be logged into Github
          </p>
          <div className="flex justify-between py-2">
            <button
              className="rounded font-bold px-2 py-1 bg-gray-800 text-white hover:bg-blue-400 transition"
              onClick={login}
            >
              <GitHubIcon className="inline-block mr-1" /> Login
            </button>
            <button
              className="rounded px-2 py-1 border hover:bg-yellow-200 transition"
              onClick={onClose}
            >
              Continue Without Logging In
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  </Transition>
)

export default LoginModal