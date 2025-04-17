package com.example.apzandroid.helpers.notifications

import android.content.Context
import android.widget.Toast
import com.example.apzandroid.models.notification_models.NotificationTypeResponse
import com.example.apzandroid.models.notification_models.NotificationsResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class NotificationHelper {

    companion object {
        fun loadNotifications(
            csrfToken: String,
            context: Context,
            callback: (List<NotificationsResponse>, Map<Int, String>) -> Unit
        ) {
            RetrofitClient.notificationService.notificationsForUser(csrfToken)
                .enqueue(object : Callback<List<NotificationsResponse>> {
                    override fun onResponse(
                        call: Call<List<NotificationsResponse>>,
                        response: Response<List<NotificationsResponse>>
                    ) {
                        if (response.isSuccessful) {
                            val notifications = response.body() ?: emptyList()
                            loadNotificationTypes(notifications, csrfToken, context, callback)
                        } else {
                            Toast.makeText(context, "Failed to load notifications", Toast.LENGTH_SHORT).show()
                        }
                    }

                    override fun onFailure(call: Call<List<NotificationsResponse>>, t: Throwable) {
                        Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                    }
                })
        }

        private fun loadNotificationTypes(
            notifications: List<NotificationsResponse>,
            csrfToken: String,
            context: Context,
            callback: (List<NotificationsResponse>, Map<Int, String>) -> Unit
        ) {
            val uniqueTypes = notifications.map { it.notification_type }.distinct()
            var typesLoaded = 0
            val notificationTypesMap = mutableMapOf<Int, String>()

            if (uniqueTypes.isEmpty()) {
                callback(notifications, notificationTypesMap)
                return
            }

            uniqueTypes.forEach { typeId ->
                RetrofitClient.notificationService.notificationTypes(typeId.toString(), csrfToken)
                    .enqueue(object : Callback<NotificationTypeResponse> {
                        override fun onResponse(
                            call: Call<NotificationTypeResponse>,
                            response: Response<NotificationTypeResponse>
                        ) {
                            response.body()?.let {
                                notificationTypesMap[it.id] = it.type_notification_name
                            }
                            typesLoaded++
                            if (typesLoaded == uniqueTypes.size) {
                                callback(notifications, notificationTypesMap)
                            }
                        }

                        override fun onFailure(call: Call<NotificationTypeResponse>, t: Throwable) {
                            typesLoaded++
                            if (typesLoaded == uniqueTypes.size) {
                                callback(notifications, notificationTypesMap)
                            }
                        }
                    })
            }
        }

        fun deleteNotificationById(
            notificationId: Int,
            csrfToken: String,
            context: Context,
            onSuccess: () -> Unit,
            onFailure: () -> Unit
        ) {
            RetrofitClient.notificationService.deleteNotificationById(notificationId, csrfToken)
                .enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        if (response.isSuccessful) {
                            onSuccess()
                            Toast.makeText(context, "Deleted succesfully", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, "Failed to delete", Toast.LENGTH_SHORT).show()
                            onFailure()
                        }
                    }

                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        Toast.makeText(context, "Failed to delete", Toast.LENGTH_SHORT).show()
                        onFailure()
                    }
                })
        }

    }
}

