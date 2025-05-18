package com.example.apzandroid.api

import com.example.apzandroid.models.container_models.ContainersResponse
import com.example.apzandroid.models.container_models.StatusContainerResponse
import com.example.apzandroid.models.container_models.TypeContainerResponse
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path

interface ContainersService {
    @GET("api/containers/")
    fun containers(@Header("X-CSRFToken") csrfToken: String):  Call<List<ContainersResponse>>

    @GET("api/statusOfContainers/{id}/")
    fun statusContainers(@Path("id") id: String, @Header("X-CSRFToken") csrfToken: String): Call<StatusContainerResponse>

    @GET("api/typeOfContainers/{id}/")
    fun typeContainers(@Path("id") id: String, @Header("X-CSRFToken") csrfToken: String): Call<TypeContainerResponse>
}