package com.example.apzandroid.models.notification_models

data class NotificationsResponse(
    val id: Int,
    val user_id: Int,
    val message: String,
    val notification_type: Int,
    val timestamp_get_notification: String
)
