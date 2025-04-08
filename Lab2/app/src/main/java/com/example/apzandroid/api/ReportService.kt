package com.example.apzandroid.api

import com.example.apzandroid.models.report_models.ReportDateRequest
import com.example.apzandroid.models.report_models.ReportDateResponse
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface ReportService {
    @POST("api/get_report")
    fun getStationsReport(@Body request: ReportDateRequest,@Header("X-CSRFToken") csrfToken: String): Call<ResponseBody>

    @POST("api/get_report_waste")
    fun getWasteReport(@Body request: ReportDateRequest,@Header("X-CSRFToken") csrfToken: String): Call<ResponseBody>
}