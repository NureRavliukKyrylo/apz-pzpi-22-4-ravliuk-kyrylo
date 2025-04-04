package com.example.apzandroid.api

import com.example.apzandroid.models.station_models.StationStatusResponse
import com.example.apzandroid.models.station_models.StationsResponse
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path
import retrofit2.http.Query

interface StationsService {
    @GET("api/stationOfContainers/")
    fun stations(@Header("X-CSRFToken") csrfToken: String):  Call<List<StationsResponse>>

    @GET("api/stationOfContainers/{id}")
    fun stationsId(@Header("X-CSRFToken") csrfToken: String, @Path("id") id: String):  Call<StationsResponse>

    @GET("api/stationOfContainersStatuses/{id}")
    fun statusStations(@Path("id") id: String, @Header("X-CSRFToken") csrfToken: String): Call<StationStatusResponse>

    @GET("api/stationOfContainers/")
    fun searchStations(@Query("search") keyword: String, @Header("X-CSRFToken") csrfToken: String): Call<List<StationsResponse>>
}