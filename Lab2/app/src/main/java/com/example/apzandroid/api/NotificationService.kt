package com.example.apzandroid.api

import com.example.apzandroid.models.notification_models.ToggleEmailResponse
import com.example.apzandroid.models.notification_models.TogglePushResponse
import com.example.apzandroid.models.notification_models.UserSettingsResponse
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface NotificationService {
    @GET("api/user-settings/")
    fun notificationOptions(@Header("X-CSRFToken") csrfToken: String):  Call<UserSettingsResponse>

    @POST("api/toggle-email/")
    fun toggleEmailNotifications(@Header("X-CSRFToken") csrfToken: String): Call<ToggleEmailResponse>

    @POST("api/toggle-push/")
    fun togglePushNotifications(@Header("X-CSRFToken") csrfToken: String): Call<TogglePushResponse>
}