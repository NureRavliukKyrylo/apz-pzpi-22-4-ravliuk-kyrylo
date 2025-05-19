package com.example.apzandroid.api

import com.example.apzandroid.models.schedules.ScheduleResponse
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Header

interface ScheduleService {
    @GET("api/collectionSchedules/")
    fun collectionSchedules(@Header("X-CSRFToken") csrfToken: String):  Call<List<ScheduleResponse>>
}