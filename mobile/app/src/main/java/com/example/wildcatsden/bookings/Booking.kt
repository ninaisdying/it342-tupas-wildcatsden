package com.example.wildcatsden.bookings

data class Booking(
    val bookingId: Long,
    val eventName: String?,
    val date: String?,
    val timeSlot: String?,
    val status: String?,
    val capacity: Int?,
    val description: String?,
    val venueId: Long?,
    val venueName: String?
)
