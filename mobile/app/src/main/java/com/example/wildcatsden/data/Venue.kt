package com.example.wildcatsden.data

data class Venue(
    val venueId: Int = 0,
    val venueName: String = "",
    val venueLocation: String? = "",
    val venueCapacity: Int? = 0,
    val image: String? = "",
    val description: String? = "",
    val custodianId: Int? = 0,
    val custodianName: String? = "",
    val amenities: List<String> = emptyList()
)