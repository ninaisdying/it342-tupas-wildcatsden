package com.example.wildcatsden.events.models

data class Event(
    val id: String = "",
    val name: String = "",
    val description: String = "",
    val coverPhoto: String = "",
    val startTime: String = "",
    val endTime: String = "",
    val place: String = "",
    val attendingCount: Int = 0
)