"use client"

import { useState, useEffect } from "react"
import Button from "../common/Button"
import * as bookingService from "../../services/bookingService"
import PaymentModal from "../payment/PaymentModal"
import InvoiceModal from "../payment/InvoiceModal"

/**
 * FinalBillModal Component
 * Displays a detailed breakdown of the guest's final bill including room charges and services
 * Two-step process: 1) Process Payment  2) Complete Checkout
 */
const FinalBillModal = ({ isOpen, onClose, bookingId, onCheckoutComplete }) => {
    const [bill, setBill] = useState(null)
    const [loading, setLoading] = useState(false)
    const [processingPayment, setProcessingPayment] = useState(false)
    const [checkingOut, setCheckingOut] = useState(false)
    const [error, setError] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState("cash")

    // Stripe & Invoice Modals
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [paymentMetadata, setPaymentMetadata] = useState(null)

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchBillDetails()
        }
    }, [isOpen, bookingId])

    const fetchBillDetails = async () => {
        try {
            setLoading(true)
            setError(null)
            const billData = await bookingService.getBookingBill(bookingId)
            setBill(billData)
        } catch (err) {
            console.error("Failed to fetch bill:", err)
            setError("Failed to load bill details")
        } finally {
            setLoading(false)
        }
    }

    const handleProcessPayment = async () => {
        if (paymentMethod === 'card') {
            setShowPaymentModal(true)
            return
        }

        // Cash/Bank Transfer flow
        try {
            setProcessingPayment(true)
            setError(null)
            const result = await bookingService.processPayment(bookingId, paymentMethod)
            if (result.success) {
                setBill(prev => ({
                    ...prev,
                    paymentStatus: 'paid',
                    services: result.data.services || prev.services,
                    serviceCharges: result.data.serviceCharges || prev.serviceCharges,
                    totalAmount: result.data.totalAmount || prev.totalAmount
                }))
            }
        } catch (err) {
            console.error("Payment failed:", err)
            setError(err.response?.data?.message || "Payment processing failed")
        } finally {
            setProcessingPayment(false)
        }
    }

    const handleStripeSuccess = async (stripeIntent) => {
        setShowPaymentModal(false)
        try {
            setProcessingPayment(true)
            setError(null)
            const result = await bookingService.processPayment(bookingId, 'card', {
                paymentIntentId: stripeIntent.id,
                paymentLast4: stripeIntent.payment_method_details?.card?.last4 || '4242'
            })

            if (result.success) {
                setBill(prev => ({
                    ...prev,
                    paymentStatus: 'paid',
                    services: result.data.services || prev.services,
                    serviceCharges: result.data.serviceCharges || prev.serviceCharges,
                    totalAmount: result.data.totalAmount || prev.totalAmount
                }))
                setPaymentMetadata({
                    id: stripeIntent.id,
                    amount: stripeIntent.amount / 100,
                    last4: stripeIntent.payment_method_details?.card?.last4 || '4242'
                })
            }
        } catch (err) {
            console.error("Stripe payment processing failed at backend:", err)
            setError("Stripe payment successful but failed to update system. Please check logs.")
        } finally {
            setProcessingPayment(false)
        }
    }

    const handleCheckout = async () => {
        try {
            setCheckingOut(true)
            setError(null)
            const result = await bookingService.checkOutBooking(bookingId)
            if (result.success) {
                setBill({
                    ...bill,
                    ...result.bill,
                    bookingStatus: 'checked-out',
                    paymentStatus: 'paid'
                })
                // No longer triggering the 2nd invoice modal automatically
                // as it was redundant and confusing for the user
                onCheckoutComplete?.(result)
            }
        } catch (err) {
            console.error("Checkout failed:", err)
            setError(err.response?.data?.message || "Checkout failed")
        } finally {
            setCheckingOut(false)
        }
    }

    if (!isOpen && !showInvoiceModal) return null

    // Make status checks case-insensitive and handle different formats
    const paymentStatus = bill?.paymentStatus?.toLowerCase() || ''
    const bookingStatus = bill?.bookingStatus?.toLowerCase().replace(/[- ]/g, '') || ''

    const isPaid = paymentStatus === 'paid'
    const isCheckedOut = bookingStatus === 'checkedout'
    const isCheckedIn = bookingStatus === 'checkedin'

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${showInvoiceModal ? 'opacity-0 scale-95 pointer-events-none' : 'animate-fade-in-up'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Final Bill Summary</h2>
                            <p className="text-blue-100 text-sm mt-1">
                                {bill?.guestName || "Loading..."}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-2xl font-bold hover:bg-white/20 w-10 h-10 rounded-full transition-all print:hidden"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading bill details...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 text-lg mb-4">{error}</p>
                            <Button onClick={fetchBillDetails}>
                                Retry
                            </Button>
                        </div>
                    ) : bill ? (
                        <div className="space-y-6">
                            {/* Room Details */}
                            <div className="bg-slate-50 rounded-xl p-6">
                                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                    <span>🏨</span> Room Charges
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-slate-700">
                                        <span>Room</span>
                                        <span className="font-semibold">{bill.roomName} ({bill.roomType})</span>
                                    </div>
                                    <div className="flex justify-between text-slate-700">
                                        <span>Check-in</span>
                                        <span>{new Date(bill.checkInDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-700">
                                        <span>Check-out</span>
                                        <span>
                                            {new Date(bill.checkOutDate).toLocaleDateString()}
                                            {bill.actualCheckOut && (
                                                <span className="text-slate-500 text-sm ml-2">
                                                    ({new Date(bill.actualCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-700">
                                        <span>Nights Stayed</span>
                                        <span className="font-semibold">{bill.nightsStayed}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-700">
                                        <span>Price per Night</span>
                                        <span>{Math.round(bill.pricePerNight || 0).toLocaleString('en-US')} LKR</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-3 mt-3">
                                        <span>Room Total</span>
                                        <span className="text-blue-600">{Math.round(bill.roomCharges || 0).toLocaleString('en-US')} LKR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            {bill.services && bill.services.filter(s => ['confirmed', 'in_progress', 'completed'].includes(s.status)).length > 0 ? (
                                <div className="bg-amber-50 rounded-xl p-6">
                                    <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        <span>🛎️</span> Room Services ({bill.services.filter(s => ['confirmed', 'in_progress', 'completed'].includes(s.status)).length} items)
                                    </h3>
                                    <div className="space-y-3">
                                        {bill.services.filter(s => ['confirmed', 'in_progress', 'completed'].includes(s.status)).map((service, idx) => (
                                            <div key={idx} className="flex justify-between text-slate-700 items-start p-2 bg-white/50 rounded-lg">
                                                <div className="flex-1">
                                                    <span className="font-medium capitalize">{(service.type || '').replace('_', ' ')}</span>
                                                    {service.description && (
                                                        <p className="text-xs text-slate-500">{service.description}</p>
                                                    )}
                                                    {service.date && (
                                                        <p className="text-xs text-slate-400">{new Date(service.date).toLocaleString()}</p>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-amber-700">{Math.round(service.price || 0).toLocaleString('en-US')} LKR</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-amber-200 pt-3 mt-3">
                                            <span>Services Total</span>
                                            <span className="text-amber-600">{Math.round(bill.serviceCharges || 0).toLocaleString('en-US')} LKR</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-6 text-center">
                                    <p className="text-slate-500">No additional services requested</p>
                                </div>
                            )}

                            {/* Totals Breakdown */}
                            <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal (Room + Services)</span>
                                    <span>{Math.round(bill.subtotal || (bill.roomCharges + bill.serviceCharges)).toLocaleString()} LKR</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Service Tax (10%)</span>
                                    <span>{Math.round(bill.taxAmount || ((bill.roomCharges + bill.serviceCharges) * 0.1)).toLocaleString()} LKR</span>
                                </div>
                                <div className="flex justify-between items-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white mt-4 shadow-md">
                                    <div>
                                        <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Grand Total</p>
                                        <p className="text-3xl font-black">{Math.round(bill.totalAmount || (bill.roomCharges + bill.serviceCharges) * 1.1).toLocaleString()} LKR</p>
                                    </div>
                                    <div className="text-4xl opacity-50">💰</div>
                                </div>
                            </div>

                            {/* Payment Status & Method Selection */}
                            <div className="bg-slate-100 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-700 font-medium">Payment Status</span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${isPaid
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {isPaid ? '✓ PAID' : 'PENDING'}
                                    </span>
                                </div>

                                {/* Payment Method Selection - Only show if not paid */}
                                {!isPaid && isCheckedIn && (
                                    <div className="border-t border-slate-200 pt-4">
                                        <p className="text-sm text-slate-600 mb-3 font-medium">Select Payment Method:</p>
                                        <div className="flex gap-3">
                                            {[
                                                { value: 'cash', label: '💵 Cash', color: 'green' },
                                                { value: 'card', label: '💳 Card', color: 'blue' },
                                                { value: 'bank_transfer', label: '🏦 Bank Transfer', color: 'purple' }
                                            ].map((method) => (
                                                <button
                                                    key={method.value}
                                                    onClick={() => setPaymentMethod(method.value)}
                                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${paymentMethod === method.value
                                                        ? `bg-${method.color}-500 text-white shadow-lg scale-105`
                                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    style={{
                                                        backgroundColor: paymentMethod === method.value
                                                            ? method.color === 'green' ? '#22c55e'
                                                                : method.color === 'blue' ? '#3b82f6'
                                                                    : '#8b5cf6'
                                                            : undefined
                                                    }}
                                                >
                                                    {method.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Booking Status */}
                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                                <span className="text-slate-700 font-medium">Booking Status</span>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${isCheckedOut
                                    ? 'bg-purple-100 text-purple-800'
                                    : isCheckedIn
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {bill.bookingStatus?.toUpperCase().replace('-', ' ') || 'UNKNOWN'}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
                    <div className="flex gap-4 justify-center mb-4">
                        {bill && isCheckedIn && !isPaid && (
                            <Button
                                onClick={handleProcessPayment}
                                disabled={processingPayment}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all px-8 py-3 text-lg"
                            >
                                {processingPayment ? "Processing..." : `💳 Process Payment (${Math.round(bill.totalAmount || 0).toLocaleString()} LKR)`}
                            </Button>
                        )}

                        {bill && isCheckedIn && isPaid && !isCheckedOut && (
                            <Button
                                onClick={handleCheckout}
                                disabled={checkingOut}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 transition-all px-8 py-3 text-lg"
                            >
                                {checkingOut ? "Completing..." : "✓ Complete Checkout"}
                            </Button>
                        )}

                        {bill && isCheckedOut && (
                            <div className="flex flex-col items-center gap-3">
                                <span className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-bold flex items-center gap-2">
                                    ✓ Checkout Complete
                                </span>
                                <Button
                                    onClick={() => window.print()}
                                    className="bg-slate-900 text-white font-bold px-6 py-2 flex items-center gap-2 hover:bg-black transition-all print:hidden"
                                >
                                    🖨️ Print Receipt
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Step Indicator */}
                    {bill && isCheckedIn && !isCheckedOut && (
                        <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-200">
                            <div className={`flex items-center gap-2 ${!isPaid ? 'text-blue-600 font-bold' : 'text-green-600'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${!isPaid ? 'bg-blue-600' : 'bg-green-600'}`}>
                                    {isPaid ? '✓' : '1'}
                                </span>
                                <span className="text-sm">Process Payment</span>
                            </div>
                            <div className="w-8 h-0.5 bg-slate-300"></div>
                            <div className={`flex items-center gap-2 ${isPaid ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${isPaid ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                                    2
                                </span>
                                <span className="text-sm">Complete Checkout</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center pt-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="hover:scale-105 transition-transform print:hidden"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>

            {/* Payment Modal for Stripe */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleStripeSuccess}
                amount={Math.round(bill?.totalAmount || 0)}
            />

            {/* Invoice Modal for Printing */}
            <InvoiceModal
                open={showInvoiceModal}
                onClose={() => {
                    setShowInvoiceModal(false)
                    onClose() // Close the final bill modal too
                }}
                invoice={{
                    booking: bill,
                    payment: paymentMetadata || {
                        id: bill?.paymentIntentId || 'CASH_PAYMENT',
                        amount: bill?.totalAmount,
                        last4: bill?.paymentLast4 || 'CASH'
                    }
                }}
            />

            <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    )
}

export default FinalBillModal;
