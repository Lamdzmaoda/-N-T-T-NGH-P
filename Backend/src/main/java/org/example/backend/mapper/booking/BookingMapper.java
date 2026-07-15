package org.example.backend.mapper.booking;

import org.example.backend.dto.response.booking.BookingResponse;
import org.example.backend.entity.BookingPayment.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface BookingMapper {
    // Ánh xạ các trường khác tên từ Entity sang DTO
    @Mapping(source = "place.id", target = "placeId")
    @Mapping(source = "check_in", target = "checkIn")
    @Mapping(source = "check_out", target = "checkOut")
    @Mapping(source = "total_price", target = "totalPrice")
    BookingResponse toBookingResponse(Booking booking);
}
