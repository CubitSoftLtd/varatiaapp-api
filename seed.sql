-- Insert into accounts
INSERT INTO accounts (id, name, subscriptionType, contactName, contactEmail, contactPhone, isActive, subscriptionExpiry, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Main Property Management', 'premium', 'John Smith', 'john.smith@mainprop.com', '+12025550123', true, '2026-06-15', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Secondary Property Management', 'basic', 'Jane Doe', 'jane.doe@secprop.com', '+13025550124', true, '2025-12-15', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into users
INSERT INTO users (id, name, email, password, role, isEmailVerified, accountId, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Admin User', 'admin@example.com', '$2b$10$...hashed_password...', 'super_admin', true, NULL, '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Property Manager', 'manager@mainprop.com', '$2b$10$...hashed_password...', 'property_manager', true, '550e8400-e29b-41d4-a716-446655440000', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into utility_types
INSERT INTO utility_types (id, name, unitRate, unitOfMeasurement, accountId, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 'Electricity', 0.15, 'kWh', '550e8400-e29b-41d4-a716-446655440000', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Water', 0.05, 'cubic meters', '550e8400-e29b-41d4-a716-446655440001', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into properties
INSERT INTO properties (id, name, address, accountId, type, yearBuilt, totalUnits, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'Main Street Apartments', '123 Main St, City, Country', '550e8400-e29b-41d4-a716-446655440000', 'residential', 2010, 10, '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Oak Avenue Complex', '456 Oak Ave, City, Country', '550e8400-e29b-41d4-a716-446655440001', 'mixed-use', 2015, 5, '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into units
INSERT INTO units (id, propertyId, name, rentAmount, status, bedroomCount, bathroomCount, squareFootage, accountId, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440006', 'Unit 101', 1000.00, 'occupied', 2, 1.5, 800.00, '550e8400-e29b-41d4-a716-446655440000', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440007', 'Unit 102', 1200.00, 'occupied', 3, 2.0, 1000.00, '550e8400-e29b-41d4-a716-446655440001', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into meters
INSERT INTO meters (id, number, accountId, propertyId, utilityTypeId, status, installedDate, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-44665544000a', 'MTR-001', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'active', '2020-01-01', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-44665544000b', 'MTR-002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 'active', '2020-01-01', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into submeters
INSERT INTO submeters (id, meterId, unitId, accountId, number, status, installedDate, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-44665544000c', '550e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'SUB-001', 'active', '2020-06-01', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-44665544000d', '550e8400-e29b-41d4-a716-44665544000b', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'SUB-002', 'active', '2020-06-01', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into expense_categories
INSERT INTO expense_categories (id, name, type, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-44665544000e', 'Repairs', 'property_related', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-44665544000f', 'Utilities', 'tenant_chargeable', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into tenants
INSERT INTO tenants (id, firstName, lastName, name, email, phoneNumber, leaseStartDate, unitId, accountId, depositAmount, status, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'John', 'Doe', 'John Doe', 'john.doe@example.com', '+12025550123', '2025-06-01', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 500.00, 'current', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Jane', 'Smith', 'Jane Smith', 'jane.smith@example.com', '+13025550124', '2025-06-01', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 600.00, 'current', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into meter_readings
INSERT INTO meter_readings (id, meterId, submeterId, accountId, readingValue, readingDate, consumption, enteredByUserId, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-44665544000a', NULL, '550e8400-e29b-41d4-a716-446655440000', 100.50, '2025-06-01 16:24:00', 0, '550e8400-e29b-41d4-a716-446655440003', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440013', NULL, '550e8400-e29b-41d4-a716-44665544000c', '550e8400-e29b-41d4-a716-446655440000', 50.25, '2025-06-15 16:24:00', 10.25, '550e8400-e29b-41d4-a716-446655440003', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into bills
INSERT INTO bills (id, tenantId, unitId, accountId, billingPeriodStart, billingPeriodEnd, rentAmount, totalUtilityAmount, otherChargesAmount, totalAmount, amountPaid, dueDate, issueDate, paymentStatus, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '2025-06-01', '2025-06-30', 1000.00, 1.5375, 50.00, 1051.5375, 0.0, '2025-07-05', '2025-06-15 16:24:00', 'unpaid', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '2025-06-01', '2025-06-30', 1200.00, 0.615, 30.00, 1230.615, 0.0, '2025-07-05', '2025-06-15 16:24:00', 'unpaid', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into payments
INSERT INTO payments (id, billId, tenantId, accountId, amountPaid, paymentDate, paymentMethod, transactionId, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 500.00, '2025-06-20 16:24:00', 'bank_transfer', 'TXN-001', '2025-06-15 16:24:00', '2025-06-15 16:24:00');

-- Insert into expenses
INSERT INTO expenses (id, accountId, propertyId, unitId, billId, categoryId, amount, description, expenseDate, createdAt, updatedAt)
VALUES
  ('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-44665544000e', 50.00, 'Repair of plumbing', '2025-06-10', '2025-06-15 16:24:00', '2025-06-15 16:24:00'),
  ('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440009', NULL, '550e8400-e29b-41d4-a716-44665544000f', 20.00, 'Utility maintenance', '2025-06-12', '2025-06-15 16:24:00', '2025-06-15 16:24:00');
