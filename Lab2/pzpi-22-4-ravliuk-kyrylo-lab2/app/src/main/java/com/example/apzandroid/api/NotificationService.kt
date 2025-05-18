package com.example.apzandroid.api

import com.example.apzandroid.models.container_models.StatusContainerResponse
import com.example.apzandroid.models.notification_models.NotificationTypeResponse
import com.example.apzandroid.models.notification_models.NotificationsResponse
import com.example.apzandroid.models.notification_models.ToggleEmailResponse
import com.example.apzandroid.models.notification_models.TogglePushResponse
import com.example.apzandroid.models.notification_models.UserSettingsResponse
import retrofit2.Call
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path

interface NotificationService {
    @GET("api/user-settings/")
    fun notificationOptions(@Header("X-CSRFToken") csrfToken: String):  Call<UserSettingsResponse>

    @POST("api/toggle-email/")
    fun toggleEmailNotifications(@Header("X-CSRFToken") csrfToken: String): Call<ToggleEmailResponse>

    @POST("api/toggle-push/")
    fun togglePushNotifications(@Header("X-CSRFToken") csrfToken: String): Call<TogglePushResponse>

    @GET("api/notificationTypes/{id}/")
    fun notificationTypes(@Path("id") id: String, @Header("X-CSRFToken") csrfToken: String): Call<NotificationTypeResponse>

    @GET("api/notificationsUsers/for-user/")
    fun notificationsForUser(@Header("X-CSRFToken") csrfToken: String): Call<List<NotificationsResponse>>

    @DELETE("api/notificationsUsers/{id}/")
    fun deleteNotificationById(@Path("id") id: Int, @Header("X-CSRFToken") csrfToken: String): Call<Void>
}