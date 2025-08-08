'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export function CartModal({ 
  isOpen, 
  onClose, 
  subdomain,
  primaryColor,
  imageAspectRatio = 'square'
}: { 
  isOpen: boolean;
  onClose: () => void;
  subdomain: string;
  primaryColor?: string; // Make optional for backward compatibility
  imageAspectRatio?: string;
}) {
  const { getCartForStore, updateQuantity, removeItem } = useCart();
  const storeItems = getCartForStore(subdomain);
  
  const subtotal = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Aspect ratio classes
  const aspectRatioClasses = {
    'square': 'aspect-square',
    'portrait': 'aspect-[3/4]',
    'landscape': 'aspect-[4/3]',
    'tall': 'aspect-[2/3]',
    'wide': 'aspect-[16/9]'
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/5 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Shopping Cart
                    </Dialog.Title>
                    
                    {storeItems.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                        <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart</p>
                        <button
                          onClick={onClose}
                          className="mt-6 text-sm font-medium"
                          style={{ color: primaryColor }}
                        >
                          Continue Shopping →
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-96 overflow-y-auto">
                          <ul className="divide-y divide-gray-200">
                            {storeItems.map((item) => (
                              <li key={item.variantId} className="flex py-6">
                                <div className={`w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 ${aspectRatioClasses[imageAspectRatio as keyof typeof aspectRatioClasses] || aspectRatioClasses.square}`}>
                                  {item.image ? (
                                    <img
                                      src={
                                        typeof item.image === 'string' 
                                          ? (item.image.startsWith('/') || item.image.startsWith('http') 
                                              ? item.image 
                                              : `/uploads/${subdomain}/${item.image}`)
                                          : item.image.url
                                      }
                                      alt={
                                        typeof item.image === 'string' 
                                          ? (item.productName || item.name)
                                          : (item.image.altText || item.productName || item.name)
                                      }
                                      className="h-full w-full object-cover object-center"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          const placeholder = document.createElement('div');
                                          placeholder.className = 'h-full w-full bg-gray-100 flex items-center justify-center';
                                          placeholder.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                          parent.appendChild(placeholder);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{item.productName || item.name}</h3>
                                      <p className="ml-4">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)} each</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => updateQuantity(item.variantId, item.quantity - 1, subdomain)}
                                        className="p-1 rounded-md hover:bg-gray-100"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="px-2 py-1 text-gray-700">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item.variantId, item.quantity + 1, subdomain)}
                                        className="p-1 rounded-md hover:bg-gray-100"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.variantId, subdomain)}
                                      className="font-medium text-red-600 hover:text-red-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-6">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Subtotal</p>
                            <p>{formatPrice(subtotal)}</p>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                          
                          <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={onClose}
                              className="rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                              Continue Shopping
                            </button>
                            <Link
                              href={`/s/${subdomain}/checkout`}
                              className="flex items-center justify-center rounded-md border border-transparent px-4 py-3 text-sm font-medium text-white shadow-sm hover:opacity-90"
                              style={{ backgroundColor: 'var(--theme-colors-primary, #2563EB)' }}
                              onClick={onClose}
                            >
                              Checkout
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}