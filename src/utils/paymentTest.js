// Payment testing utilities
export const createTestBooking = () => ({
  booking_id: 'test_booking_' + Date.now(),
  total_amount: 500,
  vehicle: {
    brand: 'Honda',
    model: 'Activa',
    vehicle_type: 'Scooter'
  },
  customer: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '9999999999'
  },
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
});

export const logPaymentFlow = (step, data) => {
  console.log(`[Payment Flow] ${step}:`, data);
};