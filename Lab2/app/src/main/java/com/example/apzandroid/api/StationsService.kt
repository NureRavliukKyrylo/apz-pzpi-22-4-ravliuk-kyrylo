package com.example.apzandroid.api

import com.example.apzandroid.models.station_models.StationStatusResponse
import com.example.apzandroid.models.station_models.StationsResponse
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path

interface StationsService {
    @GET("api/stationOfContainers/")
    fun stations(@Header("X-CSRFToken") csrfToken: String):  Call<List<StationsResponse>>

    @GET("api/stationOfContainersStatuses/{id}")
    fun statusStations(@Path("id") id: String, @Header("X-CSRFToken") csrfToken: String): Call<StationStatusResponse>
}