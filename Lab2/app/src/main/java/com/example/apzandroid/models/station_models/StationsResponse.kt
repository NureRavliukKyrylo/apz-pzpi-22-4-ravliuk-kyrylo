package com.example.apzandroid.models.station_models

data class StationsResponse(
    val id: Int,
    val station_of_containers_name: String,
    val latitude_location: Double,
    val longitude_location: Double,
    val status_station:Int,
    val last_reserved: String
)