package com.example.apzandroid.models.container_models

data class ContainersResponse(
    val fill_level: Double,
    val status_container_id: Int,
    val last_updated: String,
    val type_of_container_id: Int,
    val station_id : Int
)