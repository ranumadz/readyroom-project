-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 09, 2026 at 09:40 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `readyroom_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `edited_by` bigint UNSIGNED DEFAULT NULL,
  `booking_source` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer_app',
  `hotel_id` bigint UNSIGNED NOT NULL,
  `room_id` bigint UNSIGNED NOT NULL,
  `room_unit_id` bigint UNSIGNED DEFAULT NULL,
  `booking_type` enum('transit','overnight') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'transit',
  `duration_hours` int DEFAULT NULL,
  `check_in` datetime NOT NULL,
  `check_out` datetime NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `refund_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `refund_reason` text COLLATE utf8mb4_unicode_ci,
  `refunded_by` bigint UNSIGNED DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `total_price` int NOT NULL DEFAULT '0',
  `status` enum('pending','confirmed','cancelled','checked_in','checked_out','cleaning','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'unpaid',
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_amount` decimal(12,2) DEFAULT NULL,
  `payment_note` text COLLATE utf8mb4_unicode_ci,
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `rejection_reason_internal` text COLLATE utf8mb4_unicode_ci,
  `rejection_reason_customer` text COLLATE utf8mb4_unicode_ci,
  `cancel_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_by` bigint UNSIGNED DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_code`, `user_id`, `guest_name`, `guest_phone`, `guest_email`, `created_by`, `edited_by`, `booking_source`, `hotel_id`, `room_id`, `room_unit_id`, `booking_type`, `duration_hours`, `check_in`, `check_out`, `discount_percent`, `refund_amount`, `refund_reason`, `refunded_by`, `refunded_at`, `total_price`, `status`, `payment_status`, `payment_method`, `paid_amount`, `payment_note`, `admin_note`, `rejection_reason_internal`, `rejection_reason_customer`, `cancel_reason`, `cancelled_by`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(1, 'RR-20260318-0001', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 1, 1, 1, 'transit', 3, '2026-03-18 14:00:00', '2026-03-18 17:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'Silahkan chek-in', NULL, NULL, NULL, NULL, NULL, '2026-03-18 00:32:04', '2026-03-22 19:00:23'),
(2, 'RR-20260318-0002', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 1, 1, NULL, 'transit', 3, '2026-03-18 14:00:00', '2026-03-18 17:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, 'Blacklist', 'Maaf, kamar sedang penuh pada jadwal tersebut', NULL, NULL, NULL, '2026-03-18 01:36:52', '2026-03-18 02:37:18'),
(3, 'RR-20260318-0003', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 1, 1, 7, 'transit', 3, '2026-03-19 14:00:00', '2026-03-19 17:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'silahkan chekin di respsionis dan bayar di resepsionis', NULL, NULL, NULL, NULL, NULL, '2026-03-18 02:18:57', '2026-03-22 19:00:26'),
(4, 'RR-20260319-0004', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 2, 3, 'transit', 3, '2026-03-19 16:00:00', '2026-03-19 19:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'Booking manual dari resepsionis', NULL, NULL, NULL, NULL, NULL, '2026-03-18 21:04:31', '2026-03-23 02:26:25'),
(5, 'RR-20260319-0005', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 2, 2, 'transit', 3, '2026-03-19 16:00:00', '2026-03-19 19:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'Booking manual dari resepsionis', NULL, NULL, NULL, NULL, NULL, '2026-03-18 21:25:09', '2026-03-23 02:26:39'),
(6, 'RR-20260319-0006', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 2, 2, 'transit', 3, '2026-03-19 19:00:00', '2026-03-19 22:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'Test bentrok', NULL, NULL, NULL, NULL, NULL, '2026-03-18 21:27:06', '2026-03-23 02:26:45'),
(7, 'RR-20260319-0007', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 1, 1, 8, 'transit', 3, '2026-03-19 17:58:00', '2026-03-19 20:58:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-18 21:53:03', '2026-03-22 19:00:31'),
(8, 'RR-20260319-0008', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 1, 1, 6, 'overnight', NULL, '2026-03-24 12:53:00', '2026-03-25 12:53:00', 0.00, 0.00, NULL, NULL, NULL, 450000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-18 21:53:41', '2026-03-22 19:00:11'),
(9, 'RR-20260319-0009', NULL, 'Budi', '08123456789', 'budi@gmail.com', NULL, NULL, 'admin_manual', 2, 2, 2, 'transit', 3, '2026-03-19 10:00:00', '2026-03-19 13:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 01:46:34', '2026-03-23 02:26:49'),
(10, 'RR-20260319-0010', NULL, 'Bang rici', '08111151454', NULL, NULL, NULL, 'admin_manual', 2, 2, 3, 'transit', 3, '2026-03-20 20:01:00', '2026-03-20 23:01:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'Silahkan Menunjukan kode boking ke resepsionis saat chek in', NULL, NULL, NULL, NULL, NULL, '2026-03-19 01:59:59', '2026-03-23 18:44:45'),
(11, 'RR-20260319-0011', NULL, 'test', '1223141234123', NULL, NULL, NULL, 'admin_manual', 2, 2, 2, 'overnight', NULL, '2026-03-23 16:32:00', '2026-03-24 16:32:00', 0.00, 0.00, NULL, NULL, NULL, 400000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 02:32:20', '2026-03-23 19:10:49'),
(12, 'RR-20260319-0012', NULL, 'ria rici', '0821584', NULL, NULL, NULL, 'admin_manual', 2, 2, 3, 'overnight', NULL, '2026-03-31 18:26:00', '2026-04-01 18:26:00', 0.00, 0.00, NULL, NULL, NULL, 400000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 04:26:32', '2026-03-23 19:11:03'),
(13, 'RR-20260319-0013', NULL, 'rici ria', '08521584', NULL, 1, NULL, 'admin_manual', 1, 1, 8, 'overnight', NULL, '2026-03-30 18:31:00', '2026-03-31 18:31:00', 0.00, 0.00, NULL, NULL, NULL, 450000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 04:31:06', '2026-03-20 03:10:52'),
(14, 'RR-20260320-0014', NULL, 'ranumadz', '08111151454', 'ranumadz@gmail.com', 1, NULL, 'admin_manual', 1, 1, 6, 'overnight', NULL, '2026-03-20 10:15:00', '2026-03-21 10:15:00', 0.00, 0.00, NULL, NULL, NULL, 450000, 'completed', 'paid', NULL, NULL, NULL, 'Ranumadz Boking chekin', NULL, NULL, NULL, NULL, NULL, '2026-03-19 20:15:05', '2026-03-20 01:02:52'),
(15, 'RR-20260320-0015', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 1, 1, NULL, 'transit', 3, '2026-03-25 14:00:00', '2026-03-25 17:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, 'aokoawkoawk', 'Mohon maaf, kamar sedang penuh pada jadwal tersebut. karena lu gk mau bayar denda jelek', NULL, NULL, NULL, '2026-03-19 21:09:45', '2026-03-19 23:55:01'),
(16, 'RR-20260320-0016', NULL, 'ale', '08514451', NULL, 1, NULL, 'admin_manual', 2, 2, 3, 'transit', 3, '2026-03-24 23:39:00', '2026-03-25 02:39:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'bawa bokingan ke resepsionis', NULL, NULL, NULL, NULL, NULL, '2026-03-20 00:40:25', '2026-03-20 01:02:40'),
(17, 'RR-20260320-0017', NULL, 'edit tes', '123', '123@gmail.com', 1, 3, 'admin_manual', 2, 2, 2, 'transit', 3, '2026-03-30 23:12:00', '2026-03-31 02:12:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'edit test admin', NULL, NULL, NULL, NULL, NULL, '2026-03-20 03:12:55', '2026-03-20 04:45:10'),
(18, 'RR-20260323-0018', NULL, 'wwe', '123', 'qwewqe@gmail.com', 3, NULL, 'admin_manual', 1, 1, 6, 'transit', 3, '2026-03-23 09:01:00', '2026-03-23 12:01:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-22 19:02:06', '2026-03-22 19:02:50'),
(19, 'RR-20260323-0019', NULL, '213', '08111151454', NULL, 3, NULL, 'admin_manual', 1, 1, 6, 'transit', 3, '2026-03-23 09:03:00', '2026-03-23 12:03:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-22 19:03:06', '2026-04-06 01:16:30'),
(20, 'RR-20260323-0020', NULL, 'Bang rici', '105280', NULL, 3, NULL, 'admin_manual', 1, 1, 6, 'overnight', NULL, '2026-03-30 09:51:00', '2026-03-31 09:51:00', 0.00, 0.00, NULL, NULL, NULL, 450000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-22 19:52:47', '2026-03-23 00:20:50'),
(21, 'RR-20260323-0021', NULL, 'test discount', '08929', NULL, 3, NULL, 'admin_manual', 1, 1, 6, 'overnight', NULL, '2026-03-24 22:18:00', '2026-03-25 22:18:00', 0.00, 0.00, NULL, NULL, NULL, 360000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-22 20:06:34', '2026-03-23 19:51:12'),
(22, 'RR-20260323-0022', NULL, 'rendy', '0855440', NULL, 3, NULL, 'admin_manual', 1, 1, 9, 'overnight', NULL, '2026-11-30 02:00:00', '2026-12-01 02:00:00', 0.00, 0.00, NULL, NULL, NULL, 315000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-22 20:27:44', '2026-03-22 20:39:39'),
(23, 'RR-20260323-0023', NULL, 'ranuit', '085584', NULL, 3, 3, 'admin_manual', 2, 2, 2, 'overnight', NULL, '2026-03-22 14:47:00', '2026-03-23 14:47:00', 30.00, 280000.00, 'tamu gk jadi chekin', 3, '2026-03-22 21:30:45', 137200, 'confirmed', 'refunded', NULL, NULL, NULL, 'refund edit test', NULL, NULL, NULL, NULL, NULL, '2026-03-22 20:43:59', '2026-03-23 19:13:58'),
(24, 'RR-20260323-0024', NULL, 'family booking', '085178989', 'family@gmail.com', 3, NULL, 'admin_manual', 1, 6, 11, 'transit', 3, '2026-03-23 16:12:00', '2026-03-23 19:12:00', 10.00, 0.00, NULL, NULL, NULL, 117000, 'completed', 'paid', NULL, NULL, NULL, 'Silahkan tunjukan kode booking ke pada resepsionis', NULL, NULL, NULL, NULL, NULL, '2026-03-23 02:12:53', '2026-03-23 02:24:34'),
(25, 'RR-20260324-0025', NULL, 'dafa aw aw', '08575', 'dafa@gmail.com', 3, NULL, 'admin_manual', 2, 2, 2, 'overnight', NULL, '2026-03-25 09:12:00', '2026-03-26 09:12:00', 10.00, 0.00, NULL, NULL, NULL, 360000, 'cancelled', 'paid', NULL, NULL, NULL, 'silahkan bawa bokingan ke resepsionis hikaru acc by rici', NULL, NULL, 'Booking dibatalkan karena tidak ada kepastian kedatangan dari tamu.', 1, '2026-03-28 23:07:09', '2026-03-23 19:13:40', '2026-03-28 23:07:09'),
(26, 'RR-20260324-0026', NULL, 'bang ade', '0502', 'ad@readyroom.com', 3, NULL, 'admin_manual', 2, 2, 2, 'overnight', NULL, '2026-03-30 09:42:00', '2026-03-31 09:42:00', 0.00, 400000.00, 'kelebihan tranfers', 1, '2026-03-24 23:56:39', 400000, 'confirmed', 'refunded', NULL, NULL, NULL, 'silhkan bawa bookingan ke resepsionis', NULL, NULL, NULL, NULL, NULL, '2026-03-23 19:42:40', '2026-03-24 23:56:39'),
(27, 'RR-20260325-0027', NULL, 'test 1', '081384332021', NULL, 1, NULL, 'admin_manual', 1, 1, 6, 'transit', 3, '2026-03-29 18:00:00', '2026-03-29 21:00:00', 0.00, 0.00, NULL, NULL, NULL, 0, 'completed', 'paid', NULL, NULL, NULL, 'bawa bookingan ke resepsionis', NULL, NULL, NULL, NULL, NULL, '2026-03-24 23:55:41', '2026-03-24 23:56:15'),
(28, 'RR-20260325-0028', NULL, 'firman', '085157768294', NULL, 1, NULL, 'admin_manual', 4, 7, 15, 'transit', 3, '2026-03-25 17:53:00', '2026-03-25 20:53:00', 10.00, 0.00, NULL, NULL, NULL, 117000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-25 02:53:07', '2026-03-26 02:45:46'),
(29, 'RR-20260326-0029', NULL, 'tewst', '1324123', NULL, 1, NULL, 'admin_manual', 4, 7, 12, 'transit', 3, '2026-03-26 16:46:00', '2026-03-26 19:46:00', 50.00, 0.00, NULL, NULL, NULL, 65000, 'cancelled', 'unpaid', NULL, NULL, NULL, 'bawa langsung bokingan ke resepsionist', NULL, NULL, 'Booking dibatalkan karena tidak ada kepastian kedatangan dari tamu.', 1, '2026-03-27 23:01:58', '2026-03-26 02:47:19', '2026-03-27 23:01:58'),
(32, 'RR-20260327-0030', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 5, NULL, 'transit', 3, '2026-03-30 16:20:00', '2026-03-30 19:20:00', 0.00, 0.00, NULL, NULL, NULL, 321, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Mohon maaf, kamar sedang penuh pada jadwal tersebut.', NULL, NULL, NULL, '2026-03-27 02:54:19', '2026-03-27 02:55:01'),
(33, 'RR-20260327-0033', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 5, NULL, 'transit', 3, '2026-03-25 17:08:00', '2026-03-25 20:08:00', 0.00, 0.00, NULL, NULL, NULL, 321, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Mohon maaf, kamar sedang penuh pada jadwal tersebut.', NULL, NULL, NULL, '2026-03-27 03:09:30', '2026-03-27 23:01:50'),
(34, 'RR-20260328-0034', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 4, 7, 12, 'transit', 12, '2026-03-25 09:18:00', '2026-03-25 21:18:00', 0.00, 0.00, NULL, NULL, NULL, 180000, 'completed', 'paid', NULL, NULL, NULL, 'silahkan bawa bookingan ke resepsionis', NULL, NULL, NULL, NULL, NULL, '2026-03-27 19:18:23', '2026-04-06 00:08:27'),
(35, 'RR-20260328-0035', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 4, 7, NULL, 'transit', 3, '2026-03-28 12:09:00', '2026-03-28 15:09:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Mohon maaf, kamar sedang penuh pada jadwal tersebut.', NULL, NULL, NULL, '2026-03-27 22:10:00', '2026-03-27 23:01:30'),
(36, 'RR-20260328-0036', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 4, 7, NULL, 'overnight', NULL, '2026-03-21 12:28:00', '2026-03-22 12:28:00', 0.00, 0.00, NULL, NULL, NULL, 250000, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Mohon maaf, kamar sedang penuh pada jadwal tersebut.', NULL, NULL, NULL, '2026-03-27 22:28:25', '2026-03-27 23:01:21'),
(37, 'RR-20260328-0037', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 4, 7, NULL, 'overnight', NULL, '2026-03-28 00:00:00', '2026-03-29 00:00:00', 0.00, 0.00, NULL, NULL, NULL, 250000, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Mohon maaf, kamar sedang penuh pada jadwal tersebut.', NULL, NULL, NULL, '2026-03-27 23:00:54', '2026-03-27 23:01:15'),
(38, 'RR-20260328-0038', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 5, 17, 'overnight', NULL, '2026-03-31 00:00:00', '2026-04-01 00:00:00', 0.00, 0.00, NULL, NULL, NULL, 123, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-28 05:20:05', '2026-03-28 23:27:26'),
(39, 'RR-20260329-0039', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 1, 1, NULL, 'overnight', NULL, '2026-03-29 01:00:00', '2026-03-29 12:00:00', 0.00, 0.00, NULL, NULL, NULL, 450000, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Mohon maaf, kamar sedang penuh pada jadwal tersebut.', NULL, NULL, NULL, '2026-03-28 20:35:26', '2026-03-28 20:37:54'),
(40, 'RR-20260329-0040', 1, NULL, NULL, NULL, NULL, NULL, 'customer_app', 1, 1, NULL, 'overnight', NULL, '2026-03-29 14:00:00', '2026-03-30 12:00:00', 0.00, 0.00, NULL, NULL, NULL, 450000, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Mohon maaf, kamar sedang penuh pada jadwal tersebut.', NULL, NULL, NULL, '2026-03-28 20:35:51', '2026-03-28 20:37:42'),
(41, 'RR-20260329-0041', NULL, 'test bck', '089892929292902222222', NULL, 1, NULL, 'admin_manual', 2, 2, 2, 'overnight', NULL, '2026-03-07 11:25:00', '2026-03-07 12:00:00', 0.00, 0.00, NULL, NULL, NULL, 400000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-28 21:26:17', '2026-04-06 00:08:24'),
(42, 'RR-20260329-0042', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 5, 17, 'overnight', NULL, '2026-03-31 15:00:00', '2026-04-01 12:00:00', 0.00, 0.00, NULL, NULL, NULL, 123, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-29 01:42:11', '2026-04-05 19:19:51'),
(43, 'RR-20260329-0043', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 5, 17, 'overnight', NULL, '2026-03-29 12:00:00', '2026-03-30 12:00:00', 0.00, 0.00, NULL, NULL, NULL, 123, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-29 02:16:20', '2026-04-05 19:19:41'),
(44, 'RR-20260401-0044', NULL, '123', '123', NULL, 1, NULL, 'admin_manual', 4, 7, 13, 'transit', 3, '2026-04-01 09:01:00', '2026-04-01 12:01:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-31 19:01:59', '2026-03-31 19:04:15'),
(45, 'RR-20260401-0045', NULL, '12312213', '123123123', NULL, 1, NULL, 'admin_manual', 4, 7, 13, 'transit', 3, '2026-04-01 09:10:00', '2026-04-01 12:10:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-31 19:03:49', '2026-03-31 19:04:30'),
(46, 'RR-20260401-0046', NULL, 'test paymend', '123456', NULL, 1, NULL, 'admin_manual', 4, 7, 16, 'transit', 3, '2026-04-02 15:56:00', '2026-04-02 18:56:00', 0.00, 130000.00, 'uang masuk', 1, '2026-04-01 02:08:34', 130000, 'confirmed', 'refunded', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-01 01:56:34', '2026-04-01 02:08:34'),
(47, 'RR-20260401-0047', NULL, 'test paid', '123', NULL, 1, NULL, 'admin_manual', 4, 7, 12, 'transit', 3, '2026-04-02 19:15:00', '2026-04-02 22:15:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'completed', 'paid', 'qris', 130000.00, 'qris', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-01 02:12:29', '2026-04-01 23:45:26'),
(48, 'RR-20260402-0048', NULL, '233323', '233', NULL, 1, NULL, 'admin_manual', 4, 7, 15, 'overnight', NULL, '2026-04-17 11:52:00', '2026-04-17 12:00:00', 5.00, 0.00, NULL, NULL, NULL, 237500, 'completed', 'paid', 'transfer', 237500.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-01 21:53:08', '2026-04-01 23:45:23'),
(49, 'RR-20260406-0049', NULL, 'Test ranu ganteng', '12344211', 'ade@jelek', 1, NULL, 'admin_manual', 4, 7, 15, 'transit', 3, '2026-04-06 20:25:00', '2026-04-06 23:25:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'completed', 'paid', 'cash', 130000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-06 01:26:00', '2026-04-06 01:30:06'),
(50, 'RR-20260406-0050', NULL, 'Test ranu ganteng', '2312323', 'ade@jelek', 8, NULL, 'admin_manual', 4, 7, 15, 'transit', 3, '2026-04-06 18:32:00', '2026-04-06 21:32:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'completed', 'paid', 'transfer', 130000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-06 01:30:23', '2026-04-06 19:41:00'),
(51, 'RR-20260406-0051', NULL, 'Test Booking', '08121212', 'ready@gmail.com', 8, NULL, 'admin_manual', 4, 7, 14, 'overnight', NULL, '2026-04-06 19:57:00', '2026-04-07 12:00:00', 0.00, 0.00, NULL, NULL, NULL, 250000, 'confirmed', 'unpaid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-06 01:53:40', '2026-04-06 01:53:40'),
(52, 'RR-20260406-0052', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 4, 7, 12, 'transit', 3, '2026-04-06 19:00:00', '2026-04-06 22:00:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'confirmed', 'unpaid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-06 01:54:43', '2026-04-06 01:56:58'),
(53, 'RR-20260407-0053', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 4, 7, NULL, 'transit', 3, '2026-04-14 12:00:00', '2026-04-14 15:00:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, 'Mohon maaf, kamar sedang penuh pada jadwal tersebut.', NULL, NULL, NULL, '2026-04-06 19:42:23', '2026-04-07 19:15:44'),
(54, 'RR-20260407-0054', NULL, 'w2eweasxd', '123123', NULL, 6, NULL, 'admin_manual', 4, 7, 14, 'transit', 3, '2026-04-07 14:09:00', '2026-04-07 17:09:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'completed', 'paid', 'cash', 130000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-06 21:03:29', '2026-04-07 19:17:18'),
(55, 'RR-20260407-0055', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 5, 17, 'transit', 3, '2026-04-07 12:00:00', '2026-04-07 15:00:00', 0.00, 0.00, NULL, NULL, NULL, 321, 'cleaning', 'paid', 'cash', 321.00, NULL, 'werererererer', NULL, NULL, NULL, NULL, NULL, '2026-04-06 21:04:22', '2026-04-07 03:18:14'),
(56, 'RR-20260407-0056', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 4, 7, NULL, 'overnight', NULL, '2026-04-08 12:00:00', '2026-04-09 12:00:00', 0.00, 0.00, NULL, NULL, NULL, 250000, 'pending', 'unpaid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-07 03:09:55', '2026-04-07 03:09:55'),
(57, 'RR-20260408-0057', NULL, '123122', '12121212', NULL, 6, NULL, 'admin_manual', 4, 7, 12, 'transit', 3, '2026-04-08 15:33:00', '2026-04-08 18:33:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'cancelled', 'paid', 'cash', 130000.00, NULL, NULL, NULL, NULL, 'Booking dibatalkan karena tidak ada kepastian kedatangan dari tamu.', 6, '2026-04-08 21:47:34', '2026-04-08 00:32:41', '2026-04-08 21:47:34'),
(58, 'RR-20260408-0058', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 2, 5, 17, 'transit', 3, '2026-04-09 00:00:00', '2026-04-09 03:00:00', 0.00, 0.00, NULL, NULL, NULL, 321, 'checked_out', 'paid', 'transfer', 321.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-08 10:37:12', '2026-04-08 10:40:17'),
(59, 'RR-20260408-0059', NULL, 'riciasd', '123123123', NULL, 6, NULL, 'admin_manual', 2, 5, 17, 'transit', 3, '2026-04-09 03:10:00', '2026-04-09 06:10:00', 0.00, 0.00, NULL, NULL, NULL, 321, 'cancelled', 'unpaid', NULL, NULL, NULL, 'udah booking', NULL, NULL, 'Booking dibatalkan karena tidak ada kepastian kedatangan dari tamu.', 1, '2026-04-08 10:44:38', '2026-04-08 10:41:43', '2026-04-08 10:44:38'),
(60, 'RR-20260408-0060', 18, NULL, NULL, NULL, NULL, NULL, 'customer_app', 4, 7, 12, 'transit', 3, '2026-04-09 02:00:00', '2026-04-09 05:00:00', 0.00, 0.00, NULL, NULL, NULL, 130000, 'cancelled', 'unpaid', NULL, NULL, NULL, NULL, NULL, NULL, 'Booking dibatalkan karena tidak ada kepastian kedatangan dari tamu.', 1, '2026-04-08 10:55:44', '2026-04-08 10:53:17', '2026-04-08 10:55:44'),
(61, 'RR-20260409-0061', NULL, 'ranuit', '08111151454', NULL, 1, NULL, 'admin_manual', 1, 4, 4, 'transit', 3, '2026-04-09 11:54:00', '2026-04-09 14:54:00', 0.00, 0.00, NULL, NULL, NULL, 32, 'confirmed', 'paid', 'transfer', 100000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-08 21:54:15', '2026-04-08 22:05:11');

-- --------------------------------------------------------

--
-- Table structure for table `booking_penalties`
--

CREATE TABLE `booking_penalties` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `penalty_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_penalties`
--

INSERT INTO `booking_penalties` (`id`, `booking_id`, `penalty_type`, `title`, `amount`, `note`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 3, 'smoking', 'Merokok di kamar', 150000.00, 'Ditemukan bau rokok saat cleaning', 1, '2026-04-01 21:33:06', '2026-04-01 21:33:06'),
(2, 48, 'damage', 'Kerusakan fasilitas', 500000.00, 'Costumer merusakan lampu', 1, '2026-04-01 23:43:15', '2026-04-01 23:43:15'),
(3, 43, 'damage', 'Kerusakan fasilitas', 500000.00, 'Merusak remote set top box', 6, '2026-04-05 21:50:19', '2026-04-05 21:50:19'),
(4, 55, 'lost_item', 'Barang hotel hilang', 50000.00, 'Remote Stb', 6, '2026-04-07 03:18:28', '2026-04-07 03:18:28');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cities`
--

INSERT INTO `cities` (`id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Jakarta', 1, '2026-03-12 03:17:23', '2026-03-12 03:17:23'),
(2, 'Bali', 1, '2026-03-12 03:17:23', '2026-03-12 03:17:23'),
(3, 'Bandung', 1, '2026-03-12 03:17:23', '2026-03-12 03:17:23'),
(4, 'Surabaya', 1, '2026-03-12 03:17:23', '2026-03-12 03:17:23');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_phone_otp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_phone_otp_expired_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `otp_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expired_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `phone`, `new_phone`, `new_phone_otp`, `new_phone_otp_expired_at`, `password`, `is_verified`, `status`, `created_at`, `updated_at`, `otp_code`, `otp_expired_at`) VALUES
(1, 'Nama Baru Customer', '081234567890', '08xxxxxxxxxx', '402708', '2026-04-05 01:35:54', '$2y$12$PvnwfwgihuGdSdwzTWDGI.CiTBMrXzI4id/Atk1sdrykCRAD8JGei', 0, 1, '2026-03-13 00:47:10', '2026-04-05 01:30:54', NULL, NULL),
(2, 'ready room', '0811810154', NULL, NULL, NULL, '$2y$12$X7T376xJxTyuBJvym53BZ.60SXV99bslj4PdIQe/TirX4mWRatpxC', 0, 1, '2026-03-13 01:01:27', '2026-03-14 20:51:38', '899254', '2026-03-14 20:56:38'),
(3, 'test', '09090909', NULL, NULL, NULL, '$2y$12$iK3YAASbTO6V4jt9EjHh/e/PSxMHEmfmr8f/CXFDHPv8Wqv0O5kDO', 0, 1, '2026-03-13 02:13:15', '2026-03-13 02:13:15', NULL, NULL),
(4, 'qwe', '123', NULL, NULL, NULL, '$2y$12$0rjhlax8L6WLavC1C24b3ePztPIRMtRbkdXIMUSGQIpYjR1ak6aPK', 0, 1, '2026-03-13 02:23:47', '2026-03-13 02:23:47', NULL, NULL),
(6, 'ranutest', '085178437432', NULL, NULL, NULL, '$2y$12$NCmPZmxnL93jiytLRmInAu50bHbTY07q88e2lFx7QKkPI1FofuNOS', 0, 1, '2026-03-14 19:16:19', '2026-03-14 19:16:19', NULL, NULL),
(7, 'readytest', '085773271822', NULL, NULL, NULL, '$2y$12$BGfvn/uL.63Ws0JFxhig4emOlvMxxKuKHvp.LsbjgA7VtuMwWSmJ.', 1, 1, '2026-03-14 19:32:17', '2026-03-14 19:34:33', NULL, NULL),
(8, 'readyroom123', '08080808', NULL, NULL, NULL, '$2y$12$TEiu6NtmD7Td9nxXQDfgDOXIRLvgYiDCsJrMAWJ9JCYfCKar7UZOO', 0, 1, '2026-03-14 19:47:55', '2026-03-14 19:47:55', '385190', '2026-03-14 19:52:55'),
(9, 'readyroom1234', '080808', NULL, NULL, NULL, '$2y$12$EVtKA4TcyC7LSxcc12waW.gSkSK0Zv9PEvhHr96X9kan7mrcHHn3O', 1, 1, '2026-03-14 19:48:59', '2026-03-14 19:49:08', NULL, NULL),
(10, 'ready1234', '090909', NULL, NULL, NULL, '$2y$12$K.DRr8ze7izndynUM9Egve04HiH3jQasqeMSuViUb1PrV8TOLMFHC', 1, 1, '2026-03-14 19:52:57', '2026-03-14 19:53:09', NULL, NULL),
(11, 'ready room', '0821332244', NULL, NULL, NULL, '$2y$12$LggRI/EoITwFNf7yR0NsGO2GuTQpM1pfklRsd6dLjXnzgHSlFLmwu', 1, 1, '2026-03-14 21:00:00', '2026-03-14 21:00:39', NULL, NULL),
(12, 'ranubanget', '0858787878', NULL, NULL, NULL, '$2y$12$82ZRGXO/SGAl3i6OCbrSgemHNPdyNB0OQDeB26HrNNxTiTFRkEQ.S', 1, 1, '2026-03-14 21:19:57', '2026-03-14 21:29:50', NULL, NULL),
(13, 'haikalreadyroom', '010101', NULL, NULL, NULL, '$2y$12$AAjg6UrGduRTba887t156Ow2u0ZeAS2uAf6Jyh7aeVjO9w4PTqVaK', 1, 1, '2026-03-14 23:55:57', '2026-03-14 23:56:40', NULL, NULL),
(14, 'ranu123', '085157768294', NULL, NULL, NULL, '$2y$12$HZJ.2fxXqWiXPNtkeDILeODB4pjOTld/6bWbrYops9kSKycuoPrem', 0, 1, '2026-03-15 00:38:26', '2026-03-15 00:38:26', '500462', '2026-03-15 00:43:26'),
(15, 'ranu123', '082299171745', NULL, NULL, NULL, '$2y$12$846Bw1bDnhOlojS3k/F36uyqOg6yMVumAUUAA8EWM7G8SfmKv2SW.', 1, 1, '2026-03-15 01:17:10', '2026-03-15 01:19:44', NULL, NULL),
(16, 'testready room', '08978812256', NULL, NULL, NULL, '$2y$12$BiMvAfut6VIsVsFDL2MyCuKU9Qe3Me7lkArcEk/YvV269oBIaqYIq', 0, 1, '2026-03-15 20:04:45', '2026-03-15 20:06:03', '881527', '2026-03-15 20:11:03'),
(17, 'adi', '085927515228', NULL, NULL, NULL, '$2y$12$Wk.W3cw1h.SD1IvoxskAk.xieJGGWL.rJwgXzhbX3rtzgqs8VcOle', 1, 1, '2026-03-16 06:30:29', '2026-03-24 00:34:13', NULL, NULL),
(18, 'rici', '081384332021', NULL, NULL, NULL, '$2y$12$fCjErN0sE5g7rMAbzgRZ8uCL4s2bIF9JNTMI73f6xC4N.WPJzmpHO', 1, 1, '2026-03-24 23:50:52', '2026-04-05 01:47:44', NULL, NULL),
(19, 'sandi', '085211579011', NULL, NULL, NULL, '$2y$12$DJK9lFXl0O5sDHDcjz6tve9vnwWC8w6leuEEmgGXHf3CAxClvbsEa', 1, 1, '2026-04-05 17:30:20', '2026-04-05 17:31:23', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

CREATE TABLE `facilities` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`id`, `name`, `icon`, `status`, `created_at`, `updated_at`) VALUES
(1, 'WiFi', 'wifi', 1, '2026-03-15 02:56:35', '2026-03-15 03:17:56'),
(2, 'Parkir', 'Parking', 1, '2026-03-15 03:08:11', '2026-03-17 20:16:52'),
(3, 'Parkir Gratis', 'car', 1, '2026-03-15 20:01:23', '2026-03-17 21:43:17'),
(4, 'Kolam renang', 'waves', 1, '2026-03-17 03:06:44', '2026-04-02 03:34:23');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotels`
--

CREATE TABLE `hotels` (
  `id` bigint UNSIGNED NOT NULL,
  `city_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `area` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `wa_admin` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `map_link` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(2,1) NOT NULL DEFAULT '0.0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotels`
--

INSERT INTO `hotels` (`id`, `city_id`, `name`, `area`, `address`, `wa_admin`, `latitude`, `longitude`, `map_link`, `description`, `thumbnail`, `hero_image`, `rating`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'ReadyRoom Melawai - Jakarta', 'Melawai', 'Jl. Melawai Raya No.10 Jakarta Selatan', NULL, NULL, NULL, NULL, 'Hotel transit dan menginap', 'hotels/thumbnail/x5ZHt802N0G0BZYs7Hd7mhZbrJmiwD7gR5dSzqnd.jpg', 'hotels/hero/iey9VAlFWzO8yTKwv4MGwQqfwvPOZ1r4c3gp5ozW.jpg', 4.5, 1, '2026-03-11 21:08:50', '2026-04-02 19:52:25'),
(2, 2, 'ReadyRoom Hikaru', 'Hikaru', 'Jl. Gn. Agung No.119, Pemecutan, Kec. Denpasar Bar., Kota Denpasar, Bali 80119', '0811810852', NULL, NULL, 'https://maps.app.goo.gl/u4Z5sGG3CRywphZ58', 'Lokasi dekat dengan jalan bandara', 'hotels/thumbnail/Q9NFaVeYglD2JOCHDD1hLZTBB6BXPnpybPkDOMeB.jpg', 'hotels/hero/MJBKbmZC5Wt2QyRTDA0ZKQ7pf2YTDs9LOOT88m9c.jpg', 4.5, 1, '2026-03-11 23:17:25', '2026-03-27 02:58:13'),
(4, 1, 'Ready Room Anggrek', 'Jakarta', 'Jl anggrek raya', '0811810154', NULL, NULL, 'https://maps.app.goo.gl/rPj1hbBxHeK4rCJEA', 'kamar rapi dan aman', 'hotels/thumbnail/0JCVWgDiyKqt67mC9dUtYBMQGMZzG22TivRkBksY.jpg', 'hotels/hero/zys5wj4yQHWlJW4gXmJ5kOI9AQmlvHXKqJKG9dF3.jpg', 0.0, 1, '2026-03-25 02:19:00', '2026-03-26 19:54:49'),
(5, 1, 'Ready Room Veteran', 'Veteran', 'Jl RAYA VETERAN', '0811810154', NULL, NULL, 'https://maps.app.goo.gl/JBSsEP1mNJQsfui2A', 'Kamar Rapi Dan Bagus Banget', 'hotels/thumbnail/Dr7cRQcj7eHaX74V2hXrhCaKe6o0mwaFLlF5zkid.jpg', 'hotels/hero/Z7AYqxdwCOLDpEfVtys2NaZjmHm3oBjaJg4RLyC6.jpg', 0.0, 1, '2026-03-25 03:35:25', '2026-03-26 19:54:24');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_facilities`
--

CREATE TABLE `hotel_facilities` (
  `id` bigint UNSIGNED NOT NULL,
  `hotel_id` bigint UNSIGNED NOT NULL,
  `facility_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotel_facilities`
--

INSERT INTO `hotel_facilities` (`id`, `hotel_id`, `facility_id`, `created_at`, `updated_at`) VALUES
(1, 5, 1, NULL, NULL),
(2, 5, 2, NULL, NULL),
(3, 5, 3, NULL, NULL),
(4, 5, 4, NULL, NULL),
(5, 4, 1, NULL, NULL),
(6, 4, 4, NULL, NULL),
(7, 4, 2, NULL, NULL),
(8, 4, 3, NULL, NULL),
(9, 2, 1, NULL, NULL),
(10, 2, 2, NULL, NULL),
(11, 2, 4, NULL, NULL),
(12, 2, 3, NULL, NULL),
(13, 1, 1, NULL, NULL),
(14, 1, 2, NULL, NULL),
(15, 1, 3, NULL, NULL),
(16, 1, 4, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `internal_broadcasts`
--

CREATE TABLE `internal_broadcasts` (
  `id` bigint UNSIGNED NOT NULL,
  `sent_by` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_roles` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `show_as_modal` tinyint(1) NOT NULL DEFAULT '1',
  `show_as_banner` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `internal_broadcasts`
--

INSERT INTO `internal_broadcasts` (`id`, `sent_by`, `title`, `message`, `target_roles`, `is_active`, `show_as_modal`, `show_as_banner`, `created_at`, `updated_at`) VALUES
(3, 7, 'Semangat Malam', 'Jangan Lupa Makan krna kalo gk makan nanti omset menurun', '[\"admin\", \"receptionist\", \"pengawas\", \"super_admin\"]', 1, 1, 0, '2026-04-05 21:53:29', '2026-04-05 21:53:29');

-- --------------------------------------------------------

--
-- Table structure for table `internal_broadcast_dismissals`
--

CREATE TABLE `internal_broadcast_dismissals` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `internal_broadcast_id` bigint UNSIGNED NOT NULL,
  `dismissed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `internal_broadcast_dismissals`
--

INSERT INTO `internal_broadcast_dismissals` (`id`, `user_id`, `internal_broadcast_id`, `dismissed_at`, `created_at`, `updated_at`) VALUES
(3, 6, 3, '2026-04-05 21:53:43', '2026-04-05 21:53:43', '2026-04-05 21:53:43'),
(4, 8, 3, '2026-04-05 21:59:44', '2026-04-05 21:59:44', '2026-04-05 21:59:44'),
(5, 9, 3, '2026-04-06 02:11:25', '2026-04-06 02:11:25', '2026-04-06 02:11:25');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_03_12_015754_update_users_table', 2),
(5, '2026_03_12_022914_create_cities_table', 2),
(6, '2026_03_12_024214_create_hotels_table', 3),
(7, '2026_03_12_024713_create_rooms_table', 4),
(8, '2026_03_12_024920_create_facilities_table', 5),
(9, '2026_03_12_025115_create_hotel_facilities_table', 6),
(10, '2026_03_12_025421_create_bookings_table', 7),
(11, '2026_03_13_070950_create_customers_table', 8),
(12, '2026_03_15_014856_update_customers_table', 9),
(13, '2026_03_15_020301_add_otp_to_customers_table', 10),
(14, '2026_03_15_020404_add_otp_to_customers_table', 11),
(15, '2026_03_16_054716_create_room_images_table', 12),
(16, '2026_03_17_041646_create_room_units_table', 13),
(17, '2026_03_18_042348_alter_bookings_table_for_admin_approval', 14),
(18, '2026_03_19_075755_alter_bookings_add_guest_fields', 15),
(19, '2026_03_20_080523_alter_status_enum_on_bookings_table', 16),
(20, '2026_03_20_093434_add_edited_by_to_bookings_table', 17),
(21, '2026_03_23_033112_add_discount_percent_to_bookings_table', 18),
(22, '2026_03_23_040648_add_refund_fields_to_bookings_table', 19),
(23, '2026_03_24_081808_create_website_contents_table', 20),
(24, '2026_03_25_024700_alter_bookings_add_cancel_fields_table', 21),
(25, '2026_03_25_082955_alter_hotels_add_wa_admin_table', 22),
(26, '2026_03_26_030517_add_lat_long_to_hotels_table', 23),
(27, '2026_03_26_075119_add_map_link_to_hotels_table', 24),
(28, '2026_03_27_095154_alter_bookings_user_id_foreign_to_customers_table', 25),
(29, '2026_03_30_035139_create_user_hotels_table', 26),
(30, '2026_04_01_041311_add_video_path_to_website_contents_table', 27),
(31, '2026_04_01_045008_add_promo2_fields_to_website_contents_table', 28),
(32, '2026_04_01_083154_add_payment_fields_to_bookings_table', 29),
(33, '2026_04_02_040540_create_booking_penalties_table', 30),
(34, '2026_04_05_080750_add_change_phone_fields_to_customers_table', 31),
(35, '2026_04_05_111602_alter_role_enum_on_users_table', 32),
(36, '2026_04_05_134253_create_internal_broadcasts_table', 33),
(37, '2026_04_06_031251_create_internal_broadcast_dismissals_table', 34);

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `status` enum('active','pending','suspended') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` bigint UNSIGNED NOT NULL,
  `hotel_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL DEFAULT '1',
  `price_per_night` int NOT NULL DEFAULT '0',
  `price_transit_3h` int NOT NULL DEFAULT '0',
  `price_transit_6h` int NOT NULL DEFAULT '0',
  `price_transit_12h` int NOT NULL DEFAULT '0',
  `total_rooms` int NOT NULL DEFAULT '0',
  `available_rooms` int NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `hotel_id`, `name`, `type`, `capacity`, `price_per_night`, `price_transit_3h`, `price_transit_6h`, `price_transit_12h`, `total_rooms`, `available_rooms`, `description`, `thumbnail`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Deluxe Room', 'Deluxe', 2, 450000, 0, 0, 0, 10, 0, NULL, NULL, 1, '2026-03-11 21:40:05', '2026-03-11 21:40:05'),
(2, 2, 'Room Deluxe Hikaru', 'Deluxe', 3, 400000, 0, 0, 0, 10, 0, NULL, NULL, 1, '2026-03-12 01:53:29', '2026-03-12 01:53:29'),
(3, 2, 'Standard Room', 'Standard', 2, 23, 21, 20, 25, 23, 0, 'memberikan dlll', NULL, 1, '2026-03-15 21:58:07', '2026-03-15 21:58:07'),
(4, 1, 'Superior Room', 'Superior', 2, 32, 32, 21, 25, 12, 0, 'asds', 'C:\\Users\\Unknown\\AppData\\Local\\Temp\\phpB83B.tmp', 1, '2026-03-15 22:37:32', '2026-03-15 22:37:32'),
(5, 2, 'Superior Room', 'Superior', 21, 123, 321, 156, 654, 12, 12, 'kamar baik', 'rooms/el2CPveB3XP1ugJdt1WnbQ39kku8mNerPLwZl5Zx.png', 1, '2026-03-16 06:38:00', '2026-03-16 06:38:00'),
(6, 1, 'Family Room', 'Family', 4, 300000, 130000, 150000, 200000, 10, 10, 'Nyaman untuk kumpul keluarga', 'rooms/qVLXtNv5Z0ZMAzr5n4DBvhkuMxzUwO6MoVtyhyfi.png', 1, '2026-03-23 02:11:20', '2026-03-23 02:11:20'),
(7, 4, 'Standard Room', 'Standard', 2, 250000, 130000, 150000, 180000, 10, 10, 'kamar rapi dan nyaman', 'rooms/hWpt4g6lwhC4uuKtG6J3CJP4EFZWXAV8dILg5vm7.jpg', 1, '2026-03-25 02:36:44', '2026-03-25 02:36:44'),
(8, 1, 'Superior Room', 'Superior', 2, 130000, 100000, 200000, 300000, 3, 3, NULL, 'rooms/WRS3aS0KFgCiSgqmtYqSxgF9xtduJHrW5DG9Vzst.jpg', 1, '2026-04-08 21:52:49', '2026-04-08 21:52:49');

-- --------------------------------------------------------

--
-- Table structure for table `room_images`
--

CREATE TABLE `room_images` (
  `id` bigint UNSIGNED NOT NULL,
  `room_id` bigint UNSIGNED NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room_images`
--

INSERT INTO `room_images` (`id`, `room_id`, `image_path`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 5, 'rooms/gallery/QxVXrpsB4h7JpMRd0SCJBLyZsfmlqj7tpeaojy2w.png', 0, '2026-03-16 06:38:00', '2026-03-16 06:38:00'),
(2, 5, 'rooms/gallery/PBnCqPgJaZ2JRSkYzBYJsVnBvPRR6vQKiI0B80zY.png', 1, '2026-03-16 06:38:00', '2026-03-16 06:38:00'),
(3, 6, 'rooms/gallery/B4QxbCx6ZU3VY6BL3AFmV0GQAa3Guusey7gALcbF.png', 0, '2026-03-23 02:11:20', '2026-03-23 02:11:20'),
(4, 6, 'rooms/gallery/0YGP98HEzmaNJmRfOrJ9BuqP68cgyyWUg22azqw3.png', 1, '2026-03-23 02:11:20', '2026-03-23 02:11:20'),
(5, 7, 'rooms/gallery/fGaTq3hn1RlPSX1AIgJT38rgqrtbW4PZv4opNcxY.jpg', 0, '2026-03-25 02:36:44', '2026-03-25 02:36:44'),
(6, 7, 'rooms/gallery/sZJfdrE5Ja4qTL0dCKD71H5EgtBMpQfDVLCNAeqL.jpg', 1, '2026-03-25 02:36:44', '2026-03-25 02:36:44'),
(7, 7, 'rooms/gallery/yZxt3i4CKNaefcHFoT3M8sqibJZXchvXKmvfVFYj.jpg', 2, '2026-03-25 02:36:44', '2026-03-25 02:36:44'),
(8, 7, 'rooms/gallery/LpTAgOcD5Btiw67bP7AHZZMiyy8UWyPbqWN2nJ36.jpg', 3, '2026-03-25 02:36:44', '2026-03-25 02:36:44'),
(9, 8, 'rooms/gallery/WBNIOlxPH19fLoVbTOYwdMhWWr9qD4L4YpXBpE0q.jpg', 0, '2026-04-08 21:52:49', '2026-04-08 21:52:49'),
(10, 8, 'rooms/gallery/chhXN5dUVbBVP5L5P87VQc9bScbPqLgeEUQ4WvL8.jpg', 1, '2026-04-08 21:52:49', '2026-04-08 21:52:49'),
(11, 8, 'rooms/gallery/J92z8mKj8RCxP3tlxNSxPJpjYgzTmwa7bwlPKClz.jpg', 2, '2026-04-08 21:52:49', '2026-04-08 21:52:49');

-- --------------------------------------------------------

--
-- Table structure for table `room_units`
--

CREATE TABLE `room_units` (
  `id` bigint UNSIGNED NOT NULL,
  `room_id` bigint UNSIGNED NOT NULL,
  `room_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room_units`
--

INSERT INTO `room_units` (`id`, `room_id`, `room_number`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, '101', 0, '2026-03-17 20:26:42', '2026-03-18 01:50:23'),
(2, 2, '102', 1, '2026-03-17 20:26:50', '2026-03-17 20:26:50'),
(3, 2, '103', 1, '2026-03-17 20:26:54', '2026-03-17 20:26:54'),
(4, 4, '103', 1, '2026-03-17 21:43:04', '2026-03-17 21:43:04'),
(5, 4, '105', 1, '2026-03-17 21:43:09', '2026-03-17 21:43:09'),
(6, 1, '102', 1, '2026-03-18 03:27:00', '2026-03-18 03:27:00'),
(7, 1, '203', 0, '2026-03-18 03:27:04', '2026-03-18 03:48:21'),
(8, 1, '205', 1, '2026-03-18 03:27:07', '2026-03-18 03:27:07'),
(9, 1, '130', 1, '2026-03-19 01:34:00', '2026-03-19 01:34:00'),
(10, 6, '102', 1, '2026-03-23 02:11:40', '2026-03-23 02:11:40'),
(11, 6, '108', 1, '2026-03-23 02:11:44', '2026-03-23 02:11:44'),
(12, 7, '105', 1, '2026-03-25 02:52:05', '2026-03-25 02:52:05'),
(13, 7, '109', 1, '2026-03-25 02:52:09', '2026-03-25 02:52:09'),
(14, 7, '108', 1, '2026-03-25 02:52:12', '2026-03-25 02:52:12'),
(15, 7, '107', 1, '2026-03-25 02:52:14', '2026-03-25 02:52:14'),
(16, 7, '103', 1, '2026-03-25 02:52:18', '2026-03-25 02:52:18'),
(17, 5, '809', 1, '2026-03-28 23:24:06', '2026-03-28 23:24:06');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('B5TW7KLqqMRY93wL0EawmmsNoKafyg4TlPOPcmGy', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVWpjTEZmYWV0dXFvaW5nZjY1YUZ3S3hzaFRDclRkcEY5VUdqdUd6UiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1773286305),
('kkWRmPEbi5uVeVzkRNgnOjWgPiedla83opoA0tFN', NULL, '127.0.0.1', 'Thunder Client (https://www.thunderclient.com)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWWxuczhzMEQ2cUM0NUtWNndTMTNFZ01PZ1dNMFV0dHdNOWk5blFScSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1774492074),
('NmS4I7sKzpe3KVUCF8L83RhxIia8ZuYhjdCOAlvW', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWWhXR0dCTEVIWmxvU0Njc1p6RzQ3RkEwM1RZNVdjZXVPWE16MXBqTyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTI6Imh0dHA6Ly9kb255YS1ub25zZWNyZXRpdmUtc3VwZXJib2xkbHkubmdyb2stZnJlZS5kZXYiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1774923947);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` enum('customer','boss','super_admin','admin','receptionist','pengawas','it','it_staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `role`, `status`) VALUES
(1, 'Bos ReadyRoom', 'bos@readyroom.com', '081234567890', NULL, '$2y$12$efZGg6F2i1AYCmar3NG76OLR0zbLXMGg1Z2tvJyynjekeA9COqw1O', NULL, '2026-03-12 00:01:29', '2026-03-23 20:40:15', 'boss', 1),
(2, 'readyroomcs', 'readyroomcs@gmail.com', '09203901239', NULL, '$2y$12$0ieW7MJEfTaHozqphwWBluJmMi1EQoSSERzTBxbjwdb4RgzCXwK7W', NULL, '2026-03-12 23:55:37', '2026-03-12 23:55:37', 'customer', 1),
(3, 'Super Admin ReadyRoom', 'superadmin@readyroom.com', NULL, NULL, '$2y$12$am5gCCtBdDN/lLGUUPZrquucnxxJkkM47beV1lufsGDXSZ1hioENO', NULL, '2026-03-20 04:11:44', '2026-03-20 04:11:44', 'super_admin', 1),
(5, 'Receptionist Melawai', 'resepsionist@melawai.readyroom', '0838292929', NULL, '$2y$12$ancFbJ45otUiEbC0.5pt6O10E1niSMLGq.ovDOuyapg8uwakBjCBS', NULL, '2026-03-24 01:02:16', '2026-03-26 02:49:53', 'receptionist', 1),
(6, 'admin ade', 'ade@gmail.com', '081223232', NULL, '$2y$12$XMygoYMVl2SMvKtcCdhbu.gl2gQ1f3hJxy4olbOXvvEBl9n4gbwVO', NULL, '2026-03-29 21:12:19', '2026-04-05 03:03:24', 'admin', 1),
(7, 'ranu ITE', 'ranuimaging@gmail.com', '085178437432', NULL, '$2y$12$4FrocTOXM4iqNIPlKNzlJeSjfmC9J4GPM5cN0ejRbzEMe87UMHyVS', NULL, '2026-04-05 04:57:48', '2026-04-05 05:26:49', 'it', 1),
(8, 'Reza', 'pengawas1@readyroom.id', '0811111111', NULL, '$2y$12$VUdmVF11ehlFkGAkOKiXG.5wJQTXoNHVt3Zmxg/xAapK5hXGrKM8i', NULL, '2026-04-05 06:34:09', '2026-04-05 06:34:09', 'pengawas', 1),
(9, 'Funny', 'reseptionist@readyroom', '0811111', NULL, '$2y$12$uflLczFBIn8kCkSQbarA7O5Tdx64tiKsjdpV6J6nxSPjKcRRYwL46', NULL, '2026-04-06 02:10:33', '2026-04-06 02:10:33', 'receptionist', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_hotels`
--

CREATE TABLE `user_hotels` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `hotel_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_hotels`
--

INSERT INTO `user_hotels` (`id`, `user_id`, `hotel_id`, `created_at`, `updated_at`) VALUES
(2, 6, 4, NULL, NULL),
(3, 6, 2, NULL, NULL),
(4, 5, 1, NULL, NULL),
(5, 8, 5, NULL, NULL),
(6, 8, 2, NULL, NULL),
(7, 8, 1, NULL, NULL),
(8, 8, 4, NULL, NULL),
(9, 9, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `website_contents`
--

CREATE TABLE `website_contents` (
  `id` bigint UNSIGNED NOT NULL,
  `hero_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_subtitle` text COLLATE utf8mb4_unicode_ci,
  `hero_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `info_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `info_description` text COLLATE utf8mb4_unicode_ci,
  `info_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `promo2_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `promo2_description` text COLLATE utf8mb4_unicode_ci,
  `promo2_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_description` text COLLATE utf8mb4_unicode_ci,
  `video_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `website_contents`
--

INSERT INTO `website_contents` (`id`, `hero_title`, `hero_subtitle`, `hero_image`, `info_title`, `info_description`, `info_image`, `promo2_title`, `promo2_description`, `promo2_image`, `video_title`, `video_description`, `video_url`, `video_path`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'ReadyRoom, Booking Hotel Lebih Mudah', 'Nikmati pengalaman booking yang cepat, nyaman, modern dan sistem transit', 'website-content/hero/7opZkhnVhvhLGdMTmzuOiaziCgJy88jqfMMRsYwN.jpg', 'Fasilitas Exlusive', 'Dapatkan fasilitas exlusive dengan harga yang terjangkau', 'website-content/promo1/LwUIC3NkG2lqXG1A1z4akdzdicMxmsjA93uLfPqs.jpg', 'Promo Pengguna Baru', 'Ayo segera daftarkan akun mu untuk mendapatkan promo 50% untuk pengguna baru', 'website-content/promo2/722nIcgGvD82jnDrgR6fwXJzgnqTcoPCbVPzo7a3.png', 'Video Profil ReadyRoom', 'Kenali layanan dan pengalaman menginap bersama ReadyRoom.', 'https://www.youtube.com/watch?v=contoh', 'website-content/video/HELfGRe9Wcd1gKQXCyGZ7NZBZBWfJVxCK2mThPZB.mp4', 1, '2026-03-24 01:30:20', '2026-04-01 01:02:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookings_hotel_id_foreign` (`hotel_id`),
  ADD KEY `bookings_room_id_foreign` (`room_id`),
  ADD KEY `bookings_room_unit_id_foreign` (`room_unit_id`),
  ADD KEY `bookings_created_by_foreign` (`created_by`),
  ADD KEY `bookings_edited_by_foreign` (`edited_by`),
  ADD KEY `bookings_cancelled_by_foreign` (`cancelled_by`),
  ADD KEY `bookings_user_id_foreign` (`user_id`);

--
-- Indexes for table `booking_penalties`
--
ALTER TABLE `booking_penalties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_penalties_booking_id_foreign` (`booking_id`),
  ADD KEY `booking_penalties_created_by_foreign` (`created_by`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `hotels`
--
ALTER TABLE `hotels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hotels_city_id_foreign` (`city_id`);

--
-- Indexes for table `hotel_facilities`
--
ALTER TABLE `hotel_facilities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hotel_facilities_hotel_id_foreign` (`hotel_id`),
  ADD KEY `hotel_facilities_facility_id_foreign` (`facility_id`);

--
-- Indexes for table `internal_broadcasts`
--
ALTER TABLE `internal_broadcasts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `internal_broadcasts_sent_by_foreign` (`sent_by`);

--
-- Indexes for table `internal_broadcast_dismissals`
--
ALTER TABLE `internal_broadcast_dismissals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_broadcast_unique_dismissal` (`user_id`,`internal_broadcast_id`),
  ADD KEY `internal_broadcast_dismissals_internal_broadcast_id_foreign` (`internal_broadcast_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rooms_hotel_id_foreign` (`hotel_id`);

--
-- Indexes for table `room_images`
--
ALTER TABLE `room_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_images_room_id_foreign` (`room_id`);

--
-- Indexes for table `room_units`
--
ALTER TABLE `room_units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_units_room_id_foreign` (`room_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_hotels`
--
ALTER TABLE `user_hotels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_hotels_user_id_foreign` (`user_id`),
  ADD KEY `user_hotels_hotel_id_foreign` (`hotel_id`);

--
-- Indexes for table `website_contents`
--
ALTER TABLE `website_contents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `website_contents_updated_by_foreign` (`updated_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `booking_penalties`
--
ALTER TABLE `booking_penalties`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotels`
--
ALTER TABLE `hotels`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hotel_facilities`
--
ALTER TABLE `hotel_facilities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `internal_broadcasts`
--
ALTER TABLE `internal_broadcasts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `internal_broadcast_dismissals`
--
ALTER TABLE `internal_broadcast_dismissals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `room_images`
--
ALTER TABLE `room_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `room_units`
--
ALTER TABLE `room_units`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_hotels`
--
ALTER TABLE `user_hotels`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `website_contents`
--
ALTER TABLE `website_contents`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_cancelled_by_foreign` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_edited_by_foreign` FOREIGN KEY (`edited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_hotel_id_foreign` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_room_unit_id_foreign` FOREIGN KEY (`room_unit_id`) REFERENCES `room_units` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_penalties`
--
ALTER TABLE `booking_penalties`
  ADD CONSTRAINT `booking_penalties_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_penalties_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hotels`
--
ALTER TABLE `hotels`
  ADD CONSTRAINT `hotels_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_facilities`
--
ALTER TABLE `hotel_facilities`
  ADD CONSTRAINT `hotel_facilities_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_facilities_hotel_id_foreign` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `internal_broadcasts`
--
ALTER TABLE `internal_broadcasts`
  ADD CONSTRAINT `internal_broadcasts_sent_by_foreign` FOREIGN KEY (`sent_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `internal_broadcast_dismissals`
--
ALTER TABLE `internal_broadcast_dismissals`
  ADD CONSTRAINT `internal_broadcast_dismissals_internal_broadcast_id_foreign` FOREIGN KEY (`internal_broadcast_id`) REFERENCES `internal_broadcasts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `internal_broadcast_dismissals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_hotel_id_foreign` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_images`
--
ALTER TABLE `room_images`
  ADD CONSTRAINT `room_images_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_units`
--
ALTER TABLE `room_units`
  ADD CONSTRAINT `room_units_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_hotels`
--
ALTER TABLE `user_hotels`
  ADD CONSTRAINT `user_hotels_hotel_id_foreign` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_hotels_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `website_contents`
--
ALTER TABLE `website_contents`
  ADD CONSTRAINT `website_contents_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
