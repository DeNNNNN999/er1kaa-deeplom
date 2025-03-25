/*
  # Add reviews and payments tables

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `tour_id` (uuid, foreign key to tours)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
    - `payments`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings)
      - `amount` (decimal)
      - `status` (enum: PENDING, COMPLETED, FAILED)
      - `payment_method` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tour_id uuid REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tour_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Users can read all reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for completed bookings"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.user_id = auth.uid()
      AND bookings.tour_id = reviews.tour_id
      AND bookings.status = 'COMPLETED'
    )
  );

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their bookings"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
  );