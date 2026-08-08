import { Booking } from "./booking.entity";
import { bookingResponseSchema, BookingResponseDto, passengerBookingResponseSchema, PassengerBookingResponseDto, driverBookingResponseSchema, DriverBookingResponseDto } from "./booking.dto";

export const mapToBookingResponseDto = (booking: Booking): BookingResponseDto => {
    return bookingResponseSchema.parse(booking);
};

export const mapToPassengerBookingDto = (booking: Booking): PassengerBookingResponseDto => {
    return passengerBookingResponseSchema.parse(booking);
};

export const mapToDriverBookingDto = (booking: Booking): DriverBookingResponseDto => {
    return driverBookingResponseSchema.parse(booking);
}