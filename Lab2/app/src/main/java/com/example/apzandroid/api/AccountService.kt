package com.example.apzandroid.api

import com.example.apzandroid.models.account_models.ChangePasswordRequest
import com.example.apzandroid.models.account_models.ChangePasswordResponse
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.RoleResponse
import com.example.apzandroid.models.account_models.UpdateCustomerRequest
import com.example.apzandroid.models.account_models.UpdateCustomerResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.PUT
import retrofit2.http.Path

interface AccountService {
    @GET("api/customers/myself/")
    fun myself(): Call<MySelfResponse>

    @GET("api/roleUsers/{id}")
    fun roleUser(@Path("id") id: String): Call<RoleResponse>

    @PUT("api/customers/{id}/")
    fun updateUser(@Path("id") id: String, @Body request: UpdateCustomerRequest,@Header("X-CSRFToken") csrfToken: String): Call<UpdateCustomerResponse>

    @PATCH("api/customers/{id}/change-password/")
    fun changePassword(@Path("id") id: String, @Body request: ChangePasswordRequest, @Header("X-CSRFToken") csrfToken: String): Call<ChangePasswordResponse>
}