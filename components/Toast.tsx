'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
    message: string
    type: 'success' | 'error'
    isVisible: boolean
    onClose: () => void
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="fixed top-4 left-4 z-50"
                >
                    <div
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
                            ${type === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }
                        `}
                    >
                        {type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <XCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium">{message}</span>
                        <button
                            onClick={onClose}
                            className="ml-2 hover:opacity-80 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

