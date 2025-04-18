package com.example.apzandroid.api
import com.example.apzandroid.models.auth_models.GoogleLoginRequest
import com.example.apzandroid.models.auth_models.LoginRequest
import com.example.apzandroid.models.auth_models.LoginResponse
import com.example.apzandroid.models.auth_models.RegisterRequest
import com.example.apzandroid.models.auth_models.RegisterResponse
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthService {
    @POST("api/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @POST("api/register")
    fun register(@Body request: RegisterRequest): Call<RegisterResponse>

    @POST("api/login-google/")
    fun loginGoogle(@Body request: GoogleLoginRequest): Call<ResponseBody>

}