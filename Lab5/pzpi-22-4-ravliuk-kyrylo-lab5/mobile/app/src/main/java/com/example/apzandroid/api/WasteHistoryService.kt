package com.example.apzandroid.api

import com.example.apzandroid.models.waste_history_models.WasteHistoriesResponse
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Header

interface WasteHistoryService {
    @GET("api/wasteHistories/")
    fun wasteHistories(@Header("X-CSRFToken") csrfToken: String):  Call<List<WasteHistoriesResponse>>
}