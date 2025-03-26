package com.example.apzandroid.api

import com.example.apzandroid.models.account_models.MySelfResponse
import retrofit2.Call
import retrofit2.http.GET

interface AccountService {
    @GET("api/customers/myself/")
    fun myself(): Call<MySelfResponse>
}